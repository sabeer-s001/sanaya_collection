import { headers } from "next/headers";
import crypto from "crypto";
import { dbConnect } from "./mongodb";
import { UserModel } from "@/models/User";

const JWT_SECRET = process.env.JWT_SECRET || "fallback-sanaya-super-secret-key-12345";

export interface SessionUser {
  id: string;
  role: string;
}

export interface SessionPayload {
  id: string;
  role: string;
  exp: number;
}

/**
 * Signs a payload to generate a signature token (payload.signature)
 */
export function signToken(payload: Omit<SessionPayload, "exp">, expiresInDays = 30): string {
  const exp = Math.floor(Date.now() / 1000) + expiresInDays * 24 * 60 * 60;
  const data = JSON.stringify({ ...payload, exp });
  const base64Data = Buffer.from(data).toString("base64url");
  const signature = crypto
    .createHmac("sha256", JWT_SECRET)
    .update(base64Data)
    .digest("base64url");
  return `${base64Data}.${signature}`;
}

/**
 * Verifies a token and returns the payload if valid.
 */
export function verifyToken(token: string): SessionPayload | null {
  try {
    const [base64Data, signature] = token.split(".");
    if (!base64Data || !signature) return null;

    const expectedSignature = crypto
      .createHmac("sha256", JWT_SECRET)
      .update(base64Data)
      .digest("base64url");

    if (signature !== expectedSignature) return null;

    const data = JSON.parse(Buffer.from(base64Data, "base64url").toString("utf8"));
    if (data.exp && Date.now() / 1000 > data.exp) {
      return null; // Expired
    }
    return data;
  } catch (error) {
    return null;
  }
}

/**
 * Retrieves the session user ID and role from the Authorization Header.
 */
export function getSessionUser(): SessionUser | null {
  try {
    const authHeader = headers().get("authorization");
    if (!authHeader) return null;

    const token = authHeader.replace(/^Bearer\s+/i, "");
    const decoded = verifyToken(token);
    if (!decoded) return null;

    return { id: decoded.id, role: decoded.role };
  } catch (error) {
    console.error("Error retrieving session from authorization header:", error);
    return null;
  }
}

/**
 * Checks if the current session is an authenticated admin.
 * Performs a database lookup to prevent token role tampering.
 */
export async function checkAdmin(): Promise<boolean> {
  const session = getSessionUser();
  if (!session || session.role !== "admin") return false;

  try {
    await dbConnect();
    const dbUser = await UserModel.findOne({ id: session.id });
    return dbUser?.role === "admin";
  } catch (error) {
    console.error("Database authorization verification failed:", error);
    return false;
  }
}

/**
 * Verifies if the session is authorized to view or edit resources related to a target user.
 * Authorized if the user is an admin OR if the session user ID matches the target user ID.
 */
export async function checkAuthorizedUser(targetUserId: string): Promise<boolean> {
  const session = getSessionUser();
  if (!session) return false;
  if (session.role === "admin") return true;
  return session.id === targetUserId;
}
