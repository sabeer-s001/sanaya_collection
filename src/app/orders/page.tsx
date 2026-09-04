"use client";

import React, { useState, useEffect, useCallback } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import {
  ShoppingBag,
  Package,
  Truck,
  CheckCircle2,
  AlertCircle,
  Loader2,
  Calendar,
  ArrowRight,
  ChevronRight,
  FileText,
  CreditCard,
  Phone,
  Sparkles
} from "lucide-react";
import { motion } from "framer-motion";
import { Order } from "@/context/AppContext";

export default function GuestOrdersPage() {
  const router = useRouter();
  const [orders, setOrders] = useState<Order[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [activePhone, setActivePhone] = useState("");

  const fetchOrders = useCallback(async (phoneToSearch?: string) => {
    setIsLoading(true);
    setError(null);
    try {
      const url = phoneToSearch && phoneToSearch.trim().length >= 10
        ? `/api/orders?phone=${encodeURIComponent(phoneToSearch.trim())}`
        : "/api/orders";
      const res = await fetch(url);
      if (res.ok) {
        const data = await res.json();
        if (Array.isArray(data)) {
          setOrders(data);
        } else {
          setOrders([]);
        }
      } else {
        const errData = await res.json();
        setError(errData.error || "Failed to fetch orders.");
      }
    } catch (err: any) {
      setError(err.message || "An unexpected error occurred.");
    } finally {
      setIsLoading(false);
    }
  }, []);

  // Fetch orders on mount
  useEffect(() => {
    let savedPhone = "";
    if (typeof window !== "undefined") {
      savedPhone = localStorage.getItem("sanaya_customer_phone") || "";
    }
    if (savedPhone) {
      setActivePhone(savedPhone);
      fetchOrders(savedPhone);
    } else {
      fetchOrders();
    }
  }, [fetchOrders]);

  const getStatusBadgeStyle = (status: string) => {
    switch (status) {
      case "Delivered":
        return "bg-emerald-50 text-emerald-700 border-emerald-200";
      case "Shipped":
        return "bg-blue-50 text-blue-700 border-blue-200";
      case "Cancelled":
        return "bg-rose-50 text-rose-700 border-rose-200";
      default:
        return "bg-amber-50 text-amber-700 border-amber-200";
    }
  };

  return (
    <div className="flex flex-col min-h-screen bg-brand-bg">
      <Navbar />

      <main className="flex-1 max-w-4xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12">
        {/* Header */}
        <div className="mb-8 flex flex-col sm:flex-row justify-between items-start sm:items-end gap-4">
          <div>
            <div className="flex items-center space-x-2 text-xs font-bold uppercase tracking-wider text-brand-accent mb-1">
              <Package size={16} />
              <span>Customer Account</span>
            </div>
            <h1 className="font-serif text-3xl sm:text-4xl font-normal tracking-wide text-brand-text">
              My Orders
            </h1>
            <p className="text-xs sm:text-sm text-brand-darkGray mt-1">
              View your order history and track delivery progress.
            </p>
          </div>

          {orders.length > 0 && (
            <div className="bg-white px-4 py-2 rounded-xl border border-brand-primary/10 shadow-2xs flex items-center space-x-2 text-xs font-semibold text-brand-text">
              <Sparkles size={14} className="text-brand-accent" />
              <span>{orders.length} Order{orders.length > 1 ? "s" : ""}</span>
            </div>
          )}
        </div>

        {/* Content States */}
        {isLoading ? (
          <div className="flex flex-col items-center justify-center py-24 bg-white rounded-3xl border border-brand-primary/5 shadow-xs">
            <Loader2 className="h-10 w-10 text-brand-accent animate-spin mb-4" />
            <p className="text-xs text-brand-darkGray uppercase tracking-widest font-bold">
              Loading your orders...
            </p>
          </div>
        ) : error ? (
          <div className="bg-red-50/60 border border-red-200 rounded-3xl p-8 text-center my-6">
            <AlertCircle className="mx-auto text-red-500 h-10 w-10 mb-3 stroke-1" />
            <h3 className="font-serif text-brand-text text-lg font-bold mb-1">
              Unable to Load Orders
            </h3>
            <p className="text-xs text-brand-darkGray mb-4">{error}</p>
            <button
              onClick={() => fetchOrders(activePhone)}
              className="bg-brand-accent text-white text-xs px-6 py-3 uppercase font-semibold tracking-wider hover:bg-brand-primary transition-all rounded-full shadow-sm"
            >
              Retry
            </button>
          </div>
        ) : orders.length === 0 ? (
          <div className="bg-white rounded-3xl border border-brand-primary/5 shadow-sm p-8 sm:p-16 text-center max-w-lg mx-auto my-6">
            <div className="w-16 h-16 bg-neutral-50 rounded-full flex items-center justify-center mx-auto mb-6 border border-neutral-100">
              <ShoppingBag className="text-brand-primary/60 h-8 w-8 stroke-1" />
            </div>
            <h3 className="font-serif text-xl sm:text-2xl font-normal text-brand-text mb-2">
              No Orders Found
            </h3>
            <p className="text-xs sm:text-sm text-brand-darkGray mb-8 leading-relaxed max-w-sm mx-auto">
              You haven&apos;t placed any orders yet. Discover our luxury ethnic wear collection today!
            </p>
            <button
              onClick={() => router.push("/shop")}
              className="inline-flex items-center justify-center bg-brand-accent text-white text-xs px-8 py-3.5 tracking-widest uppercase font-semibold hover:bg-brand-primary transition-colors rounded-full space-x-2 shadow-md shadow-brand-accent/15"
            >
              <span>Explore Collection</span>
              <ArrowRight size={14} />
            </button>
          </div>
        ) : (
          <div className="space-y-4">
            {orders.map((order) => {
              const statusBadgeStyle = getStatusBadgeStyle(order.status);
              const firstItem = order.items[0];

              return (
                <motion.div
                  key={order.id}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="bg-white rounded-2xl border border-brand-primary/10 shadow-sm overflow-hidden hover:border-brand-accent/30 transition-all cursor-pointer group"
                  onClick={() => router.push(`/orders/${order.id}`)}
                >
                  {/* Top Bar: Order ID, Date & Status */}
                  <div className="p-4 sm:p-5 border-b border-neutral-100 flex flex-wrap items-center justify-between gap-2 bg-neutral-50/50">
                    <div className="flex items-center space-x-3">
                      <span className="font-mono font-bold text-xs text-brand-text bg-white px-2.5 py-1 rounded border border-neutral-200">
                        {order.id}
                      </span>
                      <span className="text-xs text-brand-darkGray flex items-center space-x-1">
                        <Calendar size={12} className="text-neutral-400" />
                        <span>Placed on {order.date}</span>
                      </span>
                    </div>

                    <span
                      className={`text-[10px] font-bold px-3 py-0.5 rounded-full uppercase tracking-wider border ${statusBadgeStyle} flex items-center space-x-1`}
                    >
                      <span className="w-1.5 h-1.5 rounded-full bg-current animate-pulse" />
                      <span>{order.status}</span>
                    </span>
                  </div>

                  {/* Body: Product Photo + Main Info */}
                  <div className="p-4 sm:p-5 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                    <div className="flex items-center space-x-4">
                      {/* Product Thumbnail (Normal Size) */}
                      <div className="w-16 h-20 bg-neutral-100 rounded-xl overflow-hidden flex-shrink-0 border border-neutral-200 relative shadow-2xs">
                        {firstItem?.product?.images && firstItem.product.images[0] ? (
                          <img
                            src={firstItem.product.images[0]}
                            alt={firstItem.product.name}
                            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                          />
                        ) : (
                          <Package size={24} className="m-auto text-neutral-300" />
                        )}
                      </div>

                      {/* Product Info */}
                      <div className="space-y-1">
                        <h3 className="font-serif font-bold text-sm text-brand-text group-hover:text-brand-accent transition-colors line-clamp-1">
                          {firstItem?.product?.name || "Garment Order"}
                        </h3>
                        <p className="text-xs text-brand-darkGray">
                          Size: <strong className="text-brand-text">{firstItem?.selectedSize}</strong>
                          {firstItem?.selectedColor ? ` | Color: ${firstItem.selectedColor}` : ""}
                          <span> | Qty: {firstItem?.quantity}</span>
                        </p>
                        {order.items.length > 1 && (
                          <span className="inline-block text-[10px] font-semibold text-brand-accent bg-brand-accent/10 px-2 py-0.5 rounded">
                            +{order.items.length - 1} more item{order.items.length - 1 > 1 ? "s" : ""}
                          </span>
                        )}
                      </div>
                    </div>

                    {/* Right: Total Price & Clean Button */}
                    <div className="flex sm:flex-col items-center sm:items-end justify-between w-full sm:w-auto pt-3 sm:pt-0 border-t sm:border-t-0 border-neutral-100 gap-2">
                      <div className="text-left sm:text-right">
                        <span className="text-[10px] text-brand-darkGray uppercase font-bold tracking-wider block">
                          Total Amount
                        </span>
                        <p className="text-base font-extrabold text-brand-accent">
                          ₹{order.totalAmount}
                        </p>
                      </div>

                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          router.push(`/orders/${order.id}`);
                        }}
                        className="bg-brand-accent hover:bg-brand-primary text-white text-xs font-bold tracking-wider uppercase px-4 py-2.5 rounded-xl transition-all flex items-center space-x-1.5 shadow-sm group-hover:shadow-md"
                      >
                        <span>View Order Details</span>
                        <ChevronRight size={14} />
                      </button>
                    </div>
                  </div>
                </motion.div>
              );
            })}
          </div>
        )}
      </main>

      <Footer />
    </div>
  );
}
