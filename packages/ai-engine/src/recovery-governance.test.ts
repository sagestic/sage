import test from "node:test";
import assert from "node:assert/strict";
import { evaluateRecoveryReadiness, transitionRecoveryDecision, validCustodyEvidence } from "./recovery-governance.ts";
import { selectRecoveryDistanceEvidence } from "./recovery-road-evidence.ts";

const inTransit = [{ id: "ord-1", status: "IN_TRANSIT" as const }];
test("in-transit order is blocked without verified custody", () => {
  assert.deepEqual(evaluateRecoveryReadiness(inTransit, new Map()).blockedOrderIds, ["ord-1"]);
  assert.equal(evaluateRecoveryReadiness(inTransit, new Map()).actionable, false);
});
test("assigned order does not require in-transit handover", () => {
  assert.equal(evaluateRecoveryReadiness([{ id: "ord-2", status: "ASSIGNED" }], new Map()).actionable, true);
});
test("verified custody evidence allows review, never automatic execution", () => {
  const evidence = { orderId: "ord-1", handoverLatitude: 6.5, handoverLongitude: 3.4, confirmedBy: "dispatcher-1", eventId: "evt-1", confirmedAt: new Date().toISOString() };
  assert.equal(validCustodyEvidence(evidence, "ord-1"), true);
  const ready = evaluateRecoveryReadiness(inTransit, new Map([["ord-1", evidence]]));
  assert.equal(transitionRecoveryDecision("PENDING", "APPROVE", ready, 0, 0), "APPROVED");
  assert.equal(transitionRecoveryDecision("APPROVED", "EXECUTE", ready, 1, 1), "EXECUTED");
});
test("stale review and unsafe approval are rejected", () => {
  const blocked = evaluateRecoveryReadiness(inTransit, new Map());
  assert.throws(() => transitionRecoveryDecision("PENDING", "APPROVE", blocked, 0, 0));
  assert.throws(() => transitionRecoveryDecision("PENDING", "APPROVE", { actionable: true, blockedOrderIds: [], reasons: [] }, 0, 1));
  assert.throws(() => transitionRecoveryDecision("PENDING", "EXECUTE", { actionable: true, blockedOrderIds: [], reasons: [] }, 0, 0));
});
test("unverified road metrics never masquerade as live ETA", () => {
  assert.deepEqual(selectRecoveryDistanceEvidence(1234, undefined), { source: "HAVERSINE", liveRoadEstimate: false, distanceMeters: 1234 });
  assert.equal(selectRecoveryDistanceEvidence(1234, { provider: "GOOGLE_ROUTES", distanceMeters: 1400, durationSeconds: 300, observedAt: new Date().toISOString() }).liveRoadEstimate, true);
  assert.equal(selectRecoveryDistanceEvidence(1234, { provider: "GOOGLE_ROUTES", distanceMeters: 1400, durationSeconds: 300, observedAt: "2020-01-01T00:00:00Z" }).liveRoadEstimate, false);
});
