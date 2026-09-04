import { NextResponse } from "next/server";
import crypto from "crypto";
import { dbConnect, OrderModel } from "@/lib/mongodb";
import { createShipmentForOrder } from "@/lib/ithinkLogistics";

export async function POST(request: Request) {
  try {
    const rawBody = await request.text();
    const signature = request.headers.get("x-razorpay-signature");

    if (!signature) {
      console.error("Razorpay webhook signature missing");
      return NextResponse.json({ error: "Signature missing" }, { status: 400 });
    }

    const webhookSecret = process.env.RAZORPAY_WEBHOOK_SECRET || "";
    if (!webhookSecret) {
      console.warn("[PAYMENT] RAZORPAY_WEBHOOK_SECRET is not configured. Webhook event skipped gracefully.");
      return NextResponse.json({ received: false, warning: "Webhook secret not configured" }, { status: 200 });
    }

    const expectedSignature = crypto
      .createHmac("sha256", webhookSecret)
      .update(rawBody)
      .digest("hex");

    if (expectedSignature !== signature) {
      console.error("Razorpay webhook signature verification failed");
      return NextResponse.json({ error: "Invalid signature" }, { status: 400 });
    }

    const payload = JSON.parse(rawBody);
    console.log(`Razorpay webhook verified. Event received: ${payload.event}`);

    await dbConnect();

    let razorpayOrderId: string | null = null;
    let razorpayPaymentId: string | null = null;

    if (payload.event === "order.paid") {
      const orderEntity = payload.payload.order.entity;
      razorpayOrderId = orderEntity.id;
    } else if (payload.event === "payment.captured") {
      const paymentEntity = payload.payload.payment.entity;
      razorpayOrderId = paymentEntity.order_id;
      razorpayPaymentId = paymentEntity.id;
    }

    if (razorpayOrderId) {
      const updateData: any = { paymentStatus: "Paid" };
      if (razorpayPaymentId) updateData.razorpayPaymentId = razorpayPaymentId;
      
      const updated = await OrderModel.findOneAndUpdate(
        { razorpayOrderId },
        updateData,
        { new: true }
      );

      if (updated) {
        console.log(`Successfully updated order ${updated.id} to Paid via webhook event: ${payload.event}`);

        // Auto-create shipment if not already created (webhook fallback)
        if (!updated.awbNumber) {
          createShipmentForOrder(updated.toObject()).catch((err) =>
            console.error(`Webhook shipment creation failed for order ${updated.id}:`, err)
          );
        }
      } else {
        console.warn(`Order with Razorpay Order ID ${razorpayOrderId} not found in database for webhook event: ${payload.event}`);
      }
    }

    return NextResponse.json({ received: true });
  } catch (error: any) {
    console.error("Razorpay webhook processing error:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
