import { sageRepo, type OrderItem } from "../data/sage-repo";
import { paystackService } from "../payment/paystack-service";

export interface WhatsAppReply {
  to: string;
  body: string;
  action?: "TRACKING_INFO" | "PAYMENT_LINK" | "ORDER_CREATED" | "CLARIFICATION_REQUIRED";
  orderNumber?: string;
}

/**
 * Intelligent WhatsApp Communications Assistant for Logistics.
 * Answers customer questions using real-time operational data, ETAs, and Paystack integration.
 */
export class WhatsAppAssistant {
  /**
   * Evaluates inbound WhatsApp customer message and generates state-aware response.
   */
  async processInboundMessage(
    senderPhone: string,
    rawText: string,
    orgId: string = "org_apex_logistics",
  ): Promise<WhatsAppReply> {
    const text = rawText.trim();
    const textLower = text.toLowerCase();

    // 1. Detect if customer is querying an order or tracking
    const orderMatch =
      text.match(/\b(?:ORD|SG)-\d+\b/i) ||
      text.match(/#(\d{4,6})/);

    let foundOrder: OrderItem | undefined;

    if (orderMatch) {
      const orderQuery = orderMatch[0].replace("#", "").toUpperCase();
      foundOrder = sageRepo.getOrders(orgId).find(
        (o) =>
          o.orderNumber.toUpperCase() === orderQuery ||
          o.id.toUpperCase() === orderQuery,
      );
    }

    // If no order number in text, match by sender's phone number against active orders
    if (!foundOrder && senderPhone) {
      const sanitizedSender = senderPhone.replace(/\D/g, "");
      foundOrder = sageRepo.getOrders(orgId).find((o) => {
        const orderPhone = o.customerPhone.replace(/\D/g, "");
        return (
          (orderPhone && sanitizedSender.endsWith(orderPhone.slice(-8))) ||
          (sanitizedSender && orderPhone.endsWith(sanitizedSender.slice(-8)))
        );
      });
    }

    // Intent: Payment Inquiry or Request for Payment Link
    if (
      foundOrder &&
      (textLower.includes("pay") ||
        textLower.includes("cost") ||
        textLower.includes("account") ||
        textLower.includes("how much") ||
        textLower.includes("price") ||
        textLower.includes("transfer"))
    ) {
      const amount = foundOrder.paymentAmount || 4500;
      const paymentInit = await paystackService.initializePayment({
        email: foundOrder.customerEmail || `customer_${foundOrder.orderNumber}@sage.ops`,
        amountNgn: amount,
        orderNumber: foundOrder.orderNumber,
        orderId: foundOrder.id,
      });

      if (foundOrder.paymentStatus === "PAID") {
        return {
          to: senderPhone,
          body: `Hello ${foundOrder.customerName}! Payment of ₦${amount.toLocaleString()} for order ${foundOrder.orderNumber} is already confirmed & verified ✓. Your courier ${foundOrder.assignedRiderName || "on duty"} has clearance for direct release.`,
          action: "PAYMENT_LINK",
          orderNumber: foundOrder.orderNumber,
        };
      }

      return {
        to: senderPhone,
        body: `Hello ${foundOrder.customerName}! The total delivery fee for order ${foundOrder.orderNumber} is ₦${amount.toLocaleString()}.\n\n💳 Pay securely now via Paystack:\n${paymentInit.authorizationUrl}\n\nOnce paid, our operations system automatically verifies receipt and informs your courier instantly!`,
        action: "PAYMENT_LINK",
        orderNumber: foundOrder.orderNumber,
      };
    }

    // Intent: Tracking Status / ETA Inquiry
    if (
      foundOrder &&
      (textLower.includes("where") ||
        textLower.includes("track") ||
        textLower.includes("eta") ||
        textLower.includes("when") ||
        textLower.includes("time") ||
        textLower.includes("rider") ||
        textLower.includes("status") ||
        orderMatch)
    ) {
      const tracking = sageRepo.getPublicTrackingOrder(foundOrder.orderNumber);
      const courier = tracking?.courier;
      const statusText =
        foundOrder.status === "IN_TRANSIT"
          ? "is out for delivery"
          : foundOrder.status === "ASSIGNED"
            ? "has been assigned to a courier"
            : foundOrder.status === "DELIVERED"
              ? "has been successfully delivered"
              : "is being processed at depot";

      const etaNotice = foundOrder.estimatedDeliveryAt
        ? `Estimated Delivery: ${new Date(foundOrder.estimatedDeliveryAt).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })} (~15-25 mins)`
        : "Estimated Delivery: Today";

      const courierInfo = courier
        ? `Courier: ${courier.name} (${courier.vehicleType})`
        : "Courier: Auto-dispatch in progress";

      return {
        to: senderPhone,
        body: `📦 Order Status: ${foundOrder.orderNumber}\n\nYour order ${statusText}.\n${courierInfo}\n🕒 ${etaNotice}\n\n📍 Live GPS Tracking:\nhttps://sage-ops.com/track/${foundOrder.orderNumber}`,
        action: "TRACKING_INFO",
        orderNumber: foundOrder.orderNumber,
      };
    }

    // Intent: Address / Landmark Ingestion
    const hasDeliveryCues =
      textLower.includes("deliver") ||
      textLower.includes("send") ||
      textLower.includes("pick") ||
      textLower.includes("drop") ||
      textLower.includes("from") ||
      textLower.includes("to");

    if (hasDeliveryCues || text.length > 25) {
      return {
        to: senderPhone,
        body: "Processing delivery booking...",
        action: "ORDER_CREATED",
      };
    }

    // Default Fallback
    return {
      to: senderPhone,
      body: `Hello! I am the Sage Logistics Assistant. You can send me your delivery booking, ask "Where is my order?" with your tracking number, or request a Paystack payment link.`,
    };
  }
}

export const whatsAppAssistant = new WhatsAppAssistant();
