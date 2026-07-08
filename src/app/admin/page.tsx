"use client";

import React from "react";
import { useRouter } from "next/navigation";
import { useApp, Product } from "@/context/AppContext";
import { 
  DollarSign, 
  ClipboardList, 
  Tags, 
  UserCheck
} from "lucide-react";

export default function AdminAnalyticsPage() {
  const router = useRouter();
  const { products, orders, users } = useApp();

  // Analytics calculations
  const totalRevenue = orders.reduce((acc, order) => acc + order.totalAmount, 0);
  const totalOrders = orders.length;
  const totalProducts = products.length;
  const totalCustomers = users.filter(u => u.role === "customer").length;

  // Best sellers analysis (Aggregate items ordered)
  const getBestSellersData = () => {
    const counts: Record<string, { product: Product; qty: number }> = {};
    orders.forEach(order => {
      order.items.forEach(item => {
        if (!counts[item.product.id]) {
          counts[item.product.id] = { product: item.product, qty: 0 };
        }
        counts[item.product.id].qty += item.quantity;
      });
    });
    return Object.values(counts).sort((a, b) => b.qty - a.qty).slice(0, 5);
  };

  const bestSellersSummary = getBestSellersData();

  return (
    <div className="space-y-8 animate-fade-in">
      <div>
        <h1 className="text-2xl font-serif font-bold tracking-tight text-zinc-900">Overview Stats</h1>
        <p className="text-xs text-zinc-500 mt-1">Real-time statistics & key store summaries</p>
      </div>

      {/* STAT CARDS */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        
        <div className="p-6 bg-white rounded-2xl border border-zinc-200/80 flex items-center justify-between shadow-xs">
          <div className="space-y-2">
            <span className="text-[10px] font-bold text-zinc-400 uppercase tracking-wider">Total Sales Revenue</span>
            <p className="text-2xl font-bold text-zinc-900">₹{totalRevenue}</p>
          </div>
          <div className="p-3 bg-emerald-50 text-emerald-700 rounded-xl border border-emerald-100">
            <DollarSign size={20} />
          </div>
        </div>

        <div className="p-6 bg-white rounded-2xl border border-zinc-200/80 flex items-center justify-between shadow-xs">
          <div className="space-y-2">
            <span className="text-[10px] font-bold text-zinc-400 uppercase tracking-wider">Client Orders</span>
            <p className="text-2xl font-bold text-zinc-900">{totalOrders}</p>
          </div>
          <div className="p-3 bg-teal-50 text-teal-700 rounded-xl border border-teal-100">
            <ClipboardList size={20} />
          </div>
        </div>

        <div className="p-6 bg-white rounded-2xl border border-zinc-200/80 flex items-center justify-between shadow-xs">
          <div className="space-y-2">
            <span className="text-[10px] font-bold text-zinc-400 uppercase tracking-wider">Active SKU Catalog</span>
            <p className="text-2xl font-bold text-zinc-900">{totalProducts}</p>
          </div>
          <div className="p-3 bg-blue-50 text-blue-700 rounded-xl border border-blue-100">
            <Tags size={20} />
          </div>
        </div>

        <div className="p-6 bg-white rounded-2xl border border-zinc-200/80 flex items-center justify-between shadow-xs">
          <div className="space-y-2">
            <span className="text-[10px] font-bold text-zinc-400 uppercase tracking-wider">Registered Base</span>
            <p className="text-2xl font-bold text-zinc-900">{totalCustomers}</p>
          </div>
          <div className="p-3 bg-amber-50 text-amber-700 rounded-xl border border-amber-100">
            <UserCheck size={20} />
          </div>
        </div>

      </div>

      {/* DETAILS ROW */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        
        {/* TOP SELLERS */}
        <div className="bg-white border border-zinc-200/80 rounded-2xl p-6 shadow-xs space-y-4">
          <h2 className="text-xs font-bold uppercase tracking-wider text-zinc-400 border-b border-zinc-100 pb-3">Top Selling Garments</h2>
          {bestSellersSummary.length === 0 ? (
            <p className="text-xs text-zinc-400 py-4">No order items recorded in the database yet.</p>
          ) : (
            <div className="divide-y divide-zinc-100">
              {bestSellersSummary.map((item, idx) => (
                <div key={idx} className="py-3 flex items-center justify-between first:pt-0 last:pb-0">
                  <div className="flex items-center space-x-3">
                    <div className="w-10 h-12 rounded-lg overflow-hidden border border-zinc-200 bg-zinc-50 flex-shrink-0">
                      <img src={item.product.images[0]} alt="" className="w-full h-full object-cover" />
                    </div>
                    <div className="text-xs space-y-0.5">
                      <p className="font-bold text-zinc-900">{item.product.name}</p>
                      <p className="text-zinc-500 text-[10px] font-medium uppercase">{item.product.category}</p>
                    </div>
                  </div>
                  <div className="text-right text-xs">
                    <p className="font-bold text-teal-700">{item.qty} Sold</p>
                    <p className="text-zinc-500 text-[10px]">₹{item.product.salePrice * item.qty}</p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* OPERATIONAL CARD */}
        <div className="bg-white border border-zinc-200/80 rounded-2xl p-6 shadow-xs flex flex-col justify-between space-y-4">
          <div className="space-y-3">
            <h2 className="text-xs font-bold uppercase tracking-wider text-zinc-400 border-b border-zinc-100 pb-3">Administrative Control</h2>
            <p className="text-xs text-zinc-600 leading-relaxed">
              Use the panels on the left to add items to the store inventory, view user profile directories, update payment states, and control shipping/delivery schedules for client orders.
            </p>
          </div>
          <div className="grid grid-cols-2 gap-4 pt-4">
            <button
              onClick={() => router.push("/admin/products")}
              className="bg-teal-700 hover:bg-teal-800 text-white text-xs py-3 px-4 rounded-xl font-bold uppercase tracking-wider text-center transition-colors shadow-xs"
            >
              Manage Inventory
            </button>
            <button
              onClick={() => router.push("/admin/orders")}
              className="bg-zinc-100 hover:bg-zinc-200 text-zinc-800 text-xs py-3 px-4 rounded-xl font-bold uppercase tracking-wider text-center border border-zinc-200 transition-colors shadow-xs"
            >
              Manage Orders
            </button>
          </div>
        </div>

      </div>
    </div>
  );
}
