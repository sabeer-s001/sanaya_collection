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
    customerId: { type: String, default: "" }, // Secure HTTP-only cookie client ID
    phone: { type: String, default: "" }, // Top-level phone number for verification flexibility
    phoneVerificationStatus: {
      type: String,
      enum: ["unverified", "verified"],
      default: "unverified",
    },
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
      enum: ["Pending", "Processing", "Shipped", "Delivered", "Cancelled"],
      default: "Pending",
    },
    trackingNumber: { type: String, default: "" },
    cancelReason: { type: String, default: "" },
    razorpayOrderId: { type: String },
    razorpayPaymentId: { type: String },
    razorpaySignature: { type: String },

    // ─── iThink Logistics Fields ───
    logisticsProvider: { type: String, default: "iThink Logistics" },
    shipmentId: { type: String, default: "" },
    awbNumber: { type: String, default: "" },
    courierName: { type: String, default: "" },
    shipmentStatus: { type: String, default: "" },
    shipmentCreatedAt: { type: Date },
    trackingUpdatedAt: { type: Date },
    logisticsError: { type: String, default: "" },
  },
  { timestamps: true }
);

// Index orders for fast lookups
OrderSchema.index({ userId: 1 });
OrderSchema.index({ customerId: 1 });
OrderSchema.index({ phone: 1 });

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
