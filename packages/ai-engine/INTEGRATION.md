# Routing and incident interpretation integration

This change extends the standalone `@sage/ai-engine` package only. Existing NestJS, Prisma, and Next.js files are unchanged.

## Routing
- `GoogleRoutesProvider` uses the Google Routes computeRoutes endpoint, traffic-aware driving, and a restricted API key supplied by the backend.
- `HaversineRoutingProvider` provides a deterministic offline estimate.
- `FallbackRoutingProvider` marks fallback estimates explicitly. Never represent fallback distances as live road data.
- Inject a mock `fetcher` for tests. Do not put credentials in source or browser bundles.
- Real route API requests incur Google Maps Platform usage costs.

## Incident interpretation
- `StructuredIncidentInterpreter` accepts an injected inference function, validates its structured output, and always marks results for human review.
- A Gemini / Vertex AI SDK adapter and production prompt are **not yet implemented**. The inference callback is the extension point.
- Do not trust LLM-generated vehicle identifiers without matching them to tenant-scoped vehicle records.

## Recovery
- `RecoveryPreviewService` is read-only and uses the existing bounded planner and independent validator.
- **Important:** road estimates are not yet fed into the planner's objective. It still uses straight-line distances and constant speed.
- No dispatch assignments, database records, or approvals are written by these interfaces.
- A full matrix-aware VRP solver, authentication, approvals, and tenant-scoped NestJS endpoints remain follow-up integration work.

## Validation
Run `pnpm --filter @sage/ai-engine test` and `pnpm typecheck`. The new tests mock the routing API and structured interpretation without network calls.
