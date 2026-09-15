"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import {
  Package,
  Settings,
  Truck,
  CheckCircle2,
  AlertCircle,
  Loader2,
  Calendar,
  Phone,
  MapPin,
  CreditCard,
  Receipt,
  ArrowLeft,
  Copy,
  Check,
  FileText,
  ChevronRight,
  ShoppingBag
} from "lucide-react";
import { motion } from "framer-motion";
import { Order } from "@/context/AppContext";

interface Props {
  params: { id: string } | Promise<{ id: string }>;
}

export default function OrderDetailPage({ params }: Props) {
  const router = useRouter();

  const [orderId, setOrderId] = useState<string>("");
  const [order, setOrder] = useState<Order | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);

  // Live tracking states
  const [trackingData, setTrackingData] = useState<any>(null);
  const [trackingLoading, setTrackingLoading] = useState(false);

  // Unwrap params safely for both Next 14 & Next 15
  useEffect(() => {
    Promise.resolve(params).then((p) => {
      if (p?.id) {
        setOrderId(p.id);
      }
    });
  }, [params]);

  // Fetch order details once orderId is known
  useEffect(() => {
    if (!orderId) return;

    const fetchOrderDetail = async () => {
      setIsLoading(true);
      setError(null);
      try {
        const res = await fetch(`/api/orders/${encodeURIComponent(orderId)}`);
        if (res.ok) {
          const data = await res.json();
          setOrder(data);
        } else {
          const errData = await res.json().catch(() => ({}));
          setError(errData.error || `Unable to load order (${res.status})`);
        }
      } catch (err: any) {
        setError(err.message || "Failed to load order details");
      } finally {
        setIsLoading(false);
      }
    };

    fetchOrderDetail();
  }, [orderId]);

  const handleCopyId = () => {
    if (order?.id) {
      navigator.clipboard.writeText(order.id);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const fetchLiveTracking = async () => {
    if (!orderId) return;
    setTrackingLoading(true);
    setTrackingData(null);
    try {
      const res = await fetch(`/api/orders/${encodeURIComponent(orderId)}/tracking`);
      const data = await res.json();
      setTrackingData(data);
    } catch (err) {
      setTrackingData({ success: false, error: "Failed to fetch live courier tracking checkpoints" });
    } finally {
      setTrackingLoading(false);
    }
  };

  // Auto-fetch live courier tracking when order details load and AWB exists
  useEffect(() => {
    if (order?.id && order?.awbNumber) {
      fetchLiveTracking();
    }
  }, [order?.id, order?.awbNumber]);

  const getStatusStep = (status?: string) => {
    switch (status) {
      case "Pending":
        return 1;
      case "Processing":
        return 2;
      case "Shipped":
        return 3;
      case "Delivered":
        return 4;
      default:
        return 1;
    }
  };

  const getStatusBadgeStyle = (status?: string) => {
    switch (status) {
      case "Delivered":
        return "bg-emerald-50 text-emerald-700 border-emerald-200 ring-emerald-500/20";
      case "Shipped":
        return "bg-blue-50 text-blue-700 border-blue-200 ring-blue-500/20";
      case "Cancelled":
        return "bg-rose-50 text-rose-700 border-rose-200 ring-rose-500/20";
      default:
        return "bg-amber-50 text-amber-700 border-amber-200 ring-amber-500/20";
    }
  };

  const safeItems = Array.isArray(order?.items) ? order.items : [];
  const totalItemCount = safeItems.reduce((sum, item) => sum + (item.quantity || 1), 0);

  return (
    <div className="flex flex-col min-h-screen bg-brand-bg">
      <Navbar />

      <main className="flex-1 max-w-4xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12">
        {/* Navigation Breadcrumb */}
        <div className="mb-6">
          <Link
            href="/orders"
            className="inline-flex items-center space-x-2 text-xs font-bold uppercase tracking-wider text-brand-accent hover:text-brand-primary transition-colors bg-white px-4 py-2 rounded-xl border border-brand-primary/10 shadow-2xs"
          >
            <ArrowLeft size={14} />
            <span>Back to All Orders</span>
          </Link>
        </div>

        {/* Content Loading State */}
        {isLoading ? (
          <div className="flex flex-col items-center justify-center py-24 bg-white rounded-3xl border border-brand-primary/5 shadow-xs">
            <Loader2 className="h-10 w-10 text-brand-accent animate-spin mb-4" />
            <p className="text-xs text-brand-darkGray uppercase tracking-widest font-bold">
              Loading order details...
            </p>
          </div>
        ) : error || !order ? (
          <div className="bg-white rounded-3xl border border-brand-primary/5 shadow-sm p-8 sm:p-12 text-center max-w-lg mx-auto my-6">
            <AlertCircle className="mx-auto text-rose-500 h-12 w-12 mb-4 stroke-1" />
            <h3 className="font-serif text-xl font-bold text-brand-text mb-2">
              Order Not Found
            </h3>
            <p className="text-xs sm:text-sm text-brand-darkGray mb-6 leading-relaxed">
              {error || "We couldn't locate this order record. Please check your order ID or view your complete order history."}
            </p>
            <Link
              href="/orders"
              className="inline-flex items-center justify-center bg-brand-accent text-white text-xs px-8 py-3.5 tracking-widest uppercase font-semibold hover:bg-brand-primary transition-colors rounded-full space-x-2 shadow-md shadow-brand-accent/15"
            >
              <span>View All Orders</span>
            </Link>
          </div>
        ) : (
          <motion.div
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            className="space-y-6"
          >
            {/* Header Card */}
            <div className="bg-white rounded-2xl border border-brand-primary/10 shadow-sm p-6 sm:p-8 space-y-4">
              <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 border-b border-neutral-100 pb-4">
                <div>
                  <div className="flex items-center space-x-3 flex-wrap gap-y-2">
                    <span className="font-serif text-2xl font-bold text-brand-text">
                      Order Details
                    </span>
                    <span
                      className={`text-[10px] font-bold px-3 py-1 rounded-full uppercase tracking-wider border ring-2 ${getStatusBadgeStyle(
                        order.status
                      )} flex items-center space-x-1`}
                    >
                      <span className="w-1.5 h-1.5 rounded-full bg-current animate-pulse" />
                      <span>{order.status || "Pending"}</span>
                    </span>
                  </div>

                  <div className="flex items-center space-x-2 mt-2 text-xs text-brand-darkGray">
                    <span className="font-mono bg-neutral-100 px-2.5 py-1 rounded border border-neutral-200 text-brand-text font-bold flex items-center gap-1">
                      <FileText size={12} className="text-brand-accent" />
                      {order.id}
                    </span>
                    <button
                      onClick={handleCopyId}
                      className="p-1 hover:bg-neutral-100 rounded transition-colors"
                      title="Copy Order ID"
                    >
                      {copied ? <Check size={14} className="text-emerald-600" /> : <Copy size={14} />}
                    </button>
                  </div>
                </div>

                <div className="text-left sm:text-right text-xs text-brand-darkGray space-y-1">
                  <p className="flex items-center space-x-1 sm:justify-end">
                    <Calendar size={13} className="text-neutral-400" />
                    <span>Placed on: <strong>{order.date || "N/A"}</strong></span>
                  </p>
                  <p className="flex items-center space-x-1 sm:justify-end">
                    <CreditCard size={13} className="text-neutral-400" />
                    <span>Payment Mode: <strong>{order.paymentMethod || "COD"}</strong></span>
                  </p>
                </div>
              </div>

              {/* Quick Summary Strip */}
              <div className="flex items-center justify-between text-xs pt-1 flex-wrap gap-2">
                <span className="text-brand-darkGray">
                  Total Items: <strong className="text-brand-text">{totalItemCount}</strong>
                </span>
                <span className="text-base font-extrabold text-brand-accent">
                  Grand Total: ₹{order.totalAmount || 0}
                </span>
              </div>
            </div>

            {/* Cancellation Banner with Reason */}
            {(order.status === "Cancelled" || order.cancelReason) && (
              <div className="bg-rose-50/80 border border-rose-200 rounded-2xl p-6 sm:p-8 space-y-3 text-rose-900 shadow-sm animate-fade-in">
                <div className="flex items-center space-x-2 text-rose-700 font-serif font-bold text-lg border-b border-rose-200/60 pb-3">
                  <AlertCircle className="w-6 h-6 text-rose-600 flex-shrink-0" />
                  <span>Order Cancelled / Deleted</span>
                </div>
                <div className="space-y-1">
                  <span className="text-[10px] font-extrabold uppercase tracking-wider text-rose-600 block">
                    Reason provided by Store Administrator:
                  </span>
                  <p className="text-sm font-semibold leading-relaxed bg-white/90 p-4 rounded-xl border border-rose-200/80 text-rose-950 font-sans shadow-2xs">
                    &ldquo;{order.cancelReason || "Order was cancelled by administrator."}&rdquo;
                  </p>
                </div>
                <p className="text-xs text-rose-700/90 pt-1">
                  If you have questions regarding this cancellation or refund status, please contact our support team.
                </p>
              </div>
            )}

            {/* 1. Delivery Progress Tracker Stepper (Only if not cancelled) */}
            {order.status !== "Cancelled" && (
              <div className="bg-white p-6 sm:p-8 border border-brand-primary/10 rounded-2xl shadow-sm space-y-6">
                <div className="flex items-center justify-between border-b border-neutral-100 pb-3">
                  <h3 className="text-xs font-bold text-brand-accent uppercase tracking-wider flex items-center space-x-1.5">
                    <Truck size={16} />
                    <span>Shipment Delivery Tracker</span>
                  </h3>
                  <span className="text-xs font-bold text-emerald-700 bg-emerald-50 px-3 py-1 rounded-full border border-emerald-200">
                    {order.status === "Delivered" ? "Delivered to Doorstep" : "In Transit"}
                  </span>
                </div>

                <div className="relative flex justify-between items-center max-w-2xl mx-auto px-4 py-4">
                  {/* Connector Line Background */}
                  <div className="absolute top-6 left-8 right-8 h-[3px] bg-neutral-100 -z-10 rounded-full" />
                  {/* Connector Line Fill */}
                  <div
                    className="absolute top-6 left-8 h-[3px] bg-emerald-500 -z-10 rounded-full transition-all duration-500 shadow-sm"
                    style={{ width: `${((getStatusStep(order.status) - 1) / 3) * 100}%` }}
                  />

                  {/* Milestones */}
                  {[
                    { label: "Order Placed", icon: Package, stepNum: 1, desc: "Confirmed" },
                    { label: "Processing", icon: Settings, stepNum: 2, desc: "Packed" },
                    { label: "Shipped", icon: Truck, stepNum: 3, desc: "In Transit" },
                    { label: "Delivered", icon: CheckCircle2, stepNum: 4, desc: "Completed" }
                  ].map((step, idx) => {
                    const StepIcon = step.icon;
                    const isDone = getStatusStep(order.status) >= step.stepNum;
                    const isActive = getStatusStep(order.status) === step.stepNum;

                    return (
                      <div key={idx} className="flex flex-col items-center z-10 text-center">
                        <div
                          className={`w-12 h-12 rounded-full border-2 flex items-center justify-center transition-all duration-300 ${
                            isDone
                              ? "border-emerald-600 bg-emerald-600 text-white shadow-md shadow-emerald-200/50"
                              : "border-neutral-300 bg-white text-neutral-400"
                          } ${
                            isActive
                              ? "ring-4 ring-emerald-200/80 scale-110"
                              : ""
                          }`}
                        >
                          {isDone && !isActive ? (
                            <Check size={20} className="text-white stroke-[2.8]" />
                          ) : (
                            <StepIcon size={20} className={`stroke-[2.2] flex-shrink-0 ${isDone ? "text-white" : "text-neutral-400"} ${isActive ? "animate-pulse" : ""}`} />
                          )}
                        </div>
                        <span
                          className={`text-xs font-semibold mt-2.5 block transition-colors duration-300 ${
                            isDone ? "text-neutral-900 font-bold" : "text-neutral-400"
                          }`}
                        >
                          {step.label}
                        </span>
                        <span className={`text-[10px] block transition-colors duration-300 ${
                          isActive ? "text-emerald-600 font-bold" : "text-neutral-400"
                        }`}>
                          {step.desc}
                        </span>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}

            {/* 2. Items List */}
            <div className="bg-white p-6 sm:p-8 border border-brand-primary/10 rounded-2xl shadow-sm space-y-4">
              <h3 className="text-xs font-bold text-brand-accent uppercase tracking-wider flex items-center space-x-1.5 border-b border-neutral-100 pb-3">
                <ShoppingBag size={16} />
                <span>Purchased Items ({safeItems.length})</span>
              </h3>

              <div className="space-y-4">
                {safeItems.map((item: any, idx: number) => {
                  const productName = item.product?.name || item.name || "Garment Item";
                  const productImage = item.product?.images?.[0] || item.image || "";
                  const productPrice = item.product?.salePrice || item.price || 0;
                  const itemQty = item.quantity || 1;
                  const itemSize = item.selectedSize || item.size || "M";
                  const itemColor = item.selectedColor || item.color || "";

                  return (
                    <div
                      key={idx}
                      className="flex flex-col sm:flex-row items-start sm:items-center justify-between bg-neutral-50/70 p-4 rounded-xl border border-neutral-200 gap-4"
                    >
                      <div className="flex items-center space-x-4">
                        <div className="w-16 h-20 bg-white rounded-lg overflow-hidden flex-shrink-0 border border-neutral-200 relative">
                          {productImage ? (
                            <img
                              src={productImage}
                              alt={productName}
                              className="w-full h-full object-cover"
                            />
                          ) : (
                            <Package size={24} className="m-auto text-neutral-300" />
                          )}
                        </div>

                        <div className="space-y-1">
                          {item.product?.id ? (
                            <Link
                              href={`/product/${item.product.id}`}
                              className="font-serif font-bold text-sm text-brand-text hover:text-brand-accent transition-colors flex items-center gap-1"
                            >
                              <span>{productName}</span>
                              <ChevronRight size={14} className="text-neutral-400" />
                            </Link>
                          ) : (
                            <span className="font-serif font-bold text-sm text-brand-text">
                              {productName}
                            </span>
                          )}
                          <div className="flex flex-wrap gap-2 text-xs text-brand-darkGray">
                            <span className="bg-white px-2.5 py-0.5 rounded border border-neutral-200 font-medium">
                              Size: {itemSize}
                            </span>
                            {itemColor && (
                              <span className="bg-white px-2.5 py-0.5 rounded border border-neutral-200 font-medium">
                                Color: {itemColor}
                              </span>
                            )}
                            <span className="bg-white px-2.5 py-0.5 rounded border border-neutral-200 font-medium">
                              Qty: {itemQty}
                            </span>
                          </div>
                        </div>
                      </div>

                      <div className="text-right sm:text-right w-full sm:w-auto border-t sm:border-t-0 border-neutral-200 pt-2 sm:pt-0">
                        <span className="font-bold text-base text-brand-accent block">
                          ₹{productPrice * itemQty}
                        </span>
                        <span className="text-[11px] text-brand-darkGray">₹{productPrice} each</span>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* 3. Address & Receipt Grid */}
            <div className="grid md:grid-cols-2 gap-6">
              {/* Shipping Address */}
              <div className="bg-white p-6 border border-brand-primary/10 rounded-2xl shadow-sm space-y-4">
                <h3 className="text-xs font-bold text-brand-accent uppercase tracking-wider flex items-center space-x-1.5 border-b border-neutral-100 pb-3">
                  <MapPin size={16} />
                  <span>Delivery Address</span>
                </h3>

                <div className="leading-relaxed text-xs text-brand-text space-y-1.5">
                  <p className="font-bold text-sm">{order.shippingAddress?.fullName || "Valued Customer"}</p>
                  <p className="text-brand-darkGray">{order.shippingAddress?.addressLine || ""}</p>
                  <p className="text-brand-darkGray">
                    {order.shippingAddress?.city || ""}{order.shippingAddress?.state ? `, ${order.shippingAddress.state}` : ""} –{" "}
                    <strong className="text-brand-text">{order.shippingAddress?.postalCode || ""}</strong>
                  </p>
                  <p className="text-brand-darkGray pt-2 flex items-center space-x-1.5">
                    <Phone size={13} className="text-brand-accent" />
                    <span>Contact Phone: +91 {order.shippingAddress?.phone || order.phone || ""}</span>
                  </p>
                </div>
              </div>

              {/* Receipt Summary */}
              <div className="bg-white p-6 border border-brand-primary/10 rounded-2xl shadow-sm space-y-4 text-xs">
                <h3 className="text-xs font-bold text-brand-accent uppercase tracking-wider flex items-center space-x-1.5 border-b border-neutral-100 pb-3">
                  <Receipt size={16} />
                  <span>Payment Receipt Breakdown</span>
                </h3>

                <div className="space-y-2.5 text-brand-darkGray">
                  {order.awbNumber ? (
                    <div className="p-3.5 bg-brand-accent/5 rounded-xl border border-brand-accent/10 space-y-1">
                      <div className="flex justify-between">
                        <span>Courier Partner:</span>
                        <strong className="text-brand-text">{order.courierName || "Allocated"}</strong>
                      </div>
                      <div className="flex justify-between">
                        <span>AWB Tracking ID:</span>
                        <strong className="font-mono text-brand-accent">{order.awbNumber}</strong>
                      </div>
                    </div>
                  ) : (
                    <div className="p-3.5 bg-amber-50/80 rounded-xl border border-amber-200/80 space-y-1 text-amber-900">
                      <div className="flex items-center space-x-1.5 font-bold text-xs">
                        <Truck size={14} className="text-amber-700" />
                        <span>Order Confirmed & Preparing Dispatch</span>
                      </div>
                      <p className="text-[11px] text-amber-800/90 leading-tight">
                        Your order is being processed. AWB courier tracking code will be assigned upon shipment pickup.
                      </p>
                    </div>
                  )}


                  <div className="flex justify-between">
                    <span>Shipping Charges:</span>
                    <span>{order.shippingCost === 0 ? <strong className="text-emerald-600">FREE</strong> : `₹${order.shippingCost || 0}`}</span>
                  </div>
                  {(order.discountAmount || 0) > 0 && (
                    <div className="flex justify-between text-emerald-600 font-bold">
                      <span>Discount Saved:</span>
                      <span>-₹{order.discountAmount}</span>
                    </div>
                  )}
                  <div className="border-t border-dashed border-neutral-200 pt-3 flex justify-between font-extrabold text-brand-accent text-base">
                    <span>Grand Total:</span>
                    <span>₹{order.totalAmount || 0}</span>
                  </div>
                </div>

                {/* Live iThink Tracking Button */}
                {order.awbNumber && (
                  <div className="border-t border-neutral-100 pt-4">
                    <button
                      type="button"
                      onClick={fetchLiveTracking}
                      disabled={trackingLoading}
                      className="w-full bg-brand-accent hover:bg-brand-primary text-white text-xs font-bold uppercase tracking-wider py-3.5 px-4 rounded-xl transition-all flex items-center justify-center space-x-2 shadow-sm disabled:opacity-50"
                    >
                      {trackingLoading ? (
                        <Loader2 size={14} className="animate-spin" />
                      ) : (
                        <Truck size={14} />
                      )}
                      <span>
                        {trackingLoading ? "Fetching Live Courier Scans..." : "Track Live Courier Checkpoints"}
                      </span>
                    </button>

                    {/* Checkpoints Output */}
                    {trackingData && (
                      <div className="mt-4 p-4 bg-neutral-50 border border-neutral-200 rounded-xl space-y-3">
                        {trackingData.success ? (
                          <>
                            <div className="space-y-1">
                              <div className="flex justify-between text-xs">
                                <span className="text-brand-darkGray">Status:</span>
                                <strong className="text-brand-accent">{trackingData.currentStatus}</strong>
                              </div>
                              {trackingData.expectedDelivery && (
                                <div className="flex justify-between text-xs">
                                  <span className="text-brand-darkGray">Expected Delivery:</span>
                                  <strong className="text-emerald-700">{trackingData.expectedDelivery}</strong>
                                </div>
                              )}
                            </div>

                            {trackingData.events && trackingData.events.length > 0 && (
                              <div className="border-t border-neutral-200 pt-3 space-y-2 max-h-48 overflow-y-auto pr-1">
                                <p className="text-[10px] font-bold text-brand-accent uppercase tracking-wider">
                                  Courier Scans History
                                </p>
                                {trackingData.events.map((evt: any, i: number) => (
                                  <div
                                    key={i}
                                    className="flex items-start space-x-2 text-xs pl-2 border-l-2 border-brand-accent/40"
                                  >
                                    <div>
                                      <p className="font-semibold text-brand-text">{evt.status || evt.remark}</p>
                                      <p className="text-brand-darkGray text-[10px]">{evt.location} • {evt.timestamp}</p>
                                    </div>
                                  </div>
                                ))}
                              </div>
                            )}
                          </>
                        ) : (
                          <div className="flex items-start space-x-2 text-amber-800 bg-amber-50 p-3 rounded-lg text-xs border border-amber-200">
                            <AlertCircle size={14} className="flex-shrink-0 mt-0.5 text-amber-600" />
                            <span>{trackingData.error || "No checkpoints returned yet."}</span>
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                )}
              </div>
            </div>

          </motion.div>
        )}
      </main>

      <Footer />
    </div>
  );
}
