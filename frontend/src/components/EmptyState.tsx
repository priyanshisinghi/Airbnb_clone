"use client";

interface EmptyStateProps {
  title?: string;
  subtitle?: string;
  onReset?: () => void;
}

export default function EmptyState({
  title = "No exact matches found",
  subtitle = "Try changing or clearing some of your filters or search terms.",
  onReset,
}: EmptyStateProps) {
  return (
    <div className="h-[50vh] flex flex-col items-center justify-center text-center p-8">
      <div className="w-16 h-16 bg-rose-50 rounded-full flex items-center justify-center text-rose-500 mb-4">
        <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
        </svg>
      </div>

      <h3 className="text-xl font-bold text-gray-900 mb-1">{title}</h3>
      <p className="text-sm text-gray-500 max-w-sm mb-6">{subtitle}</p>

      {onReset && (
        <button
          onClick={onReset}
          className="px-6 py-2.5 rounded-xl border border-gray-900 text-gray-900 font-semibold text-sm hover:bg-gray-100 transition active:scale-95 cursor-pointer"
        >
          Remove all filters
        </button>
      )}
    </div>
  );
}
