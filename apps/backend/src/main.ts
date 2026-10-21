import "reflect-metadata";

import { NestFactory } from "@nestjs/core";
import {
  FastifyAdapter,
  NestFastifyApplication,
} from "@nestjs/platform-fastify";

import { AppModule } from "./app.module";

async function bootstrap() {
  const app = await NestFactory.create<NestFastifyApplication>(
    AppModule,
    new FastifyAdapter(),
  );
  await app.enableCors();
  const port = Number(process.env.PORT) || 4000;
  await app.listen(port, "0.0.0.0");
  console.log(`Backend server running on http://0.0.0.0:${port}`);
}

bootstrap();
