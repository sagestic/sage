import { NextRequest, NextResponse } from "next/server";
import { sageRepo } from "../../../../../lib/data/sage-repo";

// In-memory message deduplication set
const processedMessageIds = new Set<string>();

/**
 * Meta WhatsApp Business Platform Webhook Verification Handshake
 * Used when configuring webhook in Meta App Dashboard
 */
export async function GET(req: NextRequest) {
  const url = new URL(req.url);
  const mode = url.searchParams.get("hub.mode");
  const token = url.searchParams.get("hub.verify_token");
  const challenge = url.searchParams.get("hub.challenge");

  const expectedToken =
    process.env.WHATSAPP_VERIFY_TOKEN || "sage_whatsapp_webhook_verify_token";

  if (mode === "subscribe" && token === expectedToken) {
    return new NextResponse(challenge || "OK", {
      status: 200,
      headers: { "Content-Type": "text/plain" },
    });
  }

  return NextResponse.json(
    {
      error: "Forbidden",
      message: "Webhook verification token mismatch.",
    },
    { status: 403 },
  );
}

/**
 * Incoming WhatsApp Message Webhook Handler
 * Promptly acknowledges receipt (200 OK) and delegates AI extraction & candidate generation
 */
export async function POST(req: NextRequest) {
  try {
    const body = await req.json();

    // Check Meta payload format
    if (body.object !== "whatsapp_business_account") {
      return NextResponse.json(
        { status: "ignored", reason: "Not a whatsapp_business_account object" },
        { status: 200 },
      );
    }

    const entries = body.entry || [];
    let receivedCount = 0;
    let duplicateCount = 0;

    for (const entry of entries) {
      const changes = entry.changes || [];
      for (const change of changes) {
        if (change.field === "messages") {
          const value = change.value;
          const messages = value.messages || [];

          for (const msg of messages) {
            const messageId = msg.id;

            // Deduplication
            if (messageId && processedMessageIds.has(messageId)) {
              duplicateCount++;
              continue;
            }

            if (messageId) {
              processedMessageIds.add(messageId);
            }

            receivedCount++;

            // Extract sender and message text
            const senderPhone = msg.from;
            const messageText = msg.text?.body || "";

            // Log event to active default tenant
            sageRepo.ingestCanonicalOrder("org_apex_logistics", {
              source: "WHATSAPP",
              externalOrderId: messageId,
              recipientName: `WhatsApp Contact (${senderPhone.slice(-4)})`,
              recipientPhone: senderPhone,
              pickupAddress: "Pending Extraction / Depot Default",
              dropoffAddress: messageText.slice(0, 100) || "Address pending extraction",
              priority: "STANDARD",
              packageSize: "MEDIUM",
              notes: `Ingested from WhatsApp message: "${messageText}"`,
              metadata: {
                whatsappMessageId: messageId,
                rawSender: senderPhone,
                status: "CANDIDATE_REQUIRES_CLARIFICATION",
              },
            });
          }
        }
      }
    }

    // Acknowledge promptly to prevent Meta webhook retries
    return NextResponse.json({
      status: "received",
      processed: receivedCount,
      duplicates: duplicateCount,
      timestamp: new Date().toISOString(),
    });
  } catch (err) {
    // Return 200 even on unexpected payloads to prevent Meta webhook blacklisting
    return NextResponse.json(
      {
        status: "error_acknowledged",
        message: err instanceof Error ? err.message : "Error parsing payload",
      },
      { status: 200 },
    );
  }
}
