import { NextRequest, NextResponse } from "next/server";
import { sageRepo } from "../data/sage-repo";

// Simple in-memory rate limiter per key / IP (sliding 60-second window)
interface RateLimitRecord {
  count: number;
  resetAt: number;
}

const rateLimitMap = new Map<string, RateLimitRecord>();
const RATE_LIMIT_MAX = 60; // 60 requests per minute
const RATE_LIMIT_WINDOW_MS = 60_000;

function checkRateLimit(identifier: string): {
  allowed: boolean;
  limit: number;
  remaining: number;
  resetSeconds: number;
} {
  const now = Date.now();
  const record = rateLimitMap.get(identifier);

  if (!record || now > record.resetAt) {
    rateLimitMap.set(identifier, {
      count: 1,
      resetAt: now + RATE_LIMIT_WINDOW_MS,
    });
    return {
      allowed: true,
      limit: RATE_LIMIT_MAX,
      remaining: RATE_LIMIT_MAX - 1,
      resetSeconds: Math.ceil(RATE_LIMIT_WINDOW_MS / 1000),
    };
  }

  if (record.count >= RATE_LIMIT_MAX) {
    const resetSeconds = Math.max(1, Math.ceil((record.resetAt - now) / 1000));
    return {
      allowed: false,
      limit: RATE_LIMIT_MAX,
      remaining: 0,
      resetSeconds,
    };
  }

  record.count += 1;
  const remaining = Math.max(0, RATE_LIMIT_MAX - record.count);
  const resetSeconds = Math.max(1, Math.ceil((record.resetAt - now) / 1000));

  return {
    allowed: true,
    limit: RATE_LIMIT_MAX,
    remaining,
    resetSeconds,
  };
}

export interface ApiAuthContext {
  organizationId: string;
  scopes: string[];
  credentialName: string;
}

export type AuthResult =
  | { success: true; context: ApiAuthContext }
  | { success: false; response: NextResponse };

/**
 * Authenticates machine-to-machine requests using organization-scoped API credentials.
 * Enforces tenant isolation, scope checks, and rate limits.
 */
export async function authenticateApiRequest(
  req: NextRequest,
  requiredScope?: string,
): Promise<AuthResult> {
  // Extract token from header
  const authHeader = req.headers.get("authorization") || req.headers.get("x-api-key");

  if (!authHeader) {
    return {
      success: false,
      response: NextResponse.json(
        {
          error: "Unauthorized",
          message:
            "Missing Authorization header. Provide a valid machine-to-machine API key via 'Authorization: Bearer <key>' or 'x-api-key: <key>'.",
        },
        { status: 401 },
      ),
    };
  }

  const token = authHeader.startsWith("Bearer ")
    ? authHeader.slice(7).trim()
    : authHeader.trim();

  // Validate API key
  const validation = sageRepo.authenticateApiKey(token);
  if (!validation.valid || !validation.organizationId) {
    return {
      success: false,
      response: NextResponse.json(
        {
          error: "Unauthorized",
          message: validation.error || "Invalid or revoked API key.",
        },
        { status: 401 },
      ),
    };
  }

  // Rate Limiting
  const rateLimitKey = `${validation.organizationId}:${token.slice(0, 16)}`;
  const rateLimit = checkRateLimit(rateLimitKey);

  if (!rateLimit.allowed) {
    return {
      success: false,
      response: NextResponse.json(
        {
          error: "Too Many Requests",
          message: "Rate limit exceeded. Maximum 60 requests per minute.",
          retryAfterSeconds: rateLimit.resetSeconds,
        },
        {
          status: 429,
          headers: {
            "Retry-After": rateLimit.resetSeconds.toString(),
            "X-RateLimit-Limit": rateLimit.limit.toString(),
            "X-RateLimit-Remaining": "0",
            "X-RateLimit-Reset": rateLimit.resetSeconds.toString(),
          },
        },
      ),
    };
  }

  // Check required scope
  if (requiredScope && !validation.scopes.includes(requiredScope) && !validation.scopes.includes("*")) {
    return {
      success: false,
      response: NextResponse.json(
        {
          error: "Forbidden",
          message: `Insufficient permissions. This endpoint requires '${requiredScope}', but key only has [${validation.scopes.join(
            ", ",
          )}].`,
        },
        { status: 403 },
      ),
    };
  }

  return {
    success: true,
    context: {
      organizationId: validation.organizationId,
      scopes: validation.scopes,
      credentialName: validation.credentialName || "API Client",
    },
  };
}
