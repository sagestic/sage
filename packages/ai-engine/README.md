# Sage AI Recovery Engine

This package is the AI Engineer-owned **deterministic recovery core** for the Sage logistics platform.

## Design boundary

- Receives a validated disruption snapshot from the NestJS application.
- Excludes unavailable/broken vehicles.
- Enumerates feasible assignments and stop orders for up to 8 deliveries.
- Enforces total route load (kg) against vehicle capacity (kg).
- Scores routes using estimated distance-based cost and weighted lateness.
- Returns ranked plans, grounded explanations, and explicit failure reasons.
- Independently checks delivery uniqueness, availability and capacity.

```ts
import { planRecovery, validatePlan } from "@sage/ai-engine";
const result = planRecovery(snapshot);
if (result.feasible) {
  const errors = validatePlan(snapshot, result.options[0]);
  if (errors.length) throw new Error(errors.join("; "));
}
```

## IMPORTANT operational limitations

This is a **small-instance baseline**, not a production VRP solver. It uses haversine straight-line distances and a configurable constant speed. It does **not** use Google Maps live road travel times, traffic, driver shifts, time-dependent route constraints, pickup/drop-off precedence, real-time vehicle telemetry, or Gemini. A road-closure incident must be reflected in upstream availability/travel inputs; this package does not model blocked road segments. Lateness is penalized but deadlines are not hard feasibility constraints. The score's cost and lateness weights are demonstration defaults and must be calibrated with a real merchant.

The exact search is bounded to 200,000 evaluated complete plans; a truncated search is **not guaranteed optimal**. It intentionally rejects larger delivery sets rather than silently producing misleading results.

## Integration ownership

AI Engineer: this package, future OR-Tools/VRP adapter, routing provider, LLM interpretation/explanations, evaluation suite.

Software Engineer: NestJS controller/service, authorization, tenant scoping, persisted delivery/vehicle/incident models, idempotent approval workflow, audit trail and dispatcher UI.

## Production roadmap

1. Agree with backend engineer on a versioned API request/response schema, stable IDs, timestamp semantics, and data ownership.
2. Integrate Google Maps Routes API behind a cached travel-time provider with rate limits, timeouts and fallback provenance.
3. Replace bounded enumeration with a VRP solver (OR-Tools service or an equivalent solver) for realistic fleets, multi-stop routes and hard time windows.
4. Add Gemini via Vertex AI for structured incident extraction and human-readable grounded summaries only. LLM output never overrides solver constraints.
5. Introduce snapshot/version checks, explainable scores, dispatcher approval, and event-triggered replanning.
6. Add adversarial constraint tests, seeded scenarios, merchant validation, cost/latency telemetry, and offline baseline comparisons.

## Run

From repository root: `pnpm install`, then `pnpm --filter @sage/ai-engine typecheck` and `pnpm --filter @sage/ai-engine test`.

The package is not wired into NestJS yet; this PR intentionally does not modify the Software Engineer's backend.
