"use client";

import React from "react";
import { motion } from "framer-motion";

export default function SocialCommunity() {
  const socialPlatforms = [
    {
      name: "WhatsApp",
      handle: "Join Chat",
      color: "#25D366",
      bgHover: "rgba(37, 211, 102, 0.08)",
      borderHover: "rgba(37, 211, 102, 0.3)",
      href: "https://wa.me/917021366239",
      icon: (
        <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
          <path d="M.057 24l1.687-6.163c-1.041-1.804-1.588-3.849-1.587-5.946C.06 5.348 5.397.01 12.008.01c3.202.001 6.212 1.246 8.477 3.514 2.266 2.268 3.507 5.28 3.505 8.484-.004 6.657-5.34 11.997-11.953 11.997-2.005-.001-3.973-.502-5.724-1.457L0 24zm6.59-4.846c1.6.95 3.188 1.449 4.625 1.45 5.489 0 9.952-4.463 9.955-9.953.002-2.66-1.033-5.159-2.914-7.04C16.43 1.77 13.93 1.733 12.01 1.73c-5.49 0-9.953 4.463-9.957 9.95-.002 2.01.526 3.968 1.53 5.71l-1.002 3.666 3.766-.988z" />
        </svg>
      ),
    },
    {
      name: "Instagram",
      handle: "@sanaya_collection786",
      color: "#E1306C",
      bgHover: "rgba(225, 48, 108, 0.08)",
      borderHover: "rgba(225, 48, 108, 0.3)",
      href: "https://www.instagram.com/sanaya_collection786",
      icon: (
        <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
          <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zM12 0C8.741 0 8.333.014 7.053.072 2.695.272.273 2.69.073 7.051C.014 8.333 0 8.741 0 12c0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98C8.333 23.986 8.741 24 12 24c3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98C15.668.014 15.259 0 12 0zm0 5.838a6.162 6.162 0 100 12.324 6.162 6.162 0 000-12.324zM12 16a4 4 0 110-8 4 4 0 010 8zm6.406-11.845a1.44 1.44 0 100 2.881 1.44 1.44 0 000-2.881z" />
        </svg>
      ),
    },
    {
      name: "Facebook",
      handle: "Sanaya Collection",
      color: "#1877F2",
      bgHover: "rgba(24, 119, 242, 0.08)",
      borderHover: "rgba(24, 119, 242, 0.3)",
      href: "https://facebook.com",
      icon: (
        <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
          <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z" />
        </svg>
      ),
    },
    {
      name: "Telegram",
      handle: "Join Channel",
      color: "#229ED9",
      bgHover: "rgba(34, 158, 217, 0.08)",
      borderHover: "rgba(34, 158, 217, 0.3)",
      href: "https://t.me",
      icon: (
        <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
          <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm4.64 6.8c-.15 1.58-.8 5.42-1.13 7.19-.14.75-.42 1-.68 1.03-.58.05-1.02-.38-1.58-.75-.88-.58-1.38-.94-2.23-1.5-1-.65-.35-1 .22-1.6 1.5-1.55 2.75-2.9 2.75-2.92.01-.06-.02-.08-.09-.05-.09.03-1.57 1-4.43 2.92-.44.3-.84.45-1.19.44-.39 0-1.13-.21-1.69-.39-.68-.22-1.22-.34-1.17-.72.03-.2.3-.41.81-.62 3.16-1.37 5.27-2.28 6.32-2.72 3.01-1.25 3.63-1.47 4.04-1.47.09 0 .29.02.42.12.11.09.14.21.15.3.01.06.01.2-.01.37z" />
        </svg>
      ),
    },
  ];

  return (
    <section className="py-16 sm:py-20 bg-gradient-to-b from-[#FFFBFB] via-[#FDF3F5] to-[#FFFBFB] border-y border-pink-100/40">
      <div className="max-w-4xl mx-auto px-4 text-center">

        {/* Subtitle / Elegant Tag */}
        <span className="font-sans text-[10px] uppercase tracking-[0.35em] text-rose-300/80 block mb-4 font-medium">
          ✦ Join the Sanaya Circle ✦
        </span>

        {/* Catchy / Gorgeous Header */}
        <h2 className="font-serif text-3xl sm:text-4xl lg:text-[2.75rem] font-light italic tracking-wide text-brand-text mb-3 leading-snug">
          <span
            className="font-normal tracking-[-0.03em] text-zinc-700"
            style={{ fontFamily: "var(--font-outfit), sans-serif" }}
          >
            10,000+
          </span>{" "}
          Followers <span className="not-italic font-normal">&</span> Growing
        </h2>

        <p className="font-sans text-[13px] sm:text-sm text-neutral-400 max-w-lg mx-auto mb-10 leading-relaxed font-light">
          Be part of our exclusive fashion journey. Connect with us for <span className="font-medium text-neutral-500">instant collection previews</span>, VIP discounts &amp; daily style drops.
        </p>

        {/* Small, Colorful & Attractive Floating Badges Row */}
        <div className="flex flex-wrap justify-center items-center gap-3 sm:gap-4">
          {socialPlatforms.map((platform, idx) => (
            <motion.a
              key={platform.name}
              href={platform.href}
              target="_blank"
              rel="noopener noreferrer"
              initial={{ opacity: 0, scale: 0.9 }}
              whileInView={{ opacity: 1, scale: 1 }}
              viewport={{ once: true }}
              transition={{ duration: 0.3, delay: idx * 0.05 }}
              style={{
                "--color": platform.color,
                "--bg-hover": platform.bgHover,
                "--border-hover": platform.borderHover,
              } as React.CSSProperties}
              className="
                group flex items-center gap-2.5 px-4 py-2.5 rounded-full 
                border border-neutral-200 bg-white shadow-sm
                transition-all duration-300 hover:-translate-y-0.5 hover:shadow-md
                text-neutral-700
              "
              onMouseEnter={(e) => {
                e.currentTarget.style.color = platform.color;
                e.currentTarget.style.borderColor = platform.borderHover;
                e.currentTarget.style.backgroundColor = platform.bgHover;
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.color = "";
                e.currentTarget.style.borderColor = "";
                e.currentTarget.style.backgroundColor = "";
              }}
            >
              {/* Colorful Icon wrapper */}
              <div
                className="flex items-center justify-center transition-all duration-300"
                style={{ color: platform.color }}
              >
                {platform.icon}
              </div>

              {/* Short / Catchy Label */}
              <span className="font-sans font-medium text-[11px] uppercase tracking-[0.12em] text-neutral-700 group-hover:text-inherit">
                {platform.name}
              </span>
            </motion.a>
          ))}
        </div>

      </div>
    </section>
  );
}
