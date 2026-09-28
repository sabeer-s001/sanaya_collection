const mongoose = require("mongoose");
const path = require("path");
const fs = require("fs");

// Load environment variables from .env.local
const envPath = path.resolve(__dirname, "../.env.local");
if (fs.existsSync(envPath)) {
  const envFile = fs.readFileSync(envPath, "utf-8");
  envFile.split("\n").forEach((line) => {
    const match = line.match(/^\s*([\w.-]+)\s*=\s*(.*)?\s*$/);
    if (match) {
      let value = match[2] || "";
      if ((value.startsWith('"') && value.endsWith('"')) || (value.startsWith("'") && value.endsWith("'"))) {
        value = value.substring(1, value.length - 1);
      }
      process.env[match[1]] = value;
    }
  });
}

const MONGODB_URI = process.env.MONGODB_URI;
if (!MONGODB_URI) {
  console.error("❌ MONGODB_URI not found in .env.local");
  process.exit(1);
}

async function runCleanup() {
  try {
    console.log("Connecting to MongoDB...");
    await mongoose.connect(MONGODB_URI);
    console.log("✅ Connected successfully.");

    const db = mongoose.connection.db;

    // 1. Delete all test orders
    const ordersResult = await db.collection("orders").deleteMany({});
    console.log(`✅ Cleared all orders: ${ordersResult.deletedCount} orders removed.`);

    // 2. Remove non-admin customer users, keeping admin user(s) intact
    const userResult = await db.collection("users").deleteMany({ role: { $ne: "admin" } });
    console.log(`✅ Cleared non-admin customer records: ${userResult.deletedCount} users removed.`);

    // 3. Verify admin user exists
    const adminCount = await db.collection("users").countDocuments({ role: "admin" });
    console.log(`ℹ️ Admin users remaining: ${adminCount}`);

    // 4. Verify products remain intact
    const productCount = await db.collection("products").countDocuments({});
    console.log(`ℹ️ Products remaining: ${productCount}`);

    console.log("\n🎉 Database cleanup completed successfully! Website is now reset for production.");
  } catch (error) {
    console.error("❌ Error during cleanup:", error);
  } finally {
    await mongoose.disconnect();
    console.log("Disconnected from MongoDB.");
  }
}

runCleanup();
