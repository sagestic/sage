# Phase 4: VRP safety contracts for application integration

## Branch and ownership

Based on the teammate's `dev` branch, not the older `main` branch. This PR only adds code in `packages/ai-engine`. It deliberately does not modify the Next.js VRP API, Prisma schema, Python solver or teammate-owned application code.

## Integration contract

The existing application can call `requireValidVrpSolution(problem, rawSolverOutput)` before displaying a route as feasible or applying any assignment. Invalid results throw; `validateVrpSolution` returns detailed errors for telemetry.

```ts
import { requireValidVrpSolution } from "@sage/ai-engine";
const proposed = await solveVrpWithGoogleOrTools(problem);
const verified = requireValidVrpSolution(problem, proposed);
// Display verified as a preview; do NOT apply without dispatcher approval.
```

Validation checks recognized status, route shape, known vehicle/order IDs, unique pickup/dropoff, pickup-before-dropoff on the same vehicle, running capacity, reported load, distance totals, order coverage and assigned/unassigned counts.

## Outstanding teammate coordination (required before production)

1. The existing `POST /api/v1/optimize/vrp?apply=true` directly mutates assignments. Add a separate dispatcher approval workflow, versioned snapshots and authorization checks before enabling production application.
2. The Python OR-Tools solver sometimes emits snake_case error/infeasible fields, whereas the TypeScript contract requires camelCase. Normalize and validate its output at the adapter boundary.
3. The TypeScript fallback uses fixed distances and London defaults. Remove fabricated coordinates and distances, and distinguish fallback from road-aware routing.
4. The Python solver currently labels successful results `OPTIMAL` without demonstrating an optimality proof, and its pickup/dropoff precedence uses a capacity dimension. Review solver correctness and introduce a proper order/time dimension.
5. Tenant-scoped data must be fetched and verified by the application. This library cannot independently verify organization ownership.
6. The validator checks structural and operational constraints, but it does not prove road-route feasibility, exact travel distances, solver optimality, or database freshness.

## Run checks

`pnpm --filter @sage/ai-engine test`
`pnpm typecheck`
`pnpm lint`

These tests use fixtures and do not require external API keys. This PR does not merge or deploy any changes.
