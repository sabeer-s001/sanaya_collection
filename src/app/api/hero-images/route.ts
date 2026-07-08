import { NextResponse } from "next/server";
import { dbConnect, HeroImageModel } from "@/lib/mongodb";
import { checkAdmin } from "@/lib/auth";

export async function GET() {
  try {
    await dbConnect();
    const heroImages = await HeroImageModel.find({}).sort({ order: 1, createdAt: -1 });
    return NextResponse.json(heroImages);
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    // Only allow admins to upload new home slides
    const isAdmin = await checkAdmin();
    if (!isAdmin) {
      return NextResponse.json({ error: "Access denied. Admin privileges required." }, { status: 403 });
    }

    const body = await request.json();
    await dbConnect();

    // Check count of existing hero images
    const count = await HeroImageModel.countDocuments();
    if (count >= 4) {
      return NextResponse.json({ error: "Maximum limit of 4 hero slides reached" }, { status: 400 });
    }

    // Find the current highest order to assign order+1
    const highestOrderImg = await HeroImageModel.findOne().sort({ order: -1 });
    const nextOrder = highestOrderImg ? (highestOrderImg.order || 0) + 1 : 0;

    const newHeroImage = {
      desktopImage: body.desktopImage,
      mobileImage: body.mobileImage,
      order: body.order !== undefined ? body.order : nextOrder,
    };

    if (!newHeroImage.desktopImage || !newHeroImage.mobileImage) {
      return NextResponse.json({ error: "desktopImage and mobileImage are required" }, { status: 400 });
    }

    const created = await HeroImageModel.create(newHeroImage);
    return NextResponse.json(created, { status: 201 });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
