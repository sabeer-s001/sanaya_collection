
"use client";

import React from "react";
import { useRouter } from "next/navigation";
import categories01 from "/public/images/CATEGORIES01.jpg";
import categories02 from "/public/images/CATEGORIES02.jpg";
import categories03 from "/public/images/CATEGORIES03.jpg";
import categories04 from "/public/images/CATEGORIES04.jpg";
import categories05 from "/public/images/CATEGORIES05.jpg";


const CATEGORIES = [
  {
    name: "Shalwar Kameez",
    image: categories01.src,
    description: "Embroidered Lawn & Chiffon",
  },
  {
    name: "Kurtis",
    image: categories04.src,
    description: "Modern & Designer Tunics",
  },
  {
    name: "Casuals",
    image: categories02.src,
    description: "Daily Wear & Comfort",
  },
  {
    name: "Party Wear",
    image: categories03.src,
    description: "Elegant Festive Outfits",
  },
  {
    name: "Bridal Wear",
    image: categories05.src,
    description: "Elegant Festive Outfits",
  },

];

export default function CollectionsSection() {
  const router = useRouter();
  const scrollRef = React.useRef<HTMLDivElement>(null);
  const [scrollProgress, setScrollProgress] = React.useState(0);

  const handleScroll = () => {
    if (scrollRef.current) {
      const { scrollLeft, scrollWidth, clientWidth } = scrollRef.current;
      const totalScroll = scrollWidth - clientWidth;
      if (totalScroll > 0) {
        const progress = (scrollLeft / totalScroll) * 100;
        setScrollProgress(progress);
      } else {
        setScrollProgress(0);
      }
    }
  };

  React.useEffect(() => {
    const el = scrollRef.current;
    if (el) {
      el.addEventListener("scroll", handleScroll, { passive: true });
      // Initial calculation
      handleScroll();
    }
    window.addEventListener("resize", handleScroll);
    return () => {
      if (el) {
        el.removeEventListener("scroll", handleScroll);
      }
      window.removeEventListener("resize", handleScroll);
    };
  }, []);

  const handleCategorySelect = (category: string) => {
    if (category === "All" || category === "New Arrivals") {
      router.push("/shop");
    } else if (category === "Best Sellers") {
      router.push("/shop?filter=best-sellers");
    } else {
      router.push(`/shop?category=${encodeURIComponent(category)}`);
    }
  };

  return (
    <section
      id="category-section"
      className="py-16 sm:py-20 pl-5 max-w-[1800px] mx-auto w-full"
    >
      {/* Heading */}
      <div className="text-center max-w-xl mx-auto mb-12 px-4 sm:px-6 lg:px-8">
        <h2 className="font-serif text-3xl md:text-4xl font-semibold text-brand-text">
          Browse Our Collections
        </h2>
      </div>

      {/* Categories */}
      <div
        ref={scrollRef}
        style={{ WebkitOverflowScrolling: "touch" }}
        className="
          flex
          flex-nowrap
          sm:grid
          sm:grid-cols-2
          md:grid-cols-3
          lg:grid-cols-5
          gap-4
          overflow-x-auto
          scrollbar-none
          snap-x
          snap-mandatory
          sm:px-6
          lg:px-8
          pb-4
          sm:pb-0
        "
      >
        {/* ✅ Left spacer — forces padding on mobile scroll start */}
        <div className="flex-shrink-0 w-4 sm:hidden" aria-hidden="true" />

        {CATEGORIES.map((cat, idx) => (
          <div
            key={idx}
            onClick={() => handleCategorySelect(cat.name)}
            className="
              flex-shrink-0
              w-[86vw]
              max-w-[290px]
              sm:w-full
              sm:max-w-none
              group
              cursor-pointer
              overflow-hidden
             rounded-md
              snap-start
            "
          >
            <div
              className="
                relative
                aspect-[2.5/4]
                sm:aspect-[2.5/3.8]
                md:aspect-[2.5/4.2]
  lg:aspect-[2.5/4.5]
  xl:aspect-[2.5/4.8]
  2xl:aspect-[2.5/5]
                overflow-hidden
               rounded-md 
              "
            >
              <img
                src={cat.image}
                alt={cat.name}
                className="
                  w-full h-full
                  object-cover object-top
                  transition-transform duration-700 ease-out
                  group-hover:scale-105
                "
              />

              {/* Overlay */}
              <div className="absolute inset-0 bg-gradient-to-t from-black/30 via-black/5 to-transparent" />

              {/* Content */}
              <div className="absolute bottom-10 left-0 right-0 flex flex-col items-center px-4">
                <h3
                  className="
                    font-serif
                    text-[#D4AF37]
                    text-lg sm:text-xl lg:text-2xl
                    font-bold uppercase tracking-[0.25em]
                    text-center mb-4
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
                    group-hover:after:scale-x-110
                  "
                >
                  SHOP NOW
                </span>
              </div>
            </div>
          </div>
        ))}

        {/* ✅ Right spacer — mirrors left gap at scroll end */}
        <div className="flex-shrink-0 w-4 sm:hidden" aria-hidden="true" />
      </div>

      {/* Scroll indicator - only visible on mobile (sm:hidden) */}
      <div className="mt-6 flex justify-center pr-5 sm:hidden">
        <div className="w-[90%] h-[6px] bg-brand-lightGray rounded-full overflow-hidden relative">
          <div
            className="absolute top-0 bottom-0 w-16 bg-brand-accent rounded-full transition-all duration-100 ease-out"
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