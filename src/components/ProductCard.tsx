"use client";

import React, { useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { useApp, Product } from "@/context/AppContext";
import { Heart, ShoppingBag, Eye, Star, X } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

interface ProductCardProps {
  product: Product;
  badge?: "best-seller" | "fast-selling" | "sale";
}

function ProductCard({ product, badge }: ProductCardProps) {
  const { wishlist, toggleWishlist, addToCart } = useApp();
  const [isHovered, setIsHovered] = useState(false);
  const [isQuickViewOpen, setIsQuickViewOpen] = useState(false);
  
  // Selected options for Quick View
  const [selectedSize, setSelectedSize] = useState(product?.sizes?.[0] || "");
  const [selectedColor, setSelectedColor] = useState(product?.colors?.[0] || "");
  const [quantity, setQuantity] = useState(1);
  const [isAdded, setIsAdded] = useState(false);

  const isWishlisted = wishlist.includes(product.id);

  const handleAddToCart = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    addToCart(product, selectedSize, selectedColor, 1);
    setIsAdded(true);
    setTimeout(() => setIsAdded(false), 2000);
  };

  const handleQuickViewAdd = () => {
    addToCart(product, selectedSize, selectedColor, quantity);
    setIsAdded(true);
    setTimeout(() => {
      setIsAdded(false);
      setIsQuickViewOpen(false);
    }, 1500);
  };

  return (
    <>
      <div 
        className="group relative flex flex-col bg-white rounded-[4px] overflow-hidden border border-neutral-100/60 hover:border-neutral-200 shadow-[0_4px_12px_rgba(0,0,0,0.02)] hover:shadow-[0_12px_32px_rgba(0,0,0,0.06)] transition-all duration-500 ease-out h-full"
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
      >
        {/* Product Images Box */}
        <div className="relative block aspect-[3/4] overflow-hidden bg-neutral-50 w-full cursor-pointer">
          {/* Invisible navigation link — sits below buttons so they remain clickable */}
          <Link href={`/product/${product.id}`} className="absolute inset-0 z-[1]" aria-label={product.name} />
          
          {/* Luxury Badges */}
          {badge === "best-seller" && (
            <span className="absolute top-3 left-3 z-10 border border-brand-accent/10 bg-white/90 backdrop-blur-[2px] text-brand-text text-[8px] font-semibold tracking-[0.2em] px-2.5 py-1 rounded-[2px] shadow-sm">
              BEST SELLER
            </span>
          )}
          {badge === "fast-selling" && (
            <span className="absolute top-3 left-3 z-10 border border-brand-accent/10 bg-white/90 backdrop-blur-[2px] text-brand-text text-[8px] font-semibold tracking-[0.2em] px-2.5 py-1 rounded-[2px] shadow-sm">
              FAST SELLING
            </span>
          )}
          {badge === "sale" && (
            <span className="absolute top-3 left-3 z-10 border border-red-500/10 bg-red-50/90 backdrop-blur-[2px] text-red-700 text-[8px] font-semibold tracking-[0.2em] px-2.5 py-1 rounded-[2px] shadow-sm">
              SALE
            </span>
          )}
          {!badge && product.discount >= 40 && (
            <span className="absolute top-3 left-3 z-10 border border-red-500/10 bg-red-50/90 backdrop-blur-[2px] text-red-700 text-[8px] font-semibold tracking-[0.2em] px-2.5 py-1 rounded-[2px] shadow-sm">
              {product.discount}% OFF
            </span>
          )}

          {/* Stock Tag */}
          {!product.inStock && (
            <div className="absolute inset-0 bg-neutral-900/40 backdrop-blur-[1px] z-10 flex items-center justify-center">
              <span className="bg-white border border-neutral-100 text-brand-text text-[9px] font-semibold tracking-[0.2em] uppercase px-4 py-2 rounded-[2px] shadow-md">
                OUT OF STOCK
              </span>
            </div>
          )}

          {/* Image Swap with Smooth Zoom & Slow Transition */}
          <Image
            src={product.images[0]}
            alt={product.name}
            fill
            sizes="(max-width: 640px) 50vw, (max-width: 1024px) 25vw, 200px"
            className={`object-cover object-center transition-all duration-[1200ms] ease-out ${
              isHovered && product.images[1] ? "opacity-0 scale-105" : "opacity-100 scale-100"
            }`}
          />
          {product.images[1] && (
            <Image
              src={product.images[1]}
              alt={`${product.name} alternate view`}
              fill
              sizes="(max-width: 640px) 50vw, (max-width: 1024px) 25vw, 200px"
              className={`absolute inset-0 object-cover object-center transition-all duration-[1200ms] ease-out ${
                isHovered ? "opacity-100 scale-105" : "opacity-0 scale-100"
              }`}
            />
          )}

          {/* Slide up split Quick Actions Panel */}
          <div className="absolute inset-x-0 bottom-0 z-20 translate-y-full group-hover:translate-y-0 transition-transform duration-300 ease-out flex">
            <button
              onClick={(e) => {
                e.preventDefault();
                e.stopPropagation();
                setIsQuickViewOpen(true);
              }}
              className="flex-1 py-3 bg-white/95 hover:bg-brand-accent hover:text-white text-brand-text text-[9px] font-semibold tracking-[0.2em] uppercase transition-colors duration-300 border-t border-r border-neutral-100 flex items-center justify-center space-x-1.5 backdrop-blur-[2px]"
            >
              <Eye size={12} />
              <span>Quick View</span>
            </button>
            <button
              disabled={!product.inStock}
              onClick={handleAddToCart}
              className={`flex-1 py-3 text-[9px] font-semibold tracking-[0.2em] uppercase transition-colors duration-300 border-t border-neutral-100 flex items-center justify-center space-x-1.5 backdrop-blur-[2px] ${
                !product.inStock
                  ? "bg-neutral-50 text-neutral-400 cursor-not-allowed"
                  : isAdded
                    ? "bg-green-600 text-white border-t-green-600"
                    : "bg-white/95 text-brand-text hover:bg-brand-accent hover:text-white"
              }`}
            >
              <ShoppingBag size={12} />
              <span>{isAdded ? "Added" : "Quick Add"}</span>
            </button>
          </div>

          {/* Wishlist Button Overlay */}
          <button
            onClick={(e) => {
              e.preventDefault();
              e.stopPropagation();
              toggleWishlist(product.id);
            }}
            className="absolute top-3 right-3 z-20 p-2 bg-white/80 hover:bg-white text-brand-text hover:text-brand-accent rounded-full shadow-[0_2px_8px_rgba(0,0,0,0.04)] backdrop-blur-[2px] transition-all duration-300 ease-out"
            title="Add to Wishlist"
            aria-label={isWishlisted ? "Remove from Wishlist" : "Add to Wishlist"}
          >
            <Heart 
              size={14} 
              className={`transition-all duration-300 ${isWishlisted ? "fill-brand-accent text-brand-accent scale-110" : "text-neutral-500"}`} 
            />
          </button>
        </div>

        {/* Content Box */}
        <div className="p-4 sm:p-5 flex-1 flex flex-col justify-between bg-white">
          <div className="mb-3">
            {/* Category tag */}
            <p className="text-[9px] uppercase tracking-[0.25em] font-semibold text-neutral-400 mb-1.5">
              {product.category}
            </p>
            {/* Name */}
            <h3 className="font-serif text-base font-normal tracking-wide text-neutral-900 group-hover:text-neutral-600 transition-colors duration-300 leading-snug line-clamp-1">
              <Link href={`/product/${product.id}`}>{product.name}</Link>
            </h3>
          </div>

          {/* Pricing display */}
          <div className="pt-2 flex items-baseline justify-between border-t border-neutral-50">
            <div className="flex items-baseline space-x-2">
              <span className="text-base font-medium text-neutral-900">₹{product.salePrice}</span>
              {product.originalPrice > product.salePrice && (
                <span className="text-xs text-neutral-400 line-through">₹{product.originalPrice}</span>
              )}
            </div>
            {product.discount > 0 && (
              <span className="text-[9px] font-semibold tracking-wider text-red-500 uppercase">
                {product.discount}% OFF
              </span>
            )}
          </div>
        </div>
      </div>

      {/* Quick View Modal */}
      <AnimatePresence>
        {isQuickViewOpen && (
          <div className="fixed inset-0 z-[102] flex items-center justify-center p-4 sm:p-6 overflow-y-auto">
            {/* Backdrop */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 0.5 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsQuickViewOpen(false)}
              className="fixed inset-0 bg-neutral-950/40 backdrop-blur-[2px]"
            />

            {/* Modal Box */}
            <motion.div
              initial={{ opacity: 0, scale: 0.98, y: 10 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.98, y: 10 }}
              transition={{ duration: 0.3, ease: "easeOut" }}
              className="bg-white w-full max-w-4xl rounded-[4px] overflow-hidden shadow-2xl relative z-10 flex flex-col md:flex-row max-h-[90vh] md:max-h-[80vh] overflow-y-auto"
            >
              {/* Close Button */}
              <button
                onClick={() => setIsQuickViewOpen(false)}
                className="absolute top-4 right-4 z-20 p-2 bg-neutral-50 hover:bg-brand-accent hover:text-white rounded-full transition-colors border border-neutral-100"
                aria-label="Close Quick View"
              >
                <X size={16} />
              </button>

              {/* Gallery column */}
              <div className="w-full md:w-1/2 bg-neutral-50/50 relative flex flex-col justify-center items-center p-6 sm:p-8 border-r border-neutral-100/60">
                <div className="aspect-[3/4] w-full max-w-[290px] rounded-[2px] overflow-hidden relative shadow-sm border border-neutral-200/40">
                  <Image
                    src={product.images[0]}
                    alt={product.name}
                    fill
                    sizes="290px"
                    className="object-cover"
                  />
                </div>
                {/* Secondary previews */}
                <div className="flex space-x-2 mt-4">
                  {product.images.map((img, idx) => (
                    <div key={idx} className="w-10 h-14 border border-neutral-200 rounded-[2px] overflow-hidden bg-white shadow-sm relative">
                      <Image 
                        src={img} 
                        alt="preview" 
                        fill 
                        sizes="40px"
                        className="object-cover" 
                      />
                    </div>
                  ))}
                </div>
              </div>

              {/* Options column */}
              <div className="w-full md:w-1/2 p-6 sm:p-8 flex flex-col justify-between bg-white">
                <div>
                  <span className="text-[10px] uppercase tracking-[0.25em] font-semibold text-neutral-400">{product.category}</span>
                  <h2 className="font-serif text-xl sm:text-2xl font-normal text-neutral-900 mt-1.5 leading-snug">{product.name}</h2>
                  
                  {/* Pricing */}
                  <div className="flex items-baseline space-x-3 mt-4">
                    <span className="text-xl sm:text-2xl font-medium text-neutral-900">₹{product.salePrice}</span>
                    <span className="text-xs text-neutral-400 line-through">₹{product.originalPrice}</span>
                    <span className="text-[10px] font-semibold tracking-wider text-red-500 uppercase bg-red-50/60 px-2 py-0.5 border border-red-500/10 rounded-[2px]">{product.discount}% OFF</span>
                  </div>

                  <hr className="my-5 border-neutral-100" />

                  {/* Fabric Description */}
                  <div className="text-xs sm:text-sm text-neutral-600 space-y-2 leading-relaxed">
                    <p className="text-neutral-800"><strong>Fabric:</strong> {product.fabric}</p>
                    <p className="line-clamp-2 text-neutral-500">{product.description}</p>
                  </div>

                  {/* Size Selector */}
                  <div className="mt-5">
                    <div className="flex justify-between items-center text-xs mb-2.5">
                      <span className="font-semibold text-neutral-800 uppercase tracking-wider text-[10px]">Select Size</span>
                      <span className="text-[10px] uppercase tracking-wider text-neutral-500 cursor-pointer hover:underline underline-offset-2">Size Chart</span>
                    </div>
                    <div className="flex flex-wrap gap-2">
                      {(product?.sizes || []).map((size) => (
                        <button
                          key={size}
                          onClick={() => setSelectedSize(size)}
                          className={`px-3 py-1.5 border text-xs font-semibold rounded-[2px] transition-all duration-200 tracking-wider ${
                            selectedSize === size
                              ? "border-brand-accent bg-brand-accent text-white"
                              : "border-neutral-200 hover:border-neutral-400 text-neutral-700 hover:text-neutral-950"
                          }`}
                        >
                          {size}
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Color Selector */}
                  {product?.colors && product.colors.length > 0 && (
                    <div className="mt-5">
                      <span className="font-semibold text-neutral-800 uppercase tracking-wider text-[10px] block mb-2.5">Select Color</span>
                      <div className="flex flex-wrap gap-2">
                        {(product?.colors || []).map((color) => (
                          <button
                            key={color}
                            onClick={() => setSelectedColor(color)}
                            className={`px-3.5 py-1.5 border text-xs font-medium rounded-[2px] transition-all duration-200 tracking-wider ${
                              selectedColor === color
                                ? "border-brand-accent bg-neutral-50 text-neutral-900 font-semibold"
                                : "border-neutral-200 hover:border-neutral-400 text-neutral-600 hover:text-neutral-900"
                            }`}
                          >
                            {color}
                          </button>
                        ))}
                      </div>
                    </div>
                  )}
                </div>

                {/* Footer buttons */}
                <div className="mt-8">
                  {/* Quantity selector & Add button */}
                  <div className="flex items-center space-x-4">
                    <div className="flex items-center border border-neutral-200 rounded-[2px] bg-neutral-50/40">
                      <button
                        onClick={() => setQuantity(Math.max(1, quantity - 1))}
                        className="px-3 py-2.5 text-neutral-500 hover:text-neutral-900 transition-colors"
                      >
                        -
                      </button>
                      <span className="px-2 font-medium text-xs text-neutral-900 min-w-[20px] text-center">{quantity}</span>
                      <button
                        onClick={() => setQuantity(quantity + 1)}
                        className="px-3 py-2.5 text-neutral-500 hover:text-neutral-900 transition-colors"
                      >
                        +
                      </button>
                    </div>

                    <button
                      disabled={!product.inStock}
                      onClick={handleQuickViewAdd}
                      className={`flex-1 text-center text-[10px] tracking-[0.25em] uppercase font-semibold py-3.5 rounded-[2px] transition-colors duration-300 flex items-center justify-center space-x-2 border ${
                        !product.inStock
                          ? "bg-neutral-100 text-neutral-400 border-neutral-100 cursor-not-allowed"
                          : isAdded
                            ? "bg-green-600 text-white border-green-600"
                            : "bg-brand-accent text-white border-brand-accent hover:bg-neutral-800 hover:border-neutral-800"
                      }`}
                    >
                      <ShoppingBag size={13} />
                      <span>{isAdded ? "Added to Cart!" : "Add To Cart"}</span>
                    </button>
                  </div>
                  <Link
                    href={`/product/${product.id}`}
                    onClick={() => setIsQuickViewOpen(false)}
                    className="block text-center text-[9px] tracking-[0.2em] uppercase text-neutral-400 hover:text-neutral-800 mt-4 font-semibold underline underline-offset-4 transition-colors"
                  >
                    View Full Product Details
                  </Link>
                </div>
              </div>

            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </>
  );
}

export default React.memo(ProductCard);
