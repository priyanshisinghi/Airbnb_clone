"use client";

import Link from "next/link";
import { ListingSummary } from "@/types/listing";
import CardImageCarousel from "./CardImageCarousel";
import HeartButton from "./HeartButton";

interface ListingCardProps {
  listing: ListingSummary;
  isGuestFavourite?: boolean;
}

export default function ListingCard({ listing, isGuestFavourite }: ListingCardProps) {
  const isFav = isGuestFavourite || (listing.rating && listing.rating >= 4.8);

  const formatPrice = (amount: number) => {
    return new Intl.NumberFormat("en-IN", {
      style: "currency",
      currency: "INR",
      maximumFractionDigits: 0,
    }).format(amount);
  };

  return (
    <Link href={`/rooms/${listing.id}`} className="group flex flex-col cursor-pointer transition-transform duration-200">
      {/* Photo Container */}
      <div className="relative rounded-2xl overflow-hidden mb-3">
        <CardImageCarousel images={listing.images} title={listing.title} />

        {/* Guest Favourite Badge (Top-Left) */}
        {isFav && (
          <div className="absolute top-3 left-3 bg-white/90 backdrop-blur-md px-3 py-1 rounded-full shadow-sm text-xs font-semibold text-gray-900 z-10 border border-black/5">
            Guest favourite
          </div>
        )}

        {/* Heart Wishlist Button (Top-Right) */}
        <div className="absolute top-2 right-2 z-10">
          <HeartButton listingId={listing.id} />
        </div>
      </div>

      {/* Text Meta Info */}
      <div className="flex justify-between items-start text-sm">
        <h3 className="font-semibold text-gray-900 truncate pr-2">
          {listing.property_type} in {listing.city}
        </h3>
        {listing.rating ? (
          <div className="flex items-center space-x-1 shrink-0 font-medium text-gray-900">
            <svg className="w-3.5 h-3.5 fill-current text-gray-900" viewBox="0 0 32 32">
              <path d="M16 2l4.55 9.22 10.17 1.48-7.36 7.17 1.74 10.13L16 25.23l-9.1 4.77 1.74-10.13-7.36-7.17 10.17-1.48z" />
            </svg>
            <span>{listing.rating.toFixed(2)}</span>
          </div>
        ) : (
          <span className="text-gray-500 font-normal shrink-0 text-xs">New</span>
        )}
      </div>

      <p className="text-sm text-gray-500 truncate mt-0.5 font-normal">
        {listing.title}
      </p>

      <p className="text-sm text-gray-500 mt-0.5 font-normal">
        {listing.beds} {listing.beds === 1 ? "bed" : "beds"}
      </p>

      <div className="mt-1.5 flex items-baseline space-x-1">
        <span className="font-semibold text-gray-900 text-sm">
          {formatPrice(listing.price_per_night)}
        </span>
        <span className="text-sm text-gray-600 font-normal">night</span>
      </div>
    </Link>
  );
}
