"use client";

import React from "react";
import { Sparkles, Lock, Truck, RotateCcw } from "lucide-react";

export default function PromiseSection() {
  return (
    <section className="py-24 bg-white border-t border-neutral-100">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
        {/* Header */}
        <div className="max-w-xl mx-auto mb-16">
          <span className="text-[10px] uppercase tracking-[0.3em] text-neutral-400 block mb-2.5 font-semibold">
            Our Commitment
          </span>
          <h2 className="font-serif text-3xl sm:text-4xl font-normal tracking-wide text-neutral-900">The Sanaya Promise</h2>
          <div className="w-12 h-[1px] bg-brand-accent/20 mx-auto mt-5" />
        </div>

        {/* Promise Grid */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-y-12 gap-x-6 sm:gap-x-8 lg:gap-x-12">
          {/* Card 1 */}
          <div className="flex flex-col items-center group">
            <div className="p-4 border border-neutral-100/80 rounded-full text-neutral-800 bg-neutral-50/50 group-hover:bg-neutral-900 group-hover:text-white group-hover:border-neutral-900 transition-all duration-500 ease-out mb-5 shadow-sm">
              <Sparkles size={20} strokeWidth={1.5} />
            </div>
            <h3 className="font-serif text-sm tracking-wider uppercase font-medium text-neutral-900">
              Premium Quality
            </h3>
            <p className="text-xs text-neutral-400 font-light mt-2.5 max-w-[220px] leading-relaxed tracking-wide">
              Curated luxury fabrics featuring authentic hand-crafted details and premium finishes.
            </p>
          </div>

          {/* Card 2 */}
          <div className="flex flex-col items-center group">
            <div className="p-4 border border-neutral-100/80 rounded-full text-neutral-800 bg-neutral-50/50 group-hover:bg-neutral-900 group-hover:text-white group-hover:border-neutral-900 transition-all duration-500 ease-out mb-5 shadow-sm">
              <Lock size={20} strokeWidth={1.5} />
            </div>
            <h3 className="font-serif text-sm tracking-wider uppercase font-medium text-neutral-900">
              Secure Payments
            </h3>
            <p className="text-xs text-neutral-400 font-light mt-2.5 max-w-[220px] leading-relaxed tracking-wide">
              100% secure checkout and encryption powered by India&apos;s leading payment gateways.
            </p>
          </div>

          {/* Card 3 */}
          <div className="flex flex-col items-center group">
            <div className="p-4 border border-neutral-100/80 rounded-full text-neutral-800 bg-neutral-50/50 group-hover:bg-neutral-900 group-hover:text-white group-hover:border-neutral-900 transition-all duration-500 ease-out mb-5 shadow-sm">
              <Truck size={20} strokeWidth={1.5} />
            </div>
            <h3 className="font-serif text-sm tracking-wider uppercase font-medium text-neutral-900">
              Express Delivery
            </h3>
            <p className="text-xs text-neutral-400 font-light mt-2.5 max-w-[220px] leading-relaxed tracking-wide">
              Fast, insured shipping with full online parcel tracking direct to your doorstep.
            </p>
          </div>

          {/* Card 4 */}
          <div className="flex flex-col items-center group">
            <div className="p-4 border border-neutral-100/80 rounded-full text-neutral-800 bg-neutral-50/50 group-hover:bg-neutral-900 group-hover:text-white group-hover:border-neutral-900 transition-all duration-500 ease-out mb-5 shadow-sm">
              <RotateCcw size={20} strokeWidth={1.5} />
            </div>
            <h3 className="font-serif text-sm tracking-wider uppercase font-medium text-neutral-900">
              Hassle-Free Returns
            </h3>
            <p className="text-xs text-neutral-400 font-light mt-2.5 max-w-[220px] leading-relaxed tracking-wide">
              Enjoy complete peace of mind with our straightforward, easy 7-day return policy.
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}
