import { NextResponse } from "next/server";
import { dbConnect, OrderModel } from "@/lib/mongodb";
import { checkAdmin, checkAuthorizedUser, getSessionUser } from "@/lib/auth";
import { Order } from "@/context/AppContext";

export async function GET(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const id = params.id;
    await dbConnect();
    
    const order = await OrderModel.findOne({ id });
    if (!order) {
      return NextResponse.json({ error: "Order not found" }, { status: 404 });
    }

    // Access control: only the ordering customer themselves or an admin
    const session = getSessionUser();
    if (!session) {
      return NextResponse.json({ error: "Access denied. Login required." }, { status: 401 });
    }

    const isAuthorized = await checkAuthorizedUser(order.userId);
    if (!isAuthorized) {
      // Secondary check: verify if the fullName matches the session name (useful for transitional orders without userId)
      const isNameMatch = session.role !== "admin" && order.shippingAddress.fullName.toLowerCase() === session.id.toLowerCase();
      if (!isNameMatch) {
        return NextResponse.json({ error: "Access denied. Unauthorized." }, { status: 403 });
      }
    }

    return NextResponse.json(order);
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function PUT(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const id = params.id;
    
    // Only allow admins to modify order records (e.g. status changes)
    const isAdmin = await checkAdmin();
    if (!isAdmin) {
      return NextResponse.json({ error: "Access denied. Admin privileges required." }, { status: 403 });
    }

    const body = await request.json();
    await dbConnect();

    // Restrict what can be updated on orders via this API
    const allowedUpdates = ["status", "paymentStatus", "trackingNumber"];
    const updateData: any = {};
    for (const key of allowedUpdates) {
      if (body[key] !== undefined) {
        updateData[key] = body[key];
      }
    }

    const updated = await OrderModel.findOneAndUpdate(
      { id },
      { $set: updateData },
      { new: true }
    );
    if (!updated) {
      return NextResponse.json({ error: "Order not found" }, { status: 404 });
    }

    return NextResponse.json(updated);
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
