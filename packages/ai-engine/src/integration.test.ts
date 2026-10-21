import assert from "node:assert/strict";
import test from "node:test";
import { FallbackRoutingProvider, GoogleRoutesProvider, HaversineRoutingProvider } from "./routing.ts";
import { StructuredIncidentInterpreter } from "./incident.ts";
import { RecoveryPreviewService } from "./ai-orchestration.ts";
import type { RecoveryRequest } from "./types.ts";

const origin = { lat: 6.5, lng: 3.3 };
test("offline routing produces finite estimates", async () => {
  const result = await new HaversineRoutingProvider().estimate(origin, { lat: 6.51, lng: 3.31 });
  assert.ok(result.distanceKm > 0);
  assert.equal(result.source, "haversine");
});
test("Google Routes parses mocked metrics", async () => {
  const fetcher = async () => new Response(JSON.stringify({ routes: [{ distanceMeters: 1200, duration: "180s" }] }), { status: 200 });
  const provider = new GoogleRoutesProvider({ apiKey: "test", fetcher: fetcher as typeof fetch });
  const result = await provider.estimate(origin, origin);
  assert.equal(result.distanceKm, 1.2);
  assert.equal(result.durationMinutes, 3);
});
test("fallback provenance is explicit", async () => {
  const broken = new GoogleRoutesProvider({ apiKey: "test", fetcher: (async () => new Response("error", { status: 503 })) as typeof fetch });
  const result = await new FallbackRoutingProvider(broken, new HaversineRoutingProvider()).estimate(origin, origin);
  assert.equal(result.fallback, true);
});
test("invalid structured interpretation is rejected", async () => {
  const interpreter = new StructuredIncidentInterpreter(async () => ({ kind: "breakdown", confidence: 0.99 }));
  await assert.rejects(() => interpreter.interpret("i1", "vehicle stopped"), /Vehicle identifier/);
});
test("structured interpretation always requires human review", async () => {
  const interpreter = new StructuredIncidentInterpreter(async () => ({ kind: "delay", delayMinutes: 30, confidence: 0.9 }));
  assert.equal((await interpreter.interpret("i1", "late")).requiresHumanReview, true);
});
test("preview does not mutate existing request", () => {
  const request: RecoveryRequest = { incident: { id: "i", kind: "road_closure" }, currentMinute: 0, vehicles: [], deliveries: [] };
  const before = JSON.stringify(request);
  const preview = new RecoveryPreviewService(new StructuredIncidentInterpreter(async () => ({})), new HaversineRoutingProvider());
  assert.equal(preview.preview(request).feasible, true);
  assert.equal(JSON.stringify(request), before);
});
