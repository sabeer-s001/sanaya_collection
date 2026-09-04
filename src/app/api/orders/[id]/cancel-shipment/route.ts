import { NextResponse } from "next/server";
import { dbConnect, OrderModel } from "@/lib/mongodb";
import { checkAdmin } from "@/lib/auth";
import { cancelShipment } from "@/lib/ithinkLogistics";

// POST /api/orders/[id]/cancel-shipment — Admin-only: cancel a shipment via iThink
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

    if (!order.awbNumber) {
      return NextResponse.json({
        success: false,
        error: "No shipment exists to cancel",
      }, { status: 400 });
    }

    // Cancel via iThink API
    const result = await cancelShipment(order.awbNumber);

    if (result.success) {
      // Update order status in MongoDB
      await OrderModel.findOneAndUpdate(
        { id },
        {
          status: "Cancelled",
          shipmentStatus: "Cancelled",
        }
      );

      return NextResponse.json({
        success: true,
        message: result.message,
      });
    } else {
      return NextResponse.json({
        success: false,
        error: result.error || "Cancellation failed",
      }, { status: 502 });
    }
  } catch (error: any) {
    console.error("Cancel shipment API error:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
