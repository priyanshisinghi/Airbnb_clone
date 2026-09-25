"use client";

import { useState, useEffect, FormEvent } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import FilterModal from "./FilterModal";

export default function SearchBar() {
  const router = useRouter();
  const searchParams = useSearchParams();

  const [expanded, setExpanded] = useState(false);
  const [filterModalOpen, setFilterModalOpen] = useState(false);

  const [location, setLocation] = useState(searchParams.get("location") || "");
  const [checkIn, setCheckIn] = useState(searchParams.get("check_in") || "");
  const [checkOut, setCheckOut] = useState(searchParams.get("check_out") || "");
  const [guests, setGuests] = useState(searchParams.get("guests") || "");
  const [dateError, setDateError] = useState<string | null>(null);

  const todayStr = new Date().toISOString().split("T")[0];

  useEffect(() => {
    setLocation(searchParams.get("location") || "");
    setCheckIn(searchParams.get("check_in") || "");
    setCheckOut(searchParams.get("check_out") || "");
    setGuests(searchParams.get("guests") || "");
  }, [searchParams]);

  // Count active filters (min_price, max_price, property_type, bedrooms, beds, amenities)
  const activeFiltersCount = [
    searchParams.get("min_price"),
    searchParams.get("max_price"),
    searchParams.get("property_type"),
    searchParams.get("bedrooms"),
    searchParams.get("beds"),
    ...searchParams.getAll("amenities"),
  ].filter(Boolean).length;

  const handleSearch = (e: FormEvent) => {
    e.preventDefault();
    setDateError(null);

    if (checkIn && checkOut && checkOut <= checkIn) {
      setDateError("Check-out date must be after check-in date");
      return;
    }

    const params = new URLSearchParams(searchParams.toString());

    if (location.trim()) params.set("location", location.trim());
    else params.delete("location");

    if (checkIn) params.set("check_in", checkIn);
    else params.delete("check_in");

    if (checkOut) params.set("check_out", checkOut);
    else params.delete("check_out");

    if (guests && Number(guests) > 0) params.set("guests", guests);
    else params.delete("guests");

    params.set("page", "1");
    setExpanded(false);
    router.push(`/?${params.toString()}`);
  };

  const clearSearch = () => {
    setLocation("");
    setCheckIn("");
    setCheckOut("");
    setGuests("");
    setDateError(null);
    router.push("/");
  };

  return (
    <>
      <div className="relative w-full max-w-3xl mx-auto flex items-center gap-2">
        {/* Collapsed Compact Search Bar */}
        {!expanded ? (
          <div className="flex items-center w-full gap-2">
            <button
              onClick={() => setExpanded(true)}
              type="button"
              className="flex-1 flex items-center justify-between border border-gray-300 hover:shadow-md rounded-full px-5 py-2.5 bg-white transition duration-200 cursor-pointer shadow-xs"
            >
              <div className="flex items-center space-x-3 divide-x divide-gray-200 text-xs sm:text-sm font-semibold text-gray-800">
                <span className="px-2 truncate">
                  {location || "Anywhere"}
                </span>
                <span className="px-3 truncate text-gray-500 font-normal hidden sm:inline">
                  {checkIn && checkOut ? `${checkIn} to ${checkOut}` : "Any week"}
                </span>
                <span className="px-3 text-gray-500 font-normal truncate">
                  {guests ? `${guests} guests` : "Add guests"}
                </span>
              </div>

              <div className="w-8 h-8 rounded-full bg-rose-500 flex items-center justify-center text-white shrink-0">
                <svg className="w-3.5 h-3.5 stroke-current stroke-[3]" fill="none" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
              </div>
            </button>

            {/* Filter Modal Trigger Button */}
            <button
              type="button"
              onClick={() => setFilterModalOpen(true)}
              className="relative flex items-center space-x-2 border border-gray-300 hover:border-gray-900 rounded-full px-4 py-2.5 bg-white text-xs font-semibold text-gray-800 transition cursor-pointer shrink-0 shadow-xs"
            >
              <svg className="w-4 h-4 text-gray-700 stroke-current stroke-2" fill="none" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 6V4m0 2a2 2 0 100 4m0-4a2 2 0 110 4m-6 8a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4m6 6v10m6-2a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4" />
              </svg>
              <span className="hidden sm:inline">Filters</span>
              {activeFiltersCount > 0 && (
                <span className="w-5 h-5 bg-rose-500 text-white rounded-full text-[10px] font-bold flex items-center justify-center">
                  {activeFiltersCount}
                </span>
              )}
            </button>
          </div>
        ) : (
          /* Expanded Form Bar */
          <form
            onSubmit={handleSearch}
            className="w-full bg-white border border-gray-200 rounded-3xl p-3 shadow-xl flex flex-col md:flex-row items-center gap-2 transition duration-300 animate-in fade-in"
          >
            {/* Where */}
            <div className="flex-1 w-full px-3 py-1.5 hover:bg-gray-100/80 rounded-2xl transition">
              <label className="block text-[10px] font-bold text-gray-800 uppercase tracking-wider">
                Where
              </label>
              <input
                type="text"
                placeholder="Search destinations"
                value={location}
                onChange={(e) => setLocation(e.target.value)}
                className="w-full bg-transparent text-xs sm:text-sm text-gray-900 focus:outline-none placeholder-gray-400 font-normal"
              />
            </div>

            <div className="hidden md:block w-px h-8 bg-gray-200" />

            {/* Check-in */}
            <div className="flex-1 w-full px-3 py-1.5 hover:bg-gray-100/80 rounded-2xl transition">
              <label className="block text-[10px] font-bold text-gray-800 uppercase tracking-wider">
                Check in
              </label>
              <input
                type="date"
                min={todayStr}
                value={checkIn}
                onChange={(e) => setCheckIn(e.target.value)}
                className="w-full bg-transparent text-xs text-gray-900 focus:outline-none font-normal"
              />
            </div>

            <div className="hidden md:block w-px h-8 bg-gray-200" />

            {/* Check-out */}
            <div className="flex-1 w-full px-3 py-1.5 hover:bg-gray-100/80 rounded-2xl transition">
              <label className="block text-[10px] font-bold text-gray-800 uppercase tracking-wider">
                Check out
              </label>
              <input
                type="date"
                min={checkIn || todayStr}
                value={checkOut}
                onChange={(e) => setCheckOut(e.target.value)}
                className="w-full bg-transparent text-xs text-gray-900 focus:outline-none font-normal"
              />
            </div>

            <div className="hidden md:block w-px h-8 bg-gray-200" />

            {/* Who */}
            <div className="flex-1 w-full px-3 py-1.5 hover:bg-gray-100/80 rounded-2xl transition">
              <label className="block text-[10px] font-bold text-gray-800 uppercase tracking-wider">
                Who
              </label>
              <input
                type="number"
                min="1"
                max="20"
                placeholder="Add guests"
                value={guests}
                onChange={(e) => setGuests(e.target.value)}
                className="w-full bg-transparent text-xs sm:text-sm text-gray-900 focus:outline-none placeholder-gray-400 font-normal"
              />
            </div>

            {/* Search Button */}
            <div className="flex items-center space-x-2 w-full md:w-auto px-2 justify-end">
              <button
                type="button"
                onClick={clearSearch}
                className="text-xs font-semibold text-gray-500 hover:text-gray-900 px-2.5 py-2 rounded-lg"
              >
                Clear
              </button>
              <button
                type="submit"
                className="bg-rose-500 hover:bg-rose-600 text-white font-semibold px-4 py-2.5 rounded-2xl flex items-center justify-center space-x-1.5 shadow-sm transition active:scale-95 cursor-pointer"
              >
                <svg className="w-4 h-4 stroke-current stroke-[2.5]" fill="none" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
                <span className="text-xs font-semibold">Search</span>
              </button>
            </div>
          </form>
        )}
      </div>

      {dateError && (
        <div className="text-center text-xs font-semibold text-rose-600 mt-2">
          {dateError}
        </div>
      )}

      {/* Filter Modal */}
      <FilterModal
        isOpen={filterModalOpen}
        onClose={() => setFilterModalOpen(false)}
      />
    </>
  );
}
