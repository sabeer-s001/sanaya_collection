import mongoose from "mongoose";

// Re-export modular models & helpers for backward compatibility
export { ProductModel } from "@/models/Product";
export { OrderModel } from "@/models/Order";
export { UserModel, hashPassword, verifyPassword } from "@/models/User";
export { HeroImageModel } from "@/models/HeroImage";

// ----------------------------------------------------
// SEED DATA REFERENCE
// ----------------------------------------------------
export const DEFAULT_USERS = [
  {
    id: "admin",
    fullName: "Sanaya Admin",
    email: "admin@sanaya.com",
    password: "adminpassword",
    role: "admin",
    addresses: [],
    wishlist: [],
  },
  {
    id: "admin_sabeer",
    fullName: "Sabeer Admin",
    email: "sabeersalotgi@gmail.com",
    password: "adminpassword",
    role: "admin",
    addresses: [],
    wishlist: [],
  },
  {
    id: "customer1",
    fullName: "Aanya Verma",
    email: "aanya@gmail.com",
    password: "userpassword",
    role: "customer",
    addresses: [
      {
        fullName: "Aanya Verma",
        addressLine: "Flat 402, Lotus Residency, MG Road",
        city: "Mumbai",
        state: "Maharashtra",
        postalCode: "400001",
        phone: "7021366239",
      },
    ],
    wishlist: [],
  },
];

// -----------------
// CONNECTION HELPER
// -----------------

let cached = (global as any).mongoose;

if (!cached) {
  cached = (global as any).mongoose = { conn: null, promise: null };
}

export async function dbConnect() {
  const MONGODB_URI = process.env.MONGODB_URI || "";
  if (!MONGODB_URI) {
    console.error("❌ MONGODB_URI environment variable is missing.");
    throw new Error("MONGODB_URI environment variable is not defined inside .env.local");
  }

  if (cached.conn) {
    return cached.conn;
  }

  if (!cached.promise) {
    cached.promise = mongoose
      .connect(MONGODB_URI, {
        bufferCommands: false,
        serverSelectionTimeoutMS: 10000,
        connectTimeoutMS: 10000,
      })
      .then((mongooseInstance) => {
        console.log("✅ Connected to MongoDB Atlas");
        return mongooseInstance;
      })
      .catch((error) => {
        cached.promise = null;
        console.error("❌ Failed to resolve MongoDB Atlas connection:", error);
        throw error;
      });
  }

  try {
    cached.conn = await cached.promise;
  } catch (e) {
    cached.promise = null;
    console.error("❌ MongoDB connection error:", e);
    throw e;
  }

  return cached.conn;
}
