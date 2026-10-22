import { NextRequest, NextResponse } from "next/server";
import { RetrievalAssignSchema } from "@sage/site-schema";
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

  const parsed = RetrievalAssignSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      {
        error: "Unprocessable Entity",
        message: "Validation failed for retrieval assignment payload",
        details: parsed.error.flatten().fieldErrors,
      },
      { status: 422 },
    );
  }

  const result = sageRepo.assignRetrieval(auth.context.organizationId, id, parsed.data);
  if (result.error) {
    return NextResponse.json({ error: "Unprocessable Entity", message: result.error }, { status: 422 });
  }

  return NextResponse.json({
    success: true,
    data: result.leg,
    message: "Retrieval assigned.",
  });
}
