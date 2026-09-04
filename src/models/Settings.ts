import mongoose from "mongoose";

const SettingsSchema = new mongoose.Schema(
  {
    key: { type: String, required: true, unique: true, default: "store_settings" },
    shippingFee: { type: Number, default: 0 },
    freeShippingThreshold: { type: Number, default: 0 },
  },
  { timestamps: true }
);

export const SettingsModel =
  mongoose.models.Settings || mongoose.model("Settings", SettingsSchema);
