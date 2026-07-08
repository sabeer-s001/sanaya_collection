"use client";

import React, { useState } from "react";
import { Mail } from "lucide-react";
import { motion } from "framer-motion";

export default function NewsletterSection() {
  const [newsletterEmail, setNewsletterEmail] = useState("");
  const [subscribed, setSubscribed] = useState(false);

  const handleNewsletterSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (newsletterEmail.trim()) {
      setSubscribed(true);
      setNewsletterEmail("");
      setTimeout(() => setSubscribed(false), 4000);
    }
  };

  return (
    <section className="bg-brand-bg py-20 border-t border-brand-primary/10">
      <div className="max-w-3xl mx-auto px-4 text-center">
        <h2 className="font-serif text-2xl sm:text-3xl font-bold text-brand-text mb-8">
          Get Exclusive Offers
        </h2>

        <form onSubmit={handleNewsletterSubmit} className="flex flex-col sm:flex-row gap-2 max-w-md mx-auto relative">
          <div className="relative flex-1">
            <Mail size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-brand-darkGray" />
            <input
              type="email"
              required
              value={newsletterEmail}
              onChange={(e) => setNewsletterEmail(e.target.value)}
              placeholder="Enter your email address"
              className="w-full bg-white text-brand-text text-xs px-10 py-3.5 rounded-full border border-brand-lightGray focus:border-brand-accent focus:outline-none"
            />
          </div>
          <button
            type="submit"
            className="bg-brand-accent hover:bg-brand-primary text-white text-xs px-8 py-3.5 rounded-full font-semibold uppercase tracking-widest transition-colors whitespace-nowrap shadow-md"
          >
            Subscribe
          </button>
        </form>

        {subscribed && (
          <motion.p
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-xs text-green-600 font-semibold mt-4"
          >
            Thank you for subscribing! Check your inbox for your 10% discount coupon.
          </motion.p>
        )}
      </div>
    </section>
  );
}
