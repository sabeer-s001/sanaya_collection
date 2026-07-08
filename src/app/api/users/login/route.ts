import { NextResponse } from "next/server";
import { dbConnect, UserModel, verifyPassword, hashPassword, DEFAULT_USERS } from "@/lib/mongodb";
import { signToken } from "@/lib/auth";

export const dynamic = "force-dynamic";

export async function POST(request: Request) {
  try {
    const { email, password } = await request.json();
    if (!email || !password) {
      return NextResponse.json({ error: "Email and password are required" }, { status: 400 });
    }

    await dbConnect();

    const lowerEmail = email.toLowerCase();

    // 1. Check database users first
    const user = await UserModel.findOne({ email: lowerEmail });
    if (user) {
      const isPasswordValid = verifyPassword(password, user.password);
      if (isPasswordValid) {
        const userObj = user.toObject();
        delete userObj.password;

        // Sign JWT-like token for Authorization headers
        const token = signToken({ id: userObj.id, role: userObj.role });
        
        return NextResponse.json({
          ...userObj,
          token
        });
      }
      // User exists but password is wrong
      return NextResponse.json(
        { error: "Incorrect password. Please try again." },
        { status: 401 }
      );
    }

    // 2. Fallback: check DEFAULT_USERS (seed/demo accounts not yet in DB)
    const defaultUser = DEFAULT_USERS.find(
      (u) => u.email.toLowerCase() === lowerEmail
    );
    if (defaultUser) {
      if (defaultUser.password === password) {
        // Automatically upsert default user to database so they can update profile/addresses
        const hashedPassword = hashPassword(password);
        const userInDb = await UserModel.findOneAndUpdate(
          { email: lowerEmail },
          {
            $setOnInsert: {
              id: defaultUser.id,
              fullName: defaultUser.fullName,
              email: lowerEmail,
              password: hashedPassword,
              role: defaultUser.role,
              addresses: defaultUser.addresses,
              wishlist: defaultUser.wishlist
            }
          },
          { upsert: true, new: true }
        );

        const userObj = userInDb.toObject();
        delete userObj.password;

        // Sign JWT-like token for Authorization headers
        const token = signToken({ id: userObj.id, role: userObj.role });

        return NextResponse.json({
          ...userObj,
          token
        });
      }
      // Default user exists but password is wrong
      return NextResponse.json(
        { error: "Incorrect password. Please try again." },
        { status: 401 }
      );
    }

    // 3. No account found at all — prompt to sign up
    return NextResponse.json(
      {
        error: "No account found with this email. Please sign up first.",
        code: "USER_NOT_FOUND",
      },
      { status: 404 }
    );
  } catch (error: any) {
    console.error("Login API error:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
