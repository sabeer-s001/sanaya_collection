/**
 * ProductCardSkeleton
 * Matches the exact layout of <ProductCard> so the page doesn't shift
 * when real data replaces the skeleton.
 */
export default function ProductCardSkeleton() {
  return (
    <div className="relative flex flex-col bg-white rounded-[4px] overflow-hidden border border-neutral-100/60 shadow-[0_4px_12px_rgba(0,0,0,0.02)] h-full animate-pulse">
      {/* Image placeholder — same aspect-ratio as real card */}
      <div className="relative aspect-[3/4] w-full overflow-hidden bg-neutral-100">
        {/* shimmer sweep */}
        <div className="absolute inset-0 -translate-x-full animate-[shimmer_1.6s_infinite] bg-gradient-to-r from-transparent via-white/40 to-transparent" />
        {/* Badge slot */}
        <div className="absolute top-3 left-3 h-5 w-20 rounded-[2px] bg-neutral-200/80" />
        {/* Wishlist button slot */}
        <div className="absolute top-3 right-3 h-7 w-7 rounded-full bg-neutral-200/80" />
      </div>

      {/* Content box — same padding as real card */}
      <div className="p-4 sm:p-5 flex-1 flex flex-col justify-between bg-white">
        <div className="mb-3 space-y-2">
          {/* Category tag */}
          <div className="h-2.5 w-16 rounded bg-neutral-100" />
          {/* Product name */}
          <div className="h-4 w-4/5 rounded bg-neutral-100" />
        </div>

        {/* Price row */}
        <div className="pt-2 flex items-baseline justify-between border-t border-neutral-50">
          <div className="h-4 w-16 rounded bg-neutral-100" />
          <div className="h-3 w-10 rounded bg-neutral-100" />
        </div>
      </div>
    </div>
  );
}
