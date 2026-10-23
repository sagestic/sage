# VRP Review Remediation

This patch addresses all three findings in the Codex review of PR #4:

1. The runtime test imports `./vrp-validation.ts` explicitly, consistent with Node's strip-types test runner.
2. The Python OR-Tools solver now converts kilogram inputs to integer **grams** for its capacity dimension and converts reported loads back to kilograms. This preserves three decimal places instead of truncating fractional weights. The validator checks the original kg values.
3. `ERROR` and `INFEASIBLE` results are never dispatchable even if they contain apparently valid routes.

Additional safeguards: reject nonpositive capacities and weights, stop substituting London coordinates for missing locations in the Python solver, use the distance dimension for pickup-before-dropoff precedence, return consistent camelCase fields on infeasible results, and report `FEASIBLE` rather than claiming optimality without proof.

## Coordination and outstanding production blockers

- This patch touches the teammate's Python solver to fix a cross-language correctness issue. Review that change with the solver owner.
- The web API still defaults to London depot coordinates and allows `?apply=true` to write assignments directly. This patch intentionally does not change teammate-owned Next.js endpoint behavior.
- The TypeScript heuristic fallback still uses fabricated distances and coordinates; do not deploy it for real routing.
- The Python process wrapper must validate output before returning it to the API and should handle solver timeouts, process paths and errors.
- Python OR-Tools runtime tests and package-wide Node/TypeScript tests must pass before merging; no live deployment has been verified.

## Checks

`pnpm --filter @sage/ai-engine test`

`pnpm --filter @sage/ai-engine typecheck`

`python3 packages/ai-engine/src/or-tools/vrp_solver.py --demo`
