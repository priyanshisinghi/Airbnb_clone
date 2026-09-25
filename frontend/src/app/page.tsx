"use client";

import { useEffect, useState, Suspense } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import Navbar from "@/components/Navbar";
import CategoryBar from "@/components/CategoryBar";
import ListingGrid from "@/components/ListingGrid";
import ListingSection from "@/components/ListingSection";
import Footer from "@/components/Footer";
import { fetchListings, fetchCategories } from "@/lib/api";
import { ListingSummary, PaginatedListings } from "@/types/listing";
import { Category } from "@/types/meta";

function ExploreContent() {
  const router = useRouter();
  const searchParams = useSearchParams();

  const [listingsData, setListingsData] = useState<PaginatedListings | null>(null);
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  const location = searchParams.get("location") || undefined;
  const category = searchParams.get("category") || undefined;
  const guests = searchParams.get("guests") ? Number(searchParams.get("guests")) : undefined;
  const page = searchParams.get("page") ? Number(searchParams.get("page")) : 1;

  useEffect(() => {
    fetchCategories()
      .then(setCategories)
      .catch((err) => console.error("Failed to load categories:", err));
  }, []);

  useEffect(() => {
    setLoading(true);
    setError(null);

    fetchListings({
      location,
      category,
      guests,
      page,
      page_size: 15,
    })
      .then((data) => {
        setListingsData(data);
      })
      .catch((err) => {
        setError(err instanceof Error ? err.message : "Failed to load listings");
      })
      .finally(() => {
        setLoading(false);
      });
  }, [location, category, guests, page]);

  const handleResetFilters = () => {
    router.push("/");
  };

  const handlePageChange = (newPage: number) => {
    const params = new URLSearchParams(searchParams.toString());
    params.set("page", newPage.toString());
    router.push(`/?${params.toString()}`);
  };

  const isFiltering = Boolean(location || category || guests);
  const items = listingsData?.items || [];

  // Group listings into featured sections when browsing home without filters
  const beachfrontListings = items.filter((item) => item.category === "Beachfront" || item.category === "Pools");
  const mountainListings = items.filter((item) => item.category === "Cabins" || item.category === "Amazing views");
  const trendingListings = items.filter((item) => item.category === "Trending" || item.category === "Villas");

  return (
    <div className="min-h-screen flex flex-col bg-white text-gray-900">
      <Navbar />
      <CategoryBar categories={categories} />

      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6">
        {/* API Error State */}
        {error && (
          <div className="my-12 p-8 bg-rose-50 border border-rose-200 rounded-2xl text-center max-w-md mx-auto">
            <h3 className="text-lg font-bold text-rose-800 mb-2">Unable to connect to server</h3>
            <p className="text-sm text-rose-600 mb-4">{error}</p>
            <button
              onClick={() => window.location.reload()}
              className="px-5 py-2.5 bg-rose-500 hover:bg-rose-600 text-white font-semibold text-sm rounded-xl shadow-xs transition active:scale-95 cursor-pointer"
            >
              Retry Connection
            </button>
          </div>
        )}

        {/* Normal Grid View */}
        {!error && (
          <>
            <div className="flex justify-between items-baseline mb-2">
              <h1 className="text-2xl font-bold tracking-tight text-gray-900">
                {isFiltering ? "Search Results" : "Explore Stays"}
              </h1>
              {listingsData && (
                <span className="text-sm text-gray-500 font-normal">
                  {listingsData.total} {listingsData.total === 1 ? "stay" : "stays"}
                </span>
              )}
            </div>

            <ListingGrid
              listings={items}
              loading={loading}
              onResetFilters={handleResetFilters}
            />

            {/* Featured Section blocks on Home View */}
            {!isFiltering && !loading && items.length > 0 && (
              <div className="mt-12 space-y-8">
                <ListingSection
                  title="Popular Beach & Pool Getaways"
                  subtitle="Relax by crystal clear waters and tropical infinity pools"
                  listings={beachfrontListings}
                />
                <ListingSection
                  title="Mountain & Scenic Escapes"
                  subtitle="Breathtaking hill valley views and cozy wooden cabins"
                  listings={mountainListings}
                />
                <ListingSection
                  title="Trending Luxury Villas"
                  subtitle="Top-rated places to stay across India"
                  listings={trendingListings}
                />
              </div>
            )}

            {/* Pagination Controls */}
            {listingsData && listingsData.total_pages > 1 && (
              <div className="flex justify-center items-center space-x-2 my-12 pt-6 border-t border-gray-200">
                <button
                  disabled={page <= 1}
                  onClick={() => handlePageChange(page - 1)}
                  className="px-4 py-2 rounded-xl border border-gray-300 text-sm font-semibold text-gray-700 hover:bg-gray-100 disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer transition"
                >
                  Previous
                </button>
                <span className="text-sm text-gray-600 font-medium px-3">
                  Page {listingsData.page} of {listingsData.total_pages}
                </span>
                <button
                  disabled={page >= listingsData.total_pages}
                  onClick={() => handlePageChange(page + 1)}
                  className="px-4 py-2 rounded-xl border border-gray-300 text-sm font-semibold text-gray-700 hover:bg-gray-100 disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer transition"
                >
                  Next
                </button>
              </div>
            )}
          </>
        )}
      </main>

      <Footer />
    </div>
  );
}

export default function Home() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-white" />}>
      <ExploreContent />
    </Suspense>
  );
}
