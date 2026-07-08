"use client";

import React, { useState, useEffect, Suspense } from "react";
import Link from "next/link";
import { useSearchParams, useRouter } from "next/navigation";
import { useApp, Address } from "@/context/AppContext";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { 
  User, 
  ShoppingBag, 
  Heart, 
  MapPin, 
  LogOut, 
  Settings, 
  History, 
  Lock, 
  ChevronRight, 
  Trash2, 
  Plus, 
  CheckCircle,
  Truck,
  Package,
  Calendar,
  AlertCircle
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

function DashboardContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  
  const { 
    session, 
    orders, 
    products, 
    wishlist, 
    toggleWishlist, 
    login, 
    signUp, 
    logout, 
    updateProfile, 
    addAddress, 
    removeAddress,
    forgotPassword
  } = useApp();

  // Navigation tab
  const [activeTab, setActiveTab] = useState("orders");
  
  // Auth screen states
  const [authMode, setAuthMode] = useState<"login" | "signup" | "forgot">("signup");
  const [authRole, setAuthRole] = useState<"customer" | "admin">("customer");
  const [authEmail, setAuthEmail] = useState("");
  const [authPassword, setAuthPassword] = useState("");
  const [authName, setAuthName] = useState("");
  
  // Feedback alerts
  const [feedback, setFeedback] = useState<{ success: boolean; message: string } | null>(null);

  // Profile forms
  const [profileName, setProfileName] = useState("");
  const [profileEmail, setProfileEmail] = useState("");

  // Address forms
  const [showAddressForm, setShowAddressForm] = useState(false);
  const [newAddress, setNewAddress] = useState<Address>({
    fullName: "",
    addressLine: "",
    city: "",
    state: "",
    postalCode: "",
    phone: ""
  });

  // Order Detail expansion
  const [selectedOrderId, setSelectedOrderId] = useState<string | null>(null);

  // Sync profile edits
  useEffect(() => {
    if (session) {
      setProfileName(session.fullName);
      setProfileEmail(session.email);
    }
  }, [session]);

  // Read URL query tab parameter
  useEffect(() => {
    const tabParam = searchParams.get("tab");
    if (tabParam) {
      setActiveTab(tabParam);
    }
  }, [searchParams]);

  // Auth form submissions
  const handleLoginSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setFeedback(null);
    const res = await login(authEmail, authPassword);
    setFeedback({ success: res.success, message: res.message });

    if (res.success) {
      setAuthPassword("");
      const redirectUrl = searchParams.get("redirect");
      if (redirectUrl) {
        router.push(redirectUrl);
      }
    } else if (res.code === "USER_NOT_FOUND") {
      // No account with this email — redirect to signup after a short delay
      setTimeout(() => {
        setAuthMode("signup");
        setFeedback({
          success: false,
          message: "No account found. Please fill in the form below to create one."
        });
      }, 2000);
    }
  };

  const handleSignupSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setFeedback(null);
    const res = await signUp(authName, authEmail, authPassword);
    setFeedback({ success: res.success, message: res.message });
    if (res.success) {
      setAuthPassword("");
      setAuthName("");
      const redirectUrl = searchParams.get("redirect");
      if (redirectUrl) {
        router.push(redirectUrl);
      }
    }
  };

  const handleForgotSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setFeedback(null);
    const res = await forgotPassword(authEmail);
    setFeedback({ success: res.success, message: res.message });
  };

  const handleProfileUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    setFeedback(null);
    const res = await updateProfile(profileName, profileEmail);
    setFeedback({ success: res.success, message: res.message });
    setTimeout(() => setFeedback(null), 3000);
  };

  const handleAddressSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const { fullName, addressLine, city, state, postalCode, phone } = newAddress;
    if (!fullName || !addressLine || !city || !state || !postalCode || !phone) return;
    
    await addAddress(newAddress);
    setNewAddress({
      fullName: "",
      addressLine: "",
      city: "",
      state: "",
      postalCode: "",
      phone: ""
    });
    setShowAddressForm(false);
  };

  const handleQuickLogin = (role: "admin" | "customer") => {
    if (role === "admin") {
      setAuthEmail("admin@sanaya.com");
      setAuthPassword("adminpassword");
    } else {
      setAuthEmail("aanya@gmail.com");
      setAuthPassword("userpassword");
    }
  };

  // Status Stepper UI helpers
  const getStatusStep = (status: string) => {
    switch (status) {
      case "Pending": return 1;
      case "Processing": return 2;
      case "Shipped": return 3;
      case "Delivered": return 4;
      default: return 1;
    }
  };

  // Filter orders related to active session (Admin sees all, customer sees theirs)
  // Orders are already filtered by the backend API based on session cookies,
  // but this provides a client-side safety net for any edge cases.
  const sessionOrders = session?.role === "admin" 
    ? orders 
    : orders.filter(o => o.userId === session?.id);

  return (
    <div className="flex flex-col min-h-screen">
      <Navbar />

      <main className="flex-grow py-12 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 w-full">
        <AnimatePresence mode="wait">
          {!session ? (
            
            /* Auth Login / Register Forms */
            <motion.div
              key="auth-forms"
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -15 }}
              className="max-w-md mx-auto bg-white rounded-3xl border border-brand-primary/5 shadow-2xl overflow-hidden p-6 sm:p-8"
            >
              {searchParams.get("info") === "login_required" && (
                <div className="mb-6 p-4 bg-rose-50 border border-rose-100 text-rose-800 rounded-2xl text-xs flex items-start gap-2.5 shadow-sm">
                  <AlertCircle size={18} className="text-rose-600 shrink-0 mt-0.5" />
                  <div>
                    <p className="font-semibold text-rose-950">Login Required</p>
                    <p className="text-[10px] text-rose-700 mt-1 leading-relaxed">
                      Please sign in or create an account to proceed to checkout and complete your order.
                    </p>
                  </div>
                </div>
              )}
              {authMode === "login" && (
                <form onSubmit={handleLoginSubmit} className="space-y-4">
                  <div className="text-center pb-2">
                    <span className="text-xs uppercase tracking-[0.25em] font-semibold text-brand-accent">Welcome</span>
                    <h2 className="font-serif text-2xl font-bold text-brand-text mt-1">Sign In To Account</h2>
                  </div>

                  {/* Demo login helper */}
                  <div className="p-3 bg-brand-bg rounded-xl text-[11px] text-brand-darkGray border border-brand-primary/10">
                    <p className="font-semibold text-brand-accent uppercase tracking-wider mb-2">Demo Credentials Quick-Click:</p>
                    <div className="grid grid-cols-2 gap-2">
                      <button 
                        type="button" 
                        onClick={() => handleQuickLogin("customer")}
                        className="bg-white hover:bg-brand-primary hover:text-white px-2 py-1.5 rounded border border-brand-lightGray text-left"
                      >
                        👩 Customer Login
                      </button>
                      <button 
                        type="button" 
                        onClick={() => handleQuickLogin("admin")}
                        className="bg-white hover:bg-brand-primary hover:text-white px-2 py-1.5 rounded border border-brand-lightGray text-left"
                      >
                        ⚙️ Staff Admin Login
                      </button>
                    </div>
                  </div>

                  <div>
                    <label htmlFor="auth-login-email" className="text-xs font-semibold text-brand-text block mb-1">Email Address</label>
                    <input
                      id="auth-login-email"
                      type="email"
                      required
                      value={authEmail}
                      onChange={(e) => setAuthEmail(e.target.value)}
                      className="w-full bg-brand-bg text-brand-text text-xs px-4 py-3 rounded-lg border border-brand-lightGray focus:border-brand-accent focus:outline-none"
                      placeholder="e.g. customer@example.com"
                    />
                  </div>

                  <div>
                    <div className="flex justify-between items-center mb-1">
                      <label htmlFor="auth-login-password" className="text-xs font-semibold text-brand-text">Password</label>
                      <button
                        type="button"
                        onClick={() => { setAuthMode("forgot"); setFeedback(null); }}
                        className="text-[11px] text-brand-accent hover:underline"
                      >
                        Forgot Password?
                      </button>
                    </div>
                    <input
                      id="auth-login-password"
                      type="password"
                      required
                      value={authPassword}
                      onChange={(e) => setAuthPassword(e.target.value)}
                      className="w-full bg-brand-bg text-brand-text text-xs px-4 py-3 rounded-lg border border-brand-lightGray focus:border-brand-accent focus:outline-none"
                      placeholder="Enter password"
                    />
                  </div>

                  {feedback && (
                    <div className={`p-3 rounded-lg flex items-start space-x-2 text-xs ${
                      feedback.success ? "bg-green-50 text-green-800" : "bg-red-50 text-red-800"
                    }`}>
                      <AlertCircle size={14} className="flex-shrink-0 mt-0.5" />
                      <span>{feedback.message}</span>
                    </div>
                  )}

                  <button
                    type="submit"
                    className="w-full bg-brand-accent hover:bg-brand-primary text-white text-xs py-3.5 rounded-full font-semibold uppercase tracking-widest transition-all"
                  >
                    Log In
                  </button>

                  <p className="text-center text-xs text-brand-darkGray pt-2">
                    Don&rsquo;t have an account?{" "}
                    <button
                      type="button"
                      onClick={() => { setAuthMode("signup"); setFeedback(null); }}
                      className="text-brand-accent font-semibold hover:underline"
                    >
                      Sign Up Now
                    </button>
                  </p>
                </form>
              )}

              {authMode === "signup" && (
                <form onSubmit={handleSignupSubmit} className="space-y-4">
                  <div className="text-center pb-2">
                    <span className="text-xs uppercase tracking-[0.25em] font-semibold text-brand-accent">Register</span>
                    <h2 className="font-serif text-2xl font-bold text-brand-text mt-1">Create Account</h2>
                  </div>

                  <div>
                    <label htmlFor="auth-signup-name" className="text-xs font-semibold text-brand-text block mb-1">Full Name</label>
                    <input
                      id="auth-signup-name"
                      type="text"
                      required
                      value={authName}
                      onChange={(e) => setAuthName(e.target.value)}
                      className="w-full bg-brand-bg text-brand-text text-xs px-4 py-3 rounded-lg border border-brand-lightGray focus:border-brand-accent focus:outline-none"
                      placeholder="e.g. Aanya Verma"
                    />
                  </div>

                  <div>
                    <label htmlFor="auth-signup-email" className="text-xs font-semibold text-brand-text block mb-1">Email Address</label>
                    <input
                      id="auth-signup-email"
                      type="email"
                      required
                      value={authEmail}
                      onChange={(e) => setAuthEmail(e.target.value)}
                      className="w-full bg-brand-bg text-brand-text text-xs px-4 py-3 rounded-lg border border-brand-lightGray focus:border-brand-accent focus:outline-none"
                      placeholder="e.g. customer@example.com"
                    />
                  </div>

                  <div>
                    <label htmlFor="auth-signup-password" className="text-xs font-semibold text-brand-text block mb-1">Create Password</label>
                    <input
                      id="auth-signup-password"
                      type="password"
                      required
                      value={authPassword}
                      onChange={(e) => setAuthPassword(e.target.value)}
                      className="w-full bg-brand-bg text-brand-text text-xs px-4 py-3 rounded-lg border border-brand-lightGray focus:border-brand-accent focus:outline-none"
                      placeholder="Min. 8 characters"
                    />
                  </div>

                  {feedback && (
                    <div className={`p-3 rounded-lg flex items-start space-x-2 text-xs ${
                      feedback.success ? "bg-green-50 text-green-800" : "bg-red-50 text-red-800"
                    }`}>
                      <AlertCircle size={14} className="flex-shrink-0 mt-0.5" />
                      <span>{feedback.message}</span>
                    </div>
                  )}

                  <button
                    type="submit"
                    className="w-full bg-brand-accent hover:bg-brand-primary text-white text-xs py-3.5 rounded-full font-semibold uppercase tracking-widest transition-all"
                  >
                    Register
                  </button>

                  <p className="text-center text-xs text-brand-darkGray pt-2">
                    Already have an account?{" "}
                    <button
                      type="button"
                      onClick={() => { setAuthMode("login"); setFeedback(null); }}
                      className="text-brand-accent font-semibold hover:underline"
                    >
                      Log In
                    </button>
                  </p>
                </form>
              )}

              {authMode === "forgot" && (
                <form onSubmit={handleForgotSubmit} className="space-y-4">
                  <div className="text-center pb-2">
                    <span className="text-xs uppercase tracking-[0.25em] font-semibold text-brand-accent">Reset password</span>
                    <h2 className="font-serif text-2xl font-bold text-brand-text mt-1">Forgot Password</h2>
                  </div>

                  <div>
                    <label htmlFor="auth-forgot-email" className="text-xs font-semibold text-brand-text block mb-1">Email Address</label>
                    <input
                      id="auth-forgot-email"
                      type="email"
                      required
                      value={authEmail}
                      onChange={(e) => setAuthEmail(e.target.value)}
                      className="w-full bg-brand-bg text-brand-text text-xs px-4 py-3 rounded-lg border border-brand-lightGray focus:border-brand-accent focus:outline-none"
                      placeholder="e.g. customer@example.com"
                    />
                  </div>

                  {feedback && (
                    <div className={`p-3 rounded-lg flex items-start space-x-2 text-xs ${
                      feedback.success ? "bg-green-50 text-green-800" : "bg-red-50 text-red-800"
                    }`}>
                      <AlertCircle size={14} className="flex-shrink-0 mt-0.5" />
                      <span>{feedback.message}</span>
                    </div>
                  )}

                  <button
                    type="submit"
                    className="w-full bg-brand-accent hover:bg-brand-primary text-white text-xs py-3.5 rounded-full font-semibold uppercase tracking-widest transition-all"
                  >
                    Request Reset Link
                  </button>

                  <button
                    type="button"
                    onClick={() => { setAuthMode("login"); setFeedback(null); }}
                    className="w-full border border-brand-lightGray text-brand-text text-xs py-3.5 rounded-full font-semibold uppercase tracking-widest text-center"
                  >
                    Back to Login
                  </button>
                </form>
              )}
            </motion.div>
          ) : (
            
            /* Logged-In User Dashboard Container */
            <motion.div
              key="dashboard-container"
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              className="grid grid-cols-1 lg:grid-cols-4 gap-8"
            >
              
              {/* Sidebar Tabs menu */}
              <div className="lg:col-span-1 space-y-4">
                <div className="bg-white rounded-2xl border border-brand-primary/5 shadow-sm p-6 flex items-center space-x-4">
                  <div className="w-12 h-12 bg-brand-primary/10 text-brand-accent font-serif text-lg font-bold rounded-full flex items-center justify-center">
                    {session.fullName.charAt(0)}
                  </div>
                  <div>
                    <h3 className="font-serif font-bold text-brand-text">{session.fullName}</h3>
                    <p className="text-[10px] text-brand-accent font-bold uppercase tracking-wider">{session.role} account</p>
                  </div>
                </div>

                <div className="bg-white rounded-2xl border border-brand-primary/5 shadow-sm overflow-hidden flex flex-col divide-y divide-brand-lightGray text-xs font-semibold">
                  <button
                    onClick={() => { setActiveTab("orders"); setSelectedOrderId(null); }}
                    className={`p-4 flex items-center justify-between text-left transition-colors ${
                      activeTab === "orders" ? "bg-brand-accent text-white" : "hover:bg-brand-bg text-brand-text"
                    }`}
                  >
                    <span className="flex items-center"><History size={16} className="mr-3" /> Order History</span>
                    <ChevronRight size={14} />
                  </button>
                  <button
                    onClick={() => setActiveTab("wishlist")}
                    className={`p-4 flex items-center justify-between text-left transition-colors ${
                      activeTab === "wishlist" ? "bg-brand-accent text-white" : "hover:bg-brand-bg text-brand-text"
                    }`}
                  >
                    <span className="flex items-center"><Heart size={16} className="mr-3" /> Saved Wishlist</span>
                    <ChevronRight size={14} />
                  </button>
                  <button
                    onClick={() => setActiveTab("addresses")}
                    className={`p-4 flex items-center justify-between text-left transition-colors ${
                      activeTab === "addresses" ? "bg-brand-accent text-white" : "hover:bg-brand-bg text-brand-text"
                    }`}
                  >
                    <span className="flex items-center"><MapPin size={16} className="mr-3" /> Saved Addresses</span>
                    <ChevronRight size={14} />
                  </button>
                  <button
                    onClick={() => setActiveTab("profile")}
                    className={`p-4 flex items-center justify-between text-left transition-colors ${
                      activeTab === "profile" ? "bg-brand-accent text-white" : "hover:bg-brand-bg text-brand-text"
                    }`}
                  >
                    <span className="flex items-center"><Settings size={16} className="mr-3" /> Profile Settings</span>
                    <ChevronRight size={14} />
                  </button>
                  {session.role === "admin" && (
                    <Link
                      href="/admin"
                      className="p-4 flex items-center justify-between text-left hover:bg-brand-bg text-brand-accent font-bold"
                    >
                      <span className="flex items-center"><Lock size={16} className="mr-3 text-brand-accent" /> Staff Admin Panel</span>
                      <ChevronRight size={14} className="text-brand-accent" />
                    </Link>
                  )}
                  <button
                    onClick={logout}
                    className="p-4 flex items-center text-left text-red-600 hover:bg-red-50"
                  >
                    <LogOut size={16} className="mr-3" /> Log Out
                  </button>
                </div>
              </div>

              {/* Main Panel Content */}
              <div className="lg:col-span-3 bg-white rounded-3xl border border-brand-primary/5 shadow-sm p-6 sm:p-8">
                
                {/* 1. ORDER HISTORY */}
                {activeTab === "orders" && (
                  <div className="space-y-6">
                    <h2 className="font-serif text-xl font-bold text-brand-text border-b border-brand-lightGray pb-4">
                      My Purchase History
                    </h2>

                    {sessionOrders.length === 0 ? (
                      <div className="text-center py-12">
                        <ShoppingBag size={40} className="mx-auto text-brand-primary/30 mb-3 stroke-1" />
                        <p className="text-xs text-brand-darkGray">No orders placed yet.</p>
                      </div>
                    ) : (
                      <div className="space-y-4">
                        {sessionOrders.map((order) => {
                          const isExpanded = selectedOrderId === order.id;
                          const currentStep = getStatusStep(order.status);
                          
                          return (
                            <div key={order.id} className="border border-brand-lightGray rounded-2xl overflow-hidden transition-all bg-white shadow-sm">
                              {/* Summary Header */}
                              <div 
                                onClick={() => setSelectedOrderId(isExpanded ? null : order.id)}
                                className="p-4 sm:p-5 flex flex-col sm:flex-row justify-between items-start sm:items-center cursor-pointer hover:bg-brand-bg/40 gap-3"
                              >
                                <div>
                                  <div className="flex items-center space-x-2">
                                    <span className="font-serif font-bold text-brand-text text-sm sm:text-base">{order.id}</span>
                                    <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full uppercase tracking-wider ${
                                      order.status === "Delivered" 
                                        ? "bg-green-100 text-green-800" 
                                        : order.status === "Shipped" 
                                          ? "bg-blue-100 text-blue-800" 
                                          : "bg-yellow-100 text-yellow-800"
                                    }`}>
                                      {order.status}
                                    </span>
                                  </div>
                                  <p className="text-[10px] text-brand-darkGray mt-1">Order Date: {order.date} • Method: {order.paymentMethod}</p>
                                </div>
                                <div className="text-left sm:text-right">
                                  <p className="text-sm font-bold text-brand-accent">₹{order.totalAmount}</p>
                                  <p className="text-[10px] text-brand-primary font-semibold underline mt-0.5">
                                    {isExpanded ? "Close Details" : "View Tracker & Items"}
                                  </p>
                                </div>
                              </div>

                              {/* Expanded details & visual progress tracker */}
                              {isExpanded && (
                                <motion.div 
                                  initial={{ height: 0 }}
                                  animate={{ height: "auto" }}
                                  className="border-t border-brand-lightGray p-4 sm:p-6 bg-brand-bg/25 space-y-6 overflow-hidden"
                                >
                                  {/* Progress tracker stepper bar */}
                                  <div>
                                    <h4 className="text-[10px] font-bold text-brand-accent tracking-wider uppercase mb-6">Visual Delivery Progress</h4>
                                    
                                    <div className="relative flex justify-between items-center max-w-xl mx-auto px-4">
                                      {/* Background connector line */}
                                      <div className="absolute top-4 left-4 right-4 h-0.5 bg-brand-lightGray -z-10" />
                                      {/* Active filled connector line */}
                                      <div 
                                        className="absolute top-4 left-4 h-0.5 bg-brand-accent -z-10 transition-all duration-500" 
                                        style={{ width: `${((currentStep - 1) / 3) * 100}%` }}
                                      />

                                      {/* Steps */}
                                      {[
                                        { label: "Placed", icon: Package, stepNum: 1 },
                                        { label: "Processing", icon: Settings, stepNum: 2 },
                                        { label: "Shipped", icon: Truck, stepNum: 3 },
                                        { label: "Delivered", icon: CheckCircle, stepNum: 4 }
                                      ].map((step, idx) => {
                                        const StepIcon = step.icon;
                                        const isDone = currentStep >= step.stepNum;
                                        const isActive = currentStep === step.stepNum;

                                        return (
                                          <div key={idx} className="flex flex-col items-center">
                                            <div className={`w-8 h-8 rounded-full border-2 flex items-center justify-center bg-white ${
                                              isDone 
                                                ? "border-brand-accent text-brand-accent" 
                                                : "border-brand-lightGray text-brand-darkGray"
                                            } ${isActive ? "ring-4 ring-brand-primary/20 scale-115" : ""}`}>
                                              <StepIcon size={14} />
                                            </div>
                                            <span className={`text-[10px] font-bold mt-2 ${isDone ? "text-brand-text" : "text-brand-darkGray"}`}>
                                              {step.label}
                                            </span>
                                          </div>
                                        );
                                      })}
                                    </div>
                                  </div>

                                  {/* Itemized Order list */}
                                  <div className="grid md:grid-cols-2 gap-6">
                                    {/* Left: Items list */}
                                    <div className="space-y-3">
                                      <h4 className="text-[10px] font-bold text-brand-accent tracking-wider uppercase">Purchased Items</h4>
                                      <div className="space-y-3">
                                        {order.items.map((item, index) => (
                                          <div key={index} className="flex items-center space-x-3 text-xs bg-white p-3 border border-brand-lightGray rounded-xl shadow-sm">
                                            <div className="w-10 h-12 bg-brand-bg rounded overflow-hidden flex-shrink-0">
                                              <img src={item.product.images[0]} alt={item.product.name} className="w-full h-full object-cover" />
                                            </div>
                                            <div className="flex-grow">
                                              <p className="font-serif font-bold text-brand-text">{item.product.name}</p>
                                              <p className="text-[9px] text-brand-darkGray mt-0.5">Size: {item.selectedSize}{item.selectedColor ? ` | Color: ${item.selectedColor}` : ""} | Qty: {item.quantity}</p>
                                            </div>
                                            <span className="font-bold text-brand-accent">₹{item.product.salePrice * item.quantity}</span>
                                          </div>
                                        ))}
                                      </div>
                                    </div>

                                    {/* Right: Address & tracking */}
                                    <div className="bg-white p-4 border border-brand-lightGray rounded-xl text-xs text-brand-darkGray space-y-3 shadow-sm">
                                      <h4 className="text-[10px] font-bold text-brand-accent tracking-wider uppercase">Shipment Detail</h4>
                                      <div className="leading-relaxed">
                                        <p className="font-bold text-brand-text">{order.shippingAddress.fullName}</p>
                                        <p>{order.shippingAddress.addressLine}</p>
                                        <p>{order.shippingAddress.city}, {order.shippingAddress.state} - {order.shippingAddress.postalCode}</p>
                                        <p>Phone: {order.shippingAddress.phone}</p>
                                      </div>
                                      <div className="border-t border-brand-lightGray pt-2 space-y-1">
                                        <p className="flex justify-between">
                                          <span>Tracking Code:</span>
                                          <span className="font-bold text-brand-text">{order.trackingNumber}</span>
                                        </p>
                                        <p className="flex justify-between">
                                          <span>Tax (GST 18%):</span>
                                          <span>₹{order.tax}</span>
                                        </p>
                                        {order.discountAmount > 0 && (
                                          <p className="flex justify-between text-green-600 font-semibold">
                                            <span>Saved Amount:</span>
                                            <span>-₹{order.discountAmount}</span>
                                          </p>
                                        )}
                                      </div>
                                    </div>
                                  </div>
                                </motion.div>
                              )}
                            </div>
                          );
                        })}
                      </div>
                    )}
                  </div>
                )}

                {/* 2. WISHLIST */}
                {activeTab === "wishlist" && (
                  <div>
                    <h2 className="font-serif text-xl font-bold text-brand-text border-b border-brand-lightGray pb-4 mb-6">
                      My Saved Styles
                    </h2>

                    {wishlist.length === 0 ? (
                      <div className="text-center py-12">
                        <Heart size={40} className="mx-auto text-brand-primary/30 mb-3 stroke-1" />
                        <p className="text-xs text-brand-darkGray">Your wishlist is currently empty.</p>
                      </div>
                    ) : (
                      <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                        {products.filter(p => wishlist.includes(p.id)).map((product) => (
                          <div key={product.id} className="border border-brand-lightGray rounded-xl overflow-hidden p-3 bg-white flex flex-col justify-between space-y-3 shadow-sm hover:shadow-md transition-shadow">
                            <div className="aspect-[3/4] w-full bg-brand-bg rounded-lg overflow-hidden relative">
                              <img src={product.images[0]} alt={product.name} className="w-full h-full object-cover" />
                              <button
                                onClick={() => toggleWishlist(product.id)}
                                className="absolute top-2 right-2 p-1.5 bg-white/80 hover:bg-white text-red-500 rounded-full shadow-sm"
                              >
                                <Trash2 size={14} />
                              </button>
                            </div>
                            <div>
                              <h3 className="font-serif font-bold text-xs text-brand-text line-clamp-1">{product.name}</h3>
                              <p className="text-[10px] text-brand-accent font-semibold mt-1">₹{product.salePrice}</p>
                            </div>
                            <button
                              disabled={!product.inStock}
                              onClick={() => router.push(`/product/${product.id}`)}
                              className={`w-full py-2 text-[10px] uppercase font-bold tracking-wider rounded ${
                                product.inStock 
                                  ? "bg-brand-accent text-white hover:bg-brand-primary" 
                                  : "bg-gray-100 text-gray-400 cursor-not-allowed"
                              }`}
                            >
                              {product.inStock ? "Select Options" : "Sold Out"}
                            </button>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                )}

                {/* 3. SAVED ADDRESSES */}
                {activeTab === "addresses" && (
                  <div className="space-y-6">
                    <div className="flex justify-between items-center border-b border-brand-lightGray pb-4">
                      <h2 className="font-serif text-xl font-bold text-brand-text">My Shipping Addresses</h2>
                      <button
                        onClick={() => setShowAddressForm(!showAddressForm)}
                        className="bg-brand-accent hover:bg-brand-primary text-white text-[10px] px-4 py-2.5 rounded-full font-bold uppercase tracking-wider flex items-center space-x-1"
                      >
                        <Plus size={12} /> <span>Add Address</span>
                      </button>
                    </div>

                    {/* Add Address Form Toggle */}
                    {showAddressForm && (
                      <form onSubmit={handleAddressSubmit} className="bg-brand-bg p-6 rounded-2xl border border-brand-primary/10 space-y-4 max-w-xl">
                        <h3 className="font-serif font-bold text-xs text-brand-accent tracking-wider uppercase mb-2">New Address Details</h3>
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                          <div>
                            <label htmlFor="addr-fullName" className="text-[10px] font-bold text-brand-text block mb-1">Full Name</label>
                            <input
                              id="addr-fullName"
                              type="text"
                              required
                              value={newAddress.fullName}
                              onChange={(e) => setNewAddress(p => ({ ...p, fullName: e.target.value }))}
                              className="w-full bg-white text-xs px-3 py-2.5 rounded-lg border border-brand-lightGray focus:border-brand-accent focus:outline-none"
                              placeholder="e.g. Aanya Verma"
                            />
                          </div>
                          <div>
                            <label htmlFor="addr-phone" className="text-[10px] font-bold text-brand-text block mb-1">Phone Number</label>
                            <input
                              id="addr-phone"
                              type="tel"
                              required
                              value={newAddress.phone}
                              onChange={(e) => setNewAddress(p => ({ ...p, phone: e.target.value }))}
                              className="w-full bg-white text-xs px-3 py-2.5 rounded-lg border border-brand-lightGray focus:border-brand-accent focus:outline-none"
                              placeholder="e.g. 9876543210"
                            />
                          </div>
                          <div className="sm:col-span-2">
                            <label htmlFor="addr-addressLine" className="text-[10px] font-bold text-brand-text block mb-1">Street Address</label>
                            <input
                              id="addr-addressLine"
                              type="text"
                              required
                              value={newAddress.addressLine}
                              onChange={(e) => setNewAddress(p => ({ ...p, addressLine: e.target.value }))}
                              className="w-full bg-white text-xs px-3 py-2.5 rounded-lg border border-brand-lightGray focus:border-brand-accent focus:outline-none"
                              placeholder="Flat/House No., Building Name, Street"
                            />
                          </div>
                          <div>
                            <label htmlFor="addr-city" className="text-[10px] font-bold text-brand-text block mb-1">City</label>
                            <input
                              id="addr-city"
                              type="text"
                              required
                              value={newAddress.city}
                              onChange={(e) => setNewAddress(p => ({ ...p, city: e.target.value }))}
                              className="w-full bg-white text-xs px-3 py-2.5 rounded-lg border border-brand-lightGray focus:border-brand-accent focus:outline-none"
                              placeholder="e.g. Mumbai"
                            />
                          </div>
                          <div>
                            <label htmlFor="addr-state" className="text-[10px] font-bold text-brand-text block mb-1">State</label>
                            <input
                              id="addr-state"
                              type="text"
                              required
                              value={newAddress.state}
                              onChange={(e) => setNewAddress(p => ({ ...p, state: e.target.value }))}
                              className="w-full bg-white text-xs px-3 py-2.5 rounded-lg border border-brand-lightGray focus:border-brand-accent focus:outline-none"
                              placeholder="e.g. Maharashtra"
                            />
                          </div>
                          <div>
                            <label htmlFor="addr-postalCode" className="text-[10px] font-bold text-brand-text block mb-1">Pin Code</label>
                            <input
                              id="addr-postalCode"
                              type="text"
                              required
                              value={newAddress.postalCode}
                              onChange={(e) => setNewAddress(p => ({ ...p, postalCode: e.target.value }))}
                              className="w-full bg-white text-xs px-3 py-2.5 rounded-lg border border-brand-lightGray focus:border-brand-accent focus:outline-none"
                              placeholder="e.g. 400001"
                            />
                          </div>
                        </div>
                        <div className="flex space-x-2 pt-2">
                          <button
                            type="submit"
                            className="bg-brand-accent hover:bg-brand-primary text-white text-[10px] px-6 py-2.5 rounded-full font-bold uppercase tracking-wider"
                          >
                            Save Address
                          </button>
                          <button
                            type="button"
                            onClick={() => setShowAddressForm(false)}
                            className="border border-brand-lightGray text-brand-text text-[10px] px-6 py-2.5 rounded-full font-bold uppercase tracking-wider bg-white"
                          >
                            Cancel
                          </button>
                        </div>
                      </form>
                    )}

                    {/* Address List */}
                    {session.addresses.length === 0 ? (
                      <div className="text-center py-12 text-xs text-brand-darkGray">No shipping addresses saved yet. Click the button to add.</div>
                    ) : (
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        {session.addresses.map((addr, idx) => (
                          <div key={idx} className="p-5 border border-brand-lightGray rounded-2xl flex justify-between items-start leading-relaxed bg-brand-bg/25">
                            <div className="text-xs text-brand-darkGray space-y-1">
                              <p className="font-bold text-brand-text text-sm flex items-center">
                                <MapPin size={14} className="mr-1.5 text-brand-accent" /> {addr.fullName}
                              </p>
                              <p>{addr.addressLine}</p>
                              <p>{addr.city}, {addr.state} - {addr.postalCode}</p>
                              <p className="font-semibold text-brand-text mt-2">Phone: {addr.phone}</p>
                            </div>
                            <button
                              onClick={() => removeAddress(idx)}
                              className="text-brand-darkGray hover:text-red-500 transition-colors p-1"
                              title="Delete address"
                            >
                              <Trash2 size={16} />
                            </button>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                )}

                {/* 4. PROFILE SETTINGS */}
                {activeTab === "profile" && (
                  <div className="space-y-6 max-w-xl">
                    <h2 className="font-serif text-xl font-bold text-brand-text border-b border-brand-lightGray pb-4 mb-6">
                      Profile Settings
                    </h2>

                    <form onSubmit={handleProfileUpdate} className="space-y-4">
                      <div>
                        <label htmlFor="profile-fullName" className="text-xs font-semibold text-brand-text block mb-1">Full Name</label>
                        <input
                          id="profile-fullName"
                          type="text"
                          required
                          value={profileName}
                          onChange={(e) => setProfileName(e.target.value)}
                          className="w-full bg-brand-bg text-brand-text text-xs px-4 py-3 rounded-lg border border-brand-lightGray focus:border-brand-accent focus:outline-none"
                        />
                      </div>
                      <div>
                        <label htmlFor="profile-email" className="text-xs font-semibold text-brand-text block mb-1">Email Address</label>
                        <input
                          id="profile-email"
                          type="email"
                          required
                          value={profileEmail}
                          onChange={(e) => setProfileEmail(e.target.value)}
                          className="w-full bg-brand-bg text-brand-text text-xs px-4 py-3 rounded-lg border border-brand-lightGray focus:border-brand-accent focus:outline-none"
                        />
                      </div>

                      {feedback && (
                        <div className={`p-3 rounded-lg flex items-start space-x-2 text-xs ${
                          feedback.success ? "bg-green-50 text-green-800" : "bg-red-50 text-red-800"
                        }`}>
                          <AlertCircle size={14} className="flex-shrink-0 mt-0.5" />
                          <span>{feedback.message}</span>
                        </div>
                      )}

                      <button
                        type="submit"
                        className="bg-brand-accent hover:bg-brand-primary text-white text-xs px-8 py-3 rounded-full font-semibold uppercase tracking-widest transition-all"
                      >
                        Save Profile Changes
                      </button>
                    </form>
                  </div>
                )}

              </div>

            </motion.div>
          )}
        </AnimatePresence>
      </main>

      <Footer />
    </div>
  );
}

export default function DashboardPage() {
  return (
    <Suspense fallback={
      <div className="h-screen w-screen flex flex-col items-center justify-center bg-brand-bg text-brand-accent">
        <span className="font-serif text-3xl font-bold animate-pulse tracking-widest">SANAYA</span>
        <span className="text-[10px] uppercase tracking-[0.2em] mt-1 font-semibold animate-pulse">Loading Account...</span>
      </div>
    }>
      <DashboardContent />
    </Suspense>
  );
}
