import { NextRequest, NextResponse } from "next/server";
import { CoordinatesSchema } from "@sage/site-schema";
import { sageRepo } from "../../../../../../lib/data/sage-repo";

export async function POST(
  req: NextRequest,
  context: { params: Promise<{ id: string }> },
) {
  try {
    const { id } = await context.params;
    const body = await req.json();

    const parsed = CoordinatesSchema.safeParse({
      latitude: body.latitude,
      longitude: body.longitude,
    });

    if (!parsed.success) {
      return NextResponse.json(
        {
          error: "Unprocessable Entity",
          message: "Invalid GPS coordinates (-90..90, -180..180 required)",
          details: parsed.error.flatten().fieldErrors,
        },
        { status: 422 },
      );
    }

    const orgId = "org_apex_logistics";
    const success = sageRepo.updateRiderLocation(
      orgId,
      id,
      parsed.data.latitude,
      parsed.data.longitude,
      typeof body.battery === "number" ? body.battery : undefined,
    );

    if (!success) {
      return NextResponse.json(
        { error: "Not Found", message: `Courier '${id}' not found.` },
        { status: 404 },
      );
    }

    return NextResponse.json({
      success: true,
      data: {
        riderId: id,
        latitude: parsed.data.latitude,
        longitude: parsed.data.longitude,
        speed: body.speed,
        timestamp: new Date().toISOString(),
      },
      message: "Telemetry ingested. Fleet radar updated.",
    });
  } catch (err) {
    return NextResponse.json(
      {
        error: "Bad Request",
        message: err instanceof Error ? err.message : "Malformed request",
      },
      { status: 400 },
    );
  }
}
