"use client";

import { DashboardCard } from "@/components/dashboard/DashboardCard";
import type { InventoryReportResponse } from "@/types/inventory-report";

export function CriticalStockWatchlistCard({ report }: { report: InventoryReportResponse }) {
  return (
    <DashboardCard className="h-full" title="Critical Stock Watchlist" description="Items that need replenishment or intervention first." contentClassName="space-y-4">
      {report.criticalStock.length ? (
        report.criticalStock.map((item) => (
          <div key={item.productId} className="flex items-start justify-between gap-3 border-b border-gray-100 pb-4 last:border-b-0 last:pb-0">
            <div className="min-w-0">
              <p className="font-medium text-gray-900">{item.name}</p>
              <p className="mt-1 text-xs text-gray-500">
                {item.lowStockThreshold ? `Reorder point: ${item.lowStockThreshold}` : "No reorder point"}
                {item.locationName ? ` · ${item.locationName}` : " · All locations"}
              </p>
            </div>
            <span
              className={cnStatus(item.status)}
            >
              {item.status === "out_of_stock" ? "Out of stock" : `${item.availableQuantity.toLocaleString()} left`}
            </span>
          </div>
        ))
      ) : (
        <p className="py-8 text-center text-sm text-gray-500">No products currently need stock intervention.</p>
      )}
    </DashboardCard>
  );
}

function cnStatus(status: InventoryReportResponse["criticalStock"][number]["status"]) {
  return `shrink-0 rounded-full border px-2 py-0.5 text-xs font-medium ${
    status === "out_of_stock" ? "border-red-200 bg-red-50 text-red-600" : "border-amber-200 bg-amber-50 text-amber-700"
  }`;
}
