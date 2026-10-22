import { NextRequest, NextResponse } from "next/server";
import { InviteRiderSchema } from "@sage/site-schema";
import { authenticateApiRequest } from "../../../../lib/api/auth";
import { sageRepo } from "../../../../lib/data/sage-repo";

export async function GET(req: NextRequest) {
  const auth = await authenticateApiRequest(req, "riders:read");
  if (!auth.success) return auth.response;

  const url = new URL(req.url);
  const statusFilter = url.searchParams.get("status") || "ALL";

  const riders = sageRepo.getRiders(auth.context.organizationId, statusFilter);

  return NextResponse.json({
    data: riders,
    meta: {
      total: riders.length,
      tenantId: auth.context.organizationId,
      timestamp: new Date().toISOString(),
    },
  });
}

export async function POST(req: NextRequest) {
  const auth = await authenticateApiRequest(req, "riders:write");
  if (!auth.success) return auth.response;

  try {
    const rawBody = await req.json();
    const parsed = InviteRiderSchema.safeParse(rawBody);

    if (!parsed.success) {
      return NextResponse.json(
        {
          error: "Unprocessable Entity",
          message: "Validation failed for rider invitation",
          details: parsed.error.flatten().fieldErrors,
        },
        { status: 422 },
      );
    }

    const { invitation, rawInviteUrl } = sageRepo.createRiderInvitation(
      auth.context.organizationId,
      parsed.data,
    );

    return NextResponse.json(
      {
        success: true,
        data: {
          id: invitation.id,
          name: invitation.name,
          phone: invitation.phone,
          status: invitation.status,
          vehicleType: invitation.vehicleType,
          expiresAt: invitation.expiresAt,
          invitationUrl: rawInviteUrl,
        },
        message: "Rider invitation generated. Single-use activation link ready to dispatch.",
      },
      { status: 201 },
    );
  } catch (err) {
    return NextResponse.json(
      {
        error: "Bad Request",
        message: err instanceof Error ? err.message : "Malformed JSON",
      },
      { status: 400 },
    );
  }
}
