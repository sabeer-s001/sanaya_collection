import { NextResponse } from "next/server";
import { dbConnect, OrderModel, SettingsModel } from "@/lib/mongodb";
import { Order } from "@/context/AppContext";
import { getSessionUser } from "@/lib/auth";
import { createShipmentForOrder } from "@/lib/ithinkLogistics";
import { cookies } from "next/headers";
import crypto from "crypto";

export const dynamic = "force-dynamic";

export async function GET(request: Request) {
  try {
    const session = getSessionUser();
    await dbConnect();

    // Secure double-hatted API: Admin reads all orders for order management
    if (session && session.role === "admin") {
      const orders = await OrderModel.find({}).sort({ createdAt: -1 });
      return NextResponse.json(orders);
    }

    const { searchParams } = new URL(request.url);
    const phoneParam = searchParams.get("phone");

    const cookieStore = cookies();
    const cookiePhone = cookieStore.get("customerPhone")?.value;

    // Get phone number from query param, cookie, or user session
    const rawPhone = phoneParam || cookiePhone || (session as any)?.phone || "";
    const cleanPhoneDigits = rawPhone.replace(/\D/g, "");

    // 1. Primary lookup: Match strictly by 10-digit mobile number
    if (cleanPhoneDigits.length >= 10) {
      const last10 = cleanPhoneDigits.slice(-10);
      const phoneRegex = new RegExp(last10 + "$", "i");
      
      const phoneQuery: any = {
        $or: [
          { phone: phoneRegex },
          { "shippingAddress.phone": phoneRegex }
        ]
      };

      // If user is logged in, also match orders created under their userId
      if (session?.id) {
        phoneQuery.$or.push({ userId: session.id });
      }

      const orders = await OrderModel.find(phoneQuery).sort({ createdAt: -1 });
      return NextResponse.json(orders);
    }

    // 2. Secondary lookup: If user is logged in with a session ID
    if (session?.id) {
      const orders = await OrderModel.find({ userId: session.id }).sort({ createdAt: -1 });
      return NextResponse.json(orders);
    }

    // 3. Privacy Guard: If no phone number or session identity, return empty list
    return NextResponse.json([]);
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();

    const isCOD = body.paymentMethod === "Cash On Delivery (COD)";
    // Enforce that online payment orders must be verified via /api/razorpay/verify
    if (!isCOD && body.paymentStatus !== "Paid") {
      return NextResponse.json(
        { error: "Online orders must complete payment verification before order creation." },
        { status: 400 }
      );
    }

    await dbConnect();

    // Check for customerId cookie or create a new one
    const cookieStore = cookies();
    let customerId = cookieStore.get("customerId")?.value;
    if (!customerId) {
      customerId = `cust_${crypto.randomUUID()}`;
    }


    const session = getSessionUser();
    const phone = body.shippingAddress?.phone || body.phone || "";
    
    // Server-side recalculation and validation of totals
    const ProductModel = (await import("@/models/Product")).ProductModel;
    let serverSubtotal = 0;
    const itemIds = body.items.map((item: any) => item.product.id);
    const dbProducts = await ProductModel.find({ id: { $in: itemIds } });
    const productMap = new Map(dbProducts.map((p: any) => [p.id, p]));

    for (const item of body.items) {
      const dbProd = productMap.get(item.product.id);
      if (!dbProd) {
        return NextResponse.json({ error: `Product with ID ${item.product.id} not found.` }, { status: 400 });
      }
      serverSubtotal += dbProd.salePrice * item.quantity;
    }

    // Validate coupon / discount
    const clientDiscountAmount = Number(body.discountAmount || 0);
    // Allow up to a max discount of 20% to prevent arbitrary discount injection
    const maxAllowedDiscount = Math.round(serverSubtotal * 0.20);
    const validatedDiscountAmount = clientDiscountAmount > maxAllowedDiscount ? maxAllowedDiscount : clientDiscountAmount;

    const serverTaxableAmount = serverSubtotal - validatedDiscountAmount;
    const serverTax = 0; // GST removed
    
    // Fetch store settings for shipping fee and free shipping threshold
    let shippingFee = 0;
    let freeShippingThreshold = 0;
    try {
      const settings = await SettingsModel.findOne({ key: "store_settings" });
      if (settings) {
        shippingFee = settings.shippingFee ?? 0;
        freeShippingThreshold = settings.freeShippingThreshold ?? 0;
      }
    } catch {}

    // Per-product shipping override: if items in the cart have a product-level shippingFee set,
    // use the maximum product shipping fee.
    const productShippingFees = body.items
      .map((item: any) => {
        const dbProd = productMap.get(item.product.id);
        return dbProd?.shippingFee;
      })
      .filter((fee: any) => fee !== null && fee !== undefined);

    if (productShippingFees.length > 0) {
      shippingFee = Math.max(...productShippingFees);
    }

    const serverShippingCost = (freeShippingThreshold > 0 && serverTaxableAmount >= freeShippingThreshold) || serverTaxableAmount === 0 ? 0 : shippingFee;
    const codFee = 0;
    
    const serverTotalAmount = serverTaxableAmount + serverShippingCost + codFee;

    // Generate unique order ID using timestamp + random suffix to prevent collisions
    const generatedOrderId = body.id && !body.id.startsWith("ORD-") 
      ? body.id 
      : `ORD-${Date.now()}-${Math.floor(1000 + Math.random() * 9000)}`;

    const newOrder = {
      ...body,
      id: generatedOrderId,
      userId: session?.id || body.userId || "guest", // Attach userId securely on the backend
      customerId,
      phone,
      phoneVerificationStatus: "unverified",
      date: body.date || new Date().toISOString().split("T")[0],
      status: body.status || "Processing",
      paymentStatus: isCOD ? "Pending" : "Paid",
      shippingCost: serverShippingCost,
      tax: serverTax,
      discountAmount: validatedDiscountAmount,
      totalAmount: serverTotalAmount,
      trackingNumber: "" // Remove fake tracking, will be set to AWB
    };

    const created = await OrderModel.create(newOrder);
    console.log(`[ORDER] Order created: ${created.id} via ${created.paymentMethod} (Total: ₹${created.totalAmount})`);

    let finalOrder = created;

    // Auto-create shipment for COD orders (prepaid orders are handled after Razorpay verification)
    if (isCOD) {
      console.log(`[LOGISTICS] Starting iThink Logistics sync for COD order: ${created.id}`);
      try {
        const shipmentResult = await createShipmentForOrder(created.toObject());
        if (shipmentResult.success) {
          const updatedOrder = await OrderModel.findOne({ id: created.id });
          if (updatedOrder) {
            finalOrder = updatedOrder;
          }
        }
      } catch (err: any) {
        console.error(`[LOGISTICS] COD shipment creation failed for order ${created.id}:`, err);
      }
    }

    const response = NextResponse.json(finalOrder, { status: 201 });

    // Store the customerId cookie (secure, HTTP-only, expires in 14 days)
    response.cookies.set("customerId", customerId, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      maxAge: 14 * 24 * 60 * 60, // 14 days in seconds
      sameSite: "lax",
      path: "/",
    });

    const cleanDigits = phone.replace(/\D/g, "");
    if (cleanDigits) {
      response.cookies.set("customerPhone", cleanDigits, {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        maxAge: 30 * 24 * 60 * 60, // 30 days in seconds
        sameSite: "lax",
        path: "/",
      });
    }

    return response;
  } catch (error: any) {
    console.error("[ORDER] Order creation error:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
