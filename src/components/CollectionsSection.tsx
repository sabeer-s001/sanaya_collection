"use client";

import React from "react";
import { useRouter } from "next/navigation";
import { ProductCategory } from "@/lib/constants";
import { ChevronLeft, ChevronRight } from "lucide-react";

import categories01 from "/public/images/CATEGORIES01.jpg";
import CATEGORIESUnstitched from "/public/images/CATEGORIESUnstitched.jpeg";
import categories02 from "/public/images/CATEGORIES02.jpg";
import categories03 from "/public/images/CATEGORIES03.jpg";
import categories04 from "/public/images/CATEGORIES04.jpg";
import Embroidery from "/public/images/Embroidery.jpg";
import DailyWear from "/public/images/Daily Wear.jpg";
import Patchwork from "/public/images/Patchwork.jpg";
import WesternWear from "/public/images/Western Wear.jpg";
import categories05 from "/public/images/CATEGORIES05.jpg";
import NightWear from "/public/images/Night Wear.webp";

interface CategoryMeta {
  name: ProductCategory;
  image?: string;
  description: string;
}

const CATEGORIES: CategoryMeta[] = [
  {
    name: "Stitched",
    image: categories01.src,
    description: "Ready-to-Wear Suits",
  },
  {
    name: "Unstitched",
    image: CATEGORIESUnstitched.src,
    description: "Premium Unstitched Fabrics",
  },
  {
    name: "Pakistani Suit",
    image: categories03.src,
    description: "Authentic Designer Wear",
  },
  {
    name: "Printed",
    image: categories04.src,
    description: "Vibrant Floral & Lawn Prints",
  },
  {
    name: "Embroidery",
    image: Embroidery.src,
    description: "Intricate Hand & Zari Work",
  },
  {
    name: "Patchwork",
    image: Patchwork.src,
    description: "Artisanal Designer Detailing",
  },
  {
    name: "Daily Wear",
    image: DailyWear.src,
    description: "Everyday Comfort & Grace",
  },
  {
    name: "Party Wear",
    image: categories05.src,
    description: "Glamorous Festive Outfits",
  },
  {
    name: "Casual Wear",
    image: categories02.src,
    description: "Breezy & Chic Ensembles",
  },
  {
    name: "Western Wear",
    image: WesternWear.src,
    description: "Modern Cuts & Fusion Styles",
  },
  {
    name: "Night Wear",
    image: NightWear.src,
    description: "Relaxed Loungewear & Nightwear",
  },
];

