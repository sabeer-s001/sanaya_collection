import mongoose from "mongoose";

const HeroImageSchema = new mongoose.Schema(
  {
    desktopImage: { type: String, required: true },
    mobileImage: { type: String, required: true },
    order: { type: Number, default: 0 },
  },
  { timestamps: true }
);

export const HeroImageModel =
  mongoose.models.HeroImage || mongoose.model("HeroImage", HeroImageSchema);
