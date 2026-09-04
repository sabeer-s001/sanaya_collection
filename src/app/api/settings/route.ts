import { NextResponse } from "next/server";
import { dbConnect, SettingsModel } from "@/lib/mongodb";
import { checkAdmin } from "@/lib/auth";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    await dbConnect();
    let settings = await SettingsModel.findOne({ key: "store_settings" });
    if (!settings) {
      settings = await SettingsModel.create({
        key: "store_settings",
        shippingFee: 0,
        freeShippingThreshold: 0
      });
    }
    return NextResponse.json(settings);
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function PUT(request: Request) {
  try {
    const isAdmin = await checkAdmin();
    if (!isAdmin) {
      return NextResponse.json({ error: "Access denied. Admin privileges required." }, { status: 403 });
    }

    const body = await request.json();
    await dbConnect();

    const updateData: any = {};
    if (body.shippingFee !== undefined) {
      updateData.shippingFee = Number(body.shippingFee);
    }
    if (body.freeShippingThreshold !== undefined) {
      updateData.freeShippingThreshold = Number(body.freeShippingThreshold);
    }

    const updated = await SettingsModel.findOneAndUpdate(
      { key: "store_settings" },
      { $set: updateData },
      { new: true, upsert: true }
    );

    return NextResponse.json(updated);
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
