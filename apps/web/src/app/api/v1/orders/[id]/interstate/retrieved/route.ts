import { NextRequest, NextResponse } from "next/server";
import { ParkRetrievedSchema } from "@sage/site-schema";
import { authenticateApiRequest } from "../../../../../../../lib/api/auth";
import { sageRepo } from "../../../../../../../lib/data/sage-repo";

export async function POST(
  req: NextRequest,
  context: { params: Promise<{ id: string }> },
) {
  const auth = await authenticateApiRequest(req, "orders:write");
  if (!auth.success) return auth.response;

  const { id } = await context.params;
  let body: unknown;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Bad Request", message: "Malformed JSON body" }, { status: 400 });
  }

  const riderId = (body as { riderId?: unknown }).riderId;
  if (typeof riderId !== "string" || riderId.length < 2) {
    return NextResponse.json(
      { error: "Unprocessable Entity", message: "riderId is required" },
      { status: 422 },
    );
  }
  const parsed = ParkRetrievedSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      {
        error: "Unprocessable Entity",
        message: "Validation failed for park retrieval payload",
        details: parsed.error.flatten().fieldErrors,
      },
      { status: 422 },
    );
  }

  const result = sageRepo.recordParkRetrieved(auth.context.organizationId, id, riderId, parsed.data);
  if (result.error) {
    return NextResponse.json({ error: "Unprocessable Entity", message: result.error }, { status: 422 });
  }

  return NextResponse.json({
    success: true,
    data: result.leg,
    sealCheck: parsed.data.sealCheck,
    message:
      parsed.data.sealCheck === "BROKEN"
        ? "Retrieved with broken seal. Incident opened; last-mile continues."
        : "Park retrieval recorded. Last-mile is now active.",
  });
}
