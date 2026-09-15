"use client";

import React, { useState } from "react";
import Link from "next/link";
import { useApp, Order } from "@/context/AppContext";
import { Eye, Trash2, AlertTriangle, X, Check } from "lucide-react";

export default function AdminOrdersPage() {
  const { orders, updateOrderStatus, deleteOrder } = useApp();

  // Deletion modal state
  const [targetOrder, setTargetOrder] = useState<Order | null>(null);
  const [reasonPreset, setReasonPreset] = useState<string>("Out of Stock");
  const [customReason, setCustomReason] = useState<string>("");
  const [deleteMode, setDeleteMode] = useState<"cancel" | "permanent">("cancel");
  const [isDeleting, setIsDeleting] = useState<boolean>(false);
  const [actionSuccess, setActionSuccess] = useState<string | null>(null);

  const handleOpenDeleteModal = (order: Order) => {
    setTargetOrder(order);
    setReasonPreset("Out of Stock");
    setCustomReason("");
    setDeleteMode("cancel");
  };

  const handleConfirmDelete = async () => {
    if (!targetOrder) return;
    setIsDeleting(true);

    const finalReason = customReason.trim() || reasonPreset;
    const isPermanent = deleteMode === "permanent";

    const success = await deleteOrder(targetOrder.id, finalReason, isPermanent);
    setIsDeleting(false);

    if (success) {
      setActionSuccess(
        isPermanent
          ? `Order ${targetOrder.id} has been permanently deleted.`
          : `Order ${targetOrder.id} has been cancelled with reason: "${finalReason}".`
      );
      setTargetOrder(null);
      setTimeout(() => setActionSuccess(null), 4000);
    } else {
      alert("Failed to delete order. Please try again.");
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight text-zinc-900">Client Orders</h1>
        <p className="text-xs text-zinc-500 mt-1">Review checkouts, manage dispatch states, and handle cancellations</p>
      </div>

      {actionSuccess && (
        <div className="bg-emerald-50 border border-emerald-200 text-emerald-800 p-4 rounded-xl text-xs font-semibold flex items-center justify-between shadow-xs animate-fade-in">
          <div className="flex items-center space-x-2">
            <Check size={16} className="text-emerald-600" />
            <span>{actionSuccess}</span>
          </div>
          <button onClick={() => setActionSuccess(null)} className="text-emerald-600 hover:text-emerald-800">
            <X size={14} />
          </button>
        </div>
      )}

      <div className="bg-white rounded-2xl border border-zinc-200 overflow-hidden shadow-xs">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="bg-zinc-50 border-b border-zinc-200 font-bold uppercase tracking-wider text-[10px] text-zinc-600">
                <th className="p-4 border-r border-zinc-100">Order ID</th>
                <th className="p-4 border-r border-zinc-100">Checkout Date</th>
                <th className="p-4 border-r border-zinc-100">Client Name & Address</th>
                <th className="p-4 border-r border-zinc-100">Total Price</th>
                <th className="p-4 border-r border-zinc-100">Payment status</th>
                <th className="p-4 border-r border-zinc-100">Delivery Status</th>
                <th className="p-4 text-center">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-zinc-200 font-medium">
              {orders.length === 0 ? (
                <tr>
                  <td colSpan={7} className="p-8 text-center text-zinc-400">
                    No order records found in the database.
                  </td>
                </tr>
              ) : (
                orders.map((order) => (
                  <tr key={order.id} className="hover:bg-zinc-50/50 transition-colors">
                    <td className="p-4 border-r border-zinc-100 font-bold text-zinc-900">
                      <Link 
                        href={`/sc-panel-7k9m2x/orders/${order.id}`}
                        className="text-teal-700 hover:text-teal-900 hover:underline transition-colors font-mono"
                      >
                        {order.id}
                      </Link>
                    </td>
                    <td className="p-4 border-r border-zinc-100 text-zinc-500">{order.date}</td>
                    <td className="p-4 border-r border-zinc-100 text-zinc-700">
                      <p className="font-bold text-zinc-900">{order.shippingAddress.fullName}</p>
                      <p className="text-[10px] text-zinc-500 leading-tight mt-0.5 font-medium">
                        {order.shippingAddress.addressLine}, {order.shippingAddress.city}, {order.shippingAddress.state} - {order.shippingAddress.postalCode} | Phone: {order.shippingAddress.phone}
                      </p>
                    </td>
                    <td className="p-4 border-r border-zinc-100 font-bold text-rose-600">₹{order.totalAmount}</td>
                    <td className="p-4 border-r border-zinc-100">
                      <span className={`inline-block border px-2.5 py-1 text-[9px] font-bold rounded-lg uppercase tracking-wider ${
                        order.paymentStatus === "Paid" 
                          ? "bg-emerald-50 text-emerald-700 border-emerald-200" 
                          : "bg-amber-50 text-amber-700 border-amber-200"
                      }`}>
                        {order.paymentStatus}
                      </span>
                    </td>
                    <td className="p-4 border-r border-zinc-100">
                      <select
                        value={order.status}
                        onChange={(e) => updateOrderStatus(order.id, e.target.value as Order["status"])}
                        className="bg-white border border-zinc-300 rounded-lg px-2.5 py-1.5 text-xs font-semibold text-zinc-700 focus:border-rose-500 focus:outline-none transition-colors cursor-pointer"
                      >
                        <option value="Pending">Pending</option>
                        <option value="Processing">Processing</option>
                        <option value="Shipped">Shipped</option>
                        <option value="Delivered">Delivered</option>
                        <option value="Cancelled">Cancelled</option>
                      </select>
                    </td>
                    <td className="p-4 text-center">
                      <div className="flex items-center justify-center space-x-2">
                        <Link
                          href={`/sc-panel-7k9m2x/orders/${order.id}`}
                          className="inline-flex items-center space-x-1 bg-teal-50 hover:bg-teal-100 text-teal-800 border border-teal-200 px-2.5 py-1.5 rounded-lg text-[11px] font-bold uppercase tracking-wider transition-colors shadow-xs"
                          title="View Details"
                        >
                          <Eye size={12} />
                          <span>Detail</span>
                        </Link>
                        <button
                          onClick={() => handleOpenDeleteModal(order)}
                          className="inline-flex items-center space-x-1 bg-rose-50 hover:bg-rose-100 text-rose-700 border border-rose-200 px-2.5 py-1.5 rounded-lg text-[11px] font-bold uppercase tracking-wider transition-colors shadow-xs"
                          title="Delete / Cancel Order"
                        >
                          <Trash2 size={12} />
                          <span>Delete</span>
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* ─── CONFIRMATION & REASON MODAL ─── */}
      {targetOrder && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-zinc-900/60 backdrop-blur-xs animate-fade-in">
          <div className="bg-white rounded-2xl border border-zinc-200 shadow-2xl max-w-lg w-full p-6 space-y-5 relative">
            <button
              onClick={() => setTargetOrder(null)}
              className="absolute top-4 right-4 text-zinc-400 hover:text-zinc-600 p-1 rounded-lg"
            >
              <X size={18} />
            </button>

            <div className="flex items-start space-x-3">
              <div className="w-10 h-10 bg-rose-100 rounded-full flex items-center justify-center text-rose-600 flex-shrink-0">
                <AlertTriangle size={20} />
              </div>
              <div>
                <h3 className="text-base font-bold text-zinc-900">Confirm Order Deletion / Cancellation</h3>
                <p className="text-xs text-zinc-500 mt-1">
                  Order <strong className="font-mono text-zinc-800">{targetOrder.id}</strong> ({targetOrder.shippingAddress.fullName} - ₹{targetOrder.totalAmount})
                </p>
              </div>
            </div>

            {/* Action Type Mode */}
            <div className="space-y-2 bg-zinc-50 p-3.5 rounded-xl border border-zinc-200 text-xs">
              <label className="block text-[10px] font-bold uppercase tracking-wider text-zinc-600">Deletion Mode</label>
              <div className="space-y-2">
                <label className="flex items-center space-x-2 cursor-pointer">
                  <input
                    type="radio"
                    name="deleteMode"
                    value="cancel"
                    checked={deleteMode === "cancel"}
                    onChange={() => setDeleteMode("cancel")}
                    className="text-rose-600 focus:ring-rose-500"
                  />
                  <span className="font-bold text-zinc-800">Cancel & Display Reason to Customer (Recommended)</span>
                </label>
                <label className="flex items-center space-x-2 cursor-pointer">
                  <input
                    type="radio"
                    name="deleteMode"
                    value="permanent"
                    checked={deleteMode === "permanent"}
                    onChange={() => setDeleteMode("permanent")}
                    className="text-rose-600 focus:ring-rose-500"
                  />
                  <span className="font-semibold text-rose-700">Permanently Delete Record from Database</span>
                </label>
              </div>
            </div>

            {/* Reason Selection */}
            <div className="space-y-3">
              <label className="block text-xs font-bold text-zinc-800">
                Reason for Cancellation / Deletion <span className="text-rose-600">*</span>
              </label>
              <select
                value={reasonPreset}
                onChange={(e) => setReasonPreset(e.target.value)}
                className="w-full bg-white border border-zinc-300 rounded-xl px-3 py-2.5 text-xs font-medium text-zinc-800 focus:border-rose-500 focus:outline-none"
              >
                <option value="Out of Stock">Product Out of Stock</option>
                <option value="Customer Requested Cancellation">Customer Requested Cancellation</option>
                <option value="Delivery Address Unserviceable">Delivery Location Unserviceable</option>
                <option value="Payment Verification Failed">Payment / Fraud Guard Failed</option>
                <option value="Duplicate Order">Duplicate / Test Order</option>
                <option value="Other Reason">Other (Specify below)</option>
              </select>

              <textarea
                value={customReason}
                onChange={(e) => setCustomReason(e.target.value)}
                placeholder="Enter detailed explanation for the client (optional)..."
                rows={3}
                className="w-full bg-white border border-zinc-300 rounded-xl p-3 text-xs text-zinc-800 focus:border-rose-500 focus:outline-none placeholder-zinc-400"
              />
              <p className="text-[10px] text-zinc-400">
                This reason will be stored and displayed to the customer when they view their order history.
              </p>
            </div>

            {/* Modal Controls */}
            <div className="flex items-center justify-end space-x-3 pt-3 border-t border-zinc-100">
              <button
                type="button"
                onClick={() => setTargetOrder(null)}
                className="px-4 py-2.5 bg-white border border-zinc-300 text-zinc-700 text-xs font-bold rounded-xl hover:bg-zinc-50 transition-colors"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleConfirmDelete}
                disabled={isDeleting}
                className="px-5 py-2.5 bg-rose-600 hover:bg-rose-700 disabled:bg-rose-400 text-white text-xs font-bold rounded-xl uppercase tracking-wider flex items-center space-x-1.5 transition-colors shadow-xs"
              >
                {isDeleting ? (
                  <>
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                    <span>Processing...</span>
                  </>
                ) : (
                  <>
                    <Trash2 size={14} />
                    <span>Confirm Delete</span>
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
