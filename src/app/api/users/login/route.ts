import { NextResponse } from "next/server";
import { dbConnect, UserModel, verifyPassword } from "@/lib/mongodb";
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

    // Check database users
    const user = await UserModel.findOne({ email: lowerEmail });
    if (user) {
      const isPasswordValid = verifyPassword(password, user.password);
      if (isPasswordValid) {
        const userObj = user.toObject();
        delete userObj.password;

        // Sign JWT token for Authorization headers
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

    // No account found with this email
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
