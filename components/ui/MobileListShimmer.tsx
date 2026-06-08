"use client";

interface MobileListShimmerProps {
  rows?: number;
  showAvatar?: boolean;
}

export default function MobileListShimmer({ rows = 8, showAvatar = true }: MobileListShimmerProps) {
  return (
    <div className="md:hidden" aria-label="Loading list">
      {Array.from({ length: rows }, (_, index) => (
        <div key={`mobile-list-shimmer-${index}`} className="flex items-start gap-3 border-b border-gray-100 px-4 py-4">
          {showAvatar && <div className="h-12 w-12 shrink-0 animate-pulse rounded-lg bg-gray-100" />}
          <div className="min-w-0 flex-1 space-y-3">
            <div className="flex items-start justify-between gap-4">
              <div className="min-w-0 flex-1 space-y-2">
                <div className="h-4 w-3/4 animate-pulse rounded-full bg-gray-100" />
                <div className="h-3 w-1/2 animate-pulse rounded-full bg-gray-100" />
              </div>
              <div className="h-4 w-16 shrink-0 animate-pulse rounded-full bg-gray-100" />
            </div>
            <div className="flex items-center gap-2">
              <div className="h-6 w-24 animate-pulse rounded-full bg-gray-100" />
              <div className="h-6 w-20 animate-pulse rounded-full bg-gray-100" />
            </div>
          </div>
          <div className="h-9 w-9 shrink-0 animate-pulse rounded-full bg-gray-100" />
        </div>
      ))}
    </div>
  );
}
