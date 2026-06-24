"use client";

import { cn } from "@/lib/utils";
import { DashboardCard } from "./DashboardCard";
import { formatChange, getTrendTone } from "./dashboard-utils";

interface DashboardMetricCardProps {
  title: string;
  value: string;
  hint: string;
  changePercent?: number | null;
  inverseChange?: boolean;
  compact?: boolean;
}

export function DashboardMetricCard({ title, value, hint, changePercent, inverseChange = false, compact = true }: DashboardMetricCardProps) {
  const tone = getTrendTone(changePercent ?? null, inverseChange);
  const formattedChange = formatChange(changePercent ?? null);

  return (
    <DashboardCard contentClassName={compact ? "p-4" : "p-5"}>
      <div className="flex items-start justify-between gap-3">
        <div>
          <p className={cn(compact ? "text-xs font-medium text-gray-500" : "text-sm font-medium text-gray-500")}>{title}</p>
          <p className={cn(compact ? "mt-1 text-xl font-semibold text-gray-950" : "mt-2 text-2xl font-semibold text-gray-950")}>{value}</p>
        </div>
        {formattedChange ? (
          <span
            className={cn(
              "inline-flex rounded-full border px-1.5 py-0.5 text-xs leading-none",
              tone === "positive" ? "border-green-300 bg-green-50 text-green-600" : "border-red-300 bg-red-50 text-red-500",
            )}
          >
            {formattedChange}
          </span>
        ) : null}
      </div>
      <p className={cn(compact ? "mt-2 text-[11px] leading-5 text-gray-500" : "mt-3 text-xs text-gray-500")}>{hint}</p>
    </DashboardCard>
  );
}
