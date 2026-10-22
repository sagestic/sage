import assert from "node:assert/strict";
import test from "node:test";
import { requireValidVrpSolution, validateVrpSolution } from "./vrp-validation";
import type { VrpProblemRequest, VrpSolution } from "./or-tools/index";

const problem: VrpProblemRequest = {
  vehicles: [{ id: "v1", name: "Rider", capacity: 10 }],
  deliveries: [{ id: "o1", orderNumber: "S1", pickupAddress: "A", deliveryAddress: "B", weightKg: 5 }],
};
function solution(): VrpSolution {
  return {
    status: "FEASIBLE", solver: "mock", totalDistanceMeters: 1000, totalDistanceKm: 1,
    assignedOrdersCount: 1, unassignedOrdersCount: 0, unassignedOrderIds: [],
    routes: [{ vehicleId: "v1", vehicleName: "Rider", totalStops: 2, distanceMeters: 1000, distanceKm: 1,
      stops: [
        { stopType: "PICKUP", orderId: "o1", orderNumber: "S1", address: "A", latitude: 6.5, longitude: 3.3, currentLoadKg: 5 },
        { stopType: "DROPOFF", orderId: "o1", orderNumber: "S1", address: "B", latitude: 6.6, longitude: 3.4, currentLoadKg: 0 },
      ],
    }],
  };
}
test("accepts complete capacity-feasible pickup and dropoff", () => {
  assert.equal(validateVrpSolution(problem, solution()).valid, true);
  assert.equal(requireValidVrpSolution(problem, solution()).routes.length, 1);
});
test("rejects dropoff before pickup", () => {
  const s = solution();
  s.routes[0].stops.reverse();
  assert.equal(validateVrpSolution(problem, s).valid, false);
});
test("rejects capacity violations", () => {
  const p = { ...problem, vehicles: [{ ...problem.vehicles[0], capacity: 2 }] };
  assert.match(validateVrpSolution(p, solution()).errors.join(" "), /Capacity/);
});
test("rejects incomplete pickup-only assignments", () => {
  const s = solution();
  s.routes[0].stops.pop();
  s.routes[0].totalStops = 1;
  assert.match(validateVrpSolution(problem, s).errors.join(" "), /Pickup without dropoff/);
});
test("rejects false optimality claims and unassigned overlap", () => {
  const s = solution();
  s.status = "OPTIMAL";
  s.unassignedOrderIds = ["o1"];
  s.unassignedOrdersCount = 1;
  assert.equal(validateVrpSolution(problem, s).valid, false);
});
test("rejects malformed Python result shapes", () => {
  assert.equal(validateVrpSolution(problem, { status: "INFEASIBLE", routes: [], unassigned_orders: ["o1"] }).valid, false);
});
