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
    const allowedUpdates = ["status", "paymentStatus", "trackingNumber", "cancelReason", "awbNumber", "courierName", "shipmentStatus", "logisticsError"];
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

export async function DELETE(
  request: Request,
  { params }: { params: { id: string } | Promise<{ id: string }> }
) {
  try {
    const resolvedParams = await Promise.resolve(params);
    const id = resolvedParams?.id;

    if (!id) {
      return NextResponse.json({ error: "Invalid Order ID parameter" }, { status: 400 });
    }

    const isAdmin = await checkAdmin();
    if (!isAdmin) {
      return NextResponse.json({ error: "Access denied. Admin privileges required." }, { status: 403 });
    }

    let body: any = {};
    try {
      body = await request.json();
    } catch (_) {}

    const reason = body.reason || "Order cancelled by store administrator.";
    const permanent = body.permanent === true;

    await dbConnect();

    if (permanent) {
      const deleted = await OrderModel.findOneAndDelete({ id });
      if (!deleted) {
        return NextResponse.json({ error: "Order not found" }, { status: 404 });
      }
      return NextResponse.json({ success: true, message: `Order ${id} permanently deleted.` });
    } else {
      // Soft cancellation with reason so customer can see the reason on their dashboard
      const updated = await OrderModel.findOneAndUpdate(
        { id },
        {
          $set: {
            status: "Cancelled",
            cancelReason: reason,
          },
        },
        { new: true }
      );

      if (!updated) {
        return NextResponse.json({ error: "Order not found" }, { status: 404 });
      }

      // Try cancelling shipment in iThink Logistics if AWB exists
      if (updated.awbNumber) {
        try {
          const { cancelShipment } = await import("@/lib/ithinkLogistics");
          await cancelShipment(updated.awbNumber);
        } catch (err) {
          console.warn(`[LOGISTICS] Failed to cancel iThink shipment for order ${id}:`, err);
        }
      }

      return NextResponse.json({
        success: true,
        message: `Order ${id} cancelled successfully.`,
        order: updated,
      });
    }
  } catch (error: any) {
    console.error("[ORDER DELETE ERROR]", error);
    return NextResponse.json({ error: error.message || "Failed to process order deletion" }, { status: 500 });
  }
}

