"use client";

import React, { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useApp } from "@/context/AppContext";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { 
  Trash2, 
  Minus, 
  Plus, 
  ShoppingBag, 
  ArrowRight, 
  Tag, 
  AlertCircle, 
  Check,
  ShieldCheck,
  RotateCcw
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

export default function CartPage() {
  const router = useRouter();
  const { 
    cart, 
    coupon, 
    discountRate, 
    updateCartQty, 
    removeFromCart, 
    applyCoupon, 
    removeCoupon,
    session
  } = useApp();

  const [couponInput, setCouponInput] = useState("");
  const [couponFeedback, setCouponFeedback] = useState<{ success: boolean; message: string } | null>(null);

  const cartCount = cart.reduce((acc, item) => acc + item.quantity, 0);
  const subtotal = cart.reduce((acc, item) => acc + (item.product.salePrice * item.quantity), 0);
  const discountAmount = Math.round(subtotal * discountRate);
  const taxableAmount = subtotal - discountAmount;
  const gst = Math.round(taxableAmount * 0.18); // 18% GST
  const shipping = taxableAmount > 1999 || taxableAmount === 0 ? 0 : 150;
  const finalTotal = taxableAmount + gst + shipping;

  const handleCouponApply = (e: React.FormEvent) => {
    e.preventDefault();
    if (!couponInput.trim()) return;
    const res = applyCoupon(couponInput);
    setCouponFeedback({ success: res.success, message: res.message });
    if (res.success) {
      setCouponInput("");
    }
  };

  const handleRemoveCoupon = () => {
    removeCoupon();
    setCouponFeedback(null);
  };

  return (
    <div className="flex flex-col min-h-screen">
      <Navbar />

      <main className="flex-grow py-12 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 w-full">
        <h1 className="font-serif text-3xl font-bold text-brand-text mb-8">Shopping Cart</h1>

        {cart.length === 0 ? (
          <div className="text-center py-24 bg-white rounded-2xl border border-brand-primary/5 shadow-sm p-8 max-w-2xl mx-auto">
            <ShoppingBag size={64} className="mx-auto text-brand-primary/40 mb-6 stroke-1" />
            <h2 className="font-serif text-xl font-bold text-brand-text mb-2">Your Cart is Empty</h2>
            <p className="text-xs text-brand-darkGray mb-8 leading-relaxed max-w-sm mx-auto">
              It looks like you haven&rsquo;t added any premium Pakistani or Indian wear to your cart yet. Explore our latest arrivals to begin.
            </p>
            <Link
              href="/"
              className="bg-brand-accent hover:bg-brand-primary text-white text-xs px-8 py-4 rounded-full font-semibold uppercase tracking-widest transition-colors inline-block"
            >
              Start Shopping
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start">
            
            {/* Left Column: Cart items table */}
            <div className="lg:col-span-2 space-y-6">
              <div className="bg-white rounded-2xl border border-brand-primary/5 shadow-sm overflow-hidden">
                <div className="p-6 border-b border-brand-lightGray bg-brand-bg/30 hidden sm:grid grid-cols-12 text-xs font-semibold text-brand-accent tracking-wider uppercase">
                  <div className="col-span-6">Product details</div>
                  <div className="col-span-2 text-center">Price</div>
                  <div className="col-span-2 text-center">Quantity</div>
                  <div className="col-span-2 text-right">Total</div>
                </div>

                <div className="divide-y divide-brand-lightGray">
                  {cart.map((item, idx) => (
                    <div 
                      key={`${item.product.id}-${item.selectedSize}-${item.selectedColor}-${idx}`}
                      className="p-6 grid grid-cols-1 sm:grid-cols-12 gap-4 sm:gap-0 items-center"
                    >
                      {/* Product details */}
                      <div className="col-span-12 sm:col-span-6 flex items-center space-x-4">
                        <div className="w-16 h-20 bg-brand-bg rounded-lg overflow-hidden flex-shrink-0">
                          <img
                            src={item.product.images[0]}
                            alt={item.product.name}
                            className="w-full h-full object-cover"
                          />
                        </div>
                        <div>
                          <h3 className="font-serif font-bold text-brand-text text-sm sm:text-base hover:text-brand-accent">
                            <Link href={`/product/${item.product.id}`}>{item.product.name}</Link>
                          </h3>
                          <p className="text-[11px] text-brand-darkGray mt-1 uppercase tracking-wide">
                            Size: <span className="font-semibold">{item.selectedSize}</span>{item.selectedColor ? <> | Color: <span className="font-semibold">{item.selectedColor}</span></> : ""}
                          </p>
                          <button
                            onClick={() => removeFromCart(item.product.id, item.selectedSize, item.selectedColor)}
                            className="text-xs text-red-500 hover:text-red-700 flex items-center mt-2 font-medium"
                          >
                            <Trash2 size={12} className="mr-1" /> Remove
                          </button>
                        </div>
                      </div>

                      {/* Price (mobile label included) */}
                      <div className="col-span-12 sm:col-span-2 text-left sm:text-center flex sm:block justify-between items-center text-xs">
                        <span className="sm:hidden font-semibold text-brand-darkGray uppercase">Price:</span>
                        <span className="font-semibold text-brand-text">₹{item.product.salePrice}</span>
                      </div>

                      {/* Quantity */}
                      <div className="col-span-12 sm:col-span-2 flex sm:justify-center justify-between items-center text-xs">
                        <span className="sm:hidden font-semibold text-brand-darkGray uppercase">Qty:</span>
                        <div className="inline-flex items-center border border-brand-lightGray rounded-md bg-white">
                          <button
                            onClick={() => updateCartQty(item.product.id, item.selectedSize, item.selectedColor, item.quantity - 1)}
                            className="px-2.5 py-1 text-brand-darkGray hover:text-brand-primary font-bold"
                          >
                            -
                          </button>
                          <span className="px-2 font-bold text-xs">{item.quantity}</span>
                          <button
                            onClick={() => updateCartQty(item.product.id, item.selectedSize, item.selectedColor, item.quantity + 1)}
                            className="px-2.5 py-1 text-brand-darkGray hover:text-brand-primary font-bold"
                          >
                            +
                          </button>
                        </div>
                      </div>

                      {/* Total */}
                      <div className="col-span-12 sm:col-span-2 text-left sm:text-right flex sm:block justify-between items-center text-xs font-bold">
                        <span className="sm:hidden font-semibold text-brand-darkGray uppercase">Total:</span>
                        <span className="text-brand-accent text-sm">₹{item.product.salePrice * item.quantity}</span>
                      </div>

                    </div>
                  ))}
                </div>
              </div>

              {/* Shopping policies indicators */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="p-4 bg-white border border-brand-primary/5 rounded-xl flex items-center space-x-3">
                  <ShieldCheck className="text-green-600 flex-shrink-0" size={20} />
                  <span className="text-xs text-brand-darkGray leading-relaxed">
                    100% secure payments using certified encryption gates.
                  </span>
                </div>
                <div className="p-4 bg-white border border-brand-primary/5 rounded-xl flex items-center space-x-3">
                  <RotateCcw className="text-brand-accent flex-shrink-0" size={20} />
                  <span className="text-xs text-brand-darkGray leading-relaxed">
                    Hassle-free reverse pick-up returns within 7 calendar days.
                  </span>
                </div>
              </div>
            </div>

            {/* Right Column: Order Summary & Promo */}
            <div className="space-y-6">
              
              {/* Promo code */}
              <div className="bg-white rounded-2xl border border-brand-primary/5 shadow-sm p-6">
                <h3 className="font-serif font-bold text-sm tracking-wider uppercase text-brand-text mb-4">
                  Apply Promo Code
                </h3>
                
                {coupon ? (
                  <div className="bg-green-50 border border-green-200 rounded-xl p-4 flex items-center justify-between text-xs">
                    <div className="flex items-center space-x-2 text-green-800">
                      <Tag size={16} className="fill-green-200" />
                      <div>
                        <p className="font-bold">{coupon} Applied</p>
                        <p className="text-[10px] text-green-600">You saved {discountRate * 100}% on this purchase.</p>
                      </div>
                    </div>
                    <button 
                      onClick={handleRemoveCoupon} 
                      className="text-xs text-red-500 hover:text-red-700 font-bold underline ml-2"
                    >
                      Remove
                    </button>
                  </div>
                ) : (
                  <form onSubmit={handleCouponApply} className="flex space-x-2">
                    <input
                      type="text"
                      placeholder="e.g. WELCOME10"
                      value={couponInput}
                      onChange={(e) => setCouponInput(e.target.value)}
                      className="flex-grow bg-brand-bg text-brand-text text-xs px-4 py-3 rounded-lg border border-brand-lightGray focus:border-brand-accent focus:outline-none uppercase"
                    />
                    <button
                      type="submit"
                      className="bg-brand-text hover:bg-brand-accent text-white text-xs px-6 py-3 rounded-lg font-semibold uppercase tracking-wider transition-colors"
                    >
                      Apply
                    </button>
                  </form>
                )}

                {/* Feedback Messages */}
                {couponFeedback && !coupon && (
                  <div className={`mt-3 p-3 rounded-lg flex items-start space-x-2 text-xs ${
                    couponFeedback.success ? "bg-green-50 text-green-800" : "bg-red-50 text-red-800"
                  }`}>
                    <AlertCircle size={14} className="flex-shrink-0 mt-0.5" />
                    <span>{couponFeedback.message}</span>
                  </div>
                )}
              </div>

              {/* Order summary calculations */}
              <div className="bg-white rounded-2xl border border-brand-primary/5 shadow-sm p-6 space-y-4">
                <h3 className="font-serif font-bold text-sm tracking-wider uppercase text-brand-text border-b border-brand-lightGray pb-3">
                  Order Summary
                </h3>

                <div className="space-y-3 text-xs text-brand-darkGray">
                  <div className="flex justify-between">
                    <span>Price Subtotal ({cartCount} items)</span>
                    <span className="font-semibold text-brand-text">₹{subtotal}</span>
                  </div>
                  
                  {discountAmount > 0 && (
                    <div className="flex justify-between text-green-600">
                      <span>Promo Discount ({discountRate * 100}%)</span>
                      <span className="font-semibold">-₹{discountAmount}</span>
                    </div>
                  )}

                  <div className="flex justify-between">
                    <span>GST (18% Goods & Services Tax)</span>
                    <span className="font-semibold text-brand-text">₹{gst}</span>
                  </div>

                  <div className="flex justify-between">
                    <span>Shipping Fee</span>
                    {shipping === 0 ? (
                      <span className="font-semibold text-green-600 uppercase text-[10px]">FREE</span>
                    ) : (
                      <span className="font-semibold text-brand-text">₹{shipping}</span>
                    )}
                  </div>

                  {shipping > 0 && (
                    <p className="text-[10px] text-brand-accent/80 italic leading-relaxed pt-1">
                      * Add ₹{Math.max(0, 2000 - taxableAmount)} more worth of products to qualify for free shipping!
                    </p>
                  )}
                </div>

                <hr className="border-brand-lightGray" />

                <div className="flex justify-between items-center text-sm font-bold pt-2">
                  <span className="text-brand-text">Final Net Amount</span>
                  <span className="text-brand-accent text-lg">₹{finalTotal}</span>
                </div>

                <div className="pt-4 space-y-2">
                  <button
                    onClick={() => {
                      router.push("/checkout");
                    }}
                    className="w-full bg-brand-accent hover:bg-brand-primary text-white text-xs py-3.5 rounded-full font-semibold uppercase tracking-widest text-center transition-all flex items-center justify-center shadow-lg shadow-brand-accent/15"
                  >
                    Proceed To Checkout <ArrowRight size={14} className="ml-1" />
                  </button>
                  <Link
                    href="/"
                    className="w-full border border-brand-lightGray text-brand-text hover:text-brand-accent text-xs py-3.5 rounded-full font-semibold uppercase tracking-widest text-center transition-all block bg-white"
                  >
                    Continue Shopping
                  </Link>
                </div>
              </div>

            </div>

          </div>
        )}
      </main>

      <Footer />
    </div>
  );
}
