"use client";

import { DashboardCard } from "./DashboardCard";

export function DashboardOverviewShimmer() {
  return (
    <div className="space-y-4">
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {Array.from({ length: 4 }).map((_, index) => (
          <DashboardCard key={index} contentClassName="p-4">
            <div className="animate-pulse space-y-3">
              <div className="h-3 w-24 rounded bg-gray-200" />
              <div className="h-8 w-28 rounded bg-gray-200" />
              <div className="h-3 w-32 rounded bg-gray-100" />
            </div>
          </DashboardCard>
        ))}
      </div>
      <DashboardCard contentClassName="p-0">
        <div className="animate-pulse divide-y divide-gray-100">
          {Array.from({ length: 6 }).map((_, index) => (
            <div key={index} className="flex items-center justify-between gap-4 px-6 py-4">
              <div className="space-y-2">
                <div className="h-4 w-28 rounded bg-gray-200" />
                <div className="h-3 w-40 rounded bg-gray-100" />
              </div>
              <div className="space-y-2 text-right">
                <div className="ml-auto h-4 w-24 rounded bg-gray-200" />
                <div className="ml-auto h-3 w-20 rounded bg-gray-100" />
              </div>
            </div>
          ))}
        </div>
      </DashboardCard>
    </div>
  );
}
