# Phase 5: Safe VRP preview integration

## What does this do?
- Prevents `POST /api/v1/optimize/vrp?apply=true` from directly mutating assignments (HTTP 409).
- Validates optimization output against the shared AI-engine contract before returning a preview.
- Rejects missing order coordinates instead of silently using London defaults.
- Makes the Python adapter fail closed on runtime errors, malformed output or invalid solver results.
- Adds an 8-second process timeout and a bounded stdout buffer.

## Why?
Unreviewed optimizer output must not assign real couriers. A fake deterministic fallback with fixed distances is not safe for dispatch decisions.

## Who/what is impacted?
The Next.js VRP endpoint and Python solver adapter in `apps/web`. **Behavior change:** callers using `apply=true` now receive HTTP 409; the endpoint only provides previews. The depot currently uses the first pickup coordinate as a provisional routing origin; this is not a configured depot and must be replaced with organization-specific configuration before production use.

## How tested?
Not independently executed. Run workspace typecheck/lint and integration tests in CI; verify missing Python, timeout, malformed JSON, incomplete pickup/dropoff, missing coordinates and forbidden apply requests.

## Screenshots
Not applicable; API/backend changes only.

## Explicit limitations
This is a safe-preview integration, **not** a completed dispatcher-approval system. No database-backed approval token, state snapshot, transactional apply, or rider reassignment UI is introduced. The Python solver still uses Haversine distances rather than road network routing. Verify deployment includes the Python runtime and OR-Tools dependency.
