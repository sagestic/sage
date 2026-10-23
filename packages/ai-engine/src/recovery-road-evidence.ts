/** External road-route metrics are optional enrichment, never solver guarantees. */
export type RoadMetrics = {
  provider: "GOOGLE_ROUTES";
  distanceMeters: number;
  durationSeconds: number;
  observedAt: string;
};
export type RecoveryDistanceEvidence =
  | { source: "HAVERSINE"; liveRoadEstimate: false; distanceMeters: number }
  | { source: "GOOGLE_ROUTES"; liveRoadEstimate: true; distanceMeters: number; durationSeconds: number; observedAt: string };

export function selectRecoveryDistanceEvidence(
  solverDistanceMeters: number,
  road: RoadMetrics | undefined,
): RecoveryDistanceEvidence {
  if (!Number.isFinite(solverDistanceMeters) || solverDistanceMeters < 0)
    throw new Error("Invalid solver distance");
  if (road &&
      Number.isFinite(road.distanceMeters) && road.distanceMeters >= 0 &&
      Number.isFinite(road.durationSeconds) && road.durationSeconds >= 0 &&
      Number.isFinite(Date.parse(road.observedAt)) &&
      Date.parse(road.observedAt) <= Date.now() &&
      Date.now() - Date.parse(road.observedAt) <= 5 * 60_000) {
    return {
      source: "GOOGLE_ROUTES", liveRoadEstimate: true,
      distanceMeters: road.distanceMeters, durationSeconds: road.durationSeconds,
      observedAt: road.observedAt,
    };
  }
  return { source: "HAVERSINE", liveRoadEstimate: false, distanceMeters: solverDistanceMeters };
}
