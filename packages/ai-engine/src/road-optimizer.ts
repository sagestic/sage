import type { Delivery, Location, RecoveryRequest, Route, RecoveryOption } from "./types";
import { validateRequest } from "./validation";
import type { RoutingProvider, TravelEstimate } from "./routing";

export interface RoadOptimizationConfig {
  maxDeliveries?: number;
  hardDeadlines?: boolean;
  requireRoadData?: boolean;
}
export interface RoadRecoveryResult {
  incidentId: string;
  feasible: boolean;
  options: RecoveryOption[];
  rejectedReasons: string[];
  routingSource: "google-routes" | "haversine" | "mixed" | "none";
  usedFallback: boolean;
  evaluatedCandidates: number;
  optimalityGuaranteed: false;
}
type Leg = TravelEstimate;
type State = { assignments: number[][]; option: RecoveryOption };
function usable(request: RecoveryRequest) {
  return request.vehicles.filter(v => v.status === "available" &&
    !(request.incident.kind === "breakdown" && request.incident.vehicleId === v.id));
}
function signature(assignments: number[][]): string {
  return assignments.map(a => a.join(",")).join("|");
}

/** Deterministic bounded beam search over road-aware route insertions. Not an exact VRP solver. */
export async function optimizeRoadRecovery(
  request: RecoveryRequest,
  routing: RoutingProvider,
  config: RoadOptimizationConfig = {},
): Promise<RoadRecoveryResult> {
  validateRequest(request);
  const vehicles = usable(request);
  const n = request.deliveries.length;
  const max = config.maxDeliveries ?? 30;
  if (!Number.isInteger(max) || max < 1 || max > 100) throw new Error("Invalid maxDeliveries");
  const result: RoadRecoveryResult = {
    incidentId: request.incident.id, feasible: false, options: [], rejectedReasons: [],
    routingSource: "none", usedFallback: false, evaluatedCandidates: 0, optimalityGuaranteed: false,
  };
  if (n > max) { result.rejectedReasons.push(`Delivery limit exceeded: ${n} > ${max}`); return result; }
  if (n && !vehicles.length) { result.rejectedReasons.push("No available vehicles"); return result; }
  if (request.deliveries.some(d => !vehicles.some(v => v.capacityKg >= d.weightKg))) {
    result.rejectedReasons.push("At least one delivery exceeds every available vehicle capacity");
    return result;
  }
  if (!n) {
    result.feasible = true;
    result.options = [{ id: "road-plan-1", routes: [], totalDistanceKm: 0, estimatedCost: 0, weightedLateness: 0, onTimeCount: 0, score: 0, explanation: "No outstanding deliveries." }];
    return result;
  }
  const locations: Location[] = [...vehicles.map(v => v.location), ...request.deliveries.map(d => d.location)];
  const cache = new Map<string, Leg>();
  const sources = new Set<string>();
  async function leg(a: number, b: number): Promise<Leg> {
    if (a === b) return { distanceKm: 0, durationMinutes: 0, source: "haversine", fallback: false };
    const key = `${a}:${b}`;
    const cached = cache.get(key);
    if (cached) return cached;
    const estimate = await routing.estimate(locations[a], locations[b]);
    if (!Number.isFinite(estimate.distanceKm) || estimate.distanceKm < 0 ||
      !Number.isFinite(estimate.durationMinutes) || estimate.durationMinutes < 0)
      throw new Error("Routing provider returned invalid metrics");
    if (config.requireRoadData && (estimate.source !== "google-routes" || estimate.fallback))
      throw new Error("Road routing required; fallback estimate rejected");
    cache.set(key, estimate);
    sources.add(estimate.source);
    result.usedFallback ||= estimate.fallback;
    return estimate;
  }
  // Precompute directed vehicle-to-delivery and delivery-to-delivery legs.
  for (let v = 0; v < vehicles.length; v++)
    for (let d = 0; d < n; d++) await leg(v, vehicles.length + d);
  for (let a = 0; a < n; a++)
    for (let b = 0; b < n; b++)
      if (a !== b) await leg(vehicles.length + a, vehicles.length + b);
  result.routingSource = sources.size > 1 ? "mixed" : sources.has("google-routes") ? "google-routes" : "haversine";

  function evaluate(assignments: number[][]): RecoveryOption | null {
    let totalDistanceKm = 0, estimatedCost = 0, weightedLateness = 0, onTimeCount = 0;
    const routes: Route[] = [];
    for (let v = 0; v < vehicles.length; v++) {
      const vehicle = vehicles[v];
      let minute = Math.max(request.currentMinute, vehicle.availableAtMinute);
      if (request.incident.kind === "delay" && request.incident.vehicleId === vehicle.id)
        minute += request.incident.delayMinutes ?? 0;
      let previous = v, loadKg = 0, distanceKm = 0;
      const stops: Route["stops"] = [];
      for (const d of assignments[v]) {
        const delivery: Delivery = request.deliveries[d];
        const edge = cache.get(`${previous}:${vehicles.length + d}`);
        if (!edge) throw new Error("Missing route matrix edge");
        minute += edge.durationMinutes;
        const lateMinutes = Math.max(0, minute - delivery.deadlineMinute);
        if (config.hardDeadlines && lateMinutes > 1e-9) return null;
        weightedLateness += lateMinutes * delivery.priority;
        if (lateMinutes <= 1e-9) onTimeCount++;
        minute += delivery.serviceMinutes;
        loadKg += delivery.weightKg;
        distanceKm += edge.distanceKm;
        stops.push({ deliveryId: delivery.id, arrivalMinute: minute - delivery.serviceMinutes, finishMinute: minute, lateMinutes, distanceKm: edge.distanceKm });
        previous = vehicles.length + d;
      }
      if (loadKg > vehicle.capacityKg + 1e-9) return null;
      if (stops.length) {
        routes.push({ vehicleId: vehicle.id, stops, distanceKm, loadKg });
        totalDistanceKm += distanceKm;
        estimatedCost += distanceKm * vehicle.costPerKm;
      }
    }
    const score = estimatedCost + weightedLateness * 10;
    return { id: "", routes, totalDistanceKm, estimatedCost, weightedLateness, onTimeCount, score,
      explanation: `${onTimeCount}/${n} on time; road data: ${result.routingSource}; fallback: ${result.usedFallback}; cost: ${estimatedCost.toFixed(2)}; weighted lateness: ${weightedLateness.toFixed(1)} minutes.` };
  }
  const beamWidth = 24;
  let beam: State[] = [{ assignments: vehicles.map(() => []), option: evaluate(vehicles.map(() => []))! }];
  // Prioritize urgent/high-impact stops, then evaluate all insertion positions.
  const order = request.deliveries.map((_, i) => i).sort((a, b) =>
    request.deliveries[a].deadlineMinute - request.deliveries[b].deadlineMinute ||
    request.deliveries[b].priority - request.deliveries[a].priority);
  for (const deliveryIndex of order) {
    const next: State[] = [];
    const seen = new Set<string>();
    for (const state of beam) {
      for (let v = 0; v < vehicles.length; v++) {
        const load = state.assignments[v].reduce((sum, i) => sum + request.deliveries[i].weightKg, 0);
        if (load + request.deliveries[deliveryIndex].weightKg > vehicles[v].capacityKg + 1e-9) continue;
        for (let pos = 0; pos <= state.assignments[v].length; pos++) {
          const assignments = state.assignments.map(a => [...a]);
          assignments[v].splice(pos, 0, deliveryIndex);
          const key = signature(assignments);
          if (seen.has(key)) continue;
          seen.add(key);
          const option = evaluate(assignments);
          result.evaluatedCandidates++;
          if (option) next.push({ assignments, option });
        }
      }
    }
    next.sort((a, b) => a.option.score - b.option.score || b.option.onTimeCount - a.option.onTimeCount || signature(a.assignments).localeCompare(signature(b.assignments)));
    beam = next.slice(0, beamWidth);
    if (!beam.length) {
      result.rejectedReasons.push("No feasible route found under capacity and deadline constraints");
      return result;
    }
  }
  const limit = request.maxOptions ?? 3;
  result.options = beam.slice(0, limit).map((state, i) => ({ ...state.option, id: `road-plan-${i + 1}` }));
  result.feasible = result.options.length > 0;
  return result;
}
