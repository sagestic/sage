import { NextRequest, NextResponse } from "next/server";
import { IngestOrderSchema } from "@sage/site-schema";
import { authenticateApiRequest } from "../../../../lib/api/auth";
import { sageRepo } from "../../../../lib/data/sage-repo";

export async function GET(req: NextRequest) {
  const auth = await authenticateApiRequest(req, "orders:read");
  if (!auth.success) return auth.response;

  const url = new URL(req.url);
  const statusFilter = url.searchParams.get("status") || "ALL";

  const orders = sageRepo.getOrders(auth.context.organizationId, statusFilter);

  return NextResponse.json({
    data: orders,
    meta: {
      total: orders.length,
      tenantId: auth.context.organizationId,
      statusFilter,
      timestamp: new Date().toISOString(),
    },
  });
}

export async function POST(req: NextRequest) {
  const auth = await authenticateApiRequest(req, "orders:write");
  if (!auth.success) return auth.response;

  try {
    const rawBody = await req.json();

    // Check optional Idempotency-Key HTTP header
    const idempotencyHeader = req.headers.get("idempotency-key");
    if (idempotencyHeader && !rawBody.idempotencyKey) {
      rawBody.idempotencyKey = idempotencyHeader;
    }

    // Validate using canonical Zod schema
    const parsed = IngestOrderSchema.safeParse(rawBody);
    if (!parsed.success) {
      return NextResponse.json(
        {
          error: "Unprocessable Entity",
          message: "Validation failed for canonical order payload",
          details: parsed.error.flatten().fieldErrors,
        },
        { status: 422 },
      );
    }

    // Ingest into canonical pipeline
    const { order, isDuplicate } = sageRepo.ingestCanonicalOrder(
      auth.context.organizationId,
      parsed.data,
    );

    return NextResponse.json(
      {
        success: true,
        isDuplicate,
        data: order,
        message: isDuplicate
          ? "Duplicate order recognized via idempotency key / external order ID. Returned existing record."
          : "Order ingested into canonical workflow successfully.",
      },
      {
        status: isDuplicate ? 200 : 201,
        headers: {
          "X-Idempotent-Replay": isDuplicate ? "true" : "false",
        },
      },
    );
  } catch (err) {
    return NextResponse.json(
      {
        error: "Bad Request",
        message: err instanceof Error ? err.message : "Malformed JSON body",
      },
      { status: 400 },
    );
  }
}
