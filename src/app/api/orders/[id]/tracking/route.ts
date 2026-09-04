import { NextResponse } from "next/server";
import { dbConnect, OrderModel } from "@/lib/mongodb";
import { syncTrackingForOrder } from "@/lib/ithinkLogistics";

// GET /api/orders/[id]/tracking — Fetch live tracking data from iThink Logistics
export async function GET(
  request: Request,
  { params }: { params: { id: string } | Promise<{ id: string }> }
) {
  try {
    const resolvedParams = await Promise.resolve(params);
    const id = resolvedParams?.id;

    if (!id) {
      return NextResponse.json({ error: "Invalid Order ID" }, { status: 400 });
    }

    await dbConnect();

    const order = await OrderModel.findOne({ id });
    if (!order) {
      return NextResponse.json({ error: "Order not found" }, { status: 404 });
    }

    // Require AWB number for tracking
    if (!order.awbNumber) {
      return NextResponse.json({
        success: false,
        error: "No shipment created yet for this order",
        orderStatus: order.status,
        logisticsError: order.logisticsError || "",
      }, { status: 200 });
    }

    // Fetch live tracking from iThink and update order status in DB
    const tracking = await syncTrackingForOrder(order.id, order.awbNumber);

    return NextResponse.json({
      success: tracking.success,
      awbNumber: tracking.awbNumber,
      currentStatus: tracking.currentStatus,
      expectedDelivery: tracking.expectedDelivery || null,
      courierName: tracking.courierName || order.courierName || "",
      events: tracking.events,
      error: tracking.error || null,
    });
  } catch (error: any) {
    console.error("Tracking API error:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
