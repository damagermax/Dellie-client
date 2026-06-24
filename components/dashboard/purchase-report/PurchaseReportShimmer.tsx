"use client";

import { DashboardCard } from "@/components/dashboard/DashboardCard";

export function PurchaseReportShimmer() {
  return (
    <div className="animate-pulse space-y-6" aria-label="Loading purchase report">
      <DashboardCard contentClassName="space-y-8 px-6 py-6">
        <div className="grid gap-5 sm:grid-cols-2 xl:grid-cols-4">
          {[1, 2, 3, 4].map((item) => (
            <div key={item}>
              <div className="h-3 w-24 rounded bg-gray-200" />
              <div className="mt-3 h-7 w-32 rounded bg-gray-200" />
              <div className="mt-3 h-3 w-full rounded bg-gray-100" />
            </div>
          ))}
        </div>
        <div className="h-80 rounded bg-gray-100" />
      </DashboardCard>
      <div className="grid gap-4 lg:grid-cols-2">
        <DashboardCard className="h-64">
          <div className="h-full rounded bg-gray-100" />
        </DashboardCard>
        <DashboardCard className="h-64">
          <div className="h-full rounded bg-gray-100" />
        </DashboardCard>
      </div>
    </div>
  );
}
