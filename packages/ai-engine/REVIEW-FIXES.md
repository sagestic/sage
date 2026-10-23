# Codex review remediation (pre-Phase 5)

This branch addresses the three findings on PR #4:

1. Explicit `.ts` imports in the Node runtime test file.
2. Fractional weights are preserved in the Python OR-Tools capacity model using integer grams; reported loads remain kilograms. The TypeScript validator continues to check the actual kilograms rather than accepting truncated weights.
3. The validator rejects `ERROR` and `INFEASIBLE` solver outputs, even when they contain otherwise well-formed assignments.

Regression tests cover both failure statuses, exact fractional loads and rejection of truncated loads.

Additional OR-Tools corrections: introduce a separate stop-order dimension for pickup-before-dropoff; do not mislabel heuristic solutions as `OPTIMAL`; reject missing depot/pickup/dropoff coordinates rather than silently substituting London.

## Remaining work, not covered by this PR

The teammate-owned Next.js VRP endpoint still permits `apply=true` assignments without a separate approval flow; the TypeScript fallback still fabricates distances; the Python wrapper needs timeout, result normalization and validation. Those require a coordinated application integration PR. This branch intentionally does not change that endpoint or claim production readiness.

Run `pnpm --filter @sage/ai-engine test` and `pnpm --filter @sage/ai-engine typecheck`, and exercise the Python solver with OR-Tools installed. No CI success has been independently verified.
