const mongoose = require("mongoose");
const crypto = require("crypto");
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

// Hashing helper matching the User model
function hashPassword(password) {
  const salt = crypto.randomBytes(16).toString("hex");
  const hash = crypto.pbkdf2Sync(password, salt, 1000, 64, "sha512").toString("hex");
  return `${salt}:${hash}`;
}

// Define minimal schema
const UserSchema = new mongoose.Schema({
  id: { type: String, required: true, unique: true },
  fullName: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  role: { type: String, enum: ["customer", "admin"], default: "customer" },
  addresses: { type: Array, default: [] },
  wishlist: { type: Array, default: [] }
}, { timestamps: true });

const User = mongoose.models.User || mongoose.model("User", UserSchema);

async function run() {
  try {
    console.log("Connecting to MongoDB...");
    await mongoose.connect(MONGODB_URI);
    console.log("✅ Connected successfully.");

    const email = "sabeersalotgi@gmail.com";
    const password = "adminpassword"; // Default admin password

    // Check if user already exists
    let user = await User.findOne({ email: email.toLowerCase() });

    if (user) {
      console.log(`User ${email} already exists. Updating role to 'admin'...`);
      user.role = "admin";
      await user.save();
      console.log("✅ User role updated to 'admin'.");
    } else {
      console.log(`Creating new admin user: ${email}...`);
      const hashedPassword = hashPassword(password);
      
      const newAdmin = new User({
        id: `usr-${Math.random().toString(36).substr(2, 9)}`,
        fullName: "Sabeer Admin",
        email: email.toLowerCase(),
        password: hashedPassword,
        role: "admin",
        addresses: [],
        wishlist: []
      });

      await newAdmin.save();
      console.log("✅ Admin user created successfully.");
    }
  } catch (error) {
    console.error("❌ Error running script:", error);
  } finally {
    await mongoose.disconnect();
    console.log("Disconnected from MongoDB.");
  }
}

run();
