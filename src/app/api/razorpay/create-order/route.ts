import { NextResponse } from "next/server";
import Razorpay from "razorpay";

const razorpay = new Razorpay({
  key_id: process.env.RAZORPAY_KEY_ID || "",
  key_secret: process.env.RAZORPAY_KEY_SECRET || "",
});

export async function POST(request: Request) {
  try {
    const { amount, currency } = await request.json();

    if (!amount || amount <= 0) {
      return NextResponse.json({ error: "Valid payment amount is required" }, { status: 400 });
    }

    const options = {
      amount: Math.round(amount * 100), // convert rupees to paise
      currency: currency || "INR",
      receipt: `rcpt_${Date.now()}_${Math.floor(100 + Math.random() * 900)}`
    };

    const razorpayOrder = await razorpay.orders.create(options);
    return NextResponse.json(razorpayOrder);
  } catch (error: any) {
    console.error("[RAZORPAY] Order creation error:", error);
    return NextResponse.json({ error: error.message || "Failed to create Razorpay order" }, { status: 500 });
  }
}

