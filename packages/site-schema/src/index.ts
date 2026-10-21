import { z } from "zod";

export const UserSchema = z.object({
  id: z.string().uuid(),
  email: z.string().email(),
  name: z.string().min(1),
  createdAt: z.date().optional(),
});

export type User = z.infer<typeof UserSchema>;

export const HealthCheckResponseSchema = z.object({
  status: z.enum(["ok", "error"]),
  uptime: z.number(),
  timestamp: z.string(),
});

export type HealthCheckResponse = z.infer<typeof HealthCheckResponseSchema>;

export type WebsiteDocument = {
  version?: string;
  sections?: unknown[];
  [key: string]: unknown;
};
