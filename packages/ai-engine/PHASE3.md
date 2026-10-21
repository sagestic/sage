# Phase 3: Gemini and road-aware recovery

## What's implemented

- Server-side Gemini REST integration via `createGeminiIncidentInterpreter`. Supply `apiKey` from a backend-only secret store. No credentials are stored in this repository.
- JSON-constrained incident extraction and strict validation. All AI interpretations require human review; unverified vehicle IDs must be checked against tenant-scoped fleet records.
- `optimizeRoadRecovery`: directed vehicle-to-delivery and delivery-to-delivery travel estimates via the existing `RoutingProvider`. Bounded deterministic beam-search insertion handles up to 30 deliveries by default (configurable up to 100), vehicle capacity, availability, breakdown exclusion, delay offsets, optional hard deadlines, ranked alternatives and fallback provenance.
- Mocked tests with no external credentials.

## Example (backend-only)

```ts
import { createGeminiIncidentInterpreter, GoogleRoutesProvider, optimizeRoadRecovery } from "@sage/ai-engine";

const interpreter = createGeminiIncidentInterpreter({ apiKey: process.env.GEMINI_API_KEY! });
const routing = new GoogleRoutesProvider({ apiKey: process.env.GOOGLE_MAPS_API_KEY! });
const interpretation = await interpreter.interpret("incident-123", "Vehicle VAN-7 broken down");
// Dispatcher verifies extracted facts before constructing a tenant-scoped snapshot.
const result = await optimizeRoadRecovery(snapshot, routing, {
  hardDeadlines: true,
  requireRoadData: true,
});
```

## Production boundaries and caveats

This is **not OR-Tools** and does not guarantee a globally optimal route. It is a deterministic, bounded beam-search heuristic intended for modest demonstrations. Matrix construction makes O(V×D + D²) external routing calls, sequentially; add batching, caching, concurrency limits, budgets and quota handling before real fleet usage. Google Routes `computeRoutes` may incur charges for every matrix leg. It is not suitable for large-scale deployment as written.

Deadlines are arrival-time deadlines. Capacity assumes all assigned deliveries are loaded at departure; no pickup or reload operations are modeled. Vehicle/driver shifts, return-to-depot, traffic changes over time, road closures not represented in provider estimates, and customer time-window starts are not modeled.

`requireRoadData: true` rejects haversine/fallback data. Otherwise the result exposes `routingSource` and `usedFallback`. No silent fallback or fabricated travel times.

Gemini is used **only for structured interpretation**, never as an authority to dispatch, approve, or override constraints. Model outputs may be incorrect; validate extracted vehicle IDs and durations against authoritative operational records.

The existing NestJS app, Prisma schema and frontend remain untouched. A future integration PR should introduce authenticated, tenant-scoped endpoints, snapshot/version checks, approval audit trails and asynchronous jobs. This package does not change production application behavior.

## Tests

`pnpm --filter @sage/ai-engine test`

`pnpm typecheck`

`pnpm lint`

`pnpm build`
