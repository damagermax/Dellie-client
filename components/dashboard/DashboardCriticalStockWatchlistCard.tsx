"use client";

import Link from "next/link";
import { formatDate } from "@/lib/dateUtils";
import { DashboardOverviewWatchlistItem } from "@/types/dashboard-overview";
import { DashboardCard } from "./DashboardCard";

interface DashboardCriticalStockWatchlistCardProps {
  items: DashboardOverviewWatchlistItem[];
  className?: string;
}

export function DashboardCriticalStockWatchlistCard({ items, className }: DashboardCriticalStockWatchlistCardProps) {
  if (!items.length) return null;

  return (
    <DashboardCard className={className} title="Critical Stock Watchlist" description="Items that need replenishment or expiry attention first." contentClassName="p-0">
      <div className="divide-y divide-gray-100">
        {items.map((item) => (
          <Link key={item.id} href={`/products/${item.productId}`} className="block px-6 py-4 transition-colors hover:bg-gray-50">
            <div className="flex flex-col gap-3 md:flex-row md:items-start md:justify-between">
              <div className="min-w-0">
                <div className="flex flex-wrap items-center gap-2">
                  <p className="truncate font-medium text-gray-950">{item.name}</p>
                  <span className={issueTone(item.issue)}>{issueLabel(item.issue)}</span>
                </div>
                {item.sku ? <p className="mt-1 text-xs uppercase tracking-[0.18em] text-gray-400">SKU {item.sku}</p> : null}
              </div>
              <div className="shrink-0 text-left md:text-right">
                <p className="text-sm font-medium text-gray-700">{issueSummary(item)}</p>
                {item.expiryDate ? <p className="mt-1 text-xs text-gray-500">{formatDate(item.expiryDate, "DD MMM YYYY")}</p> : null}
              </div>
            </div>
          </Link>
        ))}
      </div>
    </DashboardCard>
  );
}

function issueLabel(issue: DashboardOverviewWatchlistItem["issue"]) {
  switch (issue) {
    case "out_of_stock":
      return "Out of stock";
    case "stock_alert":
      return "Stock alert";
    case "expired":
      return "Expired";
    case "expiring_soon":
      return "Soon expiring";
    default:
      return "Attention";
  }
}

function issueSummary(item: DashboardOverviewWatchlistItem) {
  switch (item.issue) {
    case "out_of_stock":
      return "0 available";
    case "stock_alert":
      return `${Number(item.availableQuantity || 0).toLocaleString()} left`;
    case "expired":
      return `${Number(item.affectedQuantity || 0).toLocaleString()} expired`;
    case "expiring_soon":
      return `${Number(item.affectedQuantity || 0).toLocaleString()} at risk`;
    default:
      return "";
  }
}

function issueTone(issue: DashboardOverviewWatchlistItem["issue"]) {
  switch (issue) {
    case "out_of_stock":
    case "expired":
      return "rounded-full border border-red-200 bg-red-50 px-2 py-0.5 text-xs font-medium text-red-700";
    case "stock_alert":
    case "expiring_soon":
      return "rounded-full border border-amber-200 bg-amber-50 px-2 py-0.5 text-xs font-medium text-amber-700";
    default:
      return "rounded-full border border-gray-200 bg-gray-50 px-2 py-0.5 text-xs font-medium text-gray-600";
  }
}
