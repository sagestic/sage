import type { VrpProblemRequest, VrpSolution } from "./or-tools/index.ts";

export interface VrpValidationResult {
  valid: boolean;
  errors: string[];
  assignedOrderIds: string[];
  unassignedOrderIds: string[];
}

/**
 * Independent, side-effect-free validation of a solver's proposed assignments.
 * Rejects partial pickup/dropoff routes, unknown entities, overcapacity loads,
 * mismatched totals and false optimality claims before a dispatcher can apply.
 */
export function validateVrpSolution(problem: VrpProblemRequest, raw: unknown): VrpValidationResult {
  const errors: string[] = [];
  const empty = (): VrpValidationResult => ({ valid: false, errors, assignedOrderIds: [], unassignedOrderIds: [] });
  if (!raw || typeof raw !== "object") {
    errors.push("Solver result is not an object");
    return empty();
  }
  const solution = raw as Partial<VrpSolution>;
  if (!["OPTIMAL", "FEASIBLE", "INFEASIBLE", "ERROR"].includes(String(solution.status)))
    errors.push("Invalid solver status");
  if (solution.status === "ERROR" || solution.status === "INFEASIBLE")
    errors.push("Unsuccessful solver status cannot be used for assignments");
  if (!Array.isArray(solution.routes) || !Array.isArray(solution.unassignedOrderIds)) {
    errors.push("Solver result is missing routes or unassignedOrderIds");
    return empty();
  }
  const vehicles = new Map(problem.vehicles.map(v => [v.id, v]));
  const orders = new Map(problem.deliveries.map(d => [d.id, d]));
  if (vehicles.size !== problem.vehicles.length || orders.size !== problem.deliveries.length)
    errors.push("Duplicate vehicle or order IDs in problem");
  const pickups = new Set<string>(), dropoffs = new Set<string>(), usedVehicles = new Set<string>();
  let totalDistance = 0;
  for (const route of solution.routes) {
    if (!route || typeof route !== "object" || !Array.isArray(route.stops)) {
      errors.push("Invalid route structure");
      continue;
    }
    const vehicle = vehicles.get(route.vehicleId);
    if (!vehicle) { errors.push(`Unknown vehicle: ${route.vehicleId}`); continue; }
    if (usedVehicles.has(route.vehicleId)) errors.push(`Duplicate vehicle route: ${route.vehicleId}`);
    usedVehicles.add(route.vehicleId);
    let load = 0;
    const routePickups = new Set<string>();
    if (route.totalStops !== route.stops.length) errors.push(`Stop count mismatch: ${route.vehicleId}`);
    if (!Number.isFinite(route.distanceMeters) || route.distanceMeters < 0 ||
        !Number.isFinite(route.distanceKm) || Math.abs(route.distanceKm * 1000 - route.distanceMeters) > 10)
      errors.push(`Invalid route distance: ${route.vehicleId}`);
    else totalDistance += route.distanceMeters;
    for (const stop of route.stops) {
      if (!stop || typeof stop !== "object") { errors.push("Invalid stop"); continue; }
      const order = orders.get(stop.orderId);
      if (!order) { errors.push(`Unknown order: ${stop.orderId}`); continue; }
      if (stop.stopType === "PICKUP") {
        if (pickups.has(stop.orderId)) errors.push(`Duplicate pickup: ${stop.orderId}`);
        pickups.add(stop.orderId);
        routePickups.add(stop.orderId);
        load += order.weightKg ?? 3;
      } else if (stop.stopType === "DROPOFF") {
        if (!routePickups.has(stop.orderId)) errors.push(`Dropoff before pickup: ${stop.orderId}`);
        if (dropoffs.has(stop.orderId)) errors.push(`Duplicate dropoff: ${stop.orderId}`);
        dropoffs.add(stop.orderId);
        load -= order.weightKg ?? 3;
      } else errors.push(`Invalid stop type: ${String(stop.stopType)}`);
      if (load < -1e-9 || load > vehicle.capacity + 1e-9)
        errors.push(`Capacity violation on ${route.vehicleId}`);
      if (!Number.isFinite(stop.currentLoadKg) || Math.abs(stop.currentLoadKg - load) > 1e-6)
        errors.push(`Incorrect stop load for ${stop.orderId}`);
      if (!Number.isFinite(stop.latitude) || !Number.isFinite(stop.longitude) ||
          Math.abs(stop.latitude) > 90 || Math.abs(stop.longitude) > 180)
        errors.push(`Invalid stop coordinates for ${stop.orderId}`);
    }
    if (Math.abs(load) > 1e-9) errors.push(`Vehicle finishes with unaccounted load: ${route.vehicleId}`);
  }
  for (const id of pickups) if (!dropoffs.has(id)) errors.push(`Pickup without dropoff: ${id}`);
  for (const id of dropoffs) if (!pickups.has(id)) errors.push(`Dropoff without pickup: ${id}`);
  const unassigned = new Set<string>();
  for (const id of solution.unassignedOrderIds) {
    if (!orders.has(id)) errors.push(`Unknown unassigned order: ${id}`);
    if (unassigned.has(id)) errors.push(`Duplicate unassigned order: ${id}`);
    unassigned.add(id);
    if (pickups.has(id) || dropoffs.has(id)) errors.push(`Order both assigned and unassigned: ${id}`);
  }
  for (const id of orders.keys()) if (!pickups.has(id) && !unassigned.has(id)) errors.push(`Missing order: ${id}`);
  if (solution.assignedOrdersCount !== pickups.size || solution.unassignedOrdersCount !== unassigned.size)
    errors.push("Assignment count mismatch");
  if (!Number.isFinite(solution.totalDistanceMeters) || Math.abs(solution.totalDistanceMeters! - totalDistance) > 1)
    errors.push("Total distance mismatch");
  if (!Number.isFinite(solution.totalDistanceKm) || Math.abs(solution.totalDistanceKm! * 1000 - totalDistance) > 10)
    errors.push("Total distance km mismatch");
  if ((solution.status === "OPTIMAL" || solution.status === "FEASIBLE") && pickups.size === 0 && orders.size > 0)
    errors.push("Feasible status with no assigned orders");
  if (solution.status === "OPTIMAL" && unassigned.size > 0)
    errors.push("Optimal status cannot include unassigned orders");
  return { valid: errors.length === 0, errors, assignedOrderIds: [...pickups], unassignedOrderIds: [...unassigned] };
}

/** Safe read-only consumer boundary; throws instead of silently accepting invalid output. */
export function requireValidVrpSolution(problem: VrpProblemRequest, raw: unknown): VrpSolution {
  const result = validateVrpSolution(problem, raw);
  if (!result.valid) throw new Error(`Unsafe VRP solution: ${result.errors.join("; ")}`);
  return raw as VrpSolution;
}
