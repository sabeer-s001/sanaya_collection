import { NextResponse } from "next/server";
import { dbConnect, OrderModel } from "@/lib/mongodb";
import { Order } from "@/context/AppContext";
import { getSessionUser } from "@/lib/auth";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    // Check authentication first
    const session = getSessionUser();
    if (!session) {
      return NextResponse.json({ error: "Access denied. Login required." }, { status: 401 });
    }

    await dbConnect();

    // Secure double-hatted API: Admin reads all orders; Customer reads only their own orders
    if (session.role === "admin") {
      const orders = await OrderModel.find({}).sort({ createdAt: -1 });
      return NextResponse.json(orders);
    } else {
      const orders = await OrderModel.find({ userId: session.id }).sort({ createdAt: -1 });
      return NextResponse.json(orders);
    }
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    await dbConnect();

    // Map checkout order to the current session user ID
    const session = getSessionUser();
    
    const newOrder: Order = {
      ...body,
      id: body.id || `ORD-${Math.floor(1000 + Math.random() * 9000)}`,
      userId: session?.id || body.userId || "guest", // Attach userId securely on the backend
      date: body.date || new Date().toISOString().split("T")[0],
      status: body.status || "Pending",
      trackingNumber: body.trackingNumber || `TRK-${Math.floor(10000000 + Math.random() * 90000000)}`
    };

    const created = await OrderModel.create(newOrder);
    return NextResponse.json(created, { status: 201 });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
