"use client";

import React, { Suspense } from "react";
import { useRouter } from "next/navigation";
import { useApp } from "@/context/AppContext";
import Navbar from "@/components/Navbar";
import HeroSlider from "@/components/HeroSlider";
import ProductCard from "@/components/ProductCard";
import Footer from "@/components/Footer";
import CollectionsSection from "@/components/CollectionsSection";
import PromotionalBanner from "@/components/PromotionalBanner";
import PromiseSection from "@/components/PromiseSection";
import InstagramSection from "@/components/InstagramSection";
import NewsletterSection from "@/components/NewsletterSection";
import SocialCommunity from "@/components/SocialCommunity";
import { motion } from "framer-motion";

function HomeContent() {
  const router = useRouter();
  const { products } = useApp();

  // Show a default slice of 8 products on the homepage (e.g. New Arrivals)
  const displayProducts = products.slice(0, 8);

  return (
    <div className="flex flex-col min-h-screen">
      <Navbar />

      {/* Hero Section */}
      <HeroSlider />

      {/* Category Card Section */}
      <CollectionsSection />

      {/* Dynamic Products display (New Arrivals) */}
      <section id="products-display-section" className="py-8 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Header */}
          <div className="text-center max-w-xl mx-auto mb-14">
            <span className="text-[10px] uppercase tracking-[0.3em] text-neutral-400 block mb-3 font-semibold">
              The Latest Creations
            </span>
            <h2 className="font-serif text-3xl sm:text-4xl lg:text-5xl font-normal tracking-wide text-brand-text">
              New Arrivals
            </h2>
            <div className="w-12 h-[1px] bg-brand-accent/20 mx-auto mt-5" />
          </div>

          {/* Product Cards Grid */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
            {displayProducts.map((product) => (
              <ProductCard
                key={product.id}
                product={product}
                badge={
                  product.isBestSeller
                    ? "best-seller"
                    : product.isFastSelling
                      ? "fast-selling"
                      : product.isSale
                        ? "sale"
                        : undefined
                }
              />
            ))}
          </div>

          <div className="text-center mt-16">
            <button
              onClick={() => router.push("/shop")}
              className="border border-neutral-900 text-neutral-900 hover:bg-neutral-900 hover:text-white transition-colors duration-300 ease-out px-10 py-3.5 rounded-[2px] text-[10px] font-semibold uppercase tracking-[0.25em]"
            >
              View All Products
            </button>
          </div>
        </div>
      </section>

      {/* Promotional Banner Section */}
      <PromotionalBanner />
      {/* Instagram Section */}
      <InstagramSection />


      {/* Best Sellers Section */}
      <section className="py-12 sm:py-16 bg-neutral-50/70 border-y border-neutral-100/30">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Header */}
          <div className="text-center max-w-xl mx-auto mb-16">
            <span className="text-[10px] uppercase tracking-[0.3em] text-neutral-400 block mb-3 font-semibold">
              Curated Favorites
            </span>
            <h2 className="font-serif text-3xl sm:text-4xl lg:text-5xl font-normal tracking-wide text-brand-text">
              Our Best Sellers
            </h2>
            <div className="w-12 h-[1px] bg-brand-accent/20 mx-auto mt-5" />
          </div>

          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
            {products.filter(p => p.isBestSeller).slice(0, 4).map((product) => (
              <ProductCard key={product.id} product={product} badge="best-seller" />
            ))}
          </div>
        </div>
      </section>

      {/* Social Proof & Platforms Community Section */}
      <SocialCommunity />




      {/* Why Choose Us Section */}
      <PromiseSection />


      {/* Newsletter Section */}
      <NewsletterSection />

      <Footer />
    </div>
  );
}

export default function Home() {
  return (
    <Suspense fallback={
      <div className="h-screen w-screen flex flex-col items-center justify-center bg-brand-bg text-brand-accent">
        <span className="font-serif text-3xl font-bold animate-pulse tracking-widest">SANAYA</span>
        <span className="text-[10px] uppercase tracking-[0.2em] mt-1 font-semibold animate-pulse">Loading Luxury...</span>
      </div>
    }>
      <HomeContent />
    </Suspense>
  );
}
