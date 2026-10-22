import { NextRequest, NextResponse } from "next/server";
import { authenticateApiRequest } from "../../../../../lib/api/auth";
import { sageRepo } from "../../../../../lib/data/sage-repo";
import { solveVrpWithGoogleOrTools } from "../../../../../lib/optimization/google-or-solver";

export async function POST(req: NextRequest) {
  const auth = await authenticateApiRequest(req, "orders:write");
  if (!auth.success) return auth.response;

  const orgId = auth.context.organizationId;
  const url = new URL(req.url);
  const shouldApply = url.searchParams.get("apply") === "true";

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
  const problem = {
    depot: { latitude: 51.5074, longitude: -0.1278 },
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

  // Run Google OR-Tools optimization
  const solution = await solveVrpWithGoogleOrTools(problem);

  // If requested, apply assignments immediately
  if (shouldApply && solution.routes.length > 0) {
    for (const route of solution.routes) {
      for (const stop of route.stops) {
        if (stop.stopType === "PICKUP") {
          sageRepo.assignRider(orgId, stop.orderId, route.vehicleId);
        }
      }
    }
  }

  return NextResponse.json({
    success: true,
    data: solution,
    applied: shouldApply,
    meta: {
      tenantId: orgId,
      solverEngine: solution.solver,
      timestamp: new Date().toISOString(),
    },
  });
}
