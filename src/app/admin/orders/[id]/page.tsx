"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useApp, Order } from "@/context/AppContext";
import { 
  ArrowLeft, 
  User, 
  Mail, 
  Phone, 
  MapPin, 
  CreditCard, 
  Truck, 
  Calendar, 
  Tag, 
  Save, 
  CheckCircle2, 
  AlertCircle,
  Clock,
  ChevronRight
} from "lucide-react";

export default function AdminOrderDetailPage({ params }: { params: { id: string } }) {
  const router = useRouter();
  const { id } = params;
  const { orders, users, session, updateOrderStatus } = useApp();

  // Find order from global state
  const orderFromState = orders.find((o) => o.id === id);

  // States
  const [order, setOrder] = useState<Order | null>(orderFromState || null);
  const [loading, setLoading] = useState<boolean>(!orderFromState);
  const [error, setError] = useState<string | null>(null);
  
  // Client account details (looked up from users registry or fetched)
  const [clientEmail, setClientEmail] = useState<string>("Loading...");
  const [clientRole, setClientRole] = useState<string>("customer");

  // Editable fields
  const [status, setStatus] = useState<Order["status"]>("Pending");
  const [paymentStatus, setPaymentStatus] = useState<string>("Pending");
  const [trackingNumber, setTrackingNumber] = useState<string>("");
  const [isSaving, setIsSaving] = useState<boolean>(false);
  const [saveSuccess, setSaveSuccess] = useState<boolean>(false);

  // Initialize fields once order is available
  useEffect(() => {
    if (order) {
      setStatus(order.status);
      setPaymentStatus(order.paymentStatus);
      setTrackingNumber(order.trackingNumber || "");
      
      // Look up user in local users list
      if (order.userId) {
        const foundUser = users.find((u) => u.id === order.userId);
        if (foundUser) {
          setClientEmail(foundUser.email);
          setClientRole(foundUser.role);
        } else if (order.userId === "guest") {
          setClientEmail("Guest Checkout (No Account)");
          setClientRole("guest");
        } else {
          // If not in state, try to fetch the customer profile
          fetchCustomerProfile(order.userId);
        }
      } else {
        setClientEmail("Guest Checkout (No Account)");
        setClientRole("guest");
      }
    }
  }, [order, users]);

  // Fetch order if page refreshed and order is not in context
  useEffect(() => {
    if (!orderFromState) {
      const fetchOrder = async () => {
        try {
          setLoading(true);
          const res = await fetch(`/api/orders/${id}`, {
            headers: {
              "Authorization": `Bearer ${session?.token}`
            }
          });
          if (!res.ok) {
            throw new Error("Order not found or access denied.");
          }
          const data = await res.json();
          setOrder(data);
        } catch (err: any) {
          setError(err.message || "Failed to load order.");
        } finally {
          setLoading(false);
        }
      };
      
      if (session?.token) {
        fetchOrder();
      } else {
        // Wait a bit for session hydration
        const timer = setTimeout(() => {
          if (session?.token) fetchOrder();
          else {
            setLoading(false);
            setError("Authentication token missing. Please log in.");
          }
        }, 1000);
        return () => clearTimeout(timer);
      }
    }
  }, [id, orderFromState, session]);

  const fetchCustomerProfile = async (userId: string) => {
    try {
      const res = await fetch(`/api/users/${userId}`, {
        headers: {
          "Authorization": `Bearer ${session?.token}`
        }
      });
      if (res.ok) {
        const userData = await res.json();
        setClientEmail(userData.email || "N/A");
        setClientRole(userData.role || "customer");
      } else {
        setClientEmail("Unknown User Account");
      }
    } catch (_) {
      setClientEmail("Failed to load email");
    }
  };

  const handleSaveChanges = async () => {
    setIsSaving(true);
    setSaveSuccess(false);
    setError(null);

    try {
      const res = await fetch(`/api/orders/${id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${session?.token}`
        },
        body: JSON.stringify({
          status,
          paymentStatus,
          trackingNumber
        })
      });

      if (!res.ok) {
        const errData = await res.json();
        throw new Error(errData.error || "Failed to update order");
      }

      const updatedOrder = await res.json();
      
      // Update local state
      setOrder(updatedOrder);
      
      // Sync global context state
      await updateOrderStatus(id, status);
      
      setSaveSuccess(true);
      setTimeout(() => setSaveSuccess(false), 3000);
    } catch (err: any) {
      setError(err.message || "Something went wrong updating order details.");
    } finally {
      setIsSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-[50vh] flex flex-col items-center justify-center space-y-3">
        <div className="w-8 h-8 border-4 border-teal-700 border-t-transparent rounded-full animate-spin"></div>
        <span className="text-xs font-bold uppercase tracking-widest text-zinc-500">Loading Order Details...</span>
      </div>
    );
  }

  if (error && !order) {
    return (
      <div className="bg-red-50 border border-red-200 rounded-2xl p-6 text-center max-w-lg mx-auto my-8">
        <AlertCircle className="w-12 h-12 text-red-600 mx-auto mb-4" />
        <h3 className="text-lg font-bold text-red-900">Failed to Load Order</h3>
        <p className="text-xs text-red-700 mt-2">{error}</p>
        <button
          onClick={() => router.push("/admin/orders")}
          className="mt-6 inline-flex items-center space-x-2 bg-white hover:bg-zinc-50 border border-zinc-200 text-zinc-700 px-4 py-2 rounded-xl text-xs font-bold transition-all shadow-xs"
        >
          <ArrowLeft size={14} />
          <span>Back to Order List</span>
        </button>
      </div>
    );
  }

  if (!order) {
    return (
      <div className="text-center py-12">
        <p className="text-zinc-500">Order not found.</p>
        <Link href="/admin/orders" className="text-teal-700 font-bold text-xs hover:underline mt-2 inline-block">
          Go back to Orders
        </Link>
      </div>
    );
  }

  // Financial calculations
  const itemsSubtotal = order.items.reduce((sum, item) => {
    return sum + (item.quantity * (item.product?.salePrice || 0));
  }, 0);

  return (
    <div className="space-y-6">
      {/* BREADCRUMBS & ACTION HEADER */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <div className="flex items-center space-x-2 text-[10px] font-bold text-zinc-400 uppercase tracking-widest">
            <Link href="/admin" className="hover:text-teal-700 transition-colors">Admin</Link>
            <ChevronRight size={10} />
            <Link href="/admin/orders" className="hover:text-teal-700 transition-colors">Orders</Link>
            <ChevronRight size={10} />
            <span className="text-zinc-700 font-mono">{order.id}</span>
          </div>
          
          <div className="flex items-center space-x-3 mt-1.5">
            <h1 className="text-2xl font-bold tracking-tight text-zinc-900 font-mono">{order.id}</h1>
            <span className={`inline-block border px-3 py-1 text-[10px] font-bold rounded-lg uppercase tracking-wider ${
              order.status === "Delivered" ? "bg-emerald-50 text-emerald-700 border-emerald-200" :
              order.status === "Shipped" ? "bg-blue-50 text-blue-700 border-blue-200" :
              order.status === "Processing" ? "bg-indigo-50 text-indigo-700 border-indigo-200" :
              "bg-amber-50 text-amber-700 border-amber-200"
            }`}>
              {order.status}
            </span>
          </div>
          <p className="text-[11px] text-zinc-500 mt-1 flex items-center">
            <Calendar size={12} className="mr-1 text-zinc-400" />
            Placed on {order.date}
          </p>
        </div>

        <div>
          <Link
            href="/admin/orders"
            className="inline-flex items-center space-x-2 bg-white hover:bg-zinc-50 border border-zinc-200 text-zinc-700 px-4 py-2.5 rounded-xl text-xs font-bold transition-all shadow-xs"
          >
            <ArrowLeft size={14} className="text-zinc-500" />
            <span>All Client Orders</span>
          </Link>
        </div>
      </div>

      {saveSuccess && (
        <div className="bg-emerald-50 border border-emerald-200 rounded-xl p-4 flex items-center space-x-3 text-emerald-800 text-xs font-semibold shadow-xs animate-fade-in">
          <CheckCircle2 className="w-5 h-5 text-emerald-600 flex-shrink-0" />
          <span>Success: Order records and tracking data updated on the server.</span>
        </div>
      )}

      {error && (
        <div className="bg-red-50 border border-red-200 rounded-xl p-4 flex items-center space-x-3 text-red-800 text-xs font-semibold shadow-xs">
          <AlertCircle className="w-5 h-5 text-red-600 flex-shrink-0" />
          <span>Error: {error}</span>
        </div>
      )}

      {/* TOP DETAIL CARDS - 3 COLUMN GRID */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* CLIENT DETAILS */}
        <div className="bg-white rounded-2xl border border-zinc-200 p-5 shadow-xs flex flex-col justify-between">
          <div className="space-y-4">
            <div className="flex items-center space-x-2 border-b border-zinc-100 pb-3">
              <User size={16} className="text-teal-700" />
              <h2 className="text-xs font-bold uppercase tracking-wider text-zinc-800">Client Profile</h2>
            </div>
            
            <div className="space-y-3 text-xs">
              <div>
                <p className="text-[10px] text-zinc-400 uppercase font-semibold">Full Name</p>
                <p className="font-bold text-zinc-900 mt-0.5">{order.shippingAddress.fullName}</p>
              </div>

              <div>
                <p className="text-[10px] text-zinc-400 uppercase font-semibold">Account Email</p>
                <p className="font-medium text-zinc-800 flex items-center mt-0.5 break-all">
                  <Mail size={12} className="mr-1.5 text-zinc-400 flex-shrink-0" />
                  {clientEmail}
                </p>
              </div>

              <div>
                <p className="text-[10px] text-zinc-400 uppercase font-semibold">Contact Phone</p>
                <p className="font-medium text-zinc-800 flex items-center mt-0.5">
                  <Phone size={12} className="mr-1.5 text-zinc-400 flex-shrink-0" />
                  {order.shippingAddress.phone}
                </p>
              </div>
            </div>
          </div>

          <div className="mt-4 pt-3 border-t border-zinc-100 flex justify-between items-center text-[10px]">
            <span className="text-zinc-400 font-medium">Customer type:</span>
            <span className={`px-2 py-0.5 font-bold rounded-md uppercase tracking-wider ${
              clientRole === "admin" ? "bg-rose-50 text-rose-700 border border-rose-100" :
              clientRole === "guest" ? "bg-zinc-100 text-zinc-600 border border-zinc-200" :
              "bg-teal-50 text-teal-700 border border-teal-100"
            }`}>
              {clientRole}
            </span>
          </div>
        </div>

        {/* DELIVERY ADDRESS */}
        <div className="bg-white rounded-2xl border border-zinc-200 p-5 shadow-xs">
          <div className="flex items-center space-x-2 border-b border-zinc-100 pb-3 mb-4">
            <MapPin size={16} className="text-teal-700" />
            <h2 className="text-xs font-bold uppercase tracking-wider text-zinc-800">Shipping Address</h2>
          </div>
          
          <div className="space-y-4 text-xs">
            <div>
              <p className="text-[10px] text-zinc-400 uppercase font-semibold">Address Line</p>
              <p className="font-bold text-zinc-900 mt-0.5 leading-relaxed">{order.shippingAddress.addressLine}</p>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <p className="text-[10px] text-zinc-400 uppercase font-semibold">City</p>
                <p className="font-semibold text-zinc-800 mt-0.5">{order.shippingAddress.city}</p>
              </div>
              <div>
                <p className="text-[10px] text-zinc-400 uppercase font-semibold">State</p>
                <p className="font-semibold text-zinc-800 mt-0.5">{order.shippingAddress.state}</p>
              </div>
            </div>

            <div>
              <p className="text-[10px] text-zinc-400 uppercase font-semibold">Postal Code / PIN</p>
              <p className="font-mono font-bold text-zinc-900 mt-0.5">{order.shippingAddress.postalCode}</p>
            </div>
          </div>
        </div>

        {/* PAYMENT DETAILS */}
        <div className="bg-white rounded-2xl border border-zinc-200 p-5 shadow-xs flex flex-col justify-between">
          <div className="space-y-4">
            <div className="flex items-center space-x-2 border-b border-zinc-100 pb-3">
              <CreditCard size={16} className="text-teal-700" />
              <h2 className="text-xs font-bold uppercase tracking-wider text-zinc-800">Payment Status</h2>
            </div>
            
            <div className="space-y-3 text-xs">
              <div>
                <p className="text-[10px] text-zinc-400 uppercase font-semibold">Payment Method</p>
                <p className="font-bold text-zinc-900 mt-0.5">{order.paymentMethod}</p>
              </div>

              <div>
                <p className="text-[10px] text-zinc-400 uppercase font-semibold">Gateway Status</p>
                <span className={`inline-block border px-2.5 py-0.5 mt-1 text-[9px] font-bold rounded-lg uppercase tracking-wider ${
                  order.paymentStatus === "Paid" 
                    ? "bg-emerald-50 text-emerald-700 border-emerald-200" 
                    : "bg-amber-50 text-amber-700 border-amber-200"
                }`}>
                  {order.paymentStatus}
                </span>
              </div>

              {order.razorpayOrderId && (
                <div className="border-t border-zinc-100 pt-3 mt-3 space-y-2">
                  <p className="text-[9px] text-teal-800 font-bold uppercase tracking-wider">Razorpay Checkout Metadata</p>
                  <div className="font-mono text-[10px] space-y-1.5 text-zinc-600 bg-zinc-50 p-2.5 rounded-lg border border-zinc-150 break-all leading-tight">
                    <p>
                      <strong className="text-zinc-800 uppercase text-[8px] tracking-wider block">Razorpay Order ID:</strong>
                      {order.razorpayOrderId}
                    </p>
                    {order.razorpayPaymentId && (
                      <p className="mt-1">
                        <strong className="text-zinc-800 uppercase text-[8px] tracking-wider block">Payment ID:</strong>
                        {order.razorpayPaymentId}
                      </p>
                    )}
                    {order.razorpaySignature && (
                      <p className="mt-1">
                        <strong className="text-zinc-800 uppercase text-[8px] tracking-wider block text-ellipsis overflow-hidden">Signature hash:</strong>
                        <span className="text-[9px]">{order.razorpaySignature.slice(0, 24)}...</span>
                      </p>
                    )}
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* CORE INFO LAYOUT: PRODUCTS vs MANAGE SECTION */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* ORDERED PRODUCTS - 2 COLS WIDE */}
        <div className="lg:col-span-2 space-y-6">
          <div className="bg-white rounded-2xl border border-zinc-200 overflow-hidden shadow-xs">
            <div className="p-5 border-b border-zinc-100 flex justify-between items-center">
              <h2 className="text-sm font-bold tracking-tight text-zinc-900">Ordered Products ({order.items.length})</h2>
              <span className="bg-zinc-100 border border-zinc-200 text-zinc-600 font-bold font-mono text-[10px] px-2.5 py-0.5 rounded-md">
                Package
              </span>
            </div>

            <div className="divide-y divide-zinc-200">
              {order.items.map((item, idx) => (
                <div key={idx} className="p-5 flex items-start sm:items-center justify-between gap-4 hover:bg-zinc-50/20 transition-colors">
                  <div className="flex items-center space-x-4">
                    <div className="w-14 h-18 rounded-lg overflow-hidden border border-zinc-200 bg-zinc-50 flex-shrink-0 shadow-xs">
                      {item.product?.images?.[0] ? (
                        <img 
                          src={item.product.images[0]} 
                          alt={item.product.name} 
                          className="w-full h-full object-cover" 
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center text-zinc-300 text-[10px]">
                          No Image
                        </div>
                      )}
                    </div>
                    <div>
                      <h4 className="font-bold text-zinc-900 text-sm leading-snug">{item.product?.name || "Unknown Product"}</h4>
                      <p className="text-[10px] text-zinc-400 uppercase font-medium mt-0.5">{item.product?.category}</p>
                      
                      {/* Size & Color options */}
                      <div className="flex items-center space-x-2 mt-2">
                        <span className="bg-teal-50 border border-teal-100 text-teal-800 font-bold text-[9px] px-2 py-0.5 rounded uppercase tracking-wider">
                          Size: {item.selectedSize}
                        </span>
                        {item.selectedColor && (
                          <span className="bg-zinc-50 border border-zinc-200 text-zinc-600 font-bold text-[9px] px-2 py-0.5 rounded uppercase tracking-wider">
                            Color: {item.selectedColor}
                          </span>
                        )}
                      </div>
                    </div>
                  </div>

                  <div className="text-right">
                    <p className="text-xs text-zinc-500 font-medium">₹{item.product?.salePrice || 0} × {item.quantity}</p>
                    <p className="font-bold text-zinc-900 text-sm mt-0.5">₹{(item.product?.salePrice || 0) * item.quantity}</p>
                  </div>
                </div>
              ))}
            </div>

            {/* FINANCIAL SUMMARY TABLE */}
            <div className="bg-zinc-50 border-t border-zinc-200 p-5 space-y-3 text-xs">
              <div className="flex justify-between text-zinc-500">
                <span>Items Subtotal</span>
                <span className="font-semibold text-zinc-800">₹{itemsSubtotal}</span>
              </div>
              <div className="flex justify-between text-zinc-500">
                <span>Shipping Cost</span>
                <span className="font-semibold text-zinc-800">₹{order.shippingCost}</span>
              </div>
              <div className="flex justify-between text-zinc-500">
                <span>Estimated Tax (18% GST incl.)</span>
                <span className="font-semibold text-zinc-800">₹{order.tax}</span>
              </div>
              {order.discountAmount > 0 && (
                <div className="flex justify-between text-rose-600 font-semibold bg-rose-50/50 border border-rose-100 p-2.5 rounded-lg">
                  <span className="flex items-center">
                    <Tag size={12} className="mr-1" />
                    Promo Code Discount
                  </span>
                  <span>-₹{order.discountAmount}</span>
                </div>
              )}
              <div className="border-t border-zinc-200 pt-3 mt-1 flex justify-between items-center text-sm font-bold text-zinc-900">
                <span className="text-zinc-800 font-serif">Grand total / Final Paid</span>
                <span className="text-rose-600 font-mono text-base">₹{order.totalAmount}</span>
              </div>
            </div>
          </div>
        </div>

        {/* OPERATIONS MANAGEMENT CONTROL PANEL */}
        <div className="space-y-6">
          <div className="bg-white rounded-2xl border border-zinc-200 p-5 shadow-xs space-y-5">
            <div className="flex items-center space-x-2 border-b border-zinc-100 pb-3">
              <Truck size={16} className="text-teal-700" />
              <h3 className="text-xs font-bold uppercase tracking-wider text-zinc-800">Manage Checkout State</h3>
            </div>

            <div className="space-y-4">
              {/* Delivery Status Dropdown */}
              <div>
                <label className="block text-[10px] font-bold text-zinc-500 uppercase tracking-wider mb-1.5">
                  Delivery / Dispatch Status
                </label>
                <div className="relative">
                  <select
                    value={status}
                    onChange={(e) => setStatus(e.target.value as Order["status"])}
                    className="w-full bg-white border border-zinc-300 rounded-xl px-3 py-2.5 text-xs font-semibold text-zinc-800 focus:border-teal-700 focus:outline-none transition-colors cursor-pointer"
                  >
                    <option value="Pending">Pending (Awaiting fulfillment)</option>
                    <option value="Processing">Processing (Packaging/Labeling)</option>
                    <option value="Shipped">Shipped (In-Transit)</option>
                    <option value="Delivered">Delivered (Completed)</option>
                  </select>
                </div>
              </div>

              {/* Payment Status Dropdown */}
              <div>
                <label className="block text-[10px] font-bold text-zinc-500 uppercase tracking-wider mb-1.5">
                  Order Payment Status
                </label>
                <div className="relative">
                  <select
                    value={paymentStatus}
                    onChange={(e) => setPaymentStatus(e.target.value)}
                    className="w-full bg-white border border-zinc-300 rounded-xl px-3 py-2.5 text-xs font-semibold text-zinc-800 focus:border-teal-700 focus:outline-none transition-colors cursor-pointer"
                  >
                    <option value="Pending">Pending Payment / Unpaid</option>
                    <option value="Paid">Paid / Verified</option>
                  </select>
                </div>
              </div>

              {/* Tracking Number Input */}
              <div>
                <label className="block text-[10px] font-bold text-zinc-500 uppercase tracking-wider mb-1.5">
                  Courier Tracking Link / Number
                </label>
                <div className="relative">
                  <input
                    type="text"
                    value={trackingNumber}
                    onChange={(e) => setTrackingNumber(e.target.value)}
                    placeholder="Enter Tracking Number (e.g. TRK-34981)"
                    className="w-full bg-white border border-zinc-300 rounded-xl px-3 py-2.5 text-xs font-mono text-zinc-800 focus:border-teal-700 focus:outline-none placeholder-zinc-400 transition-colors"
                  />
                </div>
                <p className="text-[9px] text-zinc-400 mt-1 leading-normal">
                  Providing tracking numbers sends logistics transparency to the client&apos;s profile interface.
                </p>
              </div>

              {/* Save Button */}
              <button
                onClick={handleSaveChanges}
                disabled={isSaving}
                className="w-full mt-4 bg-teal-700 hover:bg-teal-800 disabled:bg-teal-900/60 disabled:cursor-not-allowed text-white text-xs py-3 px-4 rounded-xl font-bold uppercase tracking-wider flex items-center justify-center space-x-2 transition-colors shadow-xs"
              >
                {isSaving ? (
                  <>
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                    <span>Saving...</span>
                  </>
                ) : (
                  <>
                    <Save size={14} />
                    <span>Save Order Changes</span>
                  </>
                )}
              </button>
            </div>
          </div>

          {/* INTERNAL HELP CARD */}
          <div className="bg-zinc-50 rounded-2xl border border-zinc-200 p-5 shadow-xs space-y-3">
            <div className="flex items-center space-x-2 text-[10px] font-bold text-zinc-400 uppercase tracking-widest">
              <Clock size={12} />
              <span>Fulfillment Help</span>
            </div>
            <p className="text-[11px] text-zinc-500 leading-normal">
              Ensure you check that Razorpay gateway credentials say <strong>Paid</strong> before changing shipping states to Shipped, unless order method is set as Cash on Delivery.
            </p>
          </div>
        </div>

      </div>
    </div>
  );
}
