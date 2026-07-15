import { NextResponse } from "next/server";
import { dbConnect, ProductModel } from "@/lib/mongodb";
import { Product } from "@/context/AppContext";
import { checkAdmin } from "@/lib/auth";

export async function GET(request: Request) {
  try {
    await dbConnect();
    const { searchParams } = new URL(request.url);
    const category = searchParams.get("category");
    const exclude = searchParams.get("exclude");
    const limitVal = searchParams.get("limit");

    const query: any = {};
    if (category) {
      query.category = category;
    }
    if (exclude) {
      query.id = { $ne: exclude };
    }

    let mongooseQuery = ProductModel.find(query).lean();

    if (category) {
      // Optimize payload by selecting only fields needed for product cards and quick view
      mongooseQuery = mongooseQuery.select("id name category originalPrice salePrice discount images inStock rating sizes colors fabric description");
    }

    if (limitVal) {
      const parsedLimit = parseInt(limitVal, 10);
      if (!isNaN(parsedLimit)) {
        mongooseQuery = mongooseQuery.limit(parsedLimit);
      }
    } else if (!category) {
      // Maintain default sort only when not querying specific category (e.g. for main list)
      mongooseQuery = mongooseQuery.sort({ createdAt: -1 });
    }

    const products = await mongooseQuery;

    // For category-filtered requests (e.g. related products), we can safely
    // cache the response for 60 seconds. Product inventory changes slowly and
    // this eliminates a full MongoDB roundtrip on every product page view.
    // The main product list (no category filter) is left uncached so admin
    // changes are immediately visible across the site.
    const response = NextResponse.json(products);
    if (category) {
      response.headers.set(
        "Cache-Control",
        "public, s-maxage=60, stale-while-revalidate=300"
      );
    }
    return response;

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
