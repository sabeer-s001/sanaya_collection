"use client";

import React, { useState, useEffect, Suspense } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { useApp } from "@/context/AppContext";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import ProductCard from "@/components/ProductCard";

function ShopContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { products } = useApp();

  const [selectedCategory, setSelectedCategory] = useState<string>("All");
  const [showBestSellers, setShowBestSellers] = useState(false);
  const [showSale, setShowSale] = useState(false);

  // Initialize from URL params
  useEffect(() => {
    const categoryParam = searchParams.get("category");
    const filterParam = searchParams.get("filter");

    if (categoryParam) {
      setSelectedCategory(categoryParam);
      setShowBestSellers(false);
      setShowSale(false);
    } else if (filterParam === "best-sellers") {
      setShowBestSellers(true);
      setSelectedCategory("All");
      setShowSale(false);
    } else if (filterParam === "sale") {
      setShowSale(true);
      setSelectedCategory("All");
      setShowBestSellers(false);
    } else {
      setSelectedCategory("All");
      setShowBestSellers(false);
      setShowSale(false);
    }
  }, [searchParams]);

  const getFilteredProducts = () => {
    let filtered = products;

    if (selectedCategory !== "All") {
      filtered = filtered.filter(p => p.category === selectedCategory);
    }

    if (showBestSellers) {
      filtered = filtered.filter(p => p.isBestSeller);
    }

    if (showSale) {
      filtered = filtered.filter(p => p.isSale);
    }

    return filtered;
  };

  const getPageTitle = () => {
    if (selectedCategory !== "All") {
      return selectedCategory;
    }
    if (showBestSellers) {
      return "Best Sellers";
    }
    if (showSale) {
      return "Special Offers";
    }
    return "Our Collection";
  };

  const filteredProducts = getFilteredProducts();

  return (
    <div className="flex flex-col min-h-screen bg-brand-bg">
      <Navbar />

      {/* Page Header (Reduced top/bottom padding) */}
      <div className="bg-white border-b border-brand-primary/10 pt-20 pb-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h1 className="font-serif text-3xl md:text-5xl font-medium tracking-wide text-brand-text">
            {getPageTitle()}
          </h1>
        </div>
      </div>

      {/* Main content grid (Reduced padding: py-8 instead of py-12) */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 w-full flex-1">
        
        {/* Product Grid */}
        <div className="w-full">
          <div className="flex justify-between items-center mb-6">
            <span className="text-xs uppercase tracking-wider text-neutral-400 font-semibold">
              Showing {filteredProducts.length} products
            </span>
          </div>

          {filteredProducts.length === 0 ? (
            <div className="text-center py-20 bg-white rounded-[4px] border border-neutral-100">
              <p className="font-serif text-brand-text text-lg mb-2">No products found</p>
              <p className="text-sm text-neutral-400">We couldn&apos;t find any products in this category.</p>
            </div>
          ) : (
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 sm:gap-6">
              {filteredProducts.map((product) => (
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
          )}
        </div>
      </div>

      <Footer />
    </div>
  );
}

export default function Shop() {
  return (
    <Suspense fallback={
      <div className="h-screen w-screen flex flex-col items-center justify-center bg-brand-bg text-brand-accent">
        <span className="font-serif text-3xl font-bold animate-pulse tracking-widest">SANAYA</span>
      </div>
    }>
      <ShopContent />
    </Suspense>
  );
}
