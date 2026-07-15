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

// Index on the custom `id` string field — this is what page.tsx queries via
// findOne({ id }). Without this, every product page view does a full collection
// scan. The `unique:true` in the schema field definition alone does NOT
// guarantee the index exists on an existing Atlas collection.
ProductSchema.index({ id: 1 }, { unique: true });

// Index for category lookups (shop/filter pages).
ProductSchema.index({ category: 1 });

// Compound index for the related products query:
// ProductModel.find({ category, id: { $ne: currentId } })
// MongoDB can satisfy this with a single index scan instead of scanning all
// products in the category then filtering by id.
ProductSchema.index({ category: 1, id: 1 });

export const ProductModel =
  mongoose.models.Product || mongoose.model("Product", ProductSchema);
