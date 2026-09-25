"use client";

import { useState, MouseEvent } from "react";
import Image from "next/image";
import { ListingImage } from "@/types/listing";

interface CardImageCarouselProps {
  images: ListingImage[];
  title: string;
}

export default function CardImageCarousel({ images, title }: CardImageCarouselProps) {
  const [currentIndex, setCurrentIndex] = useState(0);

  // Fallback placeholder image if images list is empty
  const imageList = images && images.length > 0
    ? images
    : [{ id: 0, url: "https://images.unsplash.com/photo-1600585154340-be6161a56a0c?auto=format&fit=crop&w=1200&q=80", position: 0 }];

  const nextImage = (e: MouseEvent<HTMLButtonElement>) => {
    e.stopPropagation();
    e.preventDefault();
    setCurrentIndex((prev) => (prev + 1) % imageList.length);
  };

  const prevImage = (e: MouseEvent<HTMLButtonElement>) => {
    e.stopPropagation();
    e.preventDefault();
    setCurrentIndex((prev) => (prev - 1 + imageList.length) % imageList.length);
  };

  return (
    <div className="relative w-full aspect-[20/19] overflow-hidden rounded-2xl bg-gray-100 group">
      {/* Current Image */}
      <img
        src={imageList[currentIndex].url}
        alt={`${title} - image ${currentIndex + 1}`}
        className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
        loading="lazy"
      />

      {/* Navigation Arrows (Visible on Hover) */}
      {imageList.length > 1 && (
        <>
          {currentIndex > 0 && (
            <button
              onClick={prevImage}
              type="button"
              className="absolute left-2.5 top-1/2 -translate-y-1/2 w-7 h-7 rounded-full bg-white/90 hover:bg-white text-gray-800 shadow-md flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-200 hover:scale-110 active:scale-95"
              aria-label="Previous image"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M15 19l-7-7 7-7" />
              </svg>
            </button>
          )}

          {currentIndex < imageList.length - 1 && (
            <button
              onClick={nextImage}
              type="button"
              className="absolute right-2.5 top-1/2 -translate-y-1/2 w-7 h-7 rounded-full bg-white/90 hover:bg-white text-gray-800 shadow-md flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-200 hover:scale-110 active:scale-95"
              aria-label="Next image"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M9 5l7 7-7 7" />
              </svg>
            </button>
          )}

          {/* Dot Indicators */}
          <div className="absolute bottom-3 left-1/2 -translate-x-1/2 flex space-x-1.5 z-10">
            {imageList.map((_, idx) => (
              <span
                key={idx}
                className={`block rounded-full transition-all duration-300 ${
                  idx === currentIndex
                    ? "w-2 h-2 bg-white scale-110"
                    : "w-1.5 h-1.5 bg-white/60"
                }`}
              />
            ))}
          </div>
        </>
      )}
    </div>
  );
}
