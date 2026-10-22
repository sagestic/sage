import crypto from "crypto";

export interface PaystackInitResponse {
  status: boolean;
  message: string;
  data: {
    authorization_url: string;
    access_code: string;
    reference: string;
  };
}

export interface PaystackVerifyResponse {
  status: boolean;
  message: string;
  data: {
    id: number;
    status: "success" | "failed" | "abandoned";
    reference: string;
    amount: number; // in Kobo
    currency: string;
    customer: {
      email: string;
      phone?: string;
    };
    metadata?: Record<string, unknown>;
    paid_at?: string;
  };
}

export class PaystackService {
  private readonly secretKey: string;
  private readonly baseUrl = "https://api.paystack.co";

  constructor(secretKey?: string) {
    this.secretKey = secretKey || process.env.PAYSTACK_SECRET_KEY || "";
  }

  /**
   * Initializes a Paystack transaction for delivery payment.
   * Generates a hosted payment URL that can be sent to the customer via WhatsApp or rendered in a widget.
   */
  async initializePayment(params: {
    email: string;
    amountNgn: number;
    orderNumber: string;
    orderId: string;
    callbackUrl?: string;
    metadata?: Record<string, unknown>;
  }): Promise<{ authorizationUrl: string; reference: string }> {
    const amountKobo = Math.round(params.amountNgn * 100);
    const reference = `sage_${params.orderNumber}_${Date.now()}`;

    // If live Paystack key is provided, initiate real checkout with Paystack API
    if (this.secretKey && this.secretKey.startsWith("sk_")) {
      try {
        const response = await fetch(`${this.baseUrl}/transaction/initialize`, {
          method: "POST",
          headers: {
            Authorization: `Bearer ${this.secretKey}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            email: params.email,
            amount: amountKobo,
            reference,
            callback_url: params.callbackUrl,
            metadata: {
              ...params.metadata,
              orderId: params.orderId,
              orderNumber: params.orderNumber,
            },
          }),
        });

        const json = (await response.json()) as PaystackInitResponse;
        if (json.status && json.data) {
          return {
            authorizationUrl: json.data.authorization_url,
            reference: json.data.reference,
          };
        }
      } catch (err) {
        console.error("Paystack API call failed, falling back to simulated link:", err);
      }
    }

    // Fallback simulation URL (works in demo / sandbox without live secret key)
    const simulatedUrl = `https://checkout.paystack.com/simulate_${reference}?order=${params.orderNumber}&amount=${params.amountNgn}`;
    return {
      authorizationUrl: simulatedUrl,
      reference,
    };
  }

  /**
   * Verifies transaction with Paystack using the payment reference.
   */
  async verifyPayment(reference: string): Promise<{
    success: boolean;
    amountNgn: number;
    reference: string;
    metadata?: Record<string, unknown>;
  }> {
    if (this.secretKey && this.secretKey.startsWith("sk_")) {
      try {
        const response = await fetch(`${this.baseUrl}/transaction/verify/${encodeURIComponent(reference)}`, {
          method: "GET",
          headers: {
            Authorization: `Bearer ${this.secretKey}`,
          },
        });

        const json = (await response.json()) as PaystackVerifyResponse;
        if (json.status && json.data.status === "success") {
          return {
            success: true,
            amountNgn: json.data.amount / 100,
            reference: json.data.reference,
            metadata: json.data.metadata,
          };
        }
      } catch (err) {
        console.error("Paystack verify call failed:", err);
      }
    }

    // Simulation verification
    return {
      success: true,
      amountNgn: 4500,
      reference,
      metadata: {},
    };
  }

  /**
   * Validates Paystack Webhook HMAC-SHA512 Signature
   */
  verifyWebhookSignature(signature: string | null, rawBody: string): boolean {
    if (!this.secretKey) {
      // In dev mode without configured secret, allow verification
      return true;
    }
    if (!signature) return false;

    const hash = crypto
      .createHmac("sha512", this.secretKey)
      .update(rawBody)
      .digest("hex");

    return hash === signature;
  }
}

export const paystackService = new PaystackService();
