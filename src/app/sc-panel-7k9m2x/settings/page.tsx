"use client";

import React, { useState, useEffect } from "react";
import { useApp } from "@/context/AppContext";
import { Truck, Save, CheckCircle, ShieldCheck } from "lucide-react";

export default function AdminSettingsPage() {
  const { session } = useApp();
  const [shippingFee, setShippingFee] = useState<number>(150);
  const [freeShippingThreshold, setFreeShippingThreshold] = useState<number>(1999);
  const [loading, setLoading] = useState<boolean>(true);
  const [saving, setSaving] = useState<boolean>(false);
  const [feedback, setFeedback] = useState<{ success: boolean; message: string } | null>(null);

  useEffect(() => {
    const fetchSettings = async () => {
      try {
        const res = await fetch("/api/settings");
        if (res.ok) {
          const data = await res.json();
          if (data.shippingFee !== undefined) setShippingFee(data.shippingFee);
          if (data.freeShippingThreshold !== undefined) setFreeShippingThreshold(data.freeShippingThreshold);
        }
      } catch (err) {
        console.error("Failed to load settings", err);
      } finally {
        setLoading(false);
      }
    };

    fetchSettings();
  }, []);

  const handleSaveSettings = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setFeedback(null);

    try {
      const res = await fetch("/api/settings", {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${session?.token || ""}`
        },
        body: JSON.stringify({
          shippingFee: Number(shippingFee),
          freeShippingThreshold: Number(freeShippingThreshold)
        })
      });

      if (res.ok) {
        const data = await res.json();
        setShippingFee(data.shippingFee);
        setFreeShippingThreshold(data.freeShippingThreshold);
        setFeedback({ success: true, message: "Delivery & Shipping settings updated successfully!" });
      } else {
        const err = await res.json();
        setFeedback({ success: false, message: err.error || "Failed to update settings" });
      }
    } catch (err: any) {
      setFeedback({ success: false, message: err.message || "Network error" });
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="space-y-6 max-w-4xl">
      <div className="border-b border-zinc-200 pb-4">
        <h1 className="text-2xl font-bold tracking-tight text-zinc-900">Delivery & Shipping Settings</h1>
        <p className="text-xs text-zinc-500 mt-1">Configure global delivery charges and free shipping order threshold for your store.</p>
      </div>

      {feedback && (
        <div className={`p-4 rounded-xl text-xs font-semibold flex items-center space-x-2 ${
          feedback.success ? "bg-emerald-50 text-emerald-800 border border-emerald-200" : "bg-rose-50 text-rose-800 border border-rose-200"
        }`}>
          {feedback.success && <CheckCircle size={16} className="text-emerald-600" />}
          <span>{feedback.message}</span>
        </div>
      )}

      {loading ? (
        <div className="p-8 text-center text-zinc-400 text-xs font-semibold animate-pulse">Loading Store Settings...</div>
      ) : (
        <form onSubmit={handleSaveSettings} className="bg-white border border-zinc-200 rounded-2xl p-6 sm:p-8 space-y-6 shadow-sm">
          <div className="flex items-center space-x-3 border-b border-zinc-100 pb-4">
            <div className="p-3 bg-teal-50 text-teal-700 rounded-xl">
              <Truck size={22} />
            </div>
            <div>
              <h2 className="text-base font-bold text-zinc-900">Shipping & Logistics Charges</h2>
              <p className="text-xs text-zinc-500">Applies automatically to customer checkout totals.</p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Standard Delivery Charge */}
            <div className="space-y-2">
              <label className="text-xs font-bold uppercase tracking-wider text-zinc-700 block">
                Standard Shipping Fee (₹)
              </label>
              <div className="relative">
                <span className="absolute left-3.5 top-3.5 text-zinc-400 font-bold text-xs">₹</span>
                <input
                  type="number"
                  min="0"
                  required
                  value={shippingFee}
                  onChange={(e) => setShippingFee(Number(e.target.value))}
                  className="w-full text-sm font-semibold pl-8 p-3 border border-zinc-200 rounded-xl focus:outline-none focus:border-teal-600 bg-zinc-50/50"
                  placeholder="150"
                />
              </div>
              <p className="text-[10px] text-zinc-500 leading-relaxed">
                The standard flat shipping fee charged when an order does not qualify for free shipping.
              </p>
            </div>

            {/* Free Shipping Order Threshold */}
            <div className="space-y-2">
              <label className="text-xs font-bold uppercase tracking-wider text-zinc-700 block">
                Free Shipping Threshold (₹)
              </label>
              <div className="relative">
                <span className="absolute left-3.5 top-3.5 text-zinc-400 font-bold text-xs">₹</span>
                <input
                  type="number"
                  min="0"
                  required
                  value={freeShippingThreshold}
                  onChange={(e) => setFreeShippingThreshold(Number(e.target.value))}
                  className="w-full text-sm font-semibold pl-8 p-3 border border-zinc-200 rounded-xl focus:outline-none focus:border-teal-600 bg-zinc-50/50"
                  placeholder="1999"
                />
              </div>
              <p className="text-[10px] text-zinc-500 leading-relaxed">
                Orders with subtotal equal to or above this amount automatically receive FREE shipping. Set to 0 to make all orders free shipping.
              </p>
            </div>
          </div>

          {/* GST Notice */}
          <div className="bg-amber-50/60 border border-amber-200/80 rounded-xl p-4 flex items-start space-x-3 text-xs text-amber-900">
            <ShieldCheck size={18} className="text-amber-700 flex-shrink-0 mt-0.5" />
            <div>
              <p className="font-bold">GST Notice</p>
              <p className="text-[11px] text-amber-800 mt-0.5">
                GST / Goods & Services Tax calculation is disabled across the storefront as per your settings. All prices are final.
              </p>
            </div>
          </div>

          {/* Action */}
          <div className="pt-4 border-t border-zinc-100 flex justify-end">
            <button
              type="submit"
              disabled={saving}
              className="bg-teal-700 hover:bg-teal-800 disabled:opacity-50 text-white text-xs px-8 py-3 rounded-xl font-bold uppercase tracking-wider transition-colors shadow-sm flex items-center space-x-2"
            >
              <Save size={16} />
              <span>{saving ? "Saving Changes..." : "Save Delivery Settings"}</span>
            </button>
          </div>
        </form>
      )}
    </div>
  );
}
