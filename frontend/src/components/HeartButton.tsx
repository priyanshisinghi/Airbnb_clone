"use client";

import { useState, MouseEvent } from "react";

interface HeartButtonProps {
  listingId: number;
  initialFavorited?: boolean;
}

export default function HeartButton({ listingId, initialFavorited = false }: HeartButtonProps) {
  const [favorited, setFavorited] = useState(initialFavorited);

  const toggleFavorite = (e: MouseEvent<HTMLButtonElement>) => {
    e.stopPropagation();
    e.preventDefault();
    setFavorited((prev) => !prev);
  };

  return (
    <button
      onClick={toggleFavorite}
      type="button"
      className="relative hover:opacity-80 transition cursor-pointer p-1.5 rounded-full text-white drop-shadow-md hover:scale-110 active:scale-95"
      aria-label="Add to wishlist"
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
