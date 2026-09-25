"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import ListingCard from "@/components/ListingCard";
import { fetchWishlist } from "@/lib/api";
import { ListingSummary } from "@/types/listing";

function WishlistEmptyState() {
  return (
    <div className="flex min-h-[55vh] flex-col items-center justify-center px-6 py-20 text-center">
      <div className="mb-6 flex h-20 w-20 items-center justify-center rounded-full bg-rose-50 text-rose-500">
        <svg className="h-10 w-10 fill-current" viewBox="0 0 32 32" aria-hidden="true">
          <path d="M16 28c7-4.73 14-10 14-17a6.98 6.98 0 0 0-7-7c-1.8 0-3.58.83-4.84 2.11L16 8.36l-2.16-2.25A6.98 6.98 0 0 0 9 4a6.98 6.98 0 0 0-7 7c0 7 7 12.27 14 17z" />
        </svg>
      </div>
      <h1 className="mb-3 text-2xl font-bold tracking-tight text-gray-900">
        Your wishlist is empty
      </h1>
      <p className="mb-8 max-w-sm text-sm leading-relaxed text-gray-500">
        Save homes you love while exploring, and come back here when you are ready to plan your next stay.
      </p>
      <Link
        href="/"
        className="rounded-xl bg-gray-900 px-6 py-3 text-sm font-semibold text-white transition hover:bg-black"
      >
        Explore stays
      </Link>
    </div>
  );
}

export default function WishlistsPage() {
  const [listings, setListings] = useState<ListingSummary[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchWishlist()
      .then(setListings)
      .catch((err) => {
        setError(err instanceof Error ? err.message : "Failed to load your wishlist");
      })
      .finally(() => setLoading(false));
  }, []);

  return (
    <div className="flex min-h-screen flex-col bg-white text-gray-900">
      <Navbar />
      <main className="mx-auto w-full max-w-7xl flex-1 px-4 py-10 sm:px-6 lg:px-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold tracking-tight text-gray-900">Wishlists</h1>
          <p className="mt-2 text-sm text-gray-500">Homes you have saved for later.</p>
        </div>

        {loading && (
          <div className="grid grid-cols-1 gap-x-6 gap-y-10 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5">
            {Array.from({ length: 5 }).map((_, index) => (
              <div key={index} className="animate-pulse">
                <div className="aspect-square rounded-2xl bg-gray-200" />
                <div className="mt-3 h-4 w-3/4 rounded bg-gray-200" />
                <div className="mt-2 h-4 w-1/2 rounded bg-gray-200" />
              </div>
            ))}
          </div>
        )}

        {!loading && error && (
          <div className="rounded-2xl border border-rose-200 bg-rose-50 px-6 py-10 text-center">
            <h2 className="text-lg font-bold text-rose-900">Unable to load your wishlist</h2>
            <p className="mt-2 text-sm text-rose-700">{error}</p>
          </div>
        )}

        {!loading && !error && listings.length === 0 && <WishlistEmptyState />}

        {!loading && !error && listings.length > 0 && (
          <div className="grid grid-cols-1 gap-x-6 gap-y-10 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5">
            {listings.map((listing) => (
              <ListingCard key={listing.id} listing={listing} />
            ))}
          </div>
        )}
      </main>
      <Footer />
    </div>
  );
}
