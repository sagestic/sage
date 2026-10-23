import assert from "node:assert/strict";
import { test } from "node:test";
import { createVertexIncidentInterpreter } from "./vertex";

test("Vertex AI uses OAuth bearer token and parses structured incident", async () => {
  let url = "";
  let auth = "";
  const fetcher = (async (input: RequestInfo | URL, init?: RequestInit) => {
    url = String(input);
    auth = new Headers(init?.headers).get("authorization") ?? "";
    return new Response(JSON.stringify({
      candidates: [{ content: { parts: [{ text: JSON.stringify({
        kind: "breakdown", vehicleId: "rdr_apex_1", confidence: 0.99,
        evidence: "rdr_apex_1 broken down",
      }) }] } }],
    }), { status: 200 });
  }) as typeof fetch;
  const result = await createVertexIncidentInterpreter({
    project: "sage-demo", location: "us-central1",
    fetcher, getAccessToken: async () => "test-token",
  }).interpret("incident-1", "rdr_apex_1 broken down");
  assert.match(url, /us-central1-aiplatform.googleapis.com/);
  assert.equal(auth, "Bearer test-token");
  assert.equal(result.incident.kind, "breakdown");
});

test("Vertex AI rejects non-200 provider responses without leaking payloads", async () => {
  const interpreter = createVertexIncidentInterpreter({
    project: "sage-demo", location: "us-central1",
    getAccessToken: async () => "secret",
    fetcher: (async () => new Response("secret payload", { status: 403 })) as typeof fetch,
  });
  await assert.rejects(() => interpreter.interpret("incident-2", "rdr_apex_1 broken down"), /HTTP 403/);
});

test("Vertex AI rejects invalid configuration", () => {
  assert.throws(() => createVertexIncidentInterpreter({
    project: "invalid/project", location: "us-central1",
  }), /Invalid Vertex AI configuration/);
});
