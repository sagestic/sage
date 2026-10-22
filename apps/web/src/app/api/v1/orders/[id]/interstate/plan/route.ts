import { NextRequest, NextResponse } from "next/server";
import { InterstatePlanSchema } from "@sage/site-schema";
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

  const parsed = InterstatePlanSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      {
        error: "Unprocessable Entity",
        message: "Validation failed for interstate plan payload",
        details: parsed.error.flatten().fieldErrors,
      },
      { status: 422 },
    );
  }

  const result = sageRepo.planInterstate(auth.context.organizationId, id, parsed.data);
  if (result.error && result.legs.length === 0) {
    return NextResponse.json({ error: "Not Found", message: result.error }, { status: 404 });
  }

  return NextResponse.json(
    {
      success: true,
      data: result.legs,
      warning: result.error,
      message: "Interstate legs planned: first-mile, linehaul, last-mile.",
    },
    { status: 201 },
  );
}
