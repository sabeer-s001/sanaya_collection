"use client";

import React, { useState, useEffect, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import DfHeroDesk from "../../public/images/DfHeroDesk.png";
import DfHeorMobil from "../../public/images/DfHeorMobil.png";
import { useApp } from "@/context/AppContext";

interface Slide {
  id?: number;
  _id?: string;
  desktopImage: string;
  mobileImage: string;
}

const DEFAULT_SLIDE: Slide = {
  id: 0,
  desktopImage: DfHeroDesk.src,
  mobileImage: DfHeorMobil.src,
};

export default function HeroSlider() {
  const { heroImages } = useApp();
  const [currentIndex, setCurrentIndex] = useState(0);
  const [direction, setDirection] = useState(0);

  const activeSlides: Slide[] = React.useMemo(() => {
    if (!heroImages || heroImages.length === 0) {
      return [DEFAULT_SLIDE];
    }
    return heroImages as Slide[];
  }, [heroImages]);

  // Cap current index if number of slides changes to avoid out-of-bounds index
  useEffect(() => {
    if (currentIndex >= activeSlides.length) {
      setCurrentIndex(0);
    }
  }, [activeSlides, currentIndex]);

  const nextSlide = useCallback(() => {
    setDirection(1);
    if (activeSlides.length > 0) {
      setCurrentIndex((prev) => (prev + 1) % activeSlides.length);
    }
  }, [activeSlides.length]);

  useEffect(() => {
    if (activeSlides.length === 0) return;
    const timer = setInterval(() => {
      nextSlide();
    }, 6000);

    return () => clearInterval(timer);
  }, [nextSlide, activeSlides.length]);

  const slideVariants = {
    enter: (dir: number) => ({
      x: dir > 0 ? "100%" : "-100%",
      opacity: 0,
    }),
    center: {
      x: 0,
      opacity: 1,
      transition: {
        x: {
          type: "spring" as const,
          stiffness: 300,
          damping: 30,
        },
        opacity: {
          duration: 0.5,
        },
      },
    },
    exit: (dir: number) => ({
      x: dir < 0 ? "100%" : "-100%",
      opacity: 0,
      transition: {
        x: {
          type: "spring" as const,
          stiffness: 300,
          damping: 30,
        },
        opacity: {
          duration: 0.5,
        },
      },
    }),
  };

  return (
    <div className="relative w-full h-[70vh] md:h-screen bg-[#AF7F8F] overflow-hidden">
      {/* Slider */}
      <div className="relative w-full h-full">
        <AnimatePresence initial={false} custom={direction}>
          <motion.div
            key={activeSlides[currentIndex]?._id || activeSlides[currentIndex]?.id || currentIndex}
            custom={direction}
            variants={slideVariants}
            initial="enter"
            animate="center"
            exit="exit"
            className="absolute inset-0 w-full h-full"
          >
            {/* Navbar Overlay */}
            <div className="absolute inset-x-0 top-0 h-40 bg-gradient-to-b from-black/50 to-transparent z-10 pointer-events-none" />

            {/* Responsive Image */}
            <picture>
              <source
                media="(min-width: 768px)"
                srcSet={activeSlides[currentIndex]?.desktopImage}
              />

              <img
                src={activeSlides[currentIndex]?.mobileImage}
                alt={`Hero Slide ${currentIndex + 1}`}
                className="w-full h-full object-cover object-center"
              />
            </picture>
          </motion.div>
        </AnimatePresence>
      </div>

      {/* Dots Indicator */}
      <div className="absolute bottom-6 left-1/2 -translate-x-1/2 z-30 flex space-x-3">
        {activeSlides.map((slide: Slide, idx: number) => (
          <button
            key={slide._id || slide.id || idx}
            onClick={() => {
              setDirection(idx > currentIndex ? 1 : -1);
              setCurrentIndex(idx);
            }}
            className={`h-2 rounded-full transition-all duration-500 ${idx === currentIndex
              ? "w-8 bg-white"
              : "w-2 bg-white/50 hover:bg-white"
              }`}
            aria-label={`Go to slide ${idx + 1}`}
          />
        ))}
      </div>
    </div>
  );
}