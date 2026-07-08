"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useApp, Product } from "@/context/AppContext";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import ProductCard from "@/components/ProductCard";
import { 
  Heart, 
  ShoppingBag, 
  Ruler, 
  X,
  ChevronDown,
  ChevronUp,
  Truck,
  RotateCcw,
  ShieldCheck
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

interface ProductDetailClientProps {
  product: Product;
  relatedProducts: Product[];
}

export default function ProductDetailClient({ product, relatedProducts }: ProductDetailClientProps) {
  const router = useRouter();
  const { wishlist, toggleWishlist, addToCart, session } = useApp();

  const [activeImageIdx, setActiveImageIdx] = useState(0);
  const [selectedSize, setSelectedSize] = useState("");
  const [selectedColor, setSelectedColor] = useState("");
  const [quantity, setQuantity] = useState(1);
  const [isSizeChartOpen, setIsSizeChartOpen] = useState(false);
  const [isAdded, setIsAdded] = useState(false);
  
  // Accordion state
  const [openSection, setOpenSection] = useState<string | null>("description");

  // Zoom effect coordinates
  const [zoomPos, setZoomPos] = useState({ x: 0, y: 0 });
  const [isZoomed, setIsZoomed] = useState(false);

  // Set default selections once product loads
  useEffect(() => {
    if (product) {
      setSelectedSize(product.sizes[0] || "");
      setSelectedColor(product.colors[0] || "");
      setActiveImageIdx(0);
      setQuantity(1);
    }
  }, [product]);

  const isWishlisted = wishlist.includes(product.id);

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    const { left, top, width, height } = e.currentTarget.getBoundingClientRect();
    const x = ((e.clientX - left) / width) * 100;
    const y = ((e.clientY - top) / height) * 100;
    setZoomPos({ x, y });
  };

  const handleAddToCart = () => {
    addToCart(product, selectedSize, selectedColor, quantity);
    setIsAdded(true);
    setTimeout(() => setIsAdded(false), 2000);
  };

  const handleBuyNow = () => {
    addToCart(product, selectedSize, selectedColor, quantity);
    if (session) {
      router.push("/checkout");
    } else {
      router.push("/dashboard?redirect=/checkout&info=login_required");
    }
  };

  const toggleAccordion = (section: string) => {
    setOpenSection(openSection === section ? null : section);
  };

  return (
    <div className="flex flex-col min-h-screen">
      <Navbar />

      <main className="flex-grow py-12 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 w-full">
        {/* Product details grid */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-16">
          
          {/* Left Column: Interactive Image Gallery */}
          <div className="space-y-4">
            
            {/* Main view container with mouse zoom */}
            <div 
              className="aspect-[3/4] w-full bg-brand-bg rounded-2xl overflow-hidden relative shadow-sm border border-brand-primary/5 cursor-zoom-in"
              onMouseMove={handleMouseMove}
              onMouseEnter={() => setIsZoomed(true)}
              onMouseLeave={() => setIsZoomed(false)}
            >
              <img
                src={product.images[activeImageIdx]}
                alt={product.name}
                className="w-full h-full object-cover transition-transform duration-100"
                style={{
                  transformOrigin: `${zoomPos.x}% ${zoomPos.y}%`,
                  transform: isZoomed ? "scale(2.2)" : "scale(1)"
                }}
              />

              {/* Wishlist Button Overlay */}
              <button
                onClick={() => toggleWishlist(product.id)}
                className="absolute top-4 right-4 p-3 bg-white/80 hover:bg-white text-brand-text hover:text-brand-accent rounded-full shadow-md backdrop-blur-sm transition-colors duration-300"
                aria-label={isWishlisted ? "Remove from Wishlist" : "Add to Wishlist"}
              >
                <Heart size={20} className={isWishlisted ? "fill-brand-accent text-brand-accent scale-110" : "transition-transform"} />
              </button>

              {/* Sale or Discount Tags */}
              {product.discount > 0 && (
                <span className="absolute top-4 left-4 bg-red-500 text-white text-[10px] font-bold tracking-widest uppercase px-3 py-1 rounded-full shadow-md">
                  {product.discount}% OFF
                </span>
              )}
            </div>

            {/* Thumbnail Selection List */}
            <div className="flex space-x-3 overflow-x-auto py-1">
              {product.images.map((img, idx) => (
                <button
                  key={idx}
                  onClick={() => setActiveImageIdx(idx)}
                  className={`w-20 h-24 rounded-lg overflow-hidden border-2 bg-white flex-shrink-0 transition-all ${
                    activeImageIdx === idx ? "border-brand-accent shadow-md scale-95" : "border-brand-lightGray opacity-70 hover:opacity-100"
                  }`}
                  aria-label={`View image ${idx + 1}`}
                >
                  <img src={img} alt="Thumbnail" className="w-full h-full object-cover" />
                </button>
              ))}
            </div>
          </div>

          {/* Right Column: Garment specifications & actions */}
          <div className="flex flex-col justify-between space-y-6">
            
            {/* Title & Brand */}
            <div>
              <span className="text-xs uppercase tracking-[0.25em] font-semibold text-brand-accent">{product.category}</span>
              <h1 className="font-serif text-3xl font-bold text-brand-text mt-1">{product.name}</h1>
              
              {/* Price Row */}
              <div className="flex items-baseline space-x-4 mt-6">
                <span className="text-3xl font-bold text-brand-accent">₹{product.salePrice}</span>
                <span className="text-base text-brand-darkGray line-through">₹{product.originalPrice}</span>
                <span className="text-xs font-bold text-green-600 bg-green-50 px-3 py-1 rounded-full">
                  You Save ₹{product.originalPrice - product.salePrice} ({product.discount}% OFF)
                </span>
              </div>

              {/* Stock status indicator */}
              <div className="mt-4 flex items-center space-x-2">
                <div className={`w-2.5 h-2.5 rounded-full ${product.inStock ? "bg-green-500 animate-pulse" : "bg-red-500"}`} />
                <span className="text-xs font-semibold uppercase tracking-wider text-brand-text">
                  {product.inStock ? "In Stock & Ready to Ship" : "Currently Out of Stock"}
                </span>
              </div>
            </div>

            <hr className="border-brand-lightGray" />

            {/* Options selecting area */}
            <div className="space-y-6">
              
              {/* Size Selector */}
              <div>
                <div className="flex justify-between items-center text-xs font-semibold text-brand-text mb-3">
                  <span>SELECT SIZE</span>
                  <button 
                    type="button"
                    onClick={() => setIsSizeChartOpen(true)}
                    className="text-brand-accent hover:underline flex items-center space-x-1"
                  >
                    <Ruler size={14} /> <span>Size Guide</span>
                  </button>
                </div>
                <div className="flex flex-wrap gap-3">
                  {product.sizes.map((size) => (
                    <button
                      key={size}
                      onClick={() => setSelectedSize(size)}
                      className={`min-w-[48px] h-12 border text-xs font-bold rounded-lg transition-all flex items-center justify-center ${
                        selectedSize === size
                          ? "border-brand-accent bg-brand-accent text-white shadow-md"
                          : "border-brand-lightGray hover:border-brand-accent text-brand-text"
                      }`}
                    >
                      {size}
                    </button>
                  ))}
                </div>
              </div>

              {/* Color Selector */}
              {product.colors && product.colors.length > 0 && (
                <div>
                  <span className="text-xs font-semibold text-brand-text block mb-3">SELECT COLOR</span>
                  <div className="flex flex-wrap gap-3">
                    {product.colors.map((color) => (
                      <button
                        key={color}
                        onClick={() => setSelectedColor(color)}
                        className={`px-4 py-2 border text-xs font-semibold rounded-lg transition-all ${
                          selectedColor === color
                            ? "border-brand-accent bg-brand-accent/5 text-brand-accent shadow-sm"
                            : "border-brand-lightGray hover:border-brand-accent text-brand-text"
                        }`}
                      >
                        {color}
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {/* Quantity Selector */}
              <div>
                <span className="text-xs font-semibold text-brand-text block mb-3">QUANTITY</span>
                <div className="inline-flex items-center border border-brand-lightGray rounded-lg bg-white shadow-sm">
                  <button
                    onClick={() => setQuantity(Math.max(1, quantity - 1))}
                    className="px-4 py-2.5 text-brand-darkGray hover:text-brand-primary text-sm font-semibold"
                  >
                    -
                  </button>
                  <span className="px-4 text-xs font-bold">{quantity}</span>
                  <button
                    onClick={() => setQuantity(quantity + 1)}
                    className="px-4 py-2.5 text-brand-darkGray hover:text-brand-primary text-sm font-semibold"
                  >
                    +
                  </button>
                </div>
              </div>

            </div>

            {/* CTAs */}
            <div className="space-y-3 pt-2">
              <div className="flex flex-col sm:flex-row gap-3">
                <button
                  disabled={!product.inStock}
                  onClick={handleAddToCart}
                  className={`flex-1 text-center text-xs tracking-widest uppercase font-semibold py-4 rounded-full transition-colors flex items-center justify-center space-x-2 ${
                    !product.inStock
                      ? "bg-gray-200 text-gray-400 cursor-not-allowed"
                      : isAdded
                        ? "bg-green-600 text-white"
                        : "bg-brand-accent text-white hover:bg-brand-primary shadow-lg shadow-brand-accent/15"
                  }`}
                >
                  <ShoppingBag size={16} />
                  <span>{isAdded ? "Added to Cart!" : "Add To Cart"}</span>
                </button>
                <button
                  disabled={!product.inStock}
                  onClick={handleBuyNow}
                  className={`flex-1 text-center text-xs tracking-widest uppercase font-semibold py-4 rounded-full transition-colors ${
                    !product.inStock
                      ? "bg-gray-200 text-gray-400 cursor-not-allowed"
                      : "bg-brand-text text-white hover:bg-brand-accent"
                  }`}
                >
                  Buy It Now
                </button>
              </div>
            </div>

            <hr className="border-brand-lightGray" />

            {/* Product Details Accordions */}
            <div className="border border-brand-lightGray rounded-xl overflow-hidden bg-white text-xs sm:text-sm">
              {/* Description */}
              <div className="border-b border-brand-lightGray">
                <button 
                  onClick={() => toggleAccordion("description")}
                  className="w-full p-4 flex justify-between items-center text-left font-serif font-bold text-brand-text"
                >
                  <span>Description & Styling Guides</span>
                  {openSection === "description" ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
                </button>
                {openSection === "description" && (
                  <div className="p-4 pt-0 text-brand-darkGray leading-relaxed space-y-2">
                    <p>{product.description}</p>
                    <p><strong>Fabric Blend:</strong> {product.fabric}</p>
                  </div>
                )}
              </div>

              {/* Care Instructions */}
              <div className="border-b border-brand-lightGray">
                <button 
                  onClick={() => toggleAccordion("care")}
                  className="w-full p-4 flex justify-between items-center text-left font-serif font-bold text-brand-text"
                >
                  <span>Garment Care & Fabric Details</span>
                  {openSection === "care" ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
                </button>
                {openSection === "care" && (
                  <div className="p-4 pt-0 text-brand-darkGray leading-relaxed">
                    <p>{product.careInstructions}</p>
                  </div>
                )}
              </div>

              {/* Shipping & Returns */}
              <div className="">
                <button 
                  onClick={() => toggleAccordion("shipping")}
                  className="w-full p-4 flex justify-between items-center text-left font-serif font-bold text-brand-text"
                >
                  <span>Shipping & Returns</span>
                  {openSection === "shipping" ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
                </button>
                {openSection === "shipping" && (
                  <div className="p-4 pt-0 text-brand-darkGray leading-relaxed space-y-2">
                    <p>{product.shippingInfo}</p>
                    <p>{product.returnPolicy}</p>
                  </div>
                )}
              </div>
            </div>

          </div>
        </div>

        {/* Related Products Grid */}
        {relatedProducts.length > 0 && (
          <section className="mt-24">
            <h2 className="font-serif text-2xl font-bold text-brand-text mb-8 text-center sm:text-left">
              You May Also Like
            </h2>
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
              {relatedProducts.map((p) => (
                <ProductCard key={p.id} product={p} />
              ))}
            </div>
          </section>
        )}
      </main>

      {/* Size Chart Modal */}
      <AnimatePresence>
        {isSizeChartOpen && (
          <div className="fixed inset-0 z-[103] flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 0.6 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsSizeChartOpen(false)}
              className="fixed inset-0 bg-black"
            />
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="bg-white rounded-2xl p-6 sm:p-8 max-w-xl w-full relative z-10 shadow-2xl"
            >
              <button
                onClick={() => setIsSizeChartOpen(false)}
                className="absolute top-4 right-4 p-2 bg-brand-bg hover:bg-brand-accent hover:text-white rounded-full transition-colors"
                aria-label="Close Size Chart"
              >
                <X size={18} />
              </button>
              
              <h3 className="font-serif text-xl font-bold text-brand-text mb-2">Garment Size Chart</h3>
              <p className="text-xs text-brand-darkGray mb-6">Values listed are in inches. Standard relaxed fitting fits true to size.</p>

              <div className="overflow-x-auto">
                <table className="w-full text-xs text-left border-collapse">
                  <thead>
                    <tr className="border-b border-brand-lightGray bg-brand-bg text-brand-accent font-bold">
                      <th className="p-3">Size Tag</th>
                      <th className="p-3">Length</th>
                      <th className="p-3">Chest</th>
                      <th className="p-3">Waist</th>
                      <th className="p-3">Hips</th>
                    </tr>
                  </thead>
                  <tbody>
                    {[
                      { tag: "XS", len: "42", chest: "34", waist: "30", hips: "36" },
                      { tag: "S", len: "42", chest: "36", waist: "32", hips: "38" },
                      { tag: "M", len: "44", chest: "38", waist: "34", hips: "40" },
                      { tag: "L", len: "44", chest: "40", waist: "36", hips: "42" },
                      { tag: "XL", len: "45", chest: "42", waist: "38", hips: "44" },
                      { tag: "XXL", len: "45", chest: "44", waist: "40", hips: "46" },
                    ].map((row, idx) => (
                      <tr key={idx} className="border-b border-brand-lightGray hover:bg-brand-bg/40">
                        <td className="p-3 font-semibold text-brand-accent">{row.tag}</td>
                        <td className="p-3 text-brand-darkGray">{row.len}</td>
                        <td className="p-3 text-brand-darkGray">{row.chest}</td>
                        <td className="p-3 text-brand-darkGray">{row.waist}</td>
                        <td className="p-3 text-brand-darkGray">{row.hips}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              <p className="text-[10px] text-brand-darkGray leading-relaxed mt-6">
                * Note: Pakistani kurtas usually boast a slightly looser flow compared to straight Indian cuts. If you prefer a highly slimmed structure, consider scaling one size down.
              </p>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      <Footer />
    </div>
  );
}
