"use client";

import React from "react";
import Link from "next/link";
import { useApp, Order } from "@/context/AppContext";
import { Eye } from "lucide-react";

export default function AdminOrdersPage() {
  const { orders, updateOrderStatus } = useApp();

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight text-zinc-900">Client Orders</h1>
        <p className="text-xs text-zinc-500 mt-1">Review checkouts and update shipping/dispatch states</p>
      </div>

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
                        href={`/admin/orders/${order.id}`}
                        className="text-teal-700 hover:text-teal-900 hover:underline transition-colors"
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
                      </select>
                    </td>
                    <td className="p-4 text-center">
                      <Link
                        href={`/admin/orders/${order.id}`}
                        className="inline-flex items-center space-x-1 bg-teal-50 hover:bg-teal-100 text-teal-800 border border-teal-200 px-3 py-1.5 rounded-lg text-[11px] font-bold uppercase tracking-wider transition-colors shadow-xs"
                      >
                        <Eye size={12} />
                        <span>Detail</span>
                      </Link>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
