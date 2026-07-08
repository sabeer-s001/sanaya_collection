import { NextResponse } from "next/server";
import { dbConnect, ProductModel } from "@/lib/mongodb";
import { Product } from "@/context/AppContext";
import { checkAdmin } from "@/lib/auth";

export async function GET() {
  try {
    await dbConnect();
    const products = await ProductModel.find({}).sort({ createdAt: -1 });
    return NextResponse.json(products);
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    // Enforce admin write permission
    const isAdmin = await checkAdmin();
    if (!isAdmin) {
      return NextResponse.json({ error: "Access denied. Admin privileges required." }, { status: 403 });
    }

    const body = await request.json();
    await dbConnect();
    
    const newProduct: Product = {
      ...body,
      id: body.id || `p-${Math.random().toString(36).substr(2, 9)}`,
      rating: body.rating || 5.0,
      reviewCount: body.reviewCount || 0
    };

    const created = await ProductModel.create(newProduct);
    return NextResponse.json(created, { status: 201 });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
