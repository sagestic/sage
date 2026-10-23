/**
 * Recovery governance is independent of LLM output and route optimization.
 * A proposed route is not authorization to move a parcel.
 */
export type RecoveryDecision = "PENDING" | "APPROVED" | "REJECTED" | "EXECUTED";
export type CustodyEvidence = {
  orderId: string;
  handoverLatitude: number;
  handoverLongitude: number;
  confirmedBy: string;
  confirmedAt: string;
  eventId: string;
};
export type RecoveryOrder = { id: string; status: "ASSIGNED" | "IN_TRANSIT" };
export type RecoveryReadiness = {
  actionable: boolean;
  blockedOrderIds: string[];
  reasons: string[];
};

const coordinate = (n: number, max: number) => Number.isFinite(n) && Math.abs(n) <= max;

export function validCustodyEvidence(e: CustodyEvidence, orderId: string): boolean {
  return e.orderId === orderId &&
    coordinate(e.handoverLatitude, 90) && coordinate(e.handoverLongitude, 180) &&
    Boolean(e.confirmedBy.trim()) && Boolean(e.eventId.trim()) &&
    Number.isFinite(Date.parse(e.confirmedAt)) &&
    Date.parse(e.confirmedAt) <= Date.now();
}

/**
 * Evidence must originate from a verified, tenant-scoped custody event in persistent storage.
 * Never treat user-submitted coordinates or an LLM claim as verified evidence.
 */
export function evaluateRecoveryReadiness(
  orders: RecoveryOrder[],
  verifiedEvidence: ReadonlyMap<string, CustodyEvidence>,
): RecoveryReadiness {
  const blockedOrderIds = orders.filter(o =>
    o.status === "IN_TRANSIT" && !(
      verifiedEvidence.has(o.id) &&
      validCustodyEvidence(verifiedEvidence.get(o.id)!, o.id)
    )
  ).map(o => o.id);
  return {
    actionable: blockedOrderIds.length === 0,
    blockedOrderIds,
    reasons: blockedOrderIds.length
      ? ["In-transit parcels require verified physical handover and custody records before execution."]
      : [],
  };
}

export function transitionRecoveryDecision(
  current: RecoveryDecision,
  action: "APPROVE" | "REJECT" | "EXECUTE",
  readiness: RecoveryReadiness,
  expectedVersion: number,
  actualVersion: number,
): RecoveryDecision {
  if (!Number.isSafeInteger(expectedVersion) || expectedVersion < 0 ||
      expectedVersion !== actualVersion) throw new Error("Recovery proposal changed; refresh before reviewing");
  if (action === "REJECT" && current === "PENDING") return "REJECTED";
  if (action === "APPROVE" && current === "PENDING" && readiness.actionable) return "APPROVED";
  if (action === "EXECUTE" && current === "APPROVED" && readiness.actionable) return "EXECUTED";
  throw new Error("Invalid or unsafe recovery decision transition");
}
