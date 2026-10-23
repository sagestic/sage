# Sage recovery rollout: safety, approval, persistence, live routing

This branch adds foundations for all four workstreams; **it does not complete production rollout**.

## Phase 1: custody and handover safety
- Preview returns `actionable: false` and `blockedOrderIds` for `IN_TRANSIT` parcels without verified custody events.
- Route optimization remains an advisory preview, not an instruction to collect a parcel from its original pickup.
- `evaluateRecoveryReadiness` is fail-closed. The preview deliberately passes an empty evidence map until tenant-scoped custody verification is connected.
- Next: capture verified handover coordinates, timestamp, actor identity and evidence via an authenticated custody workflow; reject stale, forged and cross-tenant records.

## Phase 2: dispatcher decisions
- Pure state machine supports `PENDING -> APPROVED -> EXECUTED` and `PENDING -> REJECTED`, requiring a matching version and readiness before approval/execution.
- **No approval or execution API is enabled**. Do not expose a write endpoint until the persistent proposal store, actor identity, RBAC, atomic version checks, current rider/order revalidation, and audit writes are implemented.
- An API key alone is not proof of a human dispatcher's identity.

## Phase 3: database and audit
- Prisma models `RecoveryProposal`, `RecoveryCustodyVerification` and `RecoveryDecisionAudit` are defined.
- These are **schema declarations only**; no migration has been applied and no recovery records are persisted yet.
- Before rollout: generate and review migration against an approved Postgres instance; implement tenant-scoped transaction-based repository, unique idempotency keys, optimistic concurrency, and append-only audit; test rollback and concurrent approvals.
- Never run migrations against production without a database backup and operator approval.

## Phase 4: Gemini and road metrics
- `selectRecoveryDistanceEvidence` marks existing OR-Tools Haversine distances as **not live**. Only validated, fresh Google Routes metrics can be labeled live.
- The existing Gemini mock and Gemini Developer API path remain intact.
- **Vertex AI and Google Routes are not connected in this branch.** Google Cloud project, billing eligibility, authentication and API enablement are external dependencies handled by the teammate.
- Once provisioned: add server-only Vertex AI adapter, compare mock/Developer API/Vertex outputs, integrate Google Routes matrix or route legs, track cost and quota, test API failures and fallbacks.
- Never call live traffic metrics `guaranteed ETA`.

## Local verification

```bash
pnpm --filter web typecheck
pnpm exec tsx --test packages/ai-engine/src/*.test.ts
pnpm exec tsx --test apps/web/src/lib/data/sage-repo.auth.test.ts
# SAGE_MOCK_GEMINI=true in apps/web/.env.local; start Next.js separately
set -a; source apps/web/.env.local; set +a
bash scripts/test-recovery-e2e-mock.sh
```

Expect `actionable: false` for demo `ord_apex_101` (IN_TRANSIT) until verified handover is implemented. Existing smoke tests should continue to pass because previews remain available, but non-actionable.

## Required before production
- Persistent organization identity and human reviewer authentication.
- Secure custody evidence ingestion and tenant-scoped verification.
- Transactional approval/execution and immutable audit.
- Database migration + integration tests against Postgres.
- Google Cloud Vertex AI / Routes credentials, billing, quota, and contract tests.
- End-to-end regression tests for stale plans, concurrent dispatchers, cross-tenant requests and parcel custody.
