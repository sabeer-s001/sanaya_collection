"use client";

import React, { useState, useEffect } from "react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { useApp, Product } from "@/context/AppContext";
import ProductCard from "@/components/ProductCard";
import { 
  Heart, 
  ShoppingBag, 
  Ruler, 
  X,
  ChevronDown,
  ChevronUp,
  Truck,
  Calendar,
  MapPin,
  CheckCircle2,
  RotateCcw,
  ShieldCheck,
  Banknote,
  Sparkles,
  Zap,
  ArrowRight,
  CreditCard
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

interface ProductDetailClientProps {
  product: Product;
}

export default function ProductDetailClient({ product }: ProductDetailClientProps) {
  const router = useRouter();
  const { wishlist, toggleWishlist, addToCart, session } = useApp();

  const [activeImageIdx, setActiveImageIdx] = useState(0);
  const [selectedSize, setSelectedSize] = useState("");
  const [selectedColor, setSelectedColor] = useState("");
  const [quantity, setQuantity] = useState(1);
  const [isSizeChartOpen, setIsSizeChartOpen] = useState(false);
  const [isAdded, setIsAdded] = useState(false);
  
  // Pincode & Delivery estimator state
  const [pincode, setPincode] = useState("");
  const [pincodeChecked, setPincodeChecked] = useState(false);
  const [pincodeError, setPincodeError] = useState("");

  // Related Products state (Client-side fetched to avoid blocking server-side page load)
  const [relatedProducts, setRelatedProducts] = useState<Product[]>([]);
  const [loadingRelated, setLoadingRelated] = useState(true);
  
  // Accordion state
  const [openSection, setOpenSection] = useState<string | null>("description");

  // Zoom effect coordinates
  const [zoomPos, setZoomPos] = useState({ x: 0, y: 0 });
  const [isZoomed, setIsZoomed] = useState(false);

  // Gallery container ref for mobile touch scrolling
  const galleryRef = React.useRef<HTMLDivElement>(null);

  // Set default selections once product loads
  useEffect(() => {
    if (product) {
      setSelectedSize(product.sizes[0] || "");
      setSelectedColor(product.colors[0] || "");
      setActiveImageIdx(0);
      setQuantity(1);
    }
  }, [product]);

  // Load saved pincode from localStorage if present
  useEffect(() => {
    if (typeof window !== "undefined") {
      const savedPincode = localStorage.getItem("sanaya_pincode");
      if (savedPincode && savedPincode.length === 6) {
        setPincode(savedPincode);
        setPincodeChecked(true);
      }
    }
  }, []);

  // Synchronize scroll position when activeImageIdx changes
  useEffect(() => {
    if (galleryRef.current) {
      const container = galleryRef.current;
      const targetScrollLeft = activeImageIdx * container.clientWidth;
      if (Math.abs(container.scrollLeft - targetScrollLeft) > 10) {
        container.scrollTo({
          left: targetScrollLeft,
          behavior: "smooth"
        });
      }
    }
  }, [activeImageIdx]);

  // Handle scroll events on mobile swipe container
  const handleScroll = () => {
    if (!galleryRef.current) return;
    const { scrollLeft, clientWidth } = galleryRef.current;
    if (clientWidth === 0) return;
    const newIdx = Math.round(scrollLeft / clientWidth);
    if (newIdx !== activeImageIdx && newIdx >= 0 && newIdx < product.images.length) {
      setActiveImageIdx(newIdx);
    }
  };

  // Client-side fetching of related products
  useEffect(() => {
    const fetchRelatedProducts = async () => {
      try {
        const response = await fetch(`/api/products?category=${encodeURIComponent(product.category)}&exclude=${product.id}&limit=4`);
        if (response.ok) {
          const data = await response.json();
          setRelatedProducts(data);
        }
      } catch (err) {
        console.error("Failed to load related products:", err);
      } finally {
        setLoadingRelated(false);
      }
    };
    if (product?.id) {
      fetchRelatedProducts();
    }
  }, [product?.id, product?.category]);

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
    router.push("/checkout");
  };

  const toggleAccordion = (section: string) => {
    setOpenSection(openSection === section ? null : section);
  };

  const handleCheckPincode = (e: React.FormEvent) => {
    e.preventDefault();
    const cleanDigits = pincode.replace(/\D/g, "");
    if (cleanDigits.length === 6) {
      setPincodeError("");
      setPincodeChecked(true);
      if (typeof window !== "undefined") {
        localStorage.setItem("sanaya_pincode", cleanDigits);
      }
    } else {
      setPincodeError("Please enter a valid 6-digit Indian pincode.");
      setPincodeChecked(false);
    }
  };

  // Dynamic delivery dates calculator based on current date
  const getEstimatedDeliveryDates = () => {
    const minDate = new Date();
    minDate.setDate(minDate.getDate() + 3);
    const maxDate = new Date();
    maxDate.setDate(maxDate.getDate() + 5);

    const opts: Intl.DateTimeFormatOptions = { weekday: "short", month: "short", day: "numeric" };
    return {
      min: minDate.toLocaleDateString("en-IN", opts),
      max: maxDate.toLocaleDateString("en-IN", opts),
    };
  };

  const deliveryDates = getEstimatedDeliveryDates();

  return (
    <div className="w-full">
      {/* Product details grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-16">
        
        {/* Left Column: Interactive Image Gallery */}
        <div className="space-y-4">
          
          {/* Main view container with touch-friendly swipe gallery on mobile & click-to-zoom on desktop */}
          <div 
            ref={galleryRef}
            onScroll={handleScroll}
            className="aspect-[3/4] w-full bg-brand-bg rounded-2xl overflow-x-auto md:overflow-hidden flex snap-x snap-mandatory scrollbar-none relative shadow-sm border border-brand-primary/5 cursor-pointer md:cursor-zoom-in"
          >
            {product.images.map((img, idx) => (
              <div 
                key={idx}
                className="w-full h-full flex-shrink-0 snap-start relative"
                onMouseMove={handleMouseMove}
                onMouseEnter={() => {
                  // Only zoom on desktop screen widths to avoid layout shifting on touch devices
                  if (window.innerWidth >= 768) {
                    setIsZoomed(true);
                  }
                }}
                onMouseLeave={() => setIsZoomed(false)}
              >
                <Image
                  src={img}
                  alt={`${product.name} - view ${idx + 1}`}
                  fill
                  priority={idx === 0}
                  sizes="(max-width: 768px) 100vw, 50vw"
                  className="object-cover transition-transform duration-100 select-none pointer-events-none md:pointer-events-auto"
                  style={{
                    transformOrigin: `${zoomPos.x}% ${zoomPos.y}%`,
                    transform: (isZoomed && activeImageIdx === idx) ? "scale(2.2)" : "scale(1)"
                  }}
                />
              </div>
            ))}

            {/* Wishlist Button Overlay - Pinned relative to the main container */}
            <button
              onClick={(e) => {
                e.stopPropagation();
                toggleWishlist(product.id);
              }}
              className="absolute top-4 right-4 p-3 bg-white/80 hover:bg-white text-brand-text hover:text-brand-accent rounded-full shadow-md backdrop-blur-sm transition-colors duration-300 z-20"
              aria-label={isWishlisted ? "Remove from Wishlist" : "Add to Wishlist"}
            >
              <Heart size={20} className={isWishlisted ? "fill-brand-accent text-brand-accent scale-110" : "transition-transform"} />
            </button>

            {/* Sale or Discount Tags - Pinned relative to the main container */}
            {product.discount > 0 && (
              <span className="absolute top-4 left-4 bg-red-500 text-white text-[10px] font-bold tracking-widest uppercase px-3 py-1 rounded-full shadow-md z-20">
                {product.discount}% OFF
              </span>
            )}

            {/* Mobile Swipe Pagination Indicator Dots */}
            {product.images.length > 1 && (
              <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 flex space-x-1.5 z-20 md:hidden bg-black/25 backdrop-blur-[2px] px-3 py-1.5 rounded-full">
                {product.images.map((_, idx) => (
                  <button
                    key={idx}
                    onClick={(e) => {
                      e.stopPropagation();
                      setActiveImageIdx(idx);
                    }}
                    className={`w-1.5 h-1.5 rounded-full transition-all duration-300 ${
                      activeImageIdx === idx ? "bg-white scale-125" : "bg-white/40"
                    }`}
                    aria-label={`View slide ${idx + 1}`}
                  />
                ))}
              </div>
            )}
          </div>

          {/* Thumbnail Selection List */}
          <div className="flex space-x-3 overflow-x-auto py-1">
            {product.images.map((img, idx) => (
              <button
                key={idx}
                onClick={() => setActiveImageIdx(idx)}
                className={`w-20 h-24 rounded-lg overflow-hidden border-2 bg-white flex-shrink-0 relative transition-all ${
                  activeImageIdx === idx ? "border-brand-accent shadow-md scale-95" : "border-brand-lightGray opacity-70 hover:opacity-100"
                }`}
                aria-label={`View image ${idx + 1}`}
              >
                <Image 
                  src={img} 
                  alt="Thumbnail" 
                  fill 
                  sizes="80px"
                  className="object-cover" 
                />
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
                className={`flex-1 text-center text-xs tracking-widest uppercase font-bold py-4 rounded-xl transition-all flex items-center justify-center space-x-2 border border-brand-accent text-brand-accent hover:bg-brand-accent/10 ${
                  !product.inStock
                    ? "opacity-50 cursor-not-allowed"
                    : isAdded
                      ? "bg-emerald-50 text-emerald-700 border-emerald-300"
                      : ""
                }`}
              >
                <ShoppingBag size={15} />
                <span>{isAdded ? "Added to Cart!" : "Add To Cart"}</span>
              </button>
              <button
                disabled={!product.inStock}
                onClick={handleBuyNow}
                className={`flex-1 text-center text-xs tracking-widest uppercase font-bold py-4 rounded-xl transition-all flex items-center justify-center space-x-2 ${
                  !product.inStock
                    ? "bg-gray-200 text-gray-400 cursor-not-allowed"
                    : "bg-brand-accent hover:bg-brand-primary text-white shadow-md shadow-brand-accent/20 hover:shadow-lg hover:scale-[1.01] active:scale-[0.99]"
                }`}
              >
                <CreditCard size={15} className="text-white/90" />
                <span>Buy It Now</span>
                <ArrowRight size={14} className="text-white/80" />
              </button>
            </div>
          </div>

          {/* Service Highlights */}
          <div className="bg-white rounded-2xl border border-brand-primary/10 p-4 shadow-sm">
            <div className="grid grid-cols-2 gap-3">
              <div className="flex items-center space-x-2.5 text-xs text-brand-text">
                <div className="p-2 bg-brand-bg rounded-lg text-brand-accent flex-shrink-0">
                  <Banknote size={16} />
                </div>
                <div>
                  <p className="font-bold text-[11px]">Cash On Delivery</p>
                  <p className="text-[10px] text-brand-darkGray">Pay at your doorstep</p>
                </div>
              </div>

              <div className="flex items-center space-x-2.5 text-xs text-brand-text">
                <div className="p-2 bg-brand-bg rounded-lg text-brand-accent flex-shrink-0">
                  <ShieldCheck size={16} />
                </div>
                <div>
                  <p className="font-bold text-[11px]">100% Authentic</p>
                  <p className="text-[10px] text-brand-darkGray">Handpicked quality</p>
                </div>
              </div>
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
      <section className="mt-24">
        <h2 className="font-serif text-2xl font-bold text-brand-text mb-8 text-center sm:text-left">
          You May Also Like
        </h2>
        {loadingRelated ? (
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
            {[...Array(4)].map((_, idx) => (
              <div key={idx} className="animate-pulse bg-white border border-neutral-100 rounded-[4px] p-4 flex flex-col space-y-4 shadow-[0_4px_12px_rgba(0,0,0,0.02)]">
                <div className="aspect-[3/4] bg-neutral-100 rounded w-full relative" />
                <div className="h-4 bg-neutral-100 rounded w-2/3 mt-2" />
                <div className="h-4 bg-neutral-100 rounded w-1/3 mt-1" />
              </div>
            ))}
          </div>
        ) : relatedProducts.length > 0 ? (
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
            {relatedProducts.map((p) => (
              <ProductCard key={p.id} product={p} />
            ))}
          </div>
        ) : (
          <p className="text-center text-xs text-brand-darkGray py-4">No related products found.</p>
        )}
      </section>

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
    </div>
  );
}
