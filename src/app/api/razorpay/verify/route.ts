import { NextResponse } from "next/server";
import crypto from "crypto";

import { dbConnect, OrderModel } from "@/lib/mongodb";
import { createShipmentForOrder } from "@/lib/ithinkLogistics";

export async function POST(request: Request) {
  try {
    const { razorpay_order_id, razorpay_payment_id, razorpay_signature } = await request.json();

    if (!razorpay_order_id || !razorpay_payment_id || !razorpay_signature) {
      return NextResponse.json({ error: "Missing required verification fields" }, { status: 400 });
    }

    const text = razorpay_order_id + "|" + razorpay_payment_id;
    const generated_signature = crypto
      .createHmac("sha256", process.env.RAZORPAY_KEY_SECRET || "")
      .update(text)
      .digest("hex");

    if (generated_signature === razorpay_signature) {
      // Securely update the paymentStatus to Paid in MongoDB on the server side
      await dbConnect();
      const updated = await OrderModel.findOneAndUpdate(
        { razorpayOrderId: razorpay_order_id },
        {
          paymentStatus: "Paid",
          razorpayPaymentId: razorpay_payment_id,
          razorpaySignature: razorpay_signature,
        },
        { new: true }
      );

      let shipmentResult = null;
      if (!updated) {
        console.warn(`[PAYMENT] Order with Razorpay Order ID ${razorpay_order_id} not found in database during verification.`);
      } else {
        console.log(`[PAYMENT] Razorpay payment verified for order: ${updated.id}`);
        // Synchronously create shipment via iThink Logistics
        if (!updated.awbNumber) {
          try {
            shipmentResult = await createShipmentForOrder(updated.toObject());
          } catch (err: any) {
            console.error(`[LOGISTICS] Shipment creation failed for order ${updated.id}:`, err);
          }
        }
      }

      return NextResponse.json({
        success: true,
        message: "Payment verified successfully",
        awbNumber: shipmentResult?.awbNumber || updated?.awbNumber || null,
        courierName: shipmentResult?.courierName || updated?.courierName || null
      });
    } else {
      console.warn(`[PAYMENT] Signature mismatch for Razorpay order ID ${razorpay_order_id}`);
      return NextResponse.json({ success: false, message: "Payment verification failed" }, { status: 400 });
    }
  } catch (error: any) {
    console.error("[PAYMENT] Razorpay verification error:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
