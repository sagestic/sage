import { NextRequest, NextResponse } from "next/server";
import { authenticateApiRequest } from "../../../../lib/api/auth";
import { sageRepo } from "../../../../lib/data/sage-repo";

export async function GET(req: NextRequest) {
  const auth = await authenticateApiRequest(req, "recommendations:read");
  if (!auth.success) return auth.response;

  const recommendations = sageRepo.getRecommendations(auth.context.organizationId);

  return NextResponse.json({
    data: recommendations,
    meta: {
      total: recommendations.length,
      tenantId: auth.context.organizationId,
      timestamp: new Date().toISOString(),
    },
  });
}
