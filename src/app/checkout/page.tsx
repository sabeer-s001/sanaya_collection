"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useApp, Address } from "@/context/AppContext";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { initiateRazorpayPayment } from "@/lib/razorpay";
import { 
  CreditCard, 
  MapPin, 
  ShoppingBag, 
  CheckCircle, 
  ArrowRight,
  ShieldCheck,
  AlertCircle,
  Sparkles,
  Loader2,
  Truck
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

export default function CheckoutPage() {
  const router = useRouter();
  const { 
    cart, 
    products,
    session, 
    discountRate, 
    placeOrder,
    clearCart
  } = useApp();



  // Redirect if cart is empty
  useEffect(() => {
    if (cart.length === 0 && !orderSuccess) {
      router.push("/cart");
    }
  }, [cart]);

  // Form states
  const [addressForm, setAddressForm] = useState<Address>({
    fullName: session?.fullName || "",
    addressLine: "",
    city: "",
    state: "",
    postalCode: "",
    phone: session?.addresses[0]?.phone || ""
  });
  const [paymentMethod, setPaymentMethod] = useState("Credit / Debit Card");

  // Shipping settings from store admin
  const [shippingFee, setShippingFee] = useState<number>(0);
  const [freeShippingThreshold, setFreeShippingThreshold] = useState<number>(0);

  useEffect(() => {
    fetch("/api/settings")
      .then((res) => res.json())
      .then((data) => {
        if (data.shippingFee !== undefined) setShippingFee(data.shippingFee);
        if (data.freeShippingThreshold !== undefined) setFreeShippingThreshold(data.freeShippingThreshold);
      })
      .catch(() => {});
  }, []);

  // Flow states
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [validationError, setValidationError] = useState<string | null>(null);
  const [orderSuccess, setOrderSuccess] = useState(false);
  const [placedOrderDetails, setPlacedOrderDetails] = useState<any>(null);

  // Auto-fill saved address
  const handleSelectSavedAddress = (addr: Address) => {
    setAddressForm({
      fullName: addr.fullName,
      addressLine: addr.addressLine,
      city: addr.city,
      state: addr.state,
      postalCode: addr.postalCode,
      phone: addr.phone
    });
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setAddressForm(prev => ({ ...prev, [name]: value }));
  };

  const triggerConfetti = async () => {
    try {
      const confetti = (await import("canvas-confetti")).default;
      confetti({
        particleCount: 150,
        spread: 80,
        origin: { y: 0.6 },
        colors: ["#E98BA3", "#C95B7B", "#FFFFFF", "#1F1F1F"]
      });
    } catch (err) {
      console.log("Confetti loading failed", err);
    }
  };

  // Order summary calculations
  const cartCount = cart.reduce((acc, item) => acc + item.quantity, 0);
  const subtotal = cart.reduce((acc, item) => acc + (item.product.salePrice * item.quantity), 0);
  const discountAmount = Math.round(subtotal * discountRate);
  const taxableAmount = subtotal - discountAmount;

  // Use live product data for shippingFee (cart snapshots may be stale)
  const productShippingFees = cart
    .map(item => {
      const liveProduct = products.find(p => p.id === item.product.id);
      return liveProduct?.shippingFee ?? item.product.shippingFee;
    })
    .filter((fee): fee is number => fee !== undefined && fee !== null);
  const effectiveShippingFee = productShippingFees.length > 0 ? Math.max(...productShippingFees) : shippingFee;

  const shipping = (freeShippingThreshold > 0 && taxableAmount >= freeShippingThreshold) || taxableAmount === 0 ? 0 : effectiveShippingFee;
  const isCOD = paymentMethod === "Cash On Delivery (COD)";
  const codFee = 0;
  const finalTotal = taxableAmount + shipping + codFee;




  // ─── Main Submit Handler ───
  const handleSubmitOrder = async (e: React.FormEvent) => {
    e.preventDefault();
    setValidationError(null);

    // Address validation
    const { fullName, addressLine, city, state, postalCode, phone } = addressForm;
    if (!fullName || !addressLine || !city || !state || !postalCode || !phone) {
      setValidationError("Please complete all shipping address fields.");
      return;
    }

    if (phone.length < 10) {
      setValidationError("Please enter a valid 10-digit phone number.");
      return;
    }

    setIsSubmitting(true);

    try {
      // isCOD is computed above from paymentMethod state

      let order = null;

      if (!isCOD) {
        // Step 1: Create the pending order in our database first
        order = await placeOrder(addressForm, paymentMethod, "Pending");
        if (!order) {
          throw new Error("Failed to initialize order on server. Please try again.");
        }

        // Step 2: Initiate online payment via Razorpay Checkout
        const paymentSuccess = await initiateRazorpayPayment({
          amount: finalTotal - codFee,
          cartCount,
          fullName: session?.fullName || addressForm.fullName,
          email: session?.email || "",
          phone: addressForm.phone,
          orderId: order.id,
          paymentMethod,
        });
        
        if (!paymentSuccess) {
          // User dismissed the modal; order remains Pending in DB
          setIsSubmitting(false);
          return;
        }

        // Step 3: Fetch updated order details from MongoDB (with AWB, courier name, etc.)
        const updatedRes = await fetch(`/api/orders/${order.id}`);
        if (updatedRes.ok) {
          const updatedOrder = await updatedRes.json();
          order = updatedOrder;
        }

        // Clear the cart on frontend after successful payment verification
        clearCart();
      } else {
        // Place Cash On Delivery order directly
        order = await placeOrder(addressForm, paymentMethod);
      }

      setIsSubmitting(false);

      if (order) {
        setPlacedOrderDetails(order);
        setOrderSuccess(true);
        triggerConfetti();
      } else {
        setValidationError("Failed to place order. Please try again.");
      }
    } catch (error: any) {
      setIsSubmitting(false);
      setValidationError(error.message || "Payment failed. Please try again.");
    }
  };

  return (
    <div className="flex flex-col min-h-screen">
      <Navbar />

      <main className="flex-grow py-12 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 w-full">
        
        <AnimatePresence mode="wait">
          {!orderSuccess ? (
            <motion.div
              key="checkout-form"
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -15 }}
              className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start"
            >
              
              {/* Left Column: Form & Payment */}
              <div className="lg:col-span-2 space-y-6">
                <form onSubmit={handleSubmitOrder} className="space-y-6">
                  
                  {/* Shipping Address Container */}
                  <div className="bg-white rounded-2xl border border-brand-primary/5 shadow-sm p-6 sm:p-8">
                    <div className="flex items-center space-x-2 border-b border-brand-lightGray pb-4 mb-6">
                      <MapPin className="text-brand-accent" size={20} />
                      <h2 className="font-serif text-lg font-bold text-brand-text">1. Shipping Address</h2>
                    </div>

                    {/* Saved address shortcuts */}
                    {session && session.addresses.length > 0 && (
                      <div className="mb-6 p-4 bg-brand-bg rounded-xl border border-brand-primary/5">
                        <span className="text-[10px] font-bold text-brand-accent tracking-wider uppercase block mb-3">
                          Select from Saved Addresses
                        </span>
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                          {session.addresses.map((addr, idx) => (
                            <button
                              key={idx}
                              type="button"
                              onClick={() => handleSelectSavedAddress(addr)}
                              className="text-left p-3 bg-white border border-brand-lightGray hover:border-brand-accent rounded-lg text-xs leading-relaxed transition-all"
                            >
                              <p className="font-bold">{addr.fullName}</p>
                              <p className="text-brand-darkGray text-[11px] truncate">{addr.addressLine}</p>
                              <p className="text-brand-darkGray text-[11px]">{addr.city}, {addr.state} - {addr.postalCode}</p>
                            </button>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* Input grids */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div>
                        <label htmlFor="checkout-fullName" className="text-xs font-semibold text-brand-text block mb-1">Full Name *</label>
                        <input
                          id="checkout-fullName"
                          type="text"
                          name="fullName"
                          required
                          value={addressForm.fullName}
                          onChange={handleInputChange}
                          className="w-full bg-brand-bg text-brand-text text-xs px-4 py-3 rounded-lg border border-brand-lightGray focus:border-brand-accent focus:outline-none"
                          placeholder="e.g. Aanya Verma"
                        />
                      </div>
                      <div>
                        <label htmlFor="checkout-phone" className="text-xs font-semibold text-brand-text block mb-1">Phone Number *</label>
                        <input
                          id="checkout-phone"
                          type="tel"
                          name="phone"
                          required
                          value={addressForm.phone}
                          onChange={handleInputChange}
                          className="w-full bg-brand-bg text-brand-text text-xs px-4 py-3 rounded-lg border border-brand-lightGray focus:border-brand-accent focus:outline-none"
                          placeholder="e.g. 9876543210"
                        />
                      </div>
                      <div className="sm:col-span-2">
                        <label htmlFor="checkout-addressLine" className="text-xs font-semibold text-brand-text block mb-1">Street Address *</label>
                        <input
                          id="checkout-addressLine"
                          type="text"
                          name="addressLine"
                          required
                          value={addressForm.addressLine}
                          onChange={handleInputChange}
                          className="w-full bg-brand-bg text-brand-text text-xs px-4 py-3 rounded-lg border border-brand-lightGray focus:border-brand-accent focus:outline-none"
                          placeholder="Flat/House No., Building Name, Street Name"
                        />
                      </div>
                      <div>
                        <label htmlFor="checkout-city" className="text-xs font-semibold text-brand-text block mb-1">City *</label>
                        <input
                          id="checkout-city"
                          type="text"
                          name="city"
                          required
                          value={addressForm.city}
                          onChange={handleInputChange}
                          className="w-full bg-brand-bg text-brand-text text-xs px-4 py-3 rounded-lg border border-brand-lightGray focus:border-brand-accent focus:outline-none"
                          placeholder="e.g. Mumbai"
                        />
                      </div>
                      <div>
                        <label htmlFor="checkout-state" className="text-xs font-semibold text-brand-text block mb-1">State *</label>
                        <input
                          id="checkout-state"
                          type="text"
                          name="state"
                          required
                          value={addressForm.state}
                          onChange={handleInputChange}
                          className="w-full bg-brand-bg text-brand-text text-xs px-4 py-3 rounded-lg border border-brand-lightGray focus:border-brand-accent focus:outline-none"
                          placeholder="e.g. Maharashtra"
                        />
                      </div>
                      <div>
                        <label htmlFor="checkout-postalCode" className="text-xs font-semibold text-brand-text block mb-1">Postal Code / Pin Code *</label>
                        <input
                          id="checkout-postalCode"
                          type="text"
                          name="postalCode"
                          required
                          value={addressForm.postalCode}
                          onChange={handleInputChange}
                          className="w-full bg-brand-bg text-brand-text text-xs px-4 py-3 rounded-lg border border-brand-lightGray focus:border-brand-accent focus:outline-none"
                          placeholder="e.g. 400001"
                        />
                      </div>
                    </div>
                  </div>

                  {/* Payment Method Container */}
                  <div className="bg-white rounded-2xl border border-brand-primary/10 shadow-md p-6 sm:p-8 space-y-6">
                    <div className="flex items-center justify-between border-b border-brand-lightGray pb-4">
                      <div className="flex items-center space-x-2.5">
                        <div className="w-8 h-8 bg-brand-accent/10 rounded-full flex items-center justify-center text-brand-accent">
                          <CreditCard size={18} />
                        </div>
                        <div>
                          <h2 className="font-serif text-lg font-bold text-brand-text">2. Select Payment Method</h2>
                          <p className="text-[11px] text-brand-darkGray">100% Encrypted & PCI-DSS Compliant Transactions</p>
                        </div>
                      </div>
                      <span className="hidden sm:flex items-center space-x-1 text-[10px] text-green-700 bg-green-50 px-2.5 py-1 rounded-full font-bold border border-green-200">
                        <ShieldCheck size={12} />
                        <span>256-Bit SSL Secured</span>
                      </span>
                    </div>

                    <div className="space-y-3">
                      {/* 1. UPI Payment Option */}
                      <div 
                        className={`border rounded-2xl transition-all cursor-pointer overflow-hidden ${
                          paymentMethod === "UPI / GPay / PhonePe" 
                            ? "border-emerald-600 ring-2 ring-emerald-500/20 bg-emerald-50/30 shadow-sm" 
                            : "border-neutral-200 hover:border-emerald-400 bg-white"
                        }`}
                        onClick={() => setPaymentMethod("UPI / GPay / PhonePe")}
                      >
                        <div className="p-4 sm:p-5 flex items-start justify-between">
                          <div className="flex items-start space-x-3.5">
                            <div className="mt-0.5">
                              <input
                                type="radio"
                                name="paymentMethod"
                                value="UPI / GPay / PhonePe"
                                checked={paymentMethod === "UPI / GPay / PhonePe"}
                                onChange={() => setPaymentMethod("UPI / GPay / PhonePe")}
                                className="w-4 h-4 text-emerald-600 focus:ring-emerald-500 cursor-pointer"
                              />
                            </div>
                            <div>
                              <div className="flex items-center space-x-2 flex-wrap gap-y-1">
                                <span className="font-serif font-bold text-sm text-brand-text">
                                  UPI / QR Code (GPay, PhonePe, Paytm)
                                </span>
                                <span className="text-[9px] font-extrabold px-2 py-0.5 rounded-md uppercase tracking-wider bg-emerald-600 text-white">
                                  Fastest
                                </span>
                              </div>
                              <p className="text-xs text-brand-darkGray mt-1">
                                Pay instantly using Google Pay, PhonePe, Paytm, BHIM or any UPI app
                              </p>

                              {/* Authentic Brand logo pills */}
                              <div className="flex flex-wrap items-center gap-2 mt-3">
                                {/* Google Pay */}
                                <span className="inline-flex items-center px-3 py-1.5 rounded-lg text-xs font-bold bg-white text-zinc-900 border border-neutral-200 shadow-2xs">
                                  <svg className="w-4 h-4 mr-1.5 flex-shrink-0" viewBox="0 0 24 24">
                                    <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
                                    <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
                                    <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z" />
                                    <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z" />
                                  </svg>
                                  Google Pay
                                </span>

                                {/* PhonePe */}
                                <span className="inline-flex items-center px-3 py-1.5 rounded-lg text-xs font-black tracking-wide bg-[#5f259f] text-white shadow-2xs">
                                  <span className="w-4 h-4 rounded-full bg-white text-[#5f259f] font-black flex items-center justify-center text-[10px] mr-1.5 leading-none">
                                    पे
                                  </span>
                                  PhonePe
                                </span>

                                {/* Paytm */}
                                <span className="inline-flex items-center px-3 py-1.5 rounded-lg text-xs font-black bg-[#002e6e] text-white shadow-2xs">
                                  Pay<span className="text-[#00baf2]">tm</span>
                                </span>

                                {/* BHIM / UPI */}
                                <span className="inline-flex items-center px-3 py-1.5 rounded-lg text-xs font-bold bg-white text-zinc-900 border border-neutral-200 shadow-2xs">
                                  <span className="text-orange-600 font-extrabold mr-0.5">BHIM</span>
                                  <span className="text-emerald-600 font-extrabold">UPI</span>
                                </span>
                              </div>
                            </div>
                          </div>
                          <span className="text-xs font-bold text-emerald-700 bg-emerald-100/60 px-2.5 py-1 rounded-full hidden sm:inline-block">
                            0% Extra Fee
                          </span>
                        </div>

                        {/* UPI Expanded Info */}
                        {paymentMethod === "UPI / GPay / PhonePe" && (
                          <div className="bg-white/80 p-4 border-t border-emerald-200/60 space-y-2">
                            <div className="flex items-center space-x-2 text-xs text-emerald-800 font-semibold">
                              <CheckCircle size={14} className="text-emerald-600" />
                              <span>Select your UPI app or scan QR code on next screen</span>
                            </div>
                            <p className="text-[11px] text-brand-darkGray pl-5">
                              No manual bank entry needed. Instant automatic payment verification.
                            </p>
                          </div>
                        )}
                      </div>

                      {/* 2. Credit / Debit Card Option (NO Recommended badge per user request!) */}
                      <div 
                        className={`border rounded-2xl transition-all cursor-pointer overflow-hidden ${
                          paymentMethod === "Credit / Debit Card" 
                            ? "border-emerald-600 ring-2 ring-emerald-500/20 bg-emerald-50/30 shadow-sm" 
                            : "border-neutral-200 hover:border-emerald-400 bg-white"
                        }`}
                        onClick={() => setPaymentMethod("Credit / Debit Card")}
                      >
                        <div className="p-4 sm:p-5 flex items-start justify-between">
                          <div className="flex items-start space-x-3.5">
                            <div className="mt-0.5">
                              <input
                                type="radio"
                                name="paymentMethod"
                                value="Credit / Debit Card"
                                checked={paymentMethod === "Credit / Debit Card"}
                                onChange={() => setPaymentMethod("Credit / Debit Card")}
                                className="w-4 h-4 text-emerald-600 focus:ring-emerald-500 cursor-pointer"
                              />
                            </div>
                            <div>
                              <div className="flex items-center space-x-2 flex-wrap gap-y-1">
                                <span className="font-serif font-bold text-sm text-brand-text">
                                  Credit / Debit / ATM Card
                                </span>
                              </div>
                              <p className="text-xs text-brand-darkGray mt-1">
                                All major Indian & International cards accepted (Visa, Mastercard, RuPay)
                              </p>

                              {/* Card Brand Pills */}
                              <div className="flex flex-wrap items-center gap-2 mt-3">
                                <span className="inline-flex items-center px-2.5 py-1 rounded-md text-[10px] font-black bg-blue-900 text-white tracking-wider shadow-2xs">
                                  VISA
                                </span>
                                <span className="inline-flex items-center px-2.5 py-1 rounded-md text-[10px] font-bold bg-neutral-900 text-white shadow-2xs">
                                  <span className="w-2.5 h-2.5 bg-red-500 rounded-full inline-block mr-0.5 opacity-90" />
                                  <span className="w-2.5 h-2.5 bg-amber-500 rounded-full inline-block -ml-1.5 mr-1 opacity-90" />
                                  Mastercard
                                </span>
                                <span className="inline-flex items-center px-2.5 py-1 rounded-md text-[10px] font-bold bg-gradient-to-r from-orange-600 to-blue-700 text-white shadow-2xs">
                                  RuPay
                                </span>
                                <span className="inline-flex items-center px-2.5 py-1 rounded-md text-[10px] font-bold bg-neutral-100 text-neutral-700 border border-neutral-200">
                                  Net Banking
                                </span>
                              </div>
                            </div>
                          </div>
                          <span className="text-xs font-bold text-emerald-700 bg-emerald-100/60 px-2.5 py-1 rounded-full hidden sm:inline-block">
                            100% Safe
                          </span>
                        </div>

                        {/* Card Expanded Info */}
                        {paymentMethod === "Credit / Debit Card" && (
                          <div className="bg-white/80 p-4 border-t border-emerald-200/60 space-y-2">
                            <div className="flex items-center space-x-2 text-xs text-brand-text font-semibold">
                              <ShieldCheck size={14} className="text-emerald-600" />
                              <span>Bank-grade 256-bit encryption for maximum card security</span>
                            </div>
                            <p className="text-[11px] text-brand-darkGray pl-5">
                              Card numbers are processed strictly through Razorpay&apos;s PCI-DSS Level 1 certified gateway.
                            </p>
                          </div>
                        )}
                      </div>

                      {/* 3. Cash On Delivery (COD) Option */}
                      <div 
                        className={`border rounded-2xl transition-all cursor-pointer overflow-hidden ${
                          paymentMethod === "Cash On Delivery (COD)" 
                            ? "border-emerald-600 ring-2 ring-emerald-500/20 bg-emerald-50/30 shadow-sm" 
                            : "border-neutral-200 hover:border-emerald-400 bg-white"
                        }`}
                        onClick={() => setPaymentMethod("Cash On Delivery (COD)")}
                      >
                        <div className="p-4 sm:p-5 flex items-start justify-between">
                          <div className="flex items-start space-x-3.5">
                            <div className="mt-0.5">
                              <input
                                type="radio"
                                name="paymentMethod"
                                value="Cash On Delivery (COD)"
                                checked={paymentMethod === "Cash On Delivery (COD)"}
                                onChange={() => setPaymentMethod("Cash On Delivery (COD)")}
                                className="w-4 h-4 text-emerald-600 focus:ring-emerald-500 cursor-pointer"
                              />
                            </div>
                            <div>
                              <div className="flex items-center space-x-2 flex-wrap gap-y-1">
                                <span className="font-serif font-bold text-sm text-brand-text">
                                  Cash On Delivery (COD)
                                </span>
                                <span className="text-[9px] font-bold px-2 py-0.5 rounded-md uppercase tracking-wider bg-amber-100 text-amber-800 border border-amber-300">
                                  Pay at Doorstep
                                </span>
                              </div>
                              <p className="text-xs text-brand-darkGray mt-1">
                                Pay with cash when your shipment arrives at your home address
                              </p>
                            </div>
                          </div>

                        </div>

                        {/* COD Expanded Info */}
                        {paymentMethod === "Cash On Delivery (COD)" && (
                          <div className="bg-amber-50/40 p-4 border-t border-amber-200/60 space-y-1">
                            <div className="flex items-center space-x-2 text-xs text-amber-900 font-semibold">
                              <Truck size={14} className="text-amber-700" />
                              <span>Shipped via iThink Logistics COD partner</span>
                            </div>
                            <p className="text-[11px] text-amber-800/90 pl-5">
                              Please keep exact cash amount (₹{finalTotal}) ready for the courier partner upon delivery.
                            </p>
                          </div>
                        )}
                      </div>
                    </div>

                    {/* Trust Banner at bottom of Payment Card */}
                    <div className="pt-2 flex items-center justify-between border-t border-neutral-100 text-[10px] text-brand-darkGray flex-wrap gap-2">
                      <span className="flex items-center space-x-1">
                        <ShieldCheck size={12} className="text-emerald-600" />
                        <span>Powered by Razorpay Secure</span>
                      </span>
                      <div className="flex space-x-2 font-semibold text-neutral-500">
                        <span>Instant Refund Guarantee</span>
                        <span>•</span>
                        <span>Zero Hidden Charges</span>
                      </div>
                    </div>
                  </div>

                  {/* Feedback error alert */}
                  {validationError && (
                    <div className="p-4 bg-red-50 text-red-800 rounded-xl flex items-start space-x-2 text-xs">
                      <AlertCircle size={16} className="flex-shrink-0 mt-0.5" />
                      <span>{validationError}</span>
                    </div>
                  )}

                  {/* Place Order CTA */}
                  <button
                    type="submit"
                    disabled={isSubmitting}
                    className="w-full bg-brand-accent hover:bg-brand-primary disabled:bg-brand-primary/50 text-white text-xs py-4 rounded-full font-semibold uppercase tracking-widest transition-all flex items-center justify-center shadow-lg shadow-brand-accent/20"
                  >
                    {isSubmitting ? (
                      <span className="flex items-center space-x-2">
                        <Loader2 size={16} className="animate-spin" />
                        <span>Processing secure transaction...</span>
                      </span>
                    ) : (
                      <>
                        <span>
                          {isCOD 
                            ? `Place Order — ₹${finalTotal}` 
                            : `Pay ₹${finalTotal} Securely`
                          }
                        </span>
                        <ArrowRight size={14} className="ml-1" />
                      </>
                    )}
                  </button>

                </form>
              </div>

              {/* Right Column: Order Summary details */}
              <div className="bg-white rounded-2xl border border-brand-primary/5 shadow-sm p-6 space-y-4">
                <div className="flex items-center space-x-2 border-b border-brand-lightGray pb-3">
                  <ShoppingBag className="text-brand-accent" size={18} />
                  <h3 className="font-serif font-bold text-sm tracking-wider uppercase text-brand-text">Order Summary</h3>
                </div>

                {/* Items preview */}
                <div className="max-h-60 overflow-y-auto space-y-4 pr-1">
                  {cart.map((item, idx) => (
                    <div key={idx} className="flex items-center space-x-3 text-xs border-b border-brand-lightGray pb-3 last:border-b-0">
                      <div className="w-12 h-16 bg-brand-bg rounded overflow-hidden flex-shrink-0">
                        <img src={item.product.images[0]} alt={item.product.name} className="w-full h-full object-cover" />
                      </div>
                      <div className="flex-grow">
                        <p className="font-serif font-bold text-brand-text line-clamp-1">{item.product.name}</p>
                        <p className="text-[10px] text-brand-darkGray mt-0.5">Size: {item.selectedSize} | Qty: {item.quantity}</p>
                      </div>
                      <span className="font-bold text-brand-accent">₹{item.product.salePrice * item.quantity}</span>
                    </div>
                  ))}
                </div>

                <hr className="border-brand-lightGray" />

                {/* Totals */}
                <div className="space-y-2 text-xs text-brand-darkGray">
                  <div className="flex justify-between">
                    <span>Subtotal</span>
                    <span>₹{subtotal}</span>
                  </div>
                  {discountAmount > 0 && (
                    <div className="flex justify-between text-green-600 font-medium">
                      <span>Discount</span>
                      <span>-₹{discountAmount}</span>
                    </div>
                  )}

                  <div className="flex justify-between">
                    <span>Shipping</span>
                    {shipping === 0 ? (
                      <span className="text-green-600 font-bold uppercase text-[10px]">FREE</span>
                    ) : (
                      <span>₹{shipping}</span>
                    )}
                  </div>

                </div>

                <hr className="border-brand-lightGray" />

                <div className="flex justify-between items-center text-sm font-bold pt-1">
                  <span>Grand Total</span>
                  <span className="text-brand-accent text-lg">
                    ₹{finalTotal}
                  </span>
                </div>

                <div className="pt-2 flex items-center justify-center space-x-2 text-[10px] text-brand-darkGray text-center leading-relaxed">
                  <ShieldCheck size={14} className="text-green-600" />
                  <span>Your details are encrypted and entirely safe.</span>
                </div>
              </div>

            </motion.div>
          ) : (
            // Order success confirmation panel
            <motion.div
              key="checkout-success"
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              className="max-w-2xl mx-auto bg-white rounded-3xl border border-brand-primary/5 shadow-2xl p-8 sm:p-12 text-center space-y-6"
            >
              <div className="w-16 h-16 bg-green-50 rounded-full flex items-center justify-center mx-auto text-green-600 border border-green-200">
                <CheckCircle size={36} className="animate-bounce" />
              </div>
              
              <div className="space-y-2">
                <span className="text-xs uppercase tracking-[0.25em] font-semibold text-brand-accent flex items-center justify-center">
                  <Sparkles size={14} className="mr-1" /> Order Confirmed
                </span>
                <h2 className="font-serif text-2xl sm:text-3xl font-bold text-brand-text">Thank You For Your Purchase!</h2>
                <p className="text-xs text-brand-darkGray max-w-sm mx-auto leading-relaxed">
                  We have received your order. You can track your shipment status and details anytime from your order tracking page.
                </p>
              </div>

              {/* Placed Order details receipt */}
              {placedOrderDetails && (
                <div className="bg-brand-bg rounded-2xl p-6 text-left text-xs text-brand-darkGray space-y-4 max-w-md mx-auto border border-brand-primary/5">
                  <div className="flex justify-between border-b border-brand-lightGray pb-2 font-bold text-brand-text">
                    <span>Order Receipt:</span>
                    <span className="text-brand-accent">{placedOrderDetails.id}</span>
                  </div>
                  <div className="grid grid-cols-2 gap-2 leading-relaxed">
                    <div>
                      <p className="font-bold text-brand-text">Deliver To:</p>
                      <p>{placedOrderDetails.shippingAddress.fullName}</p>
                      <p className="truncate">{placedOrderDetails.shippingAddress.addressLine}</p>
                      <p>{placedOrderDetails.shippingAddress.city}, {placedOrderDetails.shippingAddress.state}</p>
                    </div>
                    <div className="text-right">
                      <p className="font-bold text-brand-text">Order Details:</p>
                      <p>Date: {placedOrderDetails.date}</p>
                      <p>Payment: {placedOrderDetails.paymentMethod}</p>
                      <p>Status: <span className="text-green-600 font-semibold">{placedOrderDetails.status}</span></p>
                    </div>
                  </div>

                  {/* iThink Logistics AWB Section */}
                  {placedOrderDetails.awbNumber && (
                    <div className="border-t border-brand-lightGray pt-3 space-y-1">
                      <p className="font-bold text-brand-text flex items-center gap-1">
                        <Truck size={14} className="text-brand-accent" /> Shipping Information:
                      </p>
                      <p className="text-[11px]">Courier: <span className="font-semibold text-brand-text">{placedOrderDetails.courierName || "Allocated"}</span></p>
                      <p className="text-[11px]">AWB Tracking Number: <span className="font-mono font-semibold text-brand-accent bg-white px-2 py-0.5 rounded border border-brand-lightGray">{placedOrderDetails.awbNumber}</span></p>
                    </div>
                  )}

                  <div className="border-t border-brand-lightGray pt-3 flex justify-between font-bold text-brand-text text-sm">
                    <span>Amount Paid:</span>
                    <span className="text-brand-accent">₹{placedOrderDetails.totalAmount}</span>
                  </div>
                </div>
              )}

              <div className="pt-4 flex flex-col sm:flex-row gap-3 justify-center">
                <Link
                  href={placedOrderDetails ? `/orders/${placedOrderDetails.id}` : "/orders"}
                  className="bg-brand-accent hover:bg-brand-primary text-white text-xs px-8 py-3.5 rounded-full font-semibold uppercase tracking-widest text-center transition-all flex items-center justify-center"
                >
                  Track My Order
                </Link>
                <Link
                  href="/"
                  className="border border-brand-lightGray text-brand-text hover:text-brand-accent text-xs px-8 py-3.5 rounded-full font-semibold uppercase tracking-widest text-center transition-all bg-white"
                >
                  Continue Shopping
                </Link>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

      </main>

      <Footer />
    </div>
  );
}
