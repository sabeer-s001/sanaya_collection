import { NextResponse } from "next/server";
import Razorpay from "razorpay";

import { dbConnect, OrderModel } from "@/lib/mongodb";

const razorpay = new Razorpay({
  key_id: process.env.RAZORPAY_KEY_ID || "",
  key_secret: process.env.RAZORPAY_KEY_SECRET || "",
});

export async function POST(request: Request) {
  try {
    const { amount, currency, orderId } = await request.json();

    if (!amount) {
      return NextResponse.json({ error: "Amount is required" }, { status: 400 });
    }
    if (!orderId) {
      return NextResponse.json({ error: "Database order ID is required" }, { status: 400 });
    }

    const options = {
      amount: Math.round(amount * 100), // convert to paise
      currency: currency || "INR",
      receipt: orderId
    };

    const order = await razorpay.orders.create(options);

    // Securely update the MongoDB order record with the Razorpay Order ID
    await dbConnect();
    const updated = await OrderModel.findOneAndUpdate(
      { id: orderId },
      { razorpayOrderId: order.id },
      { new: true }
    );

    if (!updated) {
      console.warn(`Order with ID ${orderId} not found in database when linking Razorpay Order ID.`);
    }

    return NextResponse.json(order);
  } catch (error: any) {
    console.error("Razorpay order creation error:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
