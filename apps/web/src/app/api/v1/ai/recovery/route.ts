import { NextRequest, NextResponse } from "next/server";
import { createGeminiIncidentInterpreter, validateIncidentOutput, requireValidVrpSolution, type VrpProblemRequest } from "@sage/ai-engine";
import { authenticateApiRequest } from "../../../../../lib/api/auth";
import { sageRepo } from "../../../../../lib/data/sage-repo";
import { solveVrpWithGoogleOrTools } from "../../../../../lib/optimization/google-or-solver";

/**
 * Read-only recovery preview. No rider/order mutations occur here.
 * v1 deliberately supports breakdowns only, rather than pretending all
 * incident types have the same recovery semantics.
 */
export async function POST(req: NextRequest) {
  const auth = await authenticateApiRequest(req, "orders:write");
  if (!auth.success) return auth.response;
  let body: unknown;
  try { body = await req.json(); } catch {
    return NextResponse.json({ error: "Invalid JSON body" }, { status: 400 });
  }
  const description = (body as { description?: unknown } | null)?.description;
  if (typeof description !== "string" || !description.trim() || description.length > 2000)
    return NextResponse.json({ error: "Provide an incident description (1–2000 characters)" }, { status: 400 });

  // Explicit development-only simulation; request bodies cannot enable it.
  const mockMode = process.env.NODE_ENV === "development" && process.env.SAGE_MOCK_GEMINI === "true";
  const apiKey = process.env.GEMINI_API_KEY;
  if (!mockMode && !apiKey) return NextResponse.json({ error: "Gemini is not configured" }, { status: 503 });
  let interpretation;
  try {
    if (mockMode) {
      if (!/\brdr_apex_1\b/i.test(description) || !/\b(broken down|breakdown)\b/i.test(description)) {
        return NextResponse.json({ error: "Mock mode requires an explicit rdr_apex_1 breakdown report" }, { status: 422 });
      }
      interpretation = validateIncidentOutput(crypto.randomUUID(), {
        kind: "breakdown", vehicleId: "rdr_apex_1", confidence: 1,
        evidence: "Simulated fixture: explicitly reported rider breakdown",
      });
    } else {
      interpretation = await createGeminiIncidentInterpreter({ apiKey: apiKey! }).interpret(crypto.randomUUID(), description);
    }
  } catch {
    return NextResponse.json({ error: "Could not safely interpret incident; clarify the rider ID and incident type" }, { status: 422 });
  }
  const incident = interpretation.incident;
  if (incident.kind !== "breakdown" || !incident.vehicleId)
    return NextResponse.json({ success: false, interpretation, message: "This preview currently supports rider breakdowns with an explicit rider ID only", requiresDispatcherApproval: true }, { status: 422 });

  const orgId = auth.context.organizationId;
  const brokenRider = sageRepo.getRider(orgId, incident.vehicleId);
  if (!brokenRider) return NextResponse.json({ error: "Reported rider not found in your organization" }, { status: 404 });

  // Only orders already assigned to the affected rider are in scope.
  // Pending unassigned orders must not be mixed into incident recovery.
  const affected = sageRepo.getOrders(orgId).filter(o =>
    o.assignedRiderId === brokenRider.id && (o.status === "ASSIGNED" || o.status === "IN_TRANSIT")
  );
  if (!affected.length) return NextResponse.json({ success: true, interpretation, affectedOrders: [], message: "No active assigned orders to recover", applied: false, requiresDispatcherApproval: true });

  const available = sageRepo.getRiders(orgId, "AVAILABLE").filter(r => r.id !== brokenRider.id);
  if (!available.length) return NextResponse.json({ error: "No replacement riders available", interpretation }, { status: 422 });

  const validCoord = (v: unknown, limit: number) => typeof v === "number" && Number.isFinite(v) && Math.abs(v) <= limit;
  if (affected.some(o => !validCoord(o.pickupLat, 90) || !validCoord(o.pickupLng, 180) || !validCoord(o.deliveryLat, 90) || !validCoord(o.deliveryLng, 180)) ||
      available.some(r => !validCoord(r.currentLatitude, 90) || !validCoord(r.currentLongitude, 180)))
    return NextResponse.json({ error: "Recovery requires valid order and rider coordinates" }, { status: 422 });

  const problem: VrpProblemRequest = {
    // Provisional depot: first affected pickup. Not a verified handover location.
    depot: { latitude: affected[0].pickupLat!, longitude: affected[0].pickupLng! },
    vehicles: available.map(r => ({ id: r.id, name: r.name, capacity: r.capacityScore || 25, latitude: r.currentLatitude, longitude: r.currentLongitude })),
    deliveries: affected.map(o => ({
      id: o.id, orderNumber: o.orderNumber, pickupAddress: o.pickupAddress,
      pickupLat: o.pickupLat, pickupLng: o.pickupLng,
      deliveryAddress: o.deliveryAddress, deliveryLat: o.deliveryLat, deliveryLng: o.deliveryLng,
      weightKg: o.packageWeightKg || 3, priority: o.priority,
    })),
  };
  try {
    const solution = requireValidVrpSolution(problem, await solveVrpWithGoogleOrTools(problem));
    return NextResponse.json({
      success: true, interpretation, simulation: mockMode,
      affectedOrders: affected.map(o => ({ id: o.id, orderNumber: o.orderNumber, status: o.status })),
      recommendation: solution,
      explanation: `Rider ${brokenRider.name} was reported unavailable. Sage evaluated ${affected.length} active assigned deliveries against ${available.length} available replacement riders. Review the proposed routes and confirm the physical parcel handover before taking action. This preview has not changed any assignments.`,
      caveats: ["Distances are solver estimates, not guaranteed live road ETAs.", "The first affected pickup is a provisional depot, not a verified parcel handover location.", "Orders already in transit may require a physical handover before reassignment."],
      applied: false, requiresDispatcherApproval: true,
    });
  } catch {
    return NextResponse.json({ error: "No validated safe recovery preview available", interpretation, applied: false }, { status: 422 });
  }
}
