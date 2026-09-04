import { NextResponse } from "next/server";
import { dbConnect, OrderModel } from "@/lib/mongodb";
import { checkAdmin } from "@/lib/auth";

export async function GET(
  request: Request,
  { params }: { params: { id: string } | Promise<{ id: string }> }
) {
  try {
    const resolvedParams = await Promise.resolve(params);
    const id = resolvedParams?.id;
    
    if (!id) {
      return NextResponse.json({ error: "Invalid Order ID parameter" }, { status: 400 });
    }

    await dbConnect();
    
    const order = await OrderModel.findOne({ id });
    if (!order) {
      return NextResponse.json({ error: "Order not found" }, { status: 404 });
    }

    return NextResponse.json(order);
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function PUT(
  request: Request,
  { params }: { params: { id: string } | Promise<{ id: string }> }
) {
  try {
    const resolvedParams = await Promise.resolve(params);
    const id = resolvedParams?.id;
    
    // Only allow admins to modify order records (e.g. status changes)
    const isAdmin = await checkAdmin();
    if (!isAdmin) {
      return NextResponse.json({ error: "Access denied. Admin privileges required." }, { status: 403 });
    }

    const body = await request.json();
    await dbConnect();

    // Restrict what can be updated on orders via this API
    const allowedUpdates = ["status", "paymentStatus", "trackingNumber", "awbNumber", "courierName", "shipmentStatus", "logisticsError"];
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
