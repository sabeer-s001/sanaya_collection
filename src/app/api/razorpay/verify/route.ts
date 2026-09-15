import { NextResponse } from "next/server";
import crypto from "crypto";
import { cookies } from "next/headers";

import { dbConnect, OrderModel, SettingsModel } from "@/lib/mongodb";
import { ProductModel } from "@/models/Product";
import { getSessionUser } from "@/lib/auth";
import { createShipmentForOrder } from "@/lib/ithinkLogistics";

export async function POST(request: Request) {
  try {
    const { razorpay_order_id, razorpay_payment_id, razorpay_signature, orderData } = await request.json();

    if (!razorpay_order_id || !razorpay_payment_id || !razorpay_signature) {
      return NextResponse.json({ success: false, error: "Missing required Razorpay verification fields." }, { status: 400 });
    }

    if (!orderData || !orderData.items || orderData.items.length === 0 || !orderData.shippingAddress) {
      return NextResponse.json({ success: false, error: "Missing complete order data for verification." }, { status: 400 });
    }

    // Step 1: Verify HMAC SHA-256 signature
    const text = razorpay_order_id + "|" + razorpay_payment_id;
    const generated_signature = crypto
      .createHmac("sha256", process.env.RAZORPAY_KEY_SECRET || "")
      .update(text)
      .digest("hex");

    if (generated_signature !== razorpay_signature) {
      console.warn(`[PAYMENT VERIFICATION FAILED] Signature mismatch for Razorpay order ID ${razorpay_order_id}`);
      return NextResponse.json(
        { success: false, error: "Payment verification failed. Security signature mismatch." },
        { status: 400 }
      );
    }

    // Step 2: Payment Signature is Valid! Connect to DB & create the Order Record
    await dbConnect();

    const cookieStore = cookies();
    let customerId = cookieStore.get("customerId")?.value;
    if (!customerId) {
      customerId = `cust_${crypto.randomUUID()}`;
    }

    const session = getSessionUser();
    const phone = orderData.shippingAddress?.phone || orderData.phone || "";

    // Server-side recalculation of totals
    let serverSubtotal = 0;
    const itemIds = orderData.items.map((item: any) => item.product.id);
    const dbProducts = await ProductModel.find({ id: { $in: itemIds } });
    const productMap = new Map(dbProducts.map((p: any) => [p.id, p]));

    for (const item of orderData.items) {
      const dbProd = productMap.get(item.product.id);
      if (!dbProd) {
        return NextResponse.json({ success: false, error: `Product with ID ${item.product.id} not found.` }, { status: 400 });
      }
      serverSubtotal += dbProd.salePrice * item.quantity;
    }

    const clientDiscountAmount = Number(orderData.discountAmount || 0);
    const maxAllowedDiscount = Math.round(serverSubtotal * 0.20);
    const validatedDiscountAmount = clientDiscountAmount > maxAllowedDiscount ? maxAllowedDiscount : clientDiscountAmount;

    const serverTaxableAmount = serverSubtotal - validatedDiscountAmount;

    let shippingFee = 0;
    let freeShippingThreshold = 0;
    try {
      const settings = await SettingsModel.findOne({ key: "store_settings" });
      if (settings) {
        shippingFee = settings.shippingFee ?? 0;
        freeShippingThreshold = settings.freeShippingThreshold ?? 0;
      }
    } catch {}

    const productShippingFees = orderData.items
      .map((item: any) => {
        const dbProd = productMap.get(item.product.id);
        return dbProd?.shippingFee;
      })
      .filter((fee: any) => fee !== null && fee !== undefined);

    if (productShippingFees.length > 0) {
      shippingFee = Math.max(...productShippingFees);
    }

    const serverShippingCost = (freeShippingThreshold > 0 && serverTaxableAmount >= freeShippingThreshold) || serverTaxableAmount === 0 ? 0 : shippingFee;
    const serverTotalAmount = serverTaxableAmount + serverShippingCost;

    const generatedOrderId = `ORD-${Date.now()}-${Math.floor(1000 + Math.random() * 9000)}`;

    const newOrderData = {
      ...orderData,
      id: generatedOrderId,
      userId: session?.id || orderData.userId || "guest",
      customerId,
      phone,
      phoneVerificationStatus: "unverified",
      date: new Date().toISOString().split("T")[0],
      status: "Processing",
      paymentStatus: "Paid",
      shippingCost: serverShippingCost,
      tax: 0,
      discountAmount: validatedDiscountAmount,
      totalAmount: serverTotalAmount,
      razorpayOrderId: razorpay_order_id,
      razorpayPaymentId: razorpay_payment_id,
      razorpaySignature: razorpay_signature,
      trackingNumber: ""
    };

    const createdOrder = await OrderModel.create(newOrderData);
    console.log(`[PAYMENT VERIFIED & ORDER CREATED] Order ${createdOrder.id} saved to MongoDB. Payment Status: Paid.`);

    // Step 3: Synchronously trigger iThink Logistics shipment creation for the paid order
    let updatedOrder = createdOrder;
    try {
      console.log(`[LOGISTICS] Initiating iThink Logistics shipment for order ${createdOrder.id}...`);
      const shipmentResult = await createShipmentForOrder(createdOrder.toObject());
      if (shipmentResult.success) {
        console.log(`[LOGISTICS] Shipment created successfully. AWB: ${shipmentResult.awbNumber}`);
        const refetched = await OrderModel.findOne({ id: createdOrder.id });
        if (refetched) updatedOrder = refetched;
      } else if (shipmentResult.error) {
        console.warn(`[LOGISTICS] Shipment creation returned error: ${shipmentResult.error}`);
      }
    } catch (err: any) {
      console.error(`[LOGISTICS] Shipment creation error for order ${createdOrder.id}:`, err);
    }

    const response = NextResponse.json({
      success: true,
      message: "Payment verified and order placed successfully.",
      order: updatedOrder
    }, { status: 201 });

    response.cookies.set("customerId", customerId, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      maxAge: 14 * 24 * 60 * 60,
      sameSite: "lax",
      path: "/",
    });

    const cleanDigits = phone.replace(/\D/g, "");
    if (cleanDigits) {
      response.cookies.set("customerPhone", cleanDigits, {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        maxAge: 30 * 24 * 60 * 60,
        sameSite: "lax",
        path: "/",
      });
    }

    return response;
  } catch (error: any) {
    console.error("[PAYMENT VERIFICATION] Exception error:", error);
    return NextResponse.json({ success: false, error: error.message || "Server error during payment verification." }, { status: 500 });
  }
}

