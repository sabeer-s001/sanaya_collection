"use client";

import React, { useState, useEffect, useRef } from "react";
import Link from "next/link";
import { useRouter, usePathname } from "next/navigation";
import { useApp, Product } from "@/context/AppContext";
import {
  Search,
  Heart,
  ShoppingBag,
  Menu,
  X,
  ChevronDown,
  Trash2,
  Plus,
  Minus,
  ArrowRight,
  LogOut,
  Settings,
  MapPin,
  Lock,
  History,
  Package,
  Headphones
} from "lucide-react";
import { PRODUCT_CATEGORIES } from "@/lib/constants";
import { motion, AnimatePresence } from "framer-motion";

export default function Navbar() {
  const router = useRouter();
  const pathname = usePathname();
  const isTransparentPage = pathname === "/" || pathname === "/about" || pathname === "/contact";
  const {
    cart,
    wishlist,
    session,
    logout,
    products,
    removeFromCart,
    updateCartQty,
    toggleWishlist
  } = useApp();

  const [isScrolled, setIsScrolled] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [isWishlistOpen, setIsWishlistOpen] = useState(false);

  // Search state
  const [searchQuery, setSearchQuery] = useState("");
  const [searchResults, setSearchResults] = useState<Product[]>([]);
  const [popularSearches] = useState(["Pakistani Suit", "Party Wear", "Stitched", "Unstitched"]);
  const [categorySuggestions] = useState(PRODUCT_CATEGORIES);

  // Scroll effect
  useEffect(() => {
    const handleScroll = () => {
      if (window.scrollY > 20) {
        setIsScrolled(true);
      } else {
        setIsScrolled(false);
      }
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  // Prevent body scroll when any modal/drawer is open
  useEffect(() => {
    if (isMobileMenuOpen || isCartOpen || isWishlistOpen || isSearchOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "unset";
    }
    return () => {
      document.body.style.overflow = "unset";
    };
  }, [isMobileMenuOpen, isCartOpen, isWishlistOpen, isSearchOpen]);

  // Listen for open-wishlist custom event from WhatsAppWidget mobile button
  useEffect(() => {
    const handleOpenWishlist = () => setIsWishlistOpen(true);
    window.addEventListener("open-wishlist", handleOpenWishlist);
    return () => window.removeEventListener("open-wishlist", handleOpenWishlist);
  }, []);

  const iconColorClass = isTransparentPage && !isScrolled
    ? "text-white hover:text-white/80"
    : "text-brand-text hover:text-brand-primary";

  // Live search functionality with debouncing for INP performance optimization
  useEffect(() => {
    if (searchQuery.trim() === "") {
      setSearchResults([]);
      return;
    }
    const delayDebounceFn = setTimeout(() => {
      const query = searchQuery.toLowerCase();
      const filtered = products.filter(p =>
        p.name.toLowerCase().includes(query) ||
        p.category.toLowerCase().includes(query) ||
        p.fabric.toLowerCase().includes(query)
      );
      setSearchResults(filtered.slice(0, 5));
    }, 300);

    return () => clearTimeout(delayDebounceFn);
  }, [searchQuery, products]);

  const cartCount = cart.reduce((acc, item) => acc + item.quantity, 0);
  const cartSubtotal = cart.reduce((acc, item) => acc + (item.product.salePrice * item.quantity), 0);

  const handleSearchItemClick = (productId: string) => {
    setIsSearchOpen(false);
    setSearchQuery("");
    router.push(`/product/${productId}`);
  };

  const handleCategoryClick = (category: string) => {
    setIsSearchOpen(false);
    setIsMobileMenuOpen(false);
    if (category === "All") {
      router.push("/shop");
    } else {
      router.push(`/shop?category=${encodeURIComponent(category)}`);
    }
  };

  return (
    <>
      {/* Main Navbar */}
      <header className={`z-50 transition-all duration-300 ${isTransparentPage
        ? (isScrolled
          ? "fixed top-0 left-0 w-full bg-white shadow-sm py-3 text-brand-text border-b border-brand-lightGray/10"
          : "absolute top-0 left-0 w-full bg-transparent py-5 text-white border-b border-white/10")
        : "sticky top-0 left-0 w-full bg-white border-b border-brand-lightGray py-4 text-brand-text shadow-sm"
        }`}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="relative flex items-center justify-between">

            {/* Mobile Hamburger (Left on mobile) */}
            <div className="flex md:hidden z-20 relative flex-shrink-0">
              <button
                onClick={() => setIsMobileMenuOpen(true)}
                className={`${iconColorClass} p-2 focus:outline-none`}
                aria-label="Open mobile menu"
              >
                <Menu size={24} />
              </button>
            </div>

            {/* Logo */}
            <div className="absolute left-1/2 -translate-x-1/2 md:static md:translate-x-0 flex items-center justify-center md:justify-start z-10 w-[60%] sm:w-[50%] md:w-auto max-w-[200px] md:max-w-none">
              <Link href="/" className="inline-flex items-center justify-center w-full">
                <img
                  src="/logo.png"
                  alt="Sanaya Collection"
                  className={`max-h-12 md:max-h-20 w-auto max-w-full object-contain hover:opacity-80 transition-all duration-300 rounded ${isTransparentPage && !isScrolled ? "brightness-0 invert" : ""
                    }`}
                />
              </Link>
            </div>

            {/* Desktop Navigation Menu */}
            <nav className="hidden md:flex space-x-8 lg:space-x-10 text-sm font-medium tracking-widest uppercase items-center">
              <Link href="/" className="hover:text-brand-primary transition-luxury py-2">
                Home
              </Link>

              {/* Shop with Mega Menu */}
              <div className="group relative py-2">
                <button className="flex items-center hover:text-brand-primary transition-luxury focus:outline-none uppercase tracking-widest">
                  Shop <ChevronDown size={14} className="ml-1" />
                </button>
                {/* Mega Menu Dropdown */}
                <div className="absolute left-1/2 -translate-x-1/2 top-full w-[680px] bg-white border border-brand-lightGray shadow-xl rounded-b-xl opacity-0 translate-y-3 pointer-events-none group-hover:opacity-100 group-hover:translate-y-0 group-hover:pointer-events-auto transition-all duration-300 grid grid-cols-5 p-6 gap-6 z-50 text-brand-text">
                  <div className="col-span-3">
                    <h4 className="font-serif text-xs text-brand-accent tracking-widest font-semibold uppercase border-b border-brand-lightGray pb-2 mb-3">
                      By Category
                    </h4>
                    <ul className="grid grid-cols-2 gap-x-4 gap-y-2 text-xs normal-case text-brand-darkGray max-h-72 overflow-y-auto pr-1">
                      {categorySuggestions.map((cat) => (
                        <li key={cat}>
                          <button
                            onClick={() => handleCategoryClick(cat)}
                            className="hover:text-brand-primary hover:translate-x-1 transition-all text-left truncate w-full"
                          >
                            {cat}
                          </button>
                        </li>
                      ))}
                    </ul>
                  </div>
                  <div className="col-span-2 bg-brand-bg rounded-lg p-4 flex flex-col justify-between border border-brand-primary/10">
                    <div>
                      <p className="font-serif text-sm font-semibold text-brand-text mb-1">Party Wear Collection</p>
                      <p className="text-[11px] text-brand-darkGray normal-case leading-relaxed">
                        Handcrafted celebratory ensembles and festive wear with heavy embellishments, Zari work, and premium dupattas.
                      </p>
                    </div>
                    <Link
                      href="/shop?category=Party Wear"
                      className="text-[10px] tracking-widest font-semibold text-brand-accent flex items-center hover:text-brand-primary mt-4"
                    >
                      EXPLORE PARTY WEAR <ArrowRight size={12} className="ml-1" />
                    </Link>
                  </div>
                </div>
              </div>

              <Link href="/shop?filter=best-sellers" className="hover:text-brand-primary transition-luxury py-2">
                Best Sellers
              </Link>
              <Link href="/about" className="hover:text-brand-primary transition-luxury py-2">
                About Us
              </Link>
              <Link href="/contact" className="hover:text-brand-primary transition-luxury py-2">
                Contact Us
              </Link>
            </nav>

            {/* Right Side Icons */}
            <div className="flex items-center space-x-3 sm:space-x-5 z-20 relative flex-shrink-0">
              {/* Search Toggle */}
              <button
                onClick={() => setIsSearchOpen(true)}
                className={`p-2 ${iconColorClass} transition-colors focus:outline-none relative`}
                aria-label="Search"
              >
                <Search size={20} />
              </button>

              {/* My Orders Icon */}
              <Link
                href="/orders"
                className={`p-2 ${iconColorClass} transition-colors focus:outline-none relative hidden md:block`}
                aria-label="My Orders"
                title="My Orders"
              >
                <Package size={20} />
              </Link>

              {/* Wishlist Toggle */}
              <button
                onClick={() => setIsWishlistOpen(true)}
                className={`p-2 ${iconColorClass} transition-colors focus:outline-none relative hidden md:block`}
                aria-label="Open wishlist"
              >
                <Heart size={20} />
                {wishlist.length > 0 && (
                  <span className="absolute top-0 right-0 bg-brand-accent text-white text-[9px] w-4 h-4 rounded-full flex items-center justify-center font-bold">
                    {wishlist.length}
                  </span>
                )}
              </button>

              {/* Cart Toggle */}
              <button
                onClick={() => setIsCartOpen(true)}
                className={`p-2 ${iconColorClass} transition-colors focus:outline-none relative`}
                aria-label="Open shopping cart"
              >
                <ShoppingBag size={20} />
                {cartCount > 0 && (
                  <span className="absolute top-0 right-0 bg-brand-accent text-white text-[9px] w-4 h-4 rounded-full flex items-center justify-center font-bold">
                    {cartCount}
                  </span>
                )}
              </button>
            </div>

          </div>
        </div>
      </header>

      {/* Slide-out Cart Drawer */}
      <AnimatePresence>
        {isCartOpen && (
          <motion.div
            key="cart-backdrop"
            initial={{ opacity: 0 }}
            animate={{ opacity: 0.5 }}
            exit={{ opacity: 0 }}
            onClick={() => setIsCartOpen(false)}
            className="fixed inset-0 bg-black z-[100]"
          />
        )}
        {isCartOpen && (
          <motion.div
            key="cart-panel"
            initial={{ x: "100%" }}
            animate={{ x: 0 }}
            exit={{ x: "100%" }}
            transition={{ type: "tween", duration: 0.35 }}
            className="fixed top-0 right-0 h-full w-full max-w-md bg-white shadow-2xl z-[101] flex flex-col"
          >
              <div className="p-6 border-b border-brand-lightGray flex items-center justify-between">
                <h3 className="font-serif text-lg font-semibold text-brand-text">Your Cart ({cartCount})</h3>
                <button onClick={() => setIsCartOpen(false)} className="p-1 hover:text-brand-accent transition-colors" aria-label="Close shopping cart">
                  <X size={20} />
                </button>
              </div>

              {/* Cart Items List */}
              <div className="flex-1 overflow-y-auto p-6 space-y-6">
                {cart.length === 0 ? (
                  <div className="text-center py-20 flex flex-col items-center justify-center">
                    <ShoppingBag size={48} className="text-brand-primary/40 mb-4 stroke-1" />
                    <p className="font-serif text-brand-text text-sm mb-1">Your cart is currently empty.</p>
                    <p className="text-xs text-brand-darkGray mb-6">Fill it with premium collections</p>
                    <button
                      onClick={() => {
                        setIsCartOpen(false);
                        router.push("/");
                      }}
                      className="bg-brand-accent text-white text-xs px-6 py-3 tracking-widest uppercase font-semibold hover:bg-brand-primary transition-colors rounded-full"
                    >
                      Shop Collection
                    </button>
                  </div>
                ) : (
                  cart.map((item, idx) => (
                    <div key={`${item.product.id}-${item.selectedSize}-${item.selectedColor}-${idx}`} className="flex space-x-4 border-b border-brand-lightGray pb-4 last:border-b-0">
                      <div className="w-20 h-24 relative bg-brand-bg overflow-hidden rounded-md flex-shrink-0">
                        <img
                          src={item.product.images[0]}
                          alt={item.product.name}
                          className="w-full h-full object-cover"
                        />
                      </div>
                      <div className="flex-1 flex flex-col justify-between">
                        <div>
                          <div className="flex justify-between text-sm">
                            <h4 className="font-serif font-semibold text-brand-text hover:text-brand-accent">
                              <Link href={`/product/${item.product.id}`} onClick={() => setIsCartOpen(false)}>
                                {item.product.name}
                              </Link>
                            </h4>
                            <button
                              onClick={() => removeFromCart(item.product.id, item.selectedSize, item.selectedColor)}
                              className="text-brand-darkGray hover:text-red-500 transition-colors ml-2"
                            >
                              <Trash2 size={16} />
                            </button>
                          </div>
                          <p className="text-[11px] text-brand-darkGray mt-1">
                            Size: {item.selectedSize}{item.selectedColor ? ` | Color: ${item.selectedColor}` : ""}
                          </p>
                        </div>
                        <div className="flex justify-between items-center mt-2">
                          {/* Quantity Selector */}
                          <div className="flex items-center border border-brand-lightGray rounded-md">
                            <button
                              onClick={() => updateCartQty(item.product.id, item.selectedSize, item.selectedColor, item.quantity - 1)}
                              className="px-2 py-1 text-brand-darkGray hover:text-brand-primary"
                            >
                              <Minus size={12} />
                            </button>
                            <span className="px-2 text-xs font-semibold">{item.quantity}</span>
                            <button
                              onClick={() => updateCartQty(item.product.id, item.selectedSize, item.selectedColor, item.quantity + 1)}
                              className="px-2 py-1 text-brand-darkGray hover:text-brand-primary"
                            >
                              <Plus size={12} />
                            </button>
                          </div>
                          <p className="text-sm font-semibold text-brand-accent">
                            ₹{item.product.salePrice * item.quantity}
                          </p>
                        </div>
                      </div>
                    </div>
                  ))
                )}
              </div>

              {/* Cart Footer */}
              {cart.length > 0 && (
                <div className="p-6 border-t border-brand-lightGray bg-brand-bg">
                  <div className="flex justify-between items-center mb-4 text-sm">
                    <span className="text-brand-darkGray font-medium">Subtotal</span>
                    <span className="font-bold text-brand-text text-base">₹{cartSubtotal}</span>
                  </div>
                  <p className="text-[10px] text-brand-darkGray leading-relaxed mb-6">
                    Shipping calculated at checkout based on selected items.
                  </p>
                  <div className="grid grid-cols-2 gap-4">
                    <button
                      onClick={() => {
                        setIsCartOpen(false);
                        router.push("/cart");
                      }}
                      className="w-full border border-brand-accent text-brand-accent text-xs py-3 rounded-full font-semibold uppercase tracking-widest text-center hover:bg-brand-accent hover:text-white transition-all"
                    >
                      View Cart
                    </button>
                    <button
                      onClick={() => {
                        setIsCartOpen(false);
                        router.push("/checkout");
                      }}
                      className="w-full bg-brand-accent text-white text-xs py-3 rounded-full font-semibold uppercase tracking-widest text-center hover:bg-brand-primary transition-all flex items-center justify-center"
                    >
                      Checkout <ArrowRight size={14} className="ml-1" />
                    </button>
                  </div>
                </div>
              )}
            </motion.div>
          )}
      </AnimatePresence>

      {/* Slide-out Wishlist Drawer */}
      <AnimatePresence>
        {isWishlistOpen && (
          <motion.div
            key="wishlist-backdrop"
            initial={{ opacity: 0 }}
            animate={{ opacity: 0.5 }}
            exit={{ opacity: 0 }}
            onClick={() => setIsWishlistOpen(false)}
            className="fixed inset-0 bg-black z-[100]"
          />
        )}
        {isWishlistOpen && (
          <motion.div
            key="wishlist-panel"
            initial={{ x: "100%" }}
            animate={{ x: 0 }}
            exit={{ x: "100%" }}
            transition={{ type: "tween", duration: 0.35 }}
            className="fixed top-0 right-0 h-full w-full max-w-md bg-white shadow-2xl z-[101] flex flex-col"
          >
              <div className="p-6 border-b border-brand-lightGray flex items-center justify-between">
                <h3 className="font-serif text-lg font-semibold text-brand-text">My Wishlist ({wishlist.length})</h3>
                <button onClick={() => setIsWishlistOpen(false)} className="p-1 hover:text-brand-accent transition-colors" aria-label="Close wishlist">
                  <X size={20} />
                </button>
              </div>

              <div className="flex-1 overflow-y-auto p-6 space-y-6">
                {wishlist.length === 0 ? (
                  <div className="text-center py-20 flex flex-col items-center justify-center">
                    <Heart size={48} className="text-brand-primary/40 mb-4 stroke-1" />
                    <p className="font-serif text-brand-text text-sm mb-1">Your wishlist is empty.</p>
                    <p className="text-xs text-brand-darkGray mb-6">Save your favorite styles for later</p>
                    <button
                      onClick={() => {
                        setIsWishlistOpen(false);
                        router.push("/");
                      }}
                      className="bg-brand-accent text-white text-xs px-6 py-3 tracking-widest uppercase font-semibold hover:bg-brand-primary transition-colors rounded-full"
                    >
                      Shop Collection
                    </button>
                  </div>
                ) : (
                  products.filter(p => wishlist.includes(p.id)).map((product) => (
                    <div key={product.id} className="flex space-x-4 border-b border-brand-lightGray pb-4 last:border-b-0">
                      <div className="w-20 h-24 relative bg-brand-bg overflow-hidden rounded-md flex-shrink-0">
                        <img
                          src={product.images[0]}
                          alt={product.name}
                          className="w-full h-full object-cover"
                        />
                      </div>
                      <div className="flex-1 flex flex-col justify-between">
                        <div>
                          <div className="flex justify-between text-sm">
                            <h4 className="font-serif font-semibold text-brand-text hover:text-brand-accent">
                              <Link href={`/product/${product.id}`} onClick={() => setIsWishlistOpen(false)}>
                                {product.name}
                              </Link>
                            </h4>
                            <button
                              onClick={() => toggleWishlist(product.id)}
                              className="text-red-500 hover:text-brand-darkGray transition-colors ml-2"
                            >
                              <X size={16} />
                            </button>
                          </div>
                          <p className="text-[11px] text-brand-accent font-semibold mt-1">
                            ₹{product.salePrice} <span className="line-through text-brand-darkGray text-[10px] ml-1">₹{product.originalPrice}</span>
                          </p>
                          <p className="text-[10px] text-green-600 font-medium mt-1">
                            {product.inStock ? "In Stock" : "Out of stock"}
                          </p>
                        </div>
                        <div className="mt-2">
                          <button
                            disabled={!product.inStock}
                            onClick={() => {
                              setIsWishlistOpen(false);
                              router.push(`/product/${product.id}`);
                            }}
                            className={`w-full text-center text-[10px] tracking-wider uppercase font-semibold py-2 rounded ${product.inStock
                              ? "bg-brand-accent text-white hover:bg-brand-primary"
                              : "bg-gray-200 text-gray-400 cursor-not-allowed"
                              }`}
                          >
                            {product.inStock ? "Select Options" : "Out of stock"}
                          </button>
                        </div>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </motion.div>
        )}
      </AnimatePresence>

      {/* Advanced Search Overlay */}
      <AnimatePresence>
        {isSearchOpen && (
          <motion.div
            key="search-backdrop"
            initial={{ opacity: 0 }}
            animate={{ opacity: 0.7 }}
            exit={{ opacity: 0 }}
            onClick={() => {
              setIsSearchOpen(false);
              setSearchQuery("");
            }}
            className="fixed inset-0 bg-black z-[100]"
          />
        )}
        {isSearchOpen && (
          <motion.div
            key="search-panel"
            initial={{ y: "-100%" }}
            animate={{ y: 0 }}
            exit={{ y: "-100%" }}
            transition={{ type: "tween", duration: 0.35, ease: "easeInOut" }}
            className="fixed top-0 left-0 w-full bg-white text-brand-text z-[100] shadow-2xl border-b border-brand-lightGray/80 flex flex-col max-h-[85vh] overflow-y-auto"
          >
              <div className="w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 md:py-14">
                {/* Search Input and Close Button */}
                <div className="flex items-center justify-between pb-6 border-b border-brand-lightGray">
                  <div className="flex-grow max-w-3xl flex items-center">
                    <button
                      onClick={() => {
                        if (searchQuery.trim() !== "") {
                          setIsSearchOpen(false);
                          router.push(`/search?q=${encodeURIComponent(searchQuery.trim())}`);
                          setSearchQuery("");
                        }
                      }}
                      className="focus:outline-none p-1 mr-3 group"
                      aria-label="Submit search"
                    >
                      <Search className="text-brand-text/50 group-hover:text-brand-accent transition-colors" size={22} />
                    </button>
                    <input
                      type="text"
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      onKeyDown={(e) => {
                        if (e.key === "Enter" && searchQuery.trim() !== "") {
                          setIsSearchOpen(false);
                          router.push(`/search?q=${encodeURIComponent(searchQuery.trim())}`);
                          setSearchQuery("");
                        }
                      }}
                      placeholder="Search by collection, fabric or style..."
                      className="w-full bg-transparent text-brand-text text-xl md:text-2xl placeholder-brand-darkGray/40 border-none focus:outline-none font-sans font-light tracking-wide"
                      autoFocus
                    />
                    {searchQuery && (
                      <button
                        onClick={() => setSearchQuery("")}
                        className="text-brand-darkGray hover:text-brand-text p-1 transition-colors"
                      >
                        <X size={20} />
                      </button>
                    )}
                  </div>
                  <button
                    onClick={() => {
                      setIsSearchOpen(false);
                      setSearchQuery("");
                    }}
                    className="text-[10px] tracking-[0.3em] uppercase font-semibold text-brand-text/60 hover:text-brand-text transition-colors flex items-center space-x-2 pl-6 ml-4"
                  >
                    <span>Close</span>
                    <X size={14} className="stroke-[2.5]" />
                  </button>
                </div>

                {/* Content Box */}
                <div className="mt-10">
                  {searchQuery.trim() === "" ? (
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-10">
                      {/* Popular Searches */}
                      <div>
                        <h4 className="font-serif text-xs text-brand-text uppercase tracking-widest font-semibold mb-4">
                          Popular Searches
                        </h4>
                        <div className="flex flex-wrap gap-2">
                          {popularSearches.map((term) => (
                            <button
                              key={term}
                              onClick={() => setSearchQuery(term)}
                              className="border border-brand-lightGray hover:border-brand-text text-brand-darkGray hover:text-brand-text text-xs px-4 py-2 rounded-full transition-all duration-300"
                            >
                              {term}
                            </button>
                          ))}
                        </div>
                      </div>

                      {/* Categories */}
                      <div>
                        <h4 className="font-serif text-xs text-brand-text uppercase tracking-widest font-semibold mb-4">
                          Shop By Category
                        </h4>
                        <div className="grid grid-cols-2 gap-2 text-xs">
                          {categorySuggestions.map((cat) => (
                            <button
                              key={cat}
                              onClick={() => handleCategoryClick(cat)}
                              className="text-brand-darkGray hover:text-brand-text flex items-center transition-all duration-300 hover:translate-x-1 group text-left truncate"
                            >
                              <span className="w-1.5 h-1.5 rounded-full bg-brand-lightGray mr-2 group-hover:bg-brand-accent transition-colors flex-shrink-0" />
                              <span className="truncate">{cat}</span>
                            </button>
                          ))}
                        </div>
                      </div>

                      {/* Featured Brand Info */}
                      <div className="hidden md:block border-l border-brand-lightGray pl-10">
                        <h4 className="font-serif text-xs text-brand-text uppercase tracking-widest font-semibold mb-4">
                          Sanaya Collection
                        </h4>
                        <p className="text-xs text-brand-darkGray leading-relaxed font-light mb-4">
                          Discover our curated luxury collections, from traditional hand embroidery to modern flowy cuts, meticulously crafted for you.
                        </p>
                        <button
                          onClick={() => {
                            setIsSearchOpen(false);
                            router.push("/shop");
                          }}
                          className="text-[10px] tracking-widest uppercase font-semibold text-brand-accent hover:text-brand-primary underline underline-offset-4"
                        >
                          View All Products
                        </button>
                      </div>
                    </div>
                  ) : (
                    <div>
                      <div className="flex justify-between items-center mb-6">
                        <h4 className="font-serif text-xs text-brand-text uppercase tracking-widest font-semibold">
                          Search Results ({searchResults.length})
                        </h4>
                        <button
                          onClick={() => setSearchQuery("")}
                          className="text-[10px] text-brand-darkGray hover:text-brand-text underline"
                        >
                          Clear Search
                        </button>
                      </div>

                      {searchResults.length === 0 ? (
                        <div className="py-12 text-center">
                          <p className="text-sm text-brand-darkGray">No products found matching &ldquo;{searchQuery}&rdquo;. Try another term.</p>
                        </div>
                      ) : (
                        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-6">
                          {searchResults.map((product) => (
                            <div
                              key={product.id}
                              onClick={() => handleSearchItemClick(product.id)}
                              className="group cursor-pointer transition-all duration-300"
                            >
                              <div className="aspect-[3/4] bg-brand-bg rounded-lg overflow-hidden relative shadow-sm border border-brand-lightGray/40">
                                <img
                                  src={product.images[0]}
                                  alt={product.name}
                                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                                />
                                {product.discount > 0 && (
                                  <span className="absolute top-2 left-2 bg-brand-accent text-white text-[8px] font-bold tracking-wider uppercase px-2 py-0.5 rounded">
                                    {product.discount}% OFF
                                  </span>
                                )}
                              </div>
                              <div className="mt-3 space-y-1">
                                <h5 className="font-serif text-xs font-semibold text-brand-text truncate group-hover:text-brand-primary transition-colors">
                                  {product.name}
                                </h5>
                                <p className="text-[10px] text-brand-darkGray">{product.category}</p>
                                <p className="text-xs font-bold text-brand-accent">₹{product.salePrice}</p>
                              </div>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  )}
                </div>
              </div>
            </motion.div>
        )}
      </AnimatePresence>

      {/* Mobile Menu Panel */}
      <AnimatePresence>
        {isMobileMenuOpen && (
          <motion.div
            key="mobile-backdrop"
            initial={{ opacity: 0 }}
            animate={{ opacity: 0.5 }}
            exit={{ opacity: 0 }}
            onClick={() => setIsMobileMenuOpen(false)}
            className="fixed inset-0 bg-black z-[100]"
          />
        )}
        {isMobileMenuOpen && (
          <motion.div
            key="mobile-panel"
            initial={{ x: "-100%" }}
            animate={{ x: 0 }}
            exit={{ x: "-100%" }}
            transition={{ type: "tween", duration: 0.3 }}
            className="fixed top-0 left-0 h-full w-full max-w-xs bg-white shadow-2xl z-[101] flex flex-col"
          >
              <div className="p-6 border-b border-brand-lightGray flex items-center justify-between bg-brand-bg">
                <img src="/logo.png" alt="Sanaya Collection" className="h-14 w-auto object-contain rounded" />
                <button onClick={() => setIsMobileMenuOpen(false)} className="p-1 hover:text-brand-accent transition-colors" aria-label="Close mobile menu">
                  <X size={20} />
                </button>
              </div>

              <div className="flex-1 overflow-y-auto py-6 px-4 space-y-6">
                <div>
                  <h4 className="font-serif text-[10px] text-brand-accent tracking-widest uppercase font-bold mb-3">Navigation</h4>
                  <ul className="space-y-4 text-sm font-semibold uppercase tracking-wider">
                    <li>
                      <Link href="/" onClick={() => setIsMobileMenuOpen(false)} className="block hover:text-brand-primary">
                        Home
                      </Link>
                    </li>
                    <li>
                      <Link href="/shop?filter=best-sellers" onClick={() => setIsMobileMenuOpen(false)} className="block hover:text-brand-primary">
                        Best Sellers
                      </Link>
                    </li>
                    <li>
                      <Link href="/about" onClick={() => setIsMobileMenuOpen(false)} className="block hover:text-brand-primary">
                        About Us
                      </Link>
                    </li>
                    <li>
                      <Link href="/contact" onClick={() => setIsMobileMenuOpen(false)} className="block hover:text-brand-primary">
                        Contact Us
                      </Link>
                    </li>
                  </ul>
                </div>

                <div>
                  <h4 className="font-serif text-[10px] text-brand-accent tracking-widest uppercase font-bold mb-3">Shop Categories</h4>
                  <ul className="grid grid-cols-2 gap-x-2 gap-y-2 text-xs uppercase tracking-wide text-brand-darkGray">
                    {categorySuggestions.map((cat) => (
                      <li key={cat}>
                        <button
                          onClick={() => handleCategoryClick(cat)}
                          className="w-full text-left hover:text-brand-primary py-1 truncate"
                        >
                          {cat}
                        </button>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>

              {/* Mobile Menu Footer */}
              <div className="p-6 border-t border-brand-lightGray bg-neutral-50/40 text-center">
                <Link
                  href="/orders"
                  onClick={() => setIsMobileMenuOpen(false)}
                  className="flex items-center justify-center space-x-2 w-full bg-brand-accent text-white py-3.5 rounded-xl text-xs font-bold uppercase tracking-widest hover:bg-brand-primary transition-all shadow-md shadow-brand-accent/20"
                >
                  <Package size={16} />
                  <span>Track My Order</span>
                </Link>

                <div className="mt-4 pt-4 border-t border-brand-lightGray/60 space-y-2">
                  <div className="grid grid-cols-2 gap-2">
                    <Link
                      href="/orders"
                      onClick={() => setIsMobileMenuOpen(false)}
                      className="bg-brand-accent text-white text-[10px] py-2.5 rounded-lg uppercase font-bold tracking-wider hover:bg-brand-primary text-center flex items-center justify-center space-x-1"
                    >
                      <History size={13} className="mr-1" />
                      <span>My Orders</span>
                    </Link>
                    <Link
                      href="/contact"
                      onClick={() => setIsMobileMenuOpen(false)}
                      className="border border-neutral-300 text-neutral-700 text-[10px] py-2.5 rounded-lg uppercase font-bold tracking-wider hover:bg-neutral-50 text-center flex items-center justify-center space-x-1"
                    >
                      <Headphones size={13} className="mr-1" />
                      <span>Contact Us</span>
                    </Link>
                  </div>
                </div>
              </div>
            </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
