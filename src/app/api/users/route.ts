import { NextResponse } from "next/server";
import { dbConnect, UserModel } from "@/lib/mongodb";
import { User } from "@/context/AppContext";
import { checkAdmin, signToken } from "@/lib/auth";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    // Restrict list of users to admin role only
    const isAdmin = await checkAdmin();
    if (!isAdmin) {
      return NextResponse.json({ error: "Access denied. Admin privileges required." }, { status: 403 });
    }

    await dbConnect();
    // Exclude password field from the query results for security
    const users = await UserModel.find({}, { password: 0 }).sort({ createdAt: -1 });
    return NextResponse.json(users);
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    await dbConnect();

    // Check if email already exists
    const emailExists = await UserModel.findOne({
      email: body.email.toLowerCase()
    });
    if (emailExists) {
      return NextResponse.json(
        { error: "An account with this email already exists." },
        { status: 400 }
      );
    }

    const newUser: User = {
      ...body,
      id: body.id || `usr-${Math.random().toString(36).substr(2, 9)}`,
      role: "customer",
      addresses: body.addresses || [],
      wishlist: body.wishlist || []
    };

    const created = await UserModel.create(newUser);
    const userObj = created.toObject();
    // Strip password hash from returned JSON
    delete userObj.password;

    // Sign JWT-like token for Authorization headers
    const token = signToken({ id: userObj.id, role: userObj.role });

    return NextResponse.json({
      ...userObj,
      token
    }, { status: 201 });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
