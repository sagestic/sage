import assert from "node:assert/strict";
import test from "node:test";
import { planRecovery, validatePlan } from "./index.ts";
import type { RecoveryRequest } from "./types.ts";

const request = (): RecoveryRequest => ({
  incident: { id: "incident-1", kind: "breakdown", vehicleId: "broken" },
  currentMinute: 0,
  vehicles: [
    { id: "broken", status: "available", capacityKg: 100, availableAtMinute: 0, location: { lat: 6.5, lng: 3.3 }, costPerKm: 1 },
    { id: "van-a", status: "available", capacityKg: 100, availableAtMinute: 0, location: { lat: 6.5, lng: 3.3 }, costPerKm: 1 },
    { id: "van-b", status: "available", capacityKg: 100, availableAtMinute: 0, location: { lat: 6.51, lng: 3.31 }, costPerKm: 1 },
  ],
  deliveries: [
    { id: "d1", location: { lat: 6.52, lng: 3.32 }, weightKg: 20, deadlineMinute: 90, serviceMinutes: 5, priority: 2 },
    { id: "d2", location: { lat: 6.53, lng: 3.33 }, weightKg: 30, deadlineMinute: 120, serviceMinutes: 5, priority: 1 },
  ],
});
test("produces ranked recovery options without using broken vehicle", () => {
  const result = planRecovery(request());
  assert.equal(result.feasible, true);
  assert.ok(result.options.length >= 2);
  for (const option of result.options) {
    assert.deepEqual(validatePlan(request(), option), []);
    assert.ok(option.routes.every((route) => route.vehicleId !== "broken"));
  }
  assert.ok(result.options[0].score <= result.options[1].score);
});
test("rejects impossible vehicle capacity", () => {
  const input = request();
  input.deliveries[0].weightKg = 200;
  const result = planRecovery(input);
  assert.equal(result.feasible, false);
  assert.match(result.rejectedReasons.join(" "), /capacity/);
});
test("rejects invalid negative weights", () => {
  const input = request();
  input.deliveries[0].weightKg = -1;
  assert.throws(() => planRecovery(input), /Invalid delivery/);
});
test("returns empty plan when no outstanding deliveries", () => {
  const input = request();
  input.deliveries = [];
  assert.equal(planRecovery(input).options[0].routes.length, 0);
});
test("detects duplicate assignments", () => {
  const input = request();
  const option = planRecovery(input).options[0];
  option.routes[0].stops.push({ ...option.routes[0].stops[0] });
  assert.ok(validatePlan(input, option).some((e) => e.includes("Repeated delivery")));
});
test("rejects excessive problem size without claiming optimality", () => {
  const input = request();
  input.deliveries = Array.from({ length: 9 }, (_, i) => ({ ...input.deliveries[0], id: `d-${i}` }));
  assert.equal(planRecovery(input).feasible, false);
});
test("delay shifts affected vehicle start time", () => {
  const input = request();
  input.incident = { id: "delay-1", kind: "delay", vehicleId: "van-a", delayMinutes: 60 };
  input.vehicles[0].status = "unavailable";
  input.vehicles[2].status = "unavailable";
  const result = planRecovery(input);
  assert.equal(result.feasible, true);
  assert.ok(result.options[0].routes[0].stops[0].arrivalMinute >= 60);
});
