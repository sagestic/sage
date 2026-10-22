import { NextRequest, NextResponse } from "next/server";
import { authenticateApiRequest } from "../../../../../lib/api/auth";
import { sageRepo } from "../../../../../lib/data/sage-repo";

// Overdue sweep for interstate linehaul legs.
// Intended to be called on a schedule (e.g. every 30 min via cron).
export async function POST(req: NextRequest) {
  const auth = await authenticateApiRequest(req, "orders:write");
  if (!auth.success) return auth.response;

  const flagged = sageRepo.flagOverdueLegs(auth.context.organizationId);

  return NextResponse.json({
    success: true,
    data: flagged,
    meta: {
      flaggedCount: flagged.length,
      tenantId: auth.context.organizationId,
      timestamp: new Date().toISOString(),
    },
  });
}
