import { NextRequest, NextResponse } from "next/server";
import { sageRepo } from "../../../../../lib/data/sage-repo";
import { whatsAppAssistant } from "../../../../../lib/communication/whatsapp-assistant";

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

            // Extract sender and unstructured message body
            const senderPhone = msg.from;
            const rawText = msg.text?.body || "";

            // Process incoming message with Sage WhatsApp Assistant
            const assistantReply = await whatsAppAssistant.processInboundMessage(
              senderPhone,
              rawText,
              "org_apex_logistics",
            );

            // If customer was asking for live tracking, ETA, or Paystack payment link
            if (assistantReply.action === "TRACKING_INFO" || assistantReply.action === "PAYMENT_LINK") {
              // Log simulated or outbound WhatsApp transmission
              console.log(
                `[WhatsApp Cloud API Outbound] -> To ${senderPhone}:\n${assistantReply.body}`,
              );
              continue;
            }

            // Otherwise, treat as new unstructured delivery booking
            const phoneMatch =
              rawText.match(/(?:\+234|0)[789][01]\d{8}/) ||
              rawText.match(/\b\d{10,14}\b/);
            const recipientPhone = phoneMatch ? phoneMatch[0] : senderPhone;

            const nameMatch = rawText.match(
              /(?:Recipient|Customer|Name|Contact|Send to|Drop for)[:\s]+([A-Za-z\s]+?)(?:,|\.|\n|$)/i,
            );
            const recipientName = nameMatch
              ? nameMatch[1].trim()
              : `WhatsApp Customer (${senderPhone.slice(-4)})`;

            // Extract Pickup
            const pickupMatch = rawText.match(
              /(?:pick\s*up\s*(?:at|from)?|from)[:\s]+([^,\n]+)/i,
            );
            const pickupAddress = pickupMatch
              ? pickupMatch[1].trim()
              : "Main Dispatch Depot";

            // Extract Dropoff Destination (Landmarks / Unstructured address)
            const dropoffMatch = rawText.match(
              /(?:deliver\s*to|drop\s*at|send\s*to|to)[:\s]+([^,\n]+)/i,
            );
            const dropoffAddress = dropoffMatch
              ? dropoffMatch[1].trim()
              : rawText.length > 10
                ? rawText.slice(0, 120)
                : "Address Pending Clarification";

            // Evaluate address sufficiency (does it contain street / landmark cues?)
            const landmarkKeywords = [
              "street", "road", "way", "close", "ave", "lane", "crescent",
              "plaza", "junction", "roundabout", "behind", "opposite", "beside",
              "estate", "phase", "phase 1", "phase 2", "building", "gate",
            ];
            const hasLandmarkCue = landmarkKeywords.some((word) =>
              dropoffAddress.toLowerCase().includes(word),
            );

            const isConfirmed = hasLandmarkCue || dropoffAddress.length > 15;
            const newOrderNumber = `SG-${Math.floor(1000 + Math.random() * 9000)}`;
            const paystackLink = `https://checkout.paystack.com/simulate_${newOrderNumber}?amount=4500`;

            // Ingest canonical order into Sage
            sageRepo.ingestCanonicalOrder("org_apex_logistics", {
              source: "WHATSAPP",
              externalOrderId: newOrderNumber,
              recipientName,
              recipientPhone,
              pickupAddress,
              dropoffAddress,
              priority:
                rawText.toLowerCase().includes("urgent") ||
                rawText.toLowerCase().includes("rush")
                  ? "RUSH"
                  : "STANDARD",
              packageSize: "MEDIUM",
              notes: `WhatsApp Booking: "${rawText.slice(0, 160)}"`,
              metadata: {
                whatsappMessageId: messageId,
                rawSender: senderPhone,
                status: isConfirmed
                  ? "CONFIRMED"
                  : "CANDIDATE_REQUIRES_CLARIFICATION",
                customerTrackingUrl: `/track/${newOrderNumber}`,
                paystackUrl: paystackLink,
                deliveryFeeNgn: 4500,
                paymentStatus: "PENDING",
                requiresGeocoding: true,
                autoResponseSuggested: isConfirmed
                  ? `Booking confirmed (Order ${newOrderNumber})! Delivery Fee: ₦4,500. Pay online via Paystack: ${paystackLink} or pay upon arrival. Track courier live: https://sage-ops.com/track/${newOrderNumber}`
                  : "We received your delivery request! Please provide the street name or closest landmark for delivery.",
              },
            });

            // If confirmed, trigger autonomous corridor dispatch immediately
            if (isConfirmed) {
              sageRepo.autoDispatchPendingOrders("org_apex_logistics");
            }
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
