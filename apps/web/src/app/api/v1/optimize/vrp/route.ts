import { NextRequest, NextResponse } from "next/server";
import { requireValidVrpSolution, type VrpProblemRequest } from "@sage/ai-engine";
import { authenticateApiRequest } from "../../../../../lib/api/auth";
import { sageRepo } from "../../../../../lib/data/sage-repo";
import { solveVrpWithGoogleOrTools } from "../../../../../lib/optimization/google-or-solver";

export async function POST(req: NextRequest) {
  const auth = await authenticateApiRequest(req, "orders:write");
  if (!auth.success) return auth.response;

  const orgId = auth.context.organizationId;
  const url = new URL(req.url);
  // Phase 5 is preview-only until an authenticated, versioned approval flow exists.
  if (url.searchParams.get("apply") === "true") {
    return NextResponse.json({ success: false, error: "Direct application disabled. Dispatcher approval workflow required." }, { status: 409 });
  }

  // Load active state from repository
  const pendingOrders = sageRepo.getOrders(orgId, "PENDING");
  const availableRiders = sageRepo.getRiders(orgId, "AVAILABLE");

  if (!pendingOrders.length || !availableRiders.length) {
    return NextResponse.json({
      status: "NO_ACTION_NEEDED",
      message:
        pendingOrders.length === 0
          ? "No pending orders to optimize."
          : "No available couriers on shift.",
      totalPendingOrders: pendingOrders.length,
      availableCouriers: availableRiders.length,
    });
  }

  // Build problem definition
  const problem: VrpProblemRequest = {
    depot: undefined,
    vehicles: availableRiders.map((r) => ({
      id: r.id,
      name: r.name,
      capacity: r.capacityScore || 25,
      latitude: r.currentLatitude,
      longitude: r.currentLongitude,
    })),
    deliveries: pendingOrders.map((o) => ({
      id: o.id,
      orderNumber: o.orderNumber,
      pickupAddress: o.pickupAddress,
      pickupLat: o.pickupLat,
      pickupLng: o.pickupLng,
      deliveryAddress: o.deliveryAddress,
      deliveryLat: o.deliveryLat,
      deliveryLng: o.deliveryLng,
      weightKg: o.packageWeightKg || 3,
      priority: o.priority,
    })),
  };

  // Do not invent coordinates for an operational decision.
  const coords = pendingOrders.flatMap(o => [o.pickupLat, o.pickupLng, o.deliveryLat, o.deliveryLng]);
  if (coords.some(v => typeof v !== "number" || !Number.isFinite(v))) {
    return NextResponse.json({ success: false, error: "Orders require valid geocoded pickup and delivery coordinates." }, { status: 422 });
  }
  const first = pendingOrders[0];
  problem.depot = { latitude: first.pickupLat!, longitude: first.pickupLng! };
  let solution;
  try {
    solution = requireValidVrpSolution(problem, await solveVrpWithGoogleOrTools(problem));
  } catch {
    return NextResponse.json({ success: false, error: "No safe optimization preview available." }, { status: 422 });
  }

  return NextResponse.json({
    success: true,
    data: solution,
    applied: false,
    requiresDispatcherApproval: true,
    meta: {
      tenantId: orgId,
      solverEngine: solution.solver,
      timestamp: new Date().toISOString(),
    },
  });
}
