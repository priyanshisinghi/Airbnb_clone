"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { Category } from "@/types/meta";

interface CategoryBarProps {
  categories: Category[];
}

const DEFAULT_CATEGORIES = [
  "All",
  "Beachfront",
  "Pools",
  "Amazing views",
  "Cabins",
  "Countryside",
  "Trending",
  "Villas",
  "Apartments",
  "Tiny homes",
];

export default function CategoryBar({ categories }: CategoryBarProps) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const activeCategory = searchParams.get("category") || "All";

  const categoryNames = categories && categories.length > 0
    ? ["All", ...categories.map((c) => c.name)]
    : DEFAULT_CATEGORIES;

  const handleSelectCategory = (cat: string) => {
    const params = new URLSearchParams(searchParams.toString());
    if (cat === "All") {
      params.delete("category");
    } else {
      params.set("category", cat);
    }
    params.set("page", "1");
    router.push(`/?${params.toString()}`);
  };

  return (
    <div className="w-full bg-white border-b border-gray-200 sticky top-20 z-20 py-3 shadow-xs">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center space-x-8 overflow-x-auto no-scrollbar scroll-smooth py-1">
          {categoryNames.map((cat) => {
            const isActive = (cat === "All" && !searchParams.get("category")) || activeCategory === cat;
            return (
              <button
                key={cat}
                onClick={() => handleSelectCategory(cat)}
                type="button"
                className={`flex flex-col items-center space-y-1 shrink-0 pb-2 border-b-2 transition duration-200 cursor-pointer ${
                  isActive
                    ? "border-gray-900 text-gray-900 font-semibold"
                    : "border-transparent text-gray-500 hover:text-gray-900 hover:border-gray-300 font-medium"
                }`}
              >
                <span className="text-xs tracking-tight whitespace-nowrap">{cat}</span>
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
}
