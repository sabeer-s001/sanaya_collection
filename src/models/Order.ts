import mongoose from "mongoose";
import { AddressSchema } from "./User";

const CartItemSchema = new mongoose.Schema({
  product: {
    id: { type: String, required: true },
    name: { type: String, required: true },
    category: { type: String, required: true },
    originalPrice: { type: Number, required: true },
    salePrice: { type: Number, required: true },
    discount: { type: Number },
    rating: { type: Number },
    reviewCount: { type: Number },
    images: { type: [String] },
    sizes: { type: [String] },
    colors: { type: [String] },
    inStock: { type: Boolean },
    isBestSeller: { type: Boolean },
    isFastSelling: { type: Boolean },
    isSale: { type: Boolean },
    fabric: { type: String },
    description: { type: String },
    careInstructions: { type: String },
    shippingInfo: { type: String },
    returnPolicy: { type: String },
  },
  quantity: { type: Number, required: true },
  selectedSize: { type: String, required: true },
  selectedColor: { type: String },
});

const OrderSchema = new mongoose.Schema(
  {
    id: { type: String, required: true, unique: true },
    userId: { type: String, default: "" }, // Linked user ID for secure routing
    date: { type: Date, required: true },
    items: { type: [CartItemSchema], required: true },
    shippingAddress: { type: AddressSchema, required: true },
    paymentMethod: { type: String, required: true },
    paymentStatus: { type: String, required: true },
    shippingCost: { type: Number, required: true },
    tax: { type: Number, required: true },
    discountAmount: { type: Number, required: true },
    totalAmount: { type: Number, required: true },
    status: {
      type: String,
      enum: ["Pending", "Processing", "Shipped", "Delivered"],
      default: "Pending",
    },
    trackingNumber: { type: String, required: true },
    razorpayOrderId: { type: String },
    razorpayPaymentId: { type: String },
    razorpaySignature: { type: String },
  },
  { timestamps: true }
);

// Index orders by userId for fast profile order fetches
OrderSchema.index({ userId: 1 });

OrderSchema.set("toJSON", {
  transform: (doc, ret) => {
    if (ret.date instanceof Date) {
      (ret as any).date = ret.date.toISOString().split("T")[0];
    } else if (ret.date) {
      (ret as any).date = new Date(ret.date).toISOString().split("T")[0];
    }
    return ret;
  }
});

export const OrderModel =
  mongoose.models.Order || mongoose.model("Order", OrderSchema);
