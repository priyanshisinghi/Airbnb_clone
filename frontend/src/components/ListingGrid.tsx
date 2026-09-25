import { ListingSummary } from "@/types/listing";
import ListingCard from "./ListingCard";
import ListingCardSkeleton from "./ListingCardSkeleton";
import EmptyState from "./EmptyState";

interface ListingGridProps {
  listings: ListingSummary[];
  loading?: boolean;
  onResetFilters?: () => void;
}

export default function ListingGrid({ listings, loading, onResetFilters }: ListingGridProps) {
  if (loading) {
    return (
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-x-6 gap-y-10 my-6">
        {Array.from({ length: 10 }).map((_, idx) => (
          <ListingCardSkeleton key={idx} />
        ))}
      </div>
    );
  }

  if (!listings || listings.length === 0) {
    return <EmptyState onReset={onResetFilters} />;
  }

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-x-6 gap-y-10 my-6">
      {listings.map((listing) => (
        <ListingCard key={listing.id} listing={listing} />
      ))}
    </div>
  );
}
