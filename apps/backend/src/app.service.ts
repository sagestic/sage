import type { HealthCheckResponse } from "@sage/site-schema";
import { Injectable } from "@nestjs/common";

@Injectable()
export class AppService {
  getHealth(): HealthCheckResponse {
    return {
      status: "ok",
      uptime: process.uptime(),
      timestamp: new Date().toISOString(),
    };
  }
}
