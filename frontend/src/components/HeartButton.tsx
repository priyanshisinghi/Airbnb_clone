"use client";

import { MouseEvent } from "react";
import { useWishlist } from "@/context/WishlistContext";

interface HeartButtonProps {
  listingId: number;
}

export default function HeartButton({ listingId }: HeartButtonProps) {
  const { isSaved, toggle } = useWishlist();
  const favorited = isSaved(listingId);

  const toggleFavorite = (e: MouseEvent<HTMLButtonElement>) => {
    e.stopPropagation();
    e.preventDefault();
    void toggle(listingId);
  };

  return (
    <button
      onClick={toggleFavorite}
      type="button"
      className="relative hover:opacity-80 transition cursor-pointer p-1.5 rounded-full text-white drop-shadow-md hover:scale-110 active:scale-95"
      aria-label={favorited ? "Remove from wishlist" : "Add to wishlist"}
    >
      <svg
        viewBox="0 0 32 32"
        aria-hidden="true"
        role="presentation"
        focusable="false"
        className={`w-6 h-6 transition-colors duration-200 ${
          favorited
            ? "fill-rose-500 stroke-rose-500"
            : "fill-black/30 stroke-white stroke-[2.5px]"
        }`}
      >
        <path d="M16 28c7-4.73 14-10 14-17a6.98 6.98 0 0 0-7-7c-1.8 0-3.58.83-4.84 2.11L16 8.36l-2.16-2.25A6.98 6.98 0 0 0 9 4a6.98 6.98 0 0 0-7 7c0 7 7 12.27 14 17z" />
      </svg>
    </button>
  );
}
