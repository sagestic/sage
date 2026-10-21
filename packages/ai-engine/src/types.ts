export type Location = { lat: number; lng: number };
export type Incident = {
  id: string;
  kind: "breakdown" | "delay" | "road_closure";
  vehicleId?: string;
  delayMinutes?: number;
  description?: string;
};
export type Vehicle = {
  id: string;
  capacityKg: number;
  availableAtMinute: number;
  location: Location;
  status: "available" | "unavailable";
  costPerKm: number;
};
export type Delivery = {
  id: string;
  location: Location;
  weightKg: number;
  deadlineMinute: number;
  serviceMinutes: number;
  priority: number;
  assignedVehicleId?: string;
};
export type RecoveryRequest = {
  incident: Incident;
  vehicles: Vehicle[];
  deliveries: Delivery[];
  currentMinute: number;
  averageSpeedKmh?: number;
  maxOptions?: number;
};
export type Stop = {
  deliveryId: string;
  arrivalMinute: number;
  finishMinute: number;
  lateMinutes: number;
  distanceKm: number;
};
export type Route = {
  vehicleId: string;
  stops: Stop[];
  distanceKm: number;
  loadKg: number;
};
export type RecoveryOption = {
  id: string;
  routes: Route[];
  totalDistanceKm: number;
  estimatedCost: number;
  weightedLateness: number;
  onTimeCount: number;
  score: number;
  explanation: string;
};
export type RecoveryResult = {
  incidentId: string;
  feasible: boolean;
  options: RecoveryOption[];
  rejectedReasons: string[];
  evaluatedPlans: number;
  truncated: boolean;
};
