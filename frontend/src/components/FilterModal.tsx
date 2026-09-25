"use client";

import { useState, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Amenity } from "@/types/meta";
import { fetchAmenities } from "@/lib/api";

interface FilterModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const PROPERTY_TYPES = [
  "Villa",
  "Apartment",
  "House",
  "Cabin",
  "Cottage",
  "Farm stay",
  "Tiny home",
];

export default function FilterModal({ isOpen, onClose }: FilterModalProps) {
  const router = useRouter();
  const searchParams = useSearchParams();

  const [availableAmenities, setAvailableAmenities] = useState<Amenity[]>([]);
  const [minPrice, setMinPrice] = useState(searchParams.get("min_price") || "");
  const [maxPrice, setMaxPrice] = useState(searchParams.get("max_price") || "");
  const [propertyType, setPropertyType] = useState(searchParams.get("property_type") || "");
  const [bedrooms, setBedrooms] = useState(searchParams.get("bedrooms") || "");
  const [beds, setBeds] = useState(searchParams.get("beds") || "");
  const [selectedAmenities, setSelectedAmenities] = useState<string[]>(
    searchParams.getAll("amenities")
  );

  useEffect(() => {
    fetchAmenities()
      .then(setAvailableAmenities)
      .catch((err) => console.error("Failed to load amenities for filter:", err));
  }, []);

  useEffect(() => {
    setMinPrice(searchParams.get("min_price") || "");
    setMaxPrice(searchParams.get("max_price") || "");
    setPropertyType(searchParams.get("property_type") || "");
    setBedrooms(searchParams.get("bedrooms") || "");
    setBeds(searchParams.get("beds") || "");
    setSelectedAmenities(searchParams.getAll("amenities"));
  }, [searchParams]);

  if (!isOpen) return null;

  const toggleAmenity = (name: string) => {
    setSelectedAmenities((prev) =>
      prev.includes(name) ? prev.filter((a) => a !== name) : [...prev, name]
    );
  };

  const handleClearAll = () => {
    setMinPrice("");
    setMaxPrice("");
    setPropertyType("");
    setBedrooms("");
    setBeds("");
    setSelectedAmenities([]);
  };

  const handleApplyFilters = () => {
    const params = new URLSearchParams(searchParams.toString());

    if (minPrice && Number(minPrice) >= 0) params.set("min_price", minPrice);
    else params.delete("min_price");

    if (maxPrice && Number(maxPrice) >= 0) params.set("max_price", maxPrice);
    else params.delete("max_price");

    if (propertyType) params.set("property_type", propertyType);
    else params.delete("property_type");

    if (bedrooms && Number(bedrooms) > 0) params.set("bedrooms", bedrooms);
    else params.delete("bedrooms");

    if (beds && Number(beds) > 0) params.set("beds", beds);
    else params.delete("beds");

    params.delete("amenities");
    selectedAmenities.forEach((amenity) => {
      params.append("amenities", amenity);
    });

    params.set("page", "1");
    router.push(`/?${params.toString()}`);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-xs p-4 animate-in fade-in">
      <div className="bg-white rounded-3xl max-w-2xl w-full max-h-[90vh] flex flex-col shadow-2xl overflow-hidden">
        {/* Header */}
        <div className="px-6 py-4 border-b border-gray-200 flex items-center justify-between">
          <button
            onClick={onClose}
            className="p-2 rounded-full hover:bg-gray-100 text-gray-700 transition cursor-pointer"
            aria-label="Close modal"
          >
            <svg className="w-5 h-5 stroke-current stroke-2" fill="none" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
          <h3 className="text-base font-bold text-gray-900">Filters</h3>
          <div className="w-9" />
        </div>

        {/* Scrollable Body */}
        <div className="p-6 overflow-y-auto space-y-8 flex-1 divide-y divide-gray-100">
          {/* Price Range */}
          <div>
            <h4 className="text-base font-bold text-gray-900 mb-1">Price range</h4>
            <p className="text-xs text-gray-500 mb-4">Nightly prices before fees and taxes</p>
            <div className="grid grid-cols-2 gap-4">
              <div className="border border-gray-300 rounded-xl p-3 focus-within:ring-2 focus-within:ring-gray-900">
                <label className="block text-xs text-gray-500 font-medium">Minimum</label>
                <div className="flex items-center mt-1">
                  <span className="text-sm text-gray-500 mr-1">₹</span>
                  <input
                    type="number"
                    min="0"
                    placeholder="0"
                    value={minPrice}
                    onChange={(e) => setMinPrice(e.target.value)}
                    className="w-full text-sm font-semibold text-gray-900 focus:outline-none"
                  />
                </div>
              </div>
              <div className="border border-gray-300 rounded-xl p-3 focus-within:ring-2 focus-within:ring-gray-900">
                <label className="block text-xs text-gray-500 font-medium">Maximum</label>
                <div className="flex items-center mt-1">
                  <span className="text-sm text-gray-500 mr-1">₹</span>
                  <input
                    type="number"
                    min="0"
                    placeholder="50000"
                    value={maxPrice}
                    onChange={(e) => setMaxPrice(e.target.value)}
                    className="w-full text-sm font-semibold text-gray-900 focus:outline-none"
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Property Type */}
          <div className="pt-6">
            <h4 className="text-base font-bold text-gray-900 mb-4">Property type</h4>
            <div className="flex flex-wrap gap-2">
              <button
                type="button"
                onClick={() => setPropertyType("")}
                className={`px-4 py-2 rounded-full text-xs font-semibold border transition cursor-pointer ${
                  !propertyType
                    ? "bg-gray-900 text-white border-gray-900"
                    : "bg-white text-gray-700 border-gray-300 hover:border-gray-900"
                }`}
              >
                Any type
              </button>
              {PROPERTY_TYPES.map((type) => (
                <button
                  key={type}
                  type="button"
                  onClick={() => setPropertyType(propertyType === type ? "" : type)}
                  className={`px-4 py-2 rounded-full text-xs font-semibold border transition cursor-pointer ${
                    propertyType === type
                      ? "bg-gray-900 text-white border-gray-900"
                      : "bg-white text-gray-700 border-gray-300 hover:border-gray-900"
                  }`}
                >
                  {type}
                </button>
              ))}
            </div>
          </div>

          {/* Rooms and Beds */}
          <div className="pt-6">
            <h4 className="text-base font-bold text-gray-900 mb-4">Bedrooms and beds</h4>
            <div className="space-y-4">
              <div>
                <span className="block text-sm font-medium text-gray-700 mb-2">Bedrooms</span>
                <div className="flex space-x-2">
                  {["", "1", "2", "3", "4", "5+"].map((val, idx) => (
                    <button
                      key={idx}
                      type="button"
                      onClick={() => setBedrooms(bedrooms === val ? "" : val === "5+" ? "5" : val)}
                      className={`px-4 py-2 rounded-full text-xs font-semibold border transition cursor-pointer ${
                        (bedrooms === val || (val === "5+" && bedrooms === "5"))
                          ? "bg-gray-900 text-white border-gray-900"
                          : "bg-white text-gray-700 border-gray-300 hover:border-gray-900"
                      }`}
                    >
                      {val === "" ? "Any" : val}
                    </button>
                  ))}
                </div>
              </div>
              <div>
                <span className="block text-sm font-medium text-gray-700 mb-2">Beds</span>
                <div className="flex space-x-2">
                  {["", "1", "2", "3", "4", "5+"].map((val, idx) => (
                    <button
                      key={idx}
                      type="button"
                      onClick={() => setBeds(beds === val ? "" : val === "5+" ? "5" : val)}
                      className={`px-4 py-2 rounded-full text-xs font-semibold border transition cursor-pointer ${
                        (beds === val || (val === "5+" && beds === "5"))
                          ? "bg-gray-900 text-white border-gray-900"
                          : "bg-white text-gray-700 border-gray-300 hover:border-gray-900"
                      }`}
                    >
                      {val === "" ? "Any" : val}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* Amenities Multi-Select */}
          <div className="pt-6">
            <h4 className="text-base font-bold text-gray-900 mb-4">Amenities</h4>
            <div className="grid grid-cols-2 gap-3">
              {availableAmenities.map((amenity) => {
                const isSelected = selectedAmenities.includes(amenity.name);
                return (
                  <label
                    key={amenity.id}
                    className="flex items-center space-x-3 cursor-pointer p-2 rounded-xl hover:bg-gray-50 transition"
                  >
                    <input
                      type="checkbox"
                      checked={isSelected}
                      onChange={() => toggleAmenity(amenity.name)}
                      className="w-5 h-5 accent-rose-500 rounded border-gray-300 cursor-pointer"
                    />
                    <span className="text-sm font-medium text-gray-800">{amenity.name}</span>
                  </label>
                );
              })}
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="px-6 py-4 border-t border-gray-200 flex items-center justify-between bg-white">
          <button
            type="button"
            onClick={handleClearAll}
            className="text-sm font-semibold text-gray-900 underline hover:bg-gray-100 px-3 py-2 rounded-lg transition cursor-pointer"
          >
            Clear all
          </button>
          <button
            type="button"
            onClick={handleApplyFilters}
            className="bg-gray-900 hover:bg-black text-white font-bold text-sm px-6 py-3 rounded-xl transition shadow-sm cursor-pointer active:scale-95"
          >
            Show places
          </button>
        </div>
      </div>
    </div>
  );
}
