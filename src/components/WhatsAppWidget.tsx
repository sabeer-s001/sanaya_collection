"use client";

import React, { useState, useEffect } from "react";
import { X, Send, Heart } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { useApp } from "@/context/AppContext";

const WhatsAppIcon = ({ className = "w-6 h-6" }: { className?: string }) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    viewBox="0 0 24 24"
    fill="currentColor"
    className={className}
  >
    <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413Z" />
  </svg>
);

export default function WhatsAppWidget() {
  const { wishlist } = useApp();
  const [isOpen, setIsOpen] = useState(false);
  const [showTooltip, setShowTooltip] = useState(false);
  const [hasNotification, setHasNotification] = useState(false);
  const [message, setMessage] = useState("");

  const phoneNumber = "917021366239";

  const openWishlist = () => {
    window.dispatchEvent(new CustomEvent("open-wishlist"));
  };

  useEffect(() => {
    // Show tooltip and notification badge after 4 seconds
    const timer = setTimeout(() => {
      setShowTooltip(true);
      setHasNotification(true);
    }, 4000);

    // Auto-hide tooltip after 12 seconds
    const hideTimer = setTimeout(() => {
      setShowTooltip(false);
    }, 12000);

    return () => {
      clearTimeout(timer);
      clearTimeout(hideTimer);
    };
  }, []);

  const handleToggle = () => {
    setIsOpen(!isOpen);
    setHasNotification(false);
    setShowTooltip(false);
  };

  const handleSend = (e: React.FormEvent) => {
    e.preventDefault();
    if (!message.trim()) return;

    const encodedMessage = encodeURIComponent(message);
    const whatsappUrl = `https://wa.me/${phoneNumber}?text=${encodedMessage}`;
    window.open(whatsappUrl, "_blank", "noopener,noreferrer");
    setMessage("");
    setIsOpen(false);
  };

  const handleQuickChat = (questionText: string) => {
    const encodedMsg = encodeURIComponent(questionText);
    const whatsappUrl = `https://wa.me/${phoneNumber}?text=${encodedMsg}`;
    window.open(whatsappUrl, "_blank", "noopener,noreferrer");
    setIsOpen(false);
  };

  return (
    <div className="fixed bottom-6 right-6 md:bottom-8 md:right-8 z-[9999] flex flex-col items-end">
      {/* Tooltip Speech Bubble */}
      <AnimatePresence>
        {showTooltip && !isOpen && (
          <motion.div
            initial={{ opacity: 0, y: 15, scale: 0.85 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 10, scale: 0.9 }}
            transition={{ type: "spring", stiffness: 300, damping: 25 }}
            className="absolute bottom-16 right-0 mb-3 bg-white text-brand-text px-4 py-3 rounded-2xl shadow-xl border border-brand-lightGray text-sm font-medium w-48 text-center cursor-pointer pointer-events-auto"
            onClick={handleToggle}
          >
            {/* Small arrow */}
            <div className="absolute bottom-0 right-6 transform translate-y-1/2 rotate-45 w-3 h-3 bg-white border-r border-b border-brand-lightGray"></div>
            <p className="relative z-10 text-xs text-neutral-600">
              Need assistance? <span className="font-semibold text-emerald-600">Chat with us!</span>
            </p>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Main Chat Window */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: 40, scale: 0.85, originX: 1, originY: 1 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 30, scale: 0.85 }}
            transition={{ type: "spring", stiffness: 300, damping: 26 }}
            className="mb-4 w-[320px] sm:w-[350px] bg-white rounded-3xl shadow-2xl overflow-hidden border border-neutral-100 flex flex-col"
          >
            {/* Widget Header */}
            <div className="relative p-6 text-white bg-gradient-to-r from-emerald-700 via-emerald-600 to-teal-700 flex items-center justify-between">
              <div className="flex items-center gap-3">
                {/* Brand Logo Avatar */}
                <div className="relative w-12 h-12 rounded-full bg-white/10 flex items-center justify-center border border-white/20 overflow-hidden backdrop-blur-md">
                  <span className="font-serif text-lg font-bold tracking-wider text-white">SC</span>
                  <div className="absolute bottom-0.5 right-0.5 w-3 h-3 bg-green-400 rounded-full border-2 border-emerald-600 animate-pulse"></div>
                </div>
                <div>
                  <h3 className="font-serif text-base font-medium tracking-wide">Sanaya Support</h3>
                  <div className="flex items-center gap-1.5 text-[10px] text-emerald-100 font-medium">
                    <span>Typically replies instantly</span>
                  </div>
                </div>
              </div>
              <button
                type="button"
                onClick={handleToggle}
                className="p-1.5 rounded-full hover:bg-white/10 transition-colors text-white/80 hover:text-white"
                aria-label="Close chat"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Chat Body */}
            <div className="p-5 bg-neutral-50 max-h-[280px] overflow-y-auto space-y-4">
              {/* Automated message */}
              <div className="flex gap-2 items-start max-w-[90%]">
                <div className="w-7 h-7 rounded-full bg-emerald-100 text-emerald-800 flex items-center justify-center font-bold text-xs shrink-0">
                  S
                </div>
                <div className="bg-white p-3 rounded-2xl rounded-tl-none shadow-sm text-xs sm:text-sm text-neutral-700 leading-relaxed border border-neutral-100">
                  <p className="font-serif text-neutral-800 font-semibold mb-1">Assalam-o-Alaikum! 👋</p>
                  <p>Welcome to Sanaya Collection. How can we help you today with your outfit selection or order query?</p>
                </div>
              </div>

              {/* Suggestions */}
              <div className="pl-9 space-y-2">
                <button
                  type="button"
                  onClick={() => handleQuickChat("Hi, I need help with custom sizing for an order.")}
                  className="block text-left text-xs bg-white hover:bg-emerald-50 text-neutral-700 hover:text-emerald-700 px-3 py-1.5 rounded-full border border-neutral-200 hover:border-emerald-200 transition-all font-medium shadow-sm w-full animate-luxury"
                >
                  📏 Custom Sizing help
                </button>
              </div>
            </div>

            {/* Chat Input / Action Area */}
            <form onSubmit={handleSend} className="p-4 bg-white border-t border-neutral-100 flex items-center gap-2">
              <input
                type="text"
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                placeholder="Type a message..."
                className="flex-1 bg-neutral-100 hover:bg-neutral-50 focus:bg-white text-xs sm:text-sm text-neutral-800 placeholder-neutral-400 py-2.5 px-4 rounded-full outline-none border border-transparent focus:border-emerald-500 transition-all"
              />
              <button
                type="submit"
                className="p-2.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-full transition-all duration-300 hover:scale-105 shadow-md flex items-center justify-center active:scale-95 shrink-0"
                aria-label="Send to WhatsApp"
              >
                <Send className="w-4 h-4" />
              </button>
            </form>

            <div className="bg-neutral-50 px-4 py-2 border-t border-neutral-100 text-center flex items-center justify-center gap-1.5">
              <WhatsAppIcon className="w-3.5 h-3.5 text-emerald-600" />
              <span className="text-[10px] text-neutral-400 font-medium">
                Typically online 24/7
              </span>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Floating Wishlist Toggle Button (Mobile Only) */}
      {!isOpen && (
        <motion.button
          onClick={openWishlist}
          whileHover={{ scale: 1.08 }}
          whileTap={{ scale: 0.95 }}
          className="md:hidden relative p-4 rounded-full shadow-2xl flex items-center justify-center bg-white text-brand-accent border border-brand-primary/10 mb-4 z-50 hover:bg-neutral-50 transition-all duration-300"
          aria-label="Open wishlist"
        >
          <Heart className="w-6 h-6" />
          {wishlist.length > 0 && (
            <span className="absolute -top-1 -right-1 bg-brand-accent text-white text-[9px] w-5 h-5 rounded-full flex items-center justify-center font-bold border-2 border-white">
              {wishlist.length}
            </span>
          )}
        </motion.button>
      )}

      {/* Floating Toggle Button */}
      <motion.button
        onClick={handleToggle}
        whileHover={{ scale: 1.08 }}
        whileTap={{ scale: 0.95 }}
        className={`relative p-4 rounded-full shadow-2xl flex items-center justify-center transition-all duration-500 group z-50 text-white ${isOpen
          ? "bg-neutral-800 hover:bg-neutral-900"
          : "bg-gradient-to-tr from-emerald-600 to-green-500 hover:from-emerald-500 hover:to-green-400"
          }`}
        aria-label={isOpen ? "Close WhatsApp Chat" : "Open WhatsApp Chat"}
      >
        {/* Pulsing ring indicator (only when closed) */}
        {!isOpen && (
          <span className="absolute inset-0 rounded-full bg-emerald-500/30 animate-ping pointer-events-none scale-105 opacity-75"></span>
        )}

        {/* Notification badge */}
        {hasNotification && !isOpen && (
          <span className="absolute -top-1 -right-1 w-5 h-5 bg-rose-500 rounded-full border-2 border-white text-[10px] font-bold flex items-center justify-center text-white animate-bounce">
            1
          </span>
        )}

        <AnimatePresence mode="wait">
          {isOpen ? (
            <motion.div
              key="close"
              initial={{ rotate: -90, opacity: 0 }}
              animate={{ rotate: 0, opacity: 1 }}
              exit={{ rotate: 90, opacity: 0 }}
              transition={{ duration: 0.2 }}
            >
              <X className="w-6 h-6" />
            </motion.div>
          ) : (
            <motion.div
              key="whatsapp"
              initial={{ rotate: 90, opacity: 0 }}
              animate={{ rotate: 0, opacity: 1 }}
              exit={{ rotate: -90, opacity: 0 }}
              transition={{ duration: 0.2 }}
            >
              <WhatsAppIcon className="w-6 h-6" />
            </motion.div>
          )}
        </AnimatePresence>
      </motion.button>
    </div>
  );
}

