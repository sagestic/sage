import { distanceKm } from "./geo";
import { validateRequest } from "./validation";
import type { Delivery, RecoveryOption, RecoveryRequest, RecoveryResult, Route, Vehicle } from "./types";

const MAX_DELIVERIES = 8;
const MAX_EVALUATIONS = 200_000;

function availableVehicles(request: RecoveryRequest): Vehicle[] {
  return request.vehicles.filter((vehicle) =>
    vehicle.status === "available" &&
    !(request.incident.kind === "breakdown" && request.incident.vehicleId === vehicle.id)
  );
}

function evaluate(
  request: RecoveryRequest,
  vehicles: Vehicle[],
  assignments: number[][],
  speed: number,
): RecoveryOption {
  const routes: Route[] = [];
  let totalDistanceKm = 0;
  let estimatedCost = 0;
  let weightedLateness = 0;
  let onTimeCount = 0;
  for (let i = 0; i < vehicles.length; i++) {
    const vehicle = vehicles[i];
    let position = vehicle.location;
    let minute = Math.max(request.currentMinute, vehicle.availableAtMinute);
    if (request.incident.kind === "delay" && request.incident.vehicleId === vehicle.id)
      minute += request.incident.delayMinutes ?? 0;
    let routeDistance = 0;
    let loadKg = 0;
    const stops: Route["stops"] = [];
    for (const index of assignments[i]) {
      const delivery = request.deliveries[index];
      const leg = distanceKm(position, delivery.location);
      const arrivalMinute = minute + leg / speed * 60;
      const lateMinutes = Math.max(0, arrivalMinute - delivery.deadlineMinute);
      minute = arrivalMinute + delivery.serviceMinutes;
      routeDistance += leg;
      loadKg += delivery.weightKg;
      weightedLateness += lateMinutes * delivery.priority;
      if (lateMinutes <= 1e-9) onTimeCount++;
      stops.push({ deliveryId: delivery.id, arrivalMinute, finishMinute: minute, lateMinutes, distanceKm: leg });
      position = delivery.location;
    }
    if (stops.length) {
      totalDistanceKm += routeDistance;
      estimatedCost += routeDistance * vehicle.costPerKm;
      routes.push({ vehicleId: vehicle.id, stops, distanceKm: routeDistance, loadKg });
    }
  }
  const score = estimatedCost + weightedLateness * 10;
  const explanation = `${onTimeCount}/${request.deliveries.length} deliveries on time; ${routes.length} vehicles used; estimated travel cost ${estimatedCost.toFixed(2)} (vehicle cost units); weighted lateness ${weightedLateness.toFixed(1)} minutes.`;
  return { id: "", routes, totalDistanceKm, estimatedCost, weightedLateness, onTimeCount, score, explanation };
}

/**
 * Exact bounded exhaustive search for SMALL delivery sets. Every delivery is
 * assigned exactly once, and cumulative route load may not exceed capacity.
 * Distances use haversine estimates, NOT live traffic or road routing.
 * Returns no fabricated plan when no feasible allocation exists.
 */
