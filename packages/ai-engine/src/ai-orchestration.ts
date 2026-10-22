import { planRecovery, validatePlan } from "./recovery";
import type { RecoveryRequest, RecoveryResult } from "./types";
import type { IncidentInterpreter, IncidentInterpretation } from "./incident";
import type { RoutingProvider, TravelEstimate } from "./routing";

/**
 * Read-only integration boundary. Routing estimates are advisory until the
 * recovery optimizer accepts a full road travel-time matrix.
 */
export class RecoveryPreviewService {
  constructor(
    private readonly interpreter: IncidentInterpreter,
    private readonly routing: RoutingProvider,
  ) {}
  interpretIncident(id: string, description: string): Promise<IncidentInterpretation> {
    return this.interpreter.interpret(id, description);
  }
  async estimateTravel(request: RecoveryRequest): Promise<TravelEstimate[]> {
    const estimates: TravelEstimate[] = [];
    for (const vehicle of request.vehicles) {
      if (vehicle.status !== "available") continue;
      if (request.incident.kind === "breakdown" && request.incident.vehicleId === vehicle.id) continue;
      for (const delivery of request.deliveries) {
        estimates.push(await this.routing.estimate(vehicle.location, delivery.location));
      }
    }
    return estimates;
  }
  preview(request: RecoveryRequest): RecoveryResult {
    const result = planRecovery(request);
    for (const option of result.options) {
      const errors = validatePlan(request, option);
      if (errors.length) throw new Error("Unsafe candidate: " + errors.join("; "));
    }
    return result;
  }
}
