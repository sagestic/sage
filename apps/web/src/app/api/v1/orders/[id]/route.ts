import { NextRequest, NextResponse } from "next/server";
import { authenticateApiRequest } from "../../../../../lib/api/auth";
import { sageRepo } from "../../../../../lib/data/sage-repo";

export async function GET(
  req: NextRequest,
  context: { params: Promise<{ id: string }> },
) {
  const auth = await authenticateApiRequest(req, "orders:read");
  if (!auth.success) return auth.response;

  const { id } = await context.params;
  const order = sageRepo.getOrder(auth.context.organizationId, id);

  if (!order) {
    return NextResponse.json(
      {
        error: "Not Found",
        message: `Order '${id}' not found in active organization.`,
      },
      { status: 404 },
    );
  }

  return NextResponse.json({
    data: order,
    meta: {
      tenantId: auth.context.organizationId,
      timestamp: new Date().toISOString(),
    },
  });
}
