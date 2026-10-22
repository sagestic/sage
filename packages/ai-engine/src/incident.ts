import type { Incident } from "./types";

export interface IncidentInterpretation {
  incident: Incident;
  confidence: number;
  requiresHumanReview: boolean;
  evidence: string;
}
export interface IncidentInterpreter {
  interpret(id: string, description: string): Promise<IncidentInterpretation>;
}

/** Validate model output rather than trusting its claimed confidence. */
export function validateIncidentOutput(id: string, raw: unknown): IncidentInterpretation {
  if (!id.trim() || !raw || typeof raw !== "object") throw new Error("Invalid incident output");
  const data = raw as Record<string, unknown>;
  if (data.kind !== "breakdown" && data.kind !== "delay" && data.kind !== "road_closure")
    throw new Error("Invalid incident type");
  if (typeof data.confidence !== "number" || !Number.isFinite(data.confidence) || data.confidence < 0 || data.confidence > 1)
    throw new Error("Invalid confidence");
  const vehicleId = typeof data.vehicleId === "string" && data.vehicleId.trim() ? data.vehicleId.trim() : undefined;
  const delayMinutes = typeof data.delayMinutes === "number" ? data.delayMinutes : undefined;
  if (data.kind === "breakdown" && !vehicleId) throw new Error("Vehicle identifier required");
  if (data.kind === "delay" && (delayMinutes === undefined || !Number.isFinite(delayMinutes) || delayMinutes < 0))
    throw new Error("Valid delay duration required");
  return {
    incident: { id, kind: data.kind, vehicleId, delayMinutes },
    confidence: data.confidence,
    requiresHumanReview: true,
    evidence: typeof data.evidence === "string" ? data.evidence.slice(0, 1000) : "",
  };
}

export class StructuredIncidentInterpreter implements IncidentInterpreter {
  constructor(private readonly infer: (description: string) => Promise<unknown>) {}
  async interpret(id: string, description: string): Promise<IncidentInterpretation> {
    if (!id.trim() || !description.trim() || description.length > 10000)
      throw new Error("Invalid incident input");
    return validateIncidentOutput(id, await this.infer(description));
  }
}
