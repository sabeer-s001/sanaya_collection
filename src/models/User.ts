import mongoose from "mongoose";
import crypto from "crypto";

export const AddressSchema = new mongoose.Schema({
  fullName: { type: String, required: true },
  addressLine: { type: String, required: true },
  city: { type: String, required: true },
  state: { type: String, required: true },
  postalCode: { type: String, required: true },
  phone: { type: String, required: true },
});

const UserSchema = new mongoose.Schema(
  {
    id: { type: String, required: true, unique: true },
    fullName: { type: String, required: true },
    email: { type: String, required: true, unique: true },
    password: { type: String, required: true },
    role: { type: String, enum: ["customer", "admin"], default: "customer" },
    addresses: { type: [AddressSchema], default: [] },
    wishlist: { type: [String], default: [] },
  },
  { timestamps: true }
);

export function hashPassword(password: string): string {
  const salt = crypto.randomBytes(16).toString("hex");
  const hash = crypto.pbkdf2Sync(password, salt, 1000, 64, "sha512").toString("hex");
  return `${salt}:${hash}`;
}

export function verifyPassword(password: string, storedValue: string): boolean {
  if (!storedValue || !storedValue.includes(":")) return false;
  const [salt, hash] = storedValue.split(":");
  if (!salt || !hash) return false;
  const checkHash = crypto.pbkdf2Sync(password, salt, 1000, 64, "sha512").toString("hex");
  return hash === checkHash;
}

UserSchema.pre("save", async function(this: any) {
  const user = this;
  if (!user.isModified("password")) return;
  try {
    user.password = hashPassword(user.password);
  } catch (err: any) {
    throw err;
  }
});

export const UserModel =
  mongoose.models.User || mongoose.model("User", UserSchema);
