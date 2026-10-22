import { distanceKm } from "./geo";
import type { Location } from "./types";

export type TravelEstimate = {
  distanceKm: number;
  durationMinutes: number;
  source: "haversine" | "google-routes";
  fallback: boolean;
};
export interface RoutingProvider {
  estimate(origin: Location, destination: Location): Promise<TravelEstimate>;
}
export class RoutingError extends Error {}

export class HaversineRoutingProvider implements RoutingProvider {
  constructor(private readonly speedKmh = 30) {
    if (!Number.isFinite(speedKmh) || speedKmh <= 0) throw new Error("speedKmh must be positive");
  }
  async estimate(origin: Location, destination: Location): Promise<TravelEstimate> {
    const km = distanceKm(origin, destination);
    return { distanceKm: km, durationMinutes: (km / this.speedKmh) * 60, source: "haversine", fallback: false };
  }
}

export type GoogleRoutesConfig = {
  apiKey: string;
  endpoint?: string;
  timeoutMs?: number;
  fetcher?: typeof fetch;
};
export class GoogleRoutesProvider implements RoutingProvider {
  private readonly fetcher: typeof fetch;
  private readonly endpoint: string;
  private readonly timeoutMs: number;
  constructor(private readonly config: GoogleRoutesConfig) {
    if (!config.apiKey) throw new Error("Google Routes API key is required");
    this.fetcher = config.fetcher ?? fetch;
    this.endpoint = config.endpoint ?? "https://routes.googleapis.com/directions/v2:computeRoutes";
    this.timeoutMs = config.timeoutMs ?? 6000;
    if (!Number.isFinite(this.timeoutMs) || this.timeoutMs <= 0) throw new Error("timeoutMs must be positive");
  }
  async estimate(origin: Location, destination: Location): Promise<TravelEstimate> {
    let response: Response;
    try {
      response = await this.fetcher(this.endpoint, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "X-Goog-Api-Key": this.config.apiKey,
          "X-Goog-FieldMask": "routes.distanceMeters,routes.duration",
        },
        body: JSON.stringify({
          origin: { location: { latLng: { latitude: origin.lat, longitude: origin.lng } } },
          destination: { location: { latLng: { latitude: destination.lat, longitude: destination.lng } } },
          travelMode: "DRIVE",
          routingPreference: "TRAFFIC_AWARE",
        }),
        signal: AbortSignal.timeout(this.timeoutMs),
      });
    } catch {
      throw new RoutingError("Google Routes request failed or timed out");
    }
    if (!response.ok) throw new RoutingError(`Google Routes returned HTTP ${response.status}`);
    let data: unknown;
    try { data = await response.json(); } catch { throw new RoutingError("Invalid Google Routes JSON"); }
    const route = (data as { routes?: { distanceMeters?: number; duration?: string }[] } | null)?.routes?.[0];
    const seconds = route?.duration && /^\d+(?:\.\d+)?s$/.test(route.duration)
      ? Number(route.duration.slice(0, -1)) : NaN;
    if (!route || !Number.isFinite(route.distanceMeters) || route.distanceMeters! < 0 ||
      !Number.isFinite(seconds) || seconds < 0) throw new RoutingError("Google Routes response missing valid route metrics");
    return { distanceKm: route.distanceMeters! / 1000, durationMinutes: seconds / 60, source: "google-routes", fallback: false };
  }
}

/** Explicit opt-in fallback; provenance is preserved for every estimate. */
export class FallbackRoutingProvider implements RoutingProvider {
  constructor(private readonly primary: RoutingProvider, private readonly secondary: RoutingProvider) {}
  async estimate(origin: Location, destination: Location): Promise<TravelEstimate> {
    try { return await this.primary.estimate(origin, destination); }
    catch {
      const estimate = await this.secondary.estimate(origin, destination);
      return { ...estimate, fallback: true };
    }
  }
}