export default function CollectionsSection() {
  const router = useRouter();
  const scrollRef = React.useRef<HTMLDivElement>(null);
  const [scrollProgress, setScrollProgress] = React.useState(0);
  const [canScrollLeft, setCanScrollLeft] = React.useState(false);
  const [canScrollRight, setCanScrollRight] = React.useState(true);

  const checkScrollState = () => {
    if (scrollRef.current) {
      const { scrollLeft, scrollWidth, clientWidth } = scrollRef.current;
      const totalScroll = scrollWidth - clientWidth;
      if (totalScroll > 0) {
        setScrollProgress((scrollLeft / totalScroll) * 100);
        setCanScrollLeft(scrollLeft > 10);
        setCanScrollRight(scrollLeft < totalScroll - 10);
      } else {
        setScrollProgress(0);
        setCanScrollLeft(false);
        setCanScrollRight(false);
      }
    }
  };

  const scroll = (direction: "left" | "right") => {
    if (scrollRef.current) {
      const scrollAmount = Math.max(300, scrollRef.current.clientWidth * 0.7);
      scrollRef.current.scrollBy({
        left: direction === "left" ? -scrollAmount : scrollAmount,
        behavior: "smooth",
      });
    }
  };

  React.useEffect(() => {
    const el = scrollRef.current;
    if (el) {
      el.addEventListener("scroll", checkScrollState, { passive: true });
      checkScrollState();
    }
    window.addEventListener("resize", checkScrollState);
    return () => {
      if (el) {
        el.removeEventListener("scroll", checkScrollState);
      }
      window.removeEventListener("resize", checkScrollState);
    };
  }, []);

  const handleCategorySelect = (category: string) => {
    router.push(`/shop?category=${encodeURIComponent(category)}`);
  };

  return (
    <section
      id="category-section"
      className="py-16 sm:py-20 max-w-7xl mx-auto w-full px-4 sm:px-6 lg:px-8"
    >
      {/* Centered Heading */}
      <div className="relative text-center max-w-2xl mx-auto mb-10 sm:mb-12">
        <span className="inline-block text-[11px] sm:text-xs font-semibold tracking-[0.3em] uppercase text-brand-accent mb-2">
          Curated Wardrobe
        </span>
        <h2 className="font-serif text-3xl sm:text-4xl lg:text-[2.5rem] font-normal tracking-wide text-neutral-900 leading-tight">
          Browse Our <span className="italic font-serif text-brand-accent font-light">Collections</span>
        </h2>
      </div>

      {/* Slidable Carousel with Next/Prev Buttons */}
      <div className="relative group">
        {/* Left Slide Button */}
        <button
          type="button"
          onClick={() => scroll("left")}
          disabled={!canScrollLeft}
          aria-label="Previous categories"
          className={`
            hidden sm:flex
            absolute -left-3 lg:-left-5 top-1/2 -translate-y-1/2 z-20
            w-11 h-11 rounded-full
            bg-white text-brand-text
            shadow-lg border border-neutral-200
            items-center justify-center
            transition-all duration-200
            hover:scale-110 hover:bg-brand-accent hover:text-white
            ${!canScrollLeft ? "opacity-30 cursor-not-allowed hover:scale-100 hover:bg-white hover:text-brand-text" : "opacity-90 hover:opacity-100 cursor-pointer"}
          `}
        >
          <ChevronLeft size={22} />
        </button>

        {/* Right Slide Button */}
        <button
          type="button"
          onClick={() => scroll("right")}
          disabled={!canScrollRight}
          aria-label="Next categories"
          className={`
            hidden sm:flex
            absolute -right-3 lg:-right-5 top-1/2 -translate-y-1/2 z-20
            w-11 h-11 rounded-full
            bg-white text-brand-text
            shadow-lg border border-neutral-200
            items-center justify-center
            transition-all duration-200
            hover:scale-110 hover:bg-brand-accent hover:text-white
            ${!canScrollRight ? "opacity-30 cursor-not-allowed hover:scale-100 hover:bg-white hover:text-brand-text" : "opacity-90 hover:opacity-100 cursor-pointer"}
          `}
        >
          <ChevronRight size={22} />
        </button>

        {/* Categories Rail - Slidable on both Mobile and PC */}
        <div
          ref={scrollRef}
          style={{ WebkitOverflowScrolling: "touch" }}
          className="
            flex
            flex-nowrap
            overflow-x-auto
            scrollbar-none
            snap-x
            snap-mandatory
            gap-4
            sm:gap-6
            pb-4
            sm:pb-6
          "
        >
          {CATEGORIES.map((cat, idx) => {
            return (
              <div
                key={idx}
                onClick={() => handleCategorySelect(cat.name)}
                className="
                  flex-shrink-0
                  w-[82vw]
                  max-w-[310px]
                  sm:w-[290px]
                  md:w-[320px]
                  lg:w-[340px]
                  group/card
                  cursor-pointer
                  overflow-hidden
                  rounded-md
                  snap-start
                "
              >
                <div
                  className="
                    relative
                    aspect-[2.7/4]
                    sm:aspect-[2.7/3.9]
                    md:aspect-[2.7/4]
                    lg:aspect-[2.7/4]
                    overflow-hidden
                    rounded-md
                    bg-gradient-to-b from-neutral-900 via-neutral-950 to-black
                  "
                >
                  {/* Category Image if provided */}
                  {cat.image ? (
                    <>
                      <img
                        src={cat.image}
                        alt={cat.name}
                        className="
                          w-full h-full
                          object-cover object-top
                          transition-transform duration-700 ease-out
                          group-hover/card:scale-105
                        "
                      />
                      {/* Gradient Overlay */}
                      <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/20 to-transparent" />
                    </>
                  ) : (
                    <div className="absolute inset-0 flex flex-col items-center justify-center p-6 text-center border border-neutral-800/80 rounded-md bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-neutral-800/40 via-neutral-900/80 to-black">
                      <div className="w-12 h-12 rounded-full border border-brand-accent/30 flex items-center justify-center mb-4 text-brand-accent/60 group-hover/card:border-brand-accent group-hover/card:text-brand-accent transition-colors">
                        <span className="font-serif text-lg font-light italic">S</span>
                      </div>
                    </div>
                  )}

                  {/* Content */}
                  <div className="absolute bottom-8 sm:bottom-10 left-0 right-0 flex flex-col items-center px-4 text-center">
                    <h3
                      className="
                        font-serif
                        text-[#D4AF37]
                        text-lg sm:text-xl lg:text-2xl
                        font-bold uppercase tracking-[0.25em]
                        text-center mb-4
                        drop-shadow-sm
                      "
                    >
                      {cat.name}
                    </h3>

                    <span
                      className="
                        text-white text-xs sm:text-sm
                        uppercase tracking-[0.25em]
                        relative pb-1
                        after:absolute after:left-0 after:bottom-0
                        after:w-full after:h-[1px] after:bg-white
                        after:origin-center after:transition-transform after:duration-300
                        group-hover/card:after:scale-x-110
                      "
                    >
                      SHOP NOW
                    </span>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Progress Bar Indicator below - visible on mobile only */}
      <div className="mt-4 flex sm:hidden justify-center">
        <div className="w-[80%] h-[4px] bg-neutral-200 rounded-full overflow-hidden relative">
          <div
            className="absolute top-0 bottom-0 w-24 bg-brand-accent rounded-full transition-all duration-100 ease-out"
            style={{
              left: `${scrollProgress}%`,
              transform: `translateX(-${scrollProgress}%)`,
            }}
          />
        </div>
      </div>
    </section>
  );
}