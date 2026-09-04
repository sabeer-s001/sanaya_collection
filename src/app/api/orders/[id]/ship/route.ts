import { NextResponse } from "next/server";
import { dbConnect, OrderModel } from "@/lib/mongodb";
import { checkAdmin } from "@/lib/auth";
import { createShipmentForOrder } from "@/lib/ithinkLogistics";

// POST /api/orders/[id]/ship — Admin-only: manually create or retry a shipment
export async function POST(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const id = params.id;

    // Admin-only
    const isAdmin = await checkAdmin();
    if (!isAdmin) {
      return NextResponse.json({ error: "Access denied. Admin privileges required." }, { status: 403 });
    }

    await dbConnect();

    const order = await OrderModel.findOne({ id });
    if (!order) {
      return NextResponse.json({ error: "Order not found" }, { status: 404 });
    }

    // Idempotency: if AWB already exists, don't create a duplicate
    if (order.awbNumber && order.awbNumber.length > 0) {
      return NextResponse.json({
        success: true,
        message: "Shipment already exists",
        awbNumber: order.awbNumber,
        courierName: order.courierName || "",
      });
    }

    // Create shipment via iThink
    const result = await createShipmentForOrder(order.toObject());

    if (result.success) {
      return NextResponse.json({
        success: true,
        message: "Shipment created successfully",
        awbNumber: result.awbNumber,
        courierName: result.courierName,
      });
    } else {
      return NextResponse.json({
        success: false,
        message: "Shipment creation failed",
        error: result.error,
      }, { status: 502 });
    }
  } catch (error: any) {
    console.error("Manual ship API error:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
