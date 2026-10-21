import type { HealthCheckResponse } from "@sage/site-schema";
import { Controller, Get } from "@nestjs/common";

import { AppService } from "./app.service";

@Controller()
export class AppController {
  constructor(private readonly appService: AppService) {}

  @Get("health")
  getHealth(): HealthCheckResponse {
    return this.appService.getHealth();
  }
}
