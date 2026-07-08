const mongoose = require("mongoose");
const path = require("path");
const fs = require("fs");

// Load .env.local variables manually
const envPath = path.resolve(__dirname, "../.env.local");
if (fs.existsSync(envPath)) {
  const envFile = fs.readFileSync(envPath, "utf-8");
  envFile.split("\n").forEach((line) => {
    const match = line.match(/^\s*([\w.-]+)\s*=\s*(.*)?\s*$/);
    if (match) {
      const key = match[1];
      let value = match[2] || "";
      if (value.startsWith('"') && value.endsWith('"')) {
        value = value.substring(1, value.length - 1);
      } else if (value.startsWith("'") && value.endsWith("'")) {
        value = value.substring(1, value.length - 1);
      }
      process.env[key] = value;
    }
  });
}

const MONGODB_URI = process.env.MONGODB_URI;
if (!MONGODB_URI) {
  console.error("❌ MONGODB_URI not found in .env.local");
  process.exit(1);
}

// Define minimal schemas for migration
const ProductSchema = new mongoose.Schema({
  id: String,
  name: String,
  category: String
}, { strict: false });

const OrderSchema = new mongoose.Schema({
  id: String,
  items: Array
}, { strict: false });

const Product = mongoose.models.Product || mongoose.model("Product", ProductSchema);
const Order = mongoose.models.Order || mongoose.model("Order", OrderSchema);

const mapping = {
  "Pakistani Suits": "Shalwar Kameez",
  "Pakistani Kurtas": "Kurtis",
  "Indian Kurtas": "Kurtis",
  "Casual Wear": "Casuals",
  "Festive Wear": "Party Wear"
};

async function run() {
  try {
    console.log("Connecting to MongoDB...");
    await mongoose.connect(MONGODB_URI);
    console.log("✅ Connected successfully.");

    // 1. Migrate Products
    console.log("\nMigrating Products...");
    for (const [oldCat, newCat] of Object.entries(mapping)) {
      const res = await Product.updateMany({ category: oldCat }, { category: newCat });
      console.log(`- Updated ${res.modifiedCount} products from "${oldCat}" to "${newCat}"`);
    }

    // 2. Migrate Orders
    console.log("\nMigrating Orders...");
    const orders = await Order.find({});
    let updatedOrdersCount = 0;

    for (const order of orders) {
      let modified = false;
      if (order.items && Array.isArray(order.items)) {
        for (const item of order.items) {
          if (item.product && item.product.category && mapping[item.product.category]) {
            const oldCat = item.product.category;
            item.product.category = mapping[oldCat];
            modified = true;
            console.log(`  Order ${order.id}: Mapping product "${item.product.name}" category from "${oldCat}" to "${mapping[oldCat]}"`);
          }
        }
      }
      if (modified) {
        order.markModified('items');
        await order.save();
        updatedOrdersCount++;
      }
    }
    console.log(`- Updated ${updatedOrdersCount} orders containing items with old categories.`);
    console.log("\n✅ Database migration completed successfully!");
  } catch (error) {
    console.error("❌ Error running migration:", error);
  } finally {
    await mongoose.disconnect();
    console.log("Disconnected from MongoDB.");
  }
}

run();
