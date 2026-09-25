export default function ListingCardSkeleton() {
  return (
    <div className="flex flex-col animate-pulse">
      {/* Image Skeleton */}
      <div className="w-full aspect-[20/19] bg-gray-200 rounded-2xl mb-3" />

      {/* Text Lines Skeletons */}
      <div className="flex justify-between items-center mb-1.5">
        <div className="h-4 bg-gray-200 rounded w-3/4" />
        <div className="h-4 bg-gray-200 rounded w-1/8" />
      </div>
      <div className="h-3.5 bg-gray-200 rounded w-1/2 mb-1" />
      <div className="h-3.5 bg-gray-200 rounded w-1/3 mb-2" />
      <div className="h-4 bg-gray-200 rounded w-2/5" />
    </div>
  );
}
