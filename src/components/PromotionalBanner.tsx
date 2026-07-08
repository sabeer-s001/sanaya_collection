"use client";

import React from "react";
import { useRouter } from "next/navigation";
import DfSaleOnSaleMobile from "../../public/images/PromotionalBannerImagephone.png";
import DfSaleOnSaleDesktop from "../../public/images/PromotionalBannerImageDesk.png";

export default function PromotionalBanner() {
  const router = useRouter();

  return (
    <section className="relative w-full h-[70vh] md:h-[80vh] overflow-hidden bg-brand-text">
      {/* Overlay */}
      <div className="absolute inset-0 z-10" />

      {/* Mobile Image */}
      <img
        src={DfSaleOnSaleMobile.src}
        alt="Luxury fashion model"
        className="block md:hidden w-full h-full object-cover"
      />

      {/* Desktop Image */}
      <img
        src={DfSaleOnSaleDesktop.src}
        alt="Luxury fashion model"
        className="hidden md:block w-full h-full object-cover"
      />
    </section>
  );
} 