import { NextResponse } from "next/server";
import { dbConnect, HeroImageModel } from "@/lib/mongodb";
import { checkAdmin } from "@/lib/auth";

export async function PUT(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    // Only allow admins to edit homepage slides
    const isAdmin = await checkAdmin();
    if (!isAdmin) {
      return NextResponse.json({ error: "Access denied. Admin privileges required." }, { status: 403 });
    }

    const id = params.id;
    const body = await request.json();
    await dbConnect();

    const updated = await HeroImageModel.findByIdAndUpdate(
      id,
      { ...body },
      { new: true }
    );
    if (!updated) {
      return NextResponse.json({ error: "Hero image not found" }, { status: 404 });
    }
    return NextResponse.json(updated);
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function DELETE(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    // Only allow admins to delete homepage slides
    const isAdmin = await checkAdmin();
    if (!isAdmin) {
      return NextResponse.json({ error: "Access denied. Admin privileges required." }, { status: 403 });
    }

    const id = params.id;
    await dbConnect();

    const result = await HeroImageModel.findByIdAndDelete(id);
    if (!result) {
      return NextResponse.json({ error: "Hero image not found" }, { status: 404 });
    }
    
    return NextResponse.json({ success: true, message: `Hero image deleted` });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
