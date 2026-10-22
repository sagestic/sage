import { NextRequest, NextResponse } from "next/server";
import { paystackService } from "../../../../../lib/payment/paystack-service";
import { sageRepo } from "../../../../../lib/data/sage-repo";

/**
 * Paystack Webhook Handler
 * Listens for "charge.success" to automatically verify payments made via WhatsApp link,
 * tracking widget, or delivery checkout.
 */
export async function POST(req: NextRequest) {
  try {
    const rawBody = await req.text();
    const signature = req.headers.get("x-paystack-signature");

    // Validate Paystack HMAC signature
    if (!paystackService.verifyWebhookSignature(signature, rawBody)) {
      return NextResponse.json(
        { error: "Invalid signature" },
        { status: 400 },
      );
    }

    const payload = JSON.parse(rawBody);
    const event = payload.event;
    const data = payload.data;

    if (event === "charge.success") {
      const reference = data.reference;
      const amountNgn = (data.amount || 0) / 100;
      const metadata = data.metadata || {};
      const orderNumber =
        metadata.orderNumber ||
        metadata.orderId ||
        (reference.includes("sage_") ? reference.split("_")[1] : "");

      if (orderNumber) {
        // Mark order as PAID in Sage control center
        sageRepo.markOrderPaid(
          metadata.orgId || "org_apex_logistics",
          orderNumber,
          amountNgn,
          reference,
          "PAYSTACK",
        );
      }
    }

    return NextResponse.json({ status: "success", received: true });
  } catch (err) {
    return NextResponse.json(
      { error: "Webhook processing error", details: err instanceof Error ? err.message : String(err) },
      { status: 400 },
    );
  }
}
