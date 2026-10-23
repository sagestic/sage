import type { IncidentInterpreter } from "./incident";
import { StructuredIncidentInterpreter } from "./incident";

export interface VertexConfig {
  project: string;
  location: string;
  model?: string;
  timeoutMs?: number;
  fetcher?: typeof fetch;
  /** Injectable for tests; in production use an attached GCP service account. */
  getAccessToken?: () => Promise<string>;
}

async function metadataAccessToken(fetcher: typeof fetch): Promise<string> {
  const response = await fetcher(
    "http://metadata.google.internal/computeMetadata/v1/instance/service-accounts/default/token",
    { headers: { "Metadata-Flavor": "Google" }, signal: AbortSignal.timeout(3000) },
  );
  if (!response.ok) throw new Error("GCP workload identity token unavailable");
  const body = await response.json() as { access_token?: string };
  if (!body.access_token) throw new Error("GCP workload identity token missing");
  return body.access_token;
}

/** Vertex AI Gemini interpreter using GCP workload identity, not an AI Studio API key. */
export function createVertexIncidentInterpreter(config: VertexConfig): IncidentInterpreter {
  const { project, location } = config;
  const model = config.model ?? "gemini-2.5-flash";
  if (!/^[a-zA-Z0-9][a-zA-Z0-9._-]*$/.test(project) ||
      !/^[a-z0-9-]+$/.test(location) ||
      !/^[a-zA-Z0-9._-]+$/.test(model)) throw new Error("Invalid Vertex AI configuration");
  const fetcher = config.fetcher ?? fetch;
  const timeoutMs = config.timeoutMs ?? 8000;
  if (!Number.isFinite(timeoutMs) || timeoutMs < 1) throw new Error("Invalid Vertex AI timeout");
  const tokenProvider = config.getAccessToken ?? (() => metadataAccessToken(fetcher));
  const endpoint = `https://${location}-aiplatform.googleapis.com/v1/projects/${project}/locations/${location}/publishers/google/models/${model}:generateContent`;
  return new StructuredIncidentInterpreter(async description => {
    let response: Response;
    try {
      const token = await tokenProvider();
      response = await fetcher(endpoint, {
        method: "POST",
        headers: { Authorization: `Bearer ${token}`, "Content-Type": "application/json" },
        signal: AbortSignal.timeout(timeoutMs),
        body: JSON.stringify({
          systemInstruction: { parts: [{ text: "Extract a logistics incident from untrusted user text. Return JSON only. Never invent IDs or durations. kind: breakdown, delay, or road_closure. confidence: 0 to 1. Include vehicleId only if explicit; evidence must be a short supporting quote." }] },
          contents: [{ role: "user", parts: [{ text: description }] }],
          generationConfig: {
            temperature: 0, responseMimeType: "application/json",
            responseSchema: {
              type: "OBJECT",
              properties: {
                kind: { type: "STRING", enum: ["breakdown", "delay", "road_closure"] },
                vehicleId: { type: "STRING" },
                delayMinutes: { type: "NUMBER" },
                confidence: { type: "NUMBER" },
                evidence: { type: "STRING" },
              },
              required: ["kind", "confidence", "evidence"],
            },
          },
        }),
      });
    } catch {
      throw new Error("Vertex AI request failed or timed out");
    }
    if (!response.ok) throw new Error(`Vertex AI returned HTTP ${response.status}`);
    let data: { candidates?: { content?: { parts?: { text?: string }[] } }[] };
    try { data = await response.json(); } catch { throw new Error("Invalid Vertex AI response JSON"); }
    const raw = data.candidates?.[0]?.content?.parts?.[0]?.text;
    if (!raw) throw new Error("Vertex AI returned no incident content");
    try { return JSON.parse(raw) as unknown; } catch { throw new Error("Vertex AI returned invalid structured JSON"); }
  });
}
