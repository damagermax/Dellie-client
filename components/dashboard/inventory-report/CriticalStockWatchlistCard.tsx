"use client";

import { AppModal } from "@/components/ui/AppModal";
import { DashboardCard } from "@/components/dashboard/DashboardCard";
import type { InventoryReportResponse } from "@/types/inventory-report";
import { useMemo, useState } from "react";

const PREVIEW_LIMIT = 5;

export function CriticalStockWatchlistCard({ report }: { report: InventoryReportResponse }) {
  const [viewMoreOpen, setViewMoreOpen] = useState(false);
  const previewItems = useMemo(() => report.criticalStock.slice(0, PREVIEW_LIMIT), [report.criticalStock]);
  const hasOverflow = report.criticalStock.length > PREVIEW_LIMIT;

  return (
    <>
      <DashboardCard
        className="h-full"
        title="Critical Stock Watchlist"
        description="Items that need replenishment or intervention first."
        contentClassName="space-y-4"
        headerExtra={
          hasOverflow ? (
            <button type="button" onClick={() => setViewMoreOpen(true)} className="shrink-0 text-sm font-medium text-[#2d837d] transition hover:text-[#256b66]">
              View more
            </button>
          ) : null
        }
      >
        {report.criticalStock.length ? previewItems.map((item) => <CriticalStockRow key={item.productId} item={item} />) : <p className="py-8 text-center text-sm text-gray-500">No products currently need stock intervention.</p>}
      </DashboardCard>

      <AppModal open={viewMoreOpen} toggle={() => setViewMoreOpen(false)} title="Critical Stock Watchlist" footer={null} width={760} height="70vh">
        <div className="space-y-4 bg-white px-6 py-5">
          {report.criticalStock.map((item) => (
            <CriticalStockRow key={item.productId} item={item} />
          ))}
        </div>
      </AppModal>
    </>
  );
}

function CriticalStockRow({ item }: { item: InventoryReportResponse["criticalStock"][number] }) {
  return (
    <div className="flex items-start justify-between gap-3 border-b border-gray-100 pb-4 last:border-b-0 last:pb-0">
      <div className="min-w-0">
        <p className="font-medium text-gray-900">{item.name}</p>
        <p className="mt-1 text-xs text-gray-500">
          {item.lowStockThreshold ? `Reorder point: ${item.lowStockThreshold}` : "No reorder point"}
          {item.locationName ? ` · ${item.locationName}` : " · All locations"}
        </p>
      </div>
      <span className={cnStatus(item.status)}>
        {item.status === "out_of_stock" ? "Out of stock" : `${item.availableQuantity.toLocaleString()} left`}
      </span>
    </div>
  );
}

function cnStatus(status: InventoryReportResponse["criticalStock"][number]["status"]) {
  return `shrink-0 rounded-full border px-2 py-0.5 text-xs font-medium ${
    status === "out_of_stock" ? "border-red-200 bg-red-50 text-red-600" : "border-amber-200 bg-amber-50 text-amber-700"
  }`;
}
