import mongoose from "mongoose";

const ProductSchema = new mongoose.Schema(
  {
    id: { type: String, required: true, unique: true },
    name: { type: String, required: true },
    category: { type: String, required: true },
    originalPrice: { type: Number, required: true },
    salePrice: { type: Number, required: true },
    discount: { type: Number, default: 0 },
    rating: { type: Number, default: 5.0 },
    reviewCount: { type: Number, default: 0 },
    images: { type: [String], default: [] },
    sizes: { type: [String], default: [] },
    colors: { type: [String], default: [] },
    inStock: { type: Boolean, default: true },
    isBestSeller: { type: Boolean, default: false },
    isFastSelling: { type: Boolean, default: false },
    isSale: { type: Boolean, default: false },
    fabric: { type: String, default: "" },
    description: { type: String, default: "" },
    careInstructions: { type: String, default: "" },
    shippingInfo: { type: String, default: "" },
    returnPolicy: { type: String, default: "" },
  },
  { timestamps: true }
);

export const ProductModel =
  mongoose.models.Product || mongoose.model("Product", ProductSchema);
