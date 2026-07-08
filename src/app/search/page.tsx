"use client";

import React, { useState, useEffect, Suspense } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { useApp } from "@/context/AppContext";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import ProductCard from "@/components/ProductCard";
import { Search, ArrowRight, X } from "lucide-react";

const POPULAR_SEARCHES = ["Shalwar Kameez", "Kurti", "Bridal Wear", "Party Wear"];

function SearchContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { products } = useApp();
  
  const queryParam = searchParams.get("q") || "";
  const [localQuery, setLocalQuery] = useState(queryParam);
  
  useEffect(() => {
    setLocalQuery(queryParam);
  }, [queryParam]);

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (localQuery.trim()) {
      router.push(`/search?q=${encodeURIComponent(localQuery.trim())}`);
    }
  };

  const getFilteredProducts = () => {
    if (!queryParam.trim()) return [];
    
    const term = queryParam.toLowerCase().trim();
    return products.filter(
      (p) =>
        p.name.toLowerCase().includes(term) ||
        p.category.toLowerCase().includes(term) ||
        p.fabric.toLowerCase().includes(term) ||
        p.description.toLowerCase().includes(term)
    );
  };

  const filteredProducts = getFilteredProducts();

  return (
    <div className="flex flex-col min-h-screen bg-brand-bg">
      <Navbar />

      {/* Page Header */}
      <div className="bg-white border-b border-brand-primary/10 pt-28 pb-12">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <h1 className="font-serif text-2xl md:text-3xl text-center text-brand-text mb-6">
            {queryParam ? (
              <span>
                Search Results for <span className="font-bold font-sans italic">&ldquo;{queryParam}&rdquo;</span>
              </span>
            ) : (
              <span>Search Our Collection</span>
            )}
          </h1>
          
          {/* Inner Search Box */}
          <form onSubmit={handleSearchSubmit} className="relative max-w-xl mx-auto">
            <input
              type="text"
              value={localQuery}
              onChange={(e) => setLocalQuery(e.target.value)}
              placeholder="Search by collection, fabric or style..."
              className="w-full bg-brand-bg text-brand-text text-sm px-6 py-3.5 pr-12 rounded-full border border-brand-lightGray focus:border-brand-accent focus:outline-none focus:ring-1 focus:ring-brand-accent transition-colors"
            />
            {localQuery && (
              <button
                type="button"
                onClick={() => setLocalQuery("")}
                className="absolute right-12 top-1/2 -translate-y-1/2 text-brand-darkGray hover:text-brand-text p-1 transition-colors"
              >
                <X size={16} />
              </button>
            )}
            <button
              type="submit"
              className="absolute right-4 top-1/2 -translate-y-1/2 text-brand-darkGray hover:text-brand-accent p-1 animate-pulse"
            >
              <Search size={18} />
            </button>
          </form>
        </div>
      </div>

      {/* Results Section */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 w-full flex-grow">
        {queryParam ? (
          <div>
            <div className="flex justify-between items-center mb-8 border-b border-brand-lightGray pb-4">
              <span className="text-xs tracking-wider uppercase font-semibold text-brand-darkGray">
                {filteredProducts.length} {filteredProducts.length === 1 ? "Product" : "Products"} Found
              </span>
              {filteredProducts.length > 0 && (
                <span className="text-xs text-brand-darkGray font-light">
                  Showing matches in names, categories, and fabrics
                </span>
              )}
            </div>

            {filteredProducts.length === 0 ? (
              <div className="max-w-md mx-auto text-center py-16">
                <p className="font-serif text-brand-text text-lg mb-2">No matching products found</p>
                <p className="text-xs text-brand-darkGray mb-8 leading-relaxed">
                  We couldn&rsquo;t find anything matching &ldquo;{queryParam}&rdquo;. Check the spelling or try searching for another term.
                </p>
                
                <div className="bg-white p-6 rounded-2xl border border-brand-lightGray/80 shadow-sm">
                  <h4 className="font-serif text-xs text-brand-text uppercase tracking-widest font-semibold mb-4">
                    Popular Searches
                  </h4>
                  <div className="flex flex-wrap justify-center gap-2">
                    {POPULAR_SEARCHES.map((term) => (
                      <button
                        key={term}
                        onClick={() => router.push(`/search?q=${encodeURIComponent(term)}`)}
                        className="border border-brand-lightGray hover:border-brand-text text-brand-darkGray hover:text-brand-text text-[11px] px-3.5 py-1.5 rounded-full transition-all duration-300"
                      >
                        {term}
                      </button>
                    ))}
                  </div>
                </div>
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
        ) : (
          <div className="max-w-2xl mx-auto py-12">
            <div className="bg-white p-8 rounded-2xl border border-brand-lightGray text-center space-y-6">
              <h3 className="font-serif text-xl font-semibold text-brand-text">What can we help you find?</h3>
              <p className="text-xs text-brand-darkGray max-w-sm mx-auto leading-relaxed">
                Search our extensive collection of designer Pakistani suits, kurtas, and luxury festive wear.
              </p>
              
              <div className="pt-6 border-t border-brand-lightGray">
                <h4 className="font-serif text-xs text-brand-text uppercase tracking-widest font-semibold mb-4">
                  Browse Popular Categories
                </h4>
                <div className="flex flex-wrap justify-center gap-3">
                  {["Shalwar Kameez", "Kurtis", "Bridal Wear", "Party Wear", "Casuals"].map((cat) => (
                    <button
                      key={cat}
                      onClick={() => router.push(`/shop?category=${encodeURIComponent(cat)}`)}
                      className="border border-brand-lightGray hover:border-brand-accent text-brand-darkGray hover:text-brand-text text-xs px-4 py-2 rounded-full transition-all flex items-center space-x-1"
                    >
                      <span>{cat}</span>
                      <ArrowRight size={10} className="text-brand-accent/50" />
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </div>
        )}
      </main>

      <Footer />
    </div>
  );
}

export default function SearchPage() {
  return (
    <Suspense
      fallback={
        <div className="h-screen w-screen flex flex-col items-center justify-center bg-brand-bg text-brand-accent">
          <span className="font-serif text-3xl font-bold animate-pulse tracking-widest">SANAYA</span>
        </div>
      }
    >
      <SearchContent />
    </Suspense>
  );
}
