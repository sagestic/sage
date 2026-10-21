import { z } from "zod";

const skipValidation = ["1", "true"].includes(
  process.env.SKIP_ENV_VALIDATION || "",
);

const serverSchema = z.object({
  NODE_ENV: z
    .enum(["development", "test", "production"])
    .default("development"),
  API_URL: z.string().url().optional(),
  AUTH_SECRET: z.string().min(32).optional(),
  NEXTAUTH_SECRET: z.string().min(32).optional(),
  NEXTAUTH_URL: z.string().url().optional(),
});

const clientSchema = z.object({
  NEXT_PUBLIC_API_URL: z.string().url().optional(),
  NEXT_PUBLIC_SITE_URL: z.string().url().optional(),
});

function validateEnv() {
  if (skipValidation) {
    return {
      NODE_ENV: process.env.NODE_ENV || "development",
      API_URL: process.env.API_URL,
      AUTH_SECRET: process.env.AUTH_SECRET,
      NEXTAUTH_SECRET: process.env.NEXTAUTH_SECRET,
      NEXTAUTH_URL: process.env.NEXTAUTH_URL,
      NEXT_PUBLIC_API_URL: process.env.NEXT_PUBLIC_API_URL,
      NEXT_PUBLIC_SITE_URL: process.env.NEXT_PUBLIC_SITE_URL,
    };
  }

  const server = serverSchema.parse({
    NODE_ENV: process.env.NODE_ENV,
    API_URL: process.env.API_URL,
    AUTH_SECRET: process.env.AUTH_SECRET,
    NEXTAUTH_SECRET: process.env.NEXTAUTH_SECRET,
    NEXTAUTH_URL: process.env.NEXTAUTH_URL,
  });

  const client = clientSchema.parse({
    NEXT_PUBLIC_API_URL: process.env.NEXT_PUBLIC_API_URL,
    NEXT_PUBLIC_SITE_URL: process.env.NEXT_PUBLIC_SITE_URL,
  });

  return { ...server, ...client };
}

export const env = validateEnv();
