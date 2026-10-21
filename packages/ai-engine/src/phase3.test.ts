import assert from "node:assert/strict";
import test from "node:test";
import { createGeminiIncidentInterpreter } from "./gemini.ts";
import { optimizeRoadRecovery } from "./road-optimizer.ts";
import type { RecoveryRequest } from "./types.ts";
import type { RoutingProvider } from "./routing.ts";

const base = (): RecoveryRequest => ({
  incident: { id: "incident-3", kind: "breakdown", vehicleId: "broken" },
  currentMinute: 0,
  vehicles: [
    { id: "broken", status: "available", capacityKg: 200, availableAtMinute: 0, location: { lat: 0, lng: 0 }, costPerKm: 1 },
    { id: "van-1", status: "available", capacityKg: 30, availableAtMinute: 0, location: { lat: 0, lng: 0 }, costPerKm: 1 },
    { id: "van-2", status: "available", capacityKg: 30, availableAtMinute: 0, location: { lat: 0, lng: 0 }, costPerKm: 1 },
  ],
  deliveries: [
    { id: "d1", location: { lat: 0.01, lng: 0.01 }, weightKg: 20, deadlineMinute: 60, serviceMinutes: 5, priority: 1 },
    { id: "d2", location: { lat: 0.02, lng: 0.02 }, weightKg: 20, deadlineMinute: 60, serviceMinutes: 5, priority: 1 },
  ],
});
const road: RoutingProvider = {
  async estimate(a, b) {
    return { distanceKm: Math.abs(a.lat - b.lat) * 100, durationMinutes: Math.abs(a.lat - b.lat) * 1000, source: "google-routes", fallback: false };
  },
};
test("Gemini REST adapter parses structured JSON and requires human review", async () => {
  const fetcher = async () => new Response(JSON.stringify({ candidates: [{ content: { parts: [{ text: JSON.stringify({ kind: "delay", vehicleId: "van-1", delayMinutes: 20, confidence: 0.8, evidence: "20 minutes" }) }] } }] }), { status: 200 });
  const interpreter = createGeminiIncidentInterpreter({ apiKey: "test", fetcher: fetcher as typeof fetch });
  const result = await interpreter.interpret("i", "van-1 delayed 20 minutes");
  assert.equal(result.incident.delayMinutes, 20);
  assert.equal(result.requiresHumanReview, true);
});
test("Gemini rejects missing incident facts", async () => {
  const fetcher = async () => new Response(JSON.stringify({ candidates: [{ content: { parts: [{ text: JSON.stringify({ kind: "breakdown", confidence: 0.99 }) }] } }] }), { status: 200 });
  const interpreter = createGeminiIncidentInterpreter({ apiKey: "test", fetcher: fetcher as typeof fetch });
  await assert.rejects(() => interpreter.interpret("i", "truck broken"), /Vehicle identifier/);
});
test("road optimization respects capacity and excludes broken vehicle", async () => {
  const result = await optimizeRoadRecovery(base(), road);
  assert.equal(result.feasible, true);
  assert.equal(result.routingSource, "google-routes");
  assert.equal(result.options[0].routes.length, 2);
  assert.ok(result.options[0].routes.every(r => r.vehicleId !== "broken" && r.loadKg <= 30));
});
test("hard deadlines reject late routes", async () => {
  const request = base();
  request.deliveries[0].deadlineMinute = 1;
  const result = await optimizeRoadRecovery(request, road, { hardDeadlines: true });
  assert.equal(result.feasible, false);
});
test("strict routing mode rejects fallback estimates", async () => {
  const fallback: RoutingProvider = { async estimate() { return { distanceKm: 1, durationMinutes: 1, source: "haversine", fallback: true }; } };
  await assert.rejects(() => optimizeRoadRecovery(base(), fallback, { requireRoadData: true }), /Road routing required/);
});
test("scales past the original eight-delivery bound", async () => {
  const request = base();
  request.deliveries = Array.from({ length: 9 }, (_, i) => ({ ...request.deliveries[0], id: "d" + i, weightKg: 2 }));
  const result = await optimizeRoadRecovery(request, road);
  assert.equal(result.feasible, true);
  assert.equal(result.options[0].routes.flatMap(r => r.stops).length, 9);
  assert.equal(result.optimalityGuaranteed, false);
});
