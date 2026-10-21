import type { RecoveryRequest } from "./types.ts";

const finite = (n: number) => Number.isFinite(n);
const validLocation = (p: { lat: number; lng: number }) =>
  finite(p.lat) && finite(p.lng) && Math.abs(p.lat) <= 90 && Math.abs(p.lng) <= 180;

export function validateRequest(input: RecoveryRequest): void {
  if (!input.incident?.id || !["breakdown", "delay", "road_closure"].includes(input.incident.kind))
    throw new Error("A valid incident is required");
  if (!finite(input.currentMinute) || input.currentMinute < 0) throw new Error("Invalid currentMinute");
  if (input.averageSpeedKmh !== undefined && (!finite(input.averageSpeedKmh) || input.averageSpeedKmh <= 0))
    throw new Error("averageSpeedKmh must be positive");
  if (input.maxOptions !== undefined && (!Number.isInteger(input.maxOptions) || input.maxOptions < 1 || input.maxOptions > 10))
    throw new Error("maxOptions must be an integer between 1 and 10");
  if (input.incident.kind === "delay" && (input.incident.delayMinutes === undefined || !finite(input.incident.delayMinutes) || input.incident.delayMinutes < 0))
    throw new Error("Delay incident requires nonnegative delayMinutes");
  if (input.incident.kind === "breakdown" && !input.incident.vehicleId)
    throw new Error("Breakdown incident requires vehicleId");
  const vehicleIds = new Set<string>();
  for (const v of input.vehicles) {
    if (!v.id || vehicleIds.has(v.id)) throw new Error("Duplicate or missing vehicle id");
    vehicleIds.add(v.id);
    if (!validLocation(v.location) || !finite(v.capacityKg) || v.capacityKg < 0 ||
      !finite(v.availableAtMinute) || v.availableAtMinute < 0 ||
      !finite(v.costPerKm) || v.costPerKm < 0 ||
      !["available", "unavailable"].includes(v.status))
      throw new Error(`Invalid vehicle: ${v.id}`);
  }
  if (input.incident.vehicleId && !vehicleIds.has(input.incident.vehicleId))
    throw new Error("Incident vehicleId not found");
  const deliveryIds = new Set<string>();
  for (const d of input.deliveries) {
    if (!d.id || deliveryIds.has(d.id)) throw new Error("Duplicate or missing delivery id");
    deliveryIds.add(d.id);
    if (!validLocation(d.location) || !finite(d.weightKg) || d.weightKg < 0 ||
      !finite(d.deadlineMinute) || d.deadlineMinute < 0 ||
      !finite(d.serviceMinutes) || d.serviceMinutes < 0 ||
      !finite(d.priority) || d.priority <= 0)
      throw new Error(`Invalid delivery: ${d.id}`);
    if (d.assignedVehicleId && !vehicleIds.has(d.assignedVehicleId))
      throw new Error(`Unknown assigned vehicle for delivery ${d.id}`);
  }
}