export function planRecovery(request: RecoveryRequest): RecoveryResult {
  validateRequest(request);
  const vehicles = availableVehicles(request);
  const rejectedReasons: string[] = [];
  const result: RecoveryResult = {
    incidentId: request.incident.id, feasible: false, options: [],
    rejectedReasons, evaluatedPlans: 0, truncated: false,
  };
  if (request.deliveries.length > MAX_DELIVERIES) {
    rejectedReasons.push(`Exact recovery is limited to ${MAX_DELIVERIES} deliveries; use a VRP solver for larger workloads`);
    return result;
  }
  if (request.deliveries.length === 0) {
    result.feasible = true;
    result.options = [{ id: "plan-1", routes: [], totalDistanceKm: 0, estimatedCost: 0, weightedLateness: 0, onTimeCount: 0, score: 0, explanation: "No outstanding deliveries require recovery." }];
    return result;
  }
  if (vehicles.length === 0) {
    rejectedReasons.push("No available vehicles after applying the incident");
    return result;
  }
  const impossible = request.deliveries.filter((d) => !vehicles.some((v) => v.capacityKg >= d.weightKg));
  if (impossible.length) {
    rejectedReasons.push(`No vehicle has capacity for: ${impossible.map((d) => d.id).join(", ")}`);
    return result;
  }
  const speed = request.averageSpeedKmh ?? 30;
  const assignments = vehicles.map(() => [] as number[]);
  const loads = vehicles.map(() => 0);
  const candidates: RecoveryOption[] = [];
  const limit = request.maxOptions ?? 3;
  const keys = new Set<string>();
  function visit(remaining: number[]): void {
    if (result.evaluatedPlans >= MAX_EVALUATIONS) { result.truncated = true; return; }
    if (!remaining.length) {
      result.evaluatedPlans++;
      const option = evaluate(request, vehicles, assignments, speed);
      const key = option.routes.map((r) => `${r.vehicleId}:${r.stops.map((s) => s.deliveryId).join(",")}`).join("|");
      if (!keys.has(key)) {
        keys.add(key);
        candidates.push(option);
        candidates.sort((a, b) => a.score - b.score || b.onTimeCount - a.onTimeCount || a.totalDistanceKm - b.totalDistanceKm);
        if (candidates.length > limit) candidates.pop();
      }
      return;
    }
    for (let v = 0; v < vehicles.length; v++) {
      for (let j = 0; j < remaining.length; j++) {
        const index = remaining[j];
        const delivery = request.deliveries[index];
        if (loads[v] + delivery.weightKg > vehicles[v].capacityKg + 1e-9) continue;
        assignments[v].push(index);
        loads[v] += delivery.weightKg;
        visit(remaining.filter((_, k) => k !== j));
        loads[v] -= delivery.weightKg;
        assignments[v].pop();
        if (result.truncated) return;
      }
    }
  }
  visit(request.deliveries.map((_, i) => i));
  result.feasible = candidates.length > 0;
  result.options = candidates.map((option, i) => ({ ...option, id: `plan-${i + 1}` }));
  if (!result.feasible) rejectedReasons.push("No capacity-feasible recovery allocation exists");
  if (result.truncated) rejectedReasons.push("Search budget reached; returned options are not guaranteed globally optimal");
  return result;
}

/** Independently verify that a plan respects vehicle availability, capacity and assignment uniqueness. */
export function validatePlan(request: RecoveryRequest, option: RecoveryOption): string[] {
  validateRequest(request);
  const errors: string[] = [];
  const allowed = new Map(availableVehicles(request).map((v) => [v.id, v]));
  const deliveryMap = new Map<string, Delivery>(request.deliveries.map((d) => [d.id, d]));
  const seen = new Set<string>();
  const usedVehicles = new Set<string>();
  for (const route of option.routes) {
    const vehicle = allowed.get(route.vehicleId);
    if (!vehicle) { errors.push(`Unavailable vehicle: ${route.vehicleId}`); continue; }
    if (usedVehicles.has(route.vehicleId)) errors.push(`Repeated vehicle route: ${route.vehicleId}`);
    usedVehicles.add(route.vehicleId);
    let load = 0;
    for (const stop of route.stops) {
      const delivery = deliveryMap.get(stop.deliveryId);
      if (!delivery) { errors.push(`Unknown delivery: ${stop.deliveryId}`); continue; }
      if (seen.has(stop.deliveryId)) errors.push(`Repeated delivery: ${stop.deliveryId}`);
      seen.add(stop.deliveryId);
      load += delivery.weightKg;
    }
    if (load > vehicle.capacityKg + 1e-9) errors.push(`Capacity exceeded: ${route.vehicleId}`);
  }
  for (const id of deliveryMap.keys()) if (!seen.has(id)) errors.push(`Missing delivery: ${id}`);
  return errors;
}
