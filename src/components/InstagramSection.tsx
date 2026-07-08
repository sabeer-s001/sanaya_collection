// InstagramSection.tsx
"use client";

import React, { memo, useEffect, useRef, useState } from "react";
import Image from "next/image";
import { Instagram } from "lucide-react";

interface Reel {
  thumbnail: string;
  video: string;
}

const FALLBACK_REELS: Reel[] = [
  { thumbnail: "", video: "/reels/reel1.mp4" },
  { thumbnail: "", video: "/reels/reel2.mp4" },
  { thumbnail: "", video: "/reels/reel3.mp4" },
  { thumbnail: "", video: "/reels/reel4.mp4" },
];

const ReelCard = memo(function ReelCard({ reel, index }: { reel: Reel; index: number }) {
  const ref = useRef<HTMLVideoElement>(null);

  useEffect(() => {
    const video = ref.current;
    if (!video) return;

    const observer = new IntersectionObserver(([entry]) => {
      if (entry.isIntersecting) {
        video.play().catch(() => { });
      } else {
        video.pause();
      }
    }, { threshold: 0.6 });

    observer.observe(video);

    return () => observer.disconnect();
  }, []);

  return (
    <div className="group snap-center flex-shrink-0 overflow-hidden rounded-2xl border border-neutral-200 bg-white transition-all duration-300 md:hover:-translate-y-2 md:hover:shadow-xl">
      <div className="relative w-[220px] h-[390px] sm:w-[230px] sm:h-[410px] md:w-[250px] md:h-[445px]">
        {reel.video ? (
          <video
            ref={ref}
            src={reel.video}
            poster={reel.thumbnail || undefined}
            muted
            loop
            playsInline
            preload={index === 0 ? "metadata" : "none"}
            className="absolute inset-0 h-full w-full object-cover"
          />
        ) : (
          <Image
            src={reel.thumbnail || "/logo.png"}
            alt={`Reel ${index + 1}`}
            fill
            className="object-cover"
            priority={index === 0}
          />
        )}
      </div>
    </div>
  );
});

export default function InstagramSection() {
  const [reels, setReels] = useState<Reel[]>(FALLBACK_REELS);

  useEffect(() => {
    fetch("/api/reels")
      .then(r => r.ok ? r.json() : Promise.reject())
      .then(data => {
        if (Array.isArray(data) && data.length) setReels(data);
      })
      .catch(() => { });
  }, []);

  return (
    <section className="pt-12 pb-6 sm:pt-16 sm:pb-8 bg-brand-bg">
      <div className="max-w-7xl mx-auto">

        <div className="text-center px-4 mb-8 sm:mb-10">
          <p className="text-sm sm:text-base font-medium text-neutral-700 mb-4">
            Follow us on Instagram
          </p>

          <a
            href="https://www.instagram.com/sanaya_collection786"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2 rounded-full border border-pink-200 bg-white px-5 py-2.5 transition-all duration-300 hover:bg-pink-50 hover:border-pink-300 hover:shadow-md"
          >
            <Instagram className="w-4 h-4 text-pink-600" />
            <span className="font-semibold bg-gradient-to-r from-purple-600 via-pink-600 to-orange-600 bg-clip-text text-transparent">
              @sanaya_collection786
            </span>
          </a>
        </div>

        <div className="flex gap-4 overflow-x-auto px-4 snap-x snap-mandatory scrollbar-none md:justify-center">
          {reels.map((reel, i) => (
            <ReelCard key={reel.video || i} reel={reel} index={i} />
          ))}
        </div>

      </div>
    </section>
  );
}
