import { NextResponse } from "next/server";
import { dbConnect, UserModel, hashPassword } from "@/lib/mongodb";
import { checkAuthorizedUser, checkAdmin } from "@/lib/auth";

export async function GET(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const id = params.id;
    
    // Check authorization: only the user themselves or an admin
    const isAuthorized = await checkAuthorizedUser(id);
    if (!isAuthorized) {
      return NextResponse.json({ error: "Access denied. Unauthorized." }, { status: 403 });
    }

    await dbConnect();
    const user = await UserModel.findOne({ id }).lean();
    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }
    // Omit password from returned user for safety
    const { password, ...safeUser } = user as any;
    return NextResponse.json(safeUser);
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function PUT(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const id = params.id;
    
    // Check authorization: only the user themselves or an admin
    const isAuthorized = await checkAuthorizedUser(id);
    if (!isAuthorized) {
      return NextResponse.json({ error: "Access denied. Unauthorized." }, { status: 403 });
    }

    const body = await request.json();
    await dbConnect();

    // Restrict update inputs to allowed keys only to prevent privilege/role escalation
    const allowedUpdates = ["fullName", "email", "addresses", "wishlist"];
    const updateData: any = {};
    for (const key of allowedUpdates) {
      if (body[key] !== undefined) {
        updateData[key] = body[key];
      }
    }

    // Force lower case on email if updating
    if (updateData.email) {
      updateData.email = updateData.email.toLowerCase();
    }

    // Secure password updates if provided (though not currently exposed in UI)
    if (body.password) {
      updateData.password = hashPassword(body.password);
    }

    // Note: admins are allowed to update role, but only via an admin panel (let's check checkAdmin)
    const isAdmin = await checkAdmin();
    if (isAdmin && body.role !== undefined) {
      updateData.role = body.role;
    }

    const updated = await UserModel.findOneAndUpdate(
      { id },
      { $set: updateData },
      { new: true }
    ).lean();

    if (!updated) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    // Omit password from returned user for safety
    const { password, ...safeUser } = updated as any;
    return NextResponse.json(safeUser);
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function DELETE(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const id = params.id;

    // Restrict delete operation to admin role only for store security
    const isAdmin = await checkAdmin();
    if (!isAdmin) {
      return NextResponse.json({ error: "Access denied. Admin privileges required." }, { status: 403 });
    }

    await dbConnect();

    const result = await UserModel.deleteOne({ id });
    if (result.deletedCount === 0) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    return NextResponse.json({ success: true, message: `User ${id} deleted` });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
