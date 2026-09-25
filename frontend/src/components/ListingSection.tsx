import { ListingSummary } from "@/types/listing";
import ListingCard from "./ListingCard";

interface ListingSectionProps {
  title: string;
  subtitle?: string;
  listings: ListingSummary[];
}

export default function ListingSection({ title, subtitle, listings }: ListingSectionProps) {
  if (!listings || listings.length === 0) return null;

  return (
    <section className="py-8 border-b border-gray-100 last:border-0">
      <div className="flex justify-between items-baseline mb-6">
        <div>
          <h2 className="text-2xl font-bold text-gray-900 tracking-tight">{title}</h2>
          {subtitle && <p className="text-sm text-gray-500 mt-1">{subtitle}</p>}
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-x-6 gap-y-8">
        {listings.slice(0, 4).map((listing) => (
          <ListingCard key={listing.id} listing={listing} />
        ))}
      </div>
    </section>
  );
}
