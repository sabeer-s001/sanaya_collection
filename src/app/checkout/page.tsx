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
  Loader2
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

export default function CheckoutPage() {
  const router = useRouter();
  const { 
    cart, 
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
  const gst = Math.round(taxableAmount * 0.18);
  const shipping = taxableAmount > 1999 || taxableAmount === 0 ? 0 : 150;
  const isCOD = paymentMethod === "Cash On Delivery (COD)";
  const codFee = isCOD ? 50 : 0;
  const finalTotal = taxableAmount + gst + shipping + codFee;




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
        });
        
        if (!paymentSuccess) {
          // User dismissed the modal; order remains Pending in DB
          setIsSubmitting(false);
          return;
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
                  <div className="bg-white rounded-2xl border border-brand-primary/5 shadow-sm p-6 sm:p-8">
                    <div className="flex items-center space-x-2 border-b border-brand-lightGray pb-4 mb-6">
                      <CreditCard className="text-brand-accent" size={20} />
                      <h2 className="font-serif text-lg font-bold text-brand-text">2. Payment Method</h2>
                    </div>

                    <div className="space-y-3">
                      {[
                        { 
                          name: "Credit / Debit Card", 
                          desc: "Pay securely with Visa, Mastercard, or RuPay",
                          icon: "💳",
                          badge: "Recommended"
                        },
                        { 
                          name: "UPI / GPay / PhonePe", 
                          desc: "Pay instantly using any UPI app — Google Pay, PhonePe, Paytm, etc.",
                          icon: "📱",
                          badge: "Instant"
                        },
                        { 
                          name: "Cash On Delivery (COD)", 
                          desc: "Pay with cash on delivery (adds ₹50 collection fee)",
                          icon: "🏠",
                          badge: null
                        }
                      ].map((method) => (
                        <div 
                          key={method.name} 
                          className={`border rounded-xl overflow-hidden transition-all cursor-pointer ${
                            paymentMethod === method.name 
                              ? "border-brand-accent ring-2 ring-brand-accent/20 bg-brand-accent/[0.02]" 
                              : "border-brand-lightGray hover:border-brand-accent/40"
                          }`}
                          onClick={() => setPaymentMethod(method.name)}
                        >
                          <label className="flex items-start p-4 cursor-pointer">
                            <input
                              type="radio"
                              name="paymentMethod"
                              value={method.name}
                              checked={paymentMethod === method.name}
                              onChange={() => setPaymentMethod(method.name)}
                              className="mt-1 mr-3 text-brand-accent focus:ring-brand-accent"
                            />
                            <div className="flex-grow">
                              <div className="flex items-center space-x-2">
                                <span className="text-base">{method.icon}</span>
                                <span className="font-serif font-bold text-xs sm:text-sm text-brand-text">{method.name}</span>
                                {method.badge && (
                                  <span className={`text-[9px] font-bold px-2 py-0.5 rounded-full uppercase tracking-wider ${
                                    method.badge === "Instant" 
                                      ? "bg-blue-50 text-blue-700" 
                                      : "bg-green-100 text-green-800"
                                  }`}>
                                    {method.badge}
                                  </span>
                                )}
                              </div>
                              <span className="block text-[11px] text-brand-darkGray mt-1 ml-6">{method.desc}</span>
                            </div>
                          </label>

                          {/* Info box for Credit / Debit Card */}
                          {paymentMethod === "Credit / Debit Card" && method.name === "Credit / Debit Card" && (
                            <div className="bg-brand-bg/50 p-4 border-t border-brand-lightGray">
                              <div className="flex items-start space-x-3">
                                <ShieldCheck size={18} className="text-green-600 flex-shrink-0 mt-0.5" />
                                <div className="text-[11px] text-brand-darkGray space-y-1">
                                  <p className="font-semibold text-brand-text">Secure Card Payment</p>
                                  <p>A secure payment window will open for you to enter your card details.</p>
                                  <div className="flex flex-wrap gap-2 mt-2">
                                    {["Visa", "Mastercard", "RuPay", "Net Banking"].map(m => (
                                      <span key={m} className="bg-white px-2 py-1 rounded border border-brand-lightGray text-[10px] font-medium">
                                        {m}
                                      </span>
                                    ))}
                                  </div>
                                  <p className="mt-2 text-[10px] text-brand-darkGray/70">
                                    Your card details are never stored on our servers. All transactions are PCI DSS compliant.
                                  </p>
                                </div>
                              </div>
                            </div>
                          )}

                          {/* Info box for UPI */}
                          {paymentMethod === "UPI / GPay / PhonePe" && method.name === "UPI / GPay / PhonePe" && (
                            <div className="bg-brand-bg/50 p-4 border-t border-brand-lightGray">
                              <div className="flex items-start space-x-3">
                                <ShieldCheck size={18} className="text-green-600 flex-shrink-0 mt-0.5" />
                                <div className="text-[11px] text-brand-darkGray space-y-1">
                                  <p className="font-semibold text-brand-text">Pay via UPI</p>
                                  <p>You&apos;ll be redirected to complete payment using your preferred UPI app.</p>
                                  <div className="flex flex-wrap gap-2 mt-2">
                                    {["Google Pay", "PhonePe", "Paytm", "BHIM UPI", "Other UPI"].map(m => (
                                      <span key={m} className="bg-white px-2 py-1 rounded border border-brand-lightGray text-[10px] font-medium">
                                        {m}
                                      </span>
                                    ))}
                                  </div>
                                  <p className="mt-2 text-[10px] text-brand-darkGray/70">
                                    Instant confirmation. No card details needed.
                                  </p>
                                </div>
                              </div>
                            </div>
                          )}
                        </div>
                      ))}
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
                    <span>GST (18%)</span>
                    <span>₹{gst}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Shipping</span>
                    {shipping === 0 ? (
                      <span className="text-green-600 font-bold uppercase text-[10px]">FREE</span>
                    ) : (
                      <span>₹{shipping}</span>
                    )}
                  </div>
                  {paymentMethod === "Cash On Delivery (COD)" && (
                    <div className="flex justify-between text-brand-accent">
                      <span>COD Collection Fee</span>
                      <span>₹50</span>
                    </div>
                  )}
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
                  We have received your order. An email and SMS receipt with shipping tracking information has been sent to you.
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
                  <div className="border-t border-brand-lightGray pt-3 flex justify-between font-bold text-brand-text text-sm">
                    <span>Amount Paid:</span>
                    <span className="text-brand-accent">₹{placedOrderDetails.totalAmount}</span>
                  </div>
                </div>
              )}

              <div className="pt-4 flex flex-col sm:flex-row gap-3 justify-center">
                <Link
                  href="/dashboard?tab=orders"
                  className="bg-brand-accent hover:bg-brand-primary text-white text-xs px-8 py-3.5 rounded-full font-semibold uppercase tracking-widest text-center transition-all flex items-center justify-center"
                >
                  Track Order History
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
