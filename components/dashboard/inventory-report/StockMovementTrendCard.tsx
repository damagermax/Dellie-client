"use client";

import { DashboardCard } from "@/components/dashboard/DashboardCard";
import { cn } from "@/lib/utils";
import type { InventoryReportResponse } from "@/types/inventory-report";
import { Area, AreaChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";
import { formatDashboardMoney } from "../dashboard-utils";

export function StockMovementTrendCard({ report }: { report: InventoryReportResponse }) {
  const metrics = [
    {
      title: "Inventory Value",
      value: formatDashboardMoney(report.currencyCode, report.summary.inventoryValue),
      hint: "Physical stock value across the selected locations",
    },
    {
      title: "Low Stock SKUs",
      value: report.summary.lowStockSkus.toLocaleString(),
      hint: "Products at or below their configured stock threshold",
    },
    {
      title: "Out of Stock",
      value: report.summary.outOfStockSkus.toLocaleString(),
      hint: "Tracked products with zero available quantity",
    },
    {
      title: "Expiring Soon",
      value: `${report.summary.expiringSoonBatches.toLocaleString()} batches`,
      hint: "Batches expiring within the next 30 days",
    },
  ];
  const normalizeTooltipValue = (value: number | string | ReadonlyArray<number | string> | undefined) => {
    if (Array.isArray(value)) return Number(value[0] || 0);
    return Number(value || 0);
  };

  return (
    <DashboardCard contentClassName="px-6 py-6">
      <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 xl:grid-cols-4 xl:gap-0">
        {metrics.map((metric, index) => (
          <div
            key={metric.title}
            className={cn(
              index > 0 && "xl:border-l xl:border-gray-200 xl:pl-5",
              index < 2 && "sm:border-r sm:border-gray-200 sm:pr-5 xl:border-r-0 xl:pr-0",
              index >= 2 && "sm:pl-5",
            )}
          >
            <p className="text-xs font-medium text-gray-500">{metric.title}</p>
            <p className="mt-1 text-xl font-semibold text-gray-950">{metric.value}</p>
            <p className="mt-1 text-[11px] leading-5 text-gray-500">{metric.hint}</p>
          </div>
        ))}
      </div>

      <div className="mt-6">
        <p className="text-sm font-medium text-gray-950">Stock Movement Trend</p>
        <p className="mt-1 text-xs text-gray-500">
          Compare stock received and returned with stock sold or sent back to suppliers.
        </p>
      </div>

      <div className="h-80 w-full pt-4">
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart data={report.movementTrend}>
            <defs>
              <linearGradient id="fill-stock-in" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#0f766e" stopOpacity={0.22} />
                <stop offset="95%" stopColor="#0f766e" stopOpacity={0.02} />
              </linearGradient>
            </defs>
            <CartesianGrid stroke="#f1f5f9" vertical={false} />
            <XAxis dataKey="label" tickLine={false} axisLine={false} />
            <YAxis tickLine={false} axisLine={false} allowDecimals={false} />
            <Tooltip
              formatter={(value, name) => [
                `${normalizeTooltipValue(value).toLocaleString()} units`,
                name === "Stock In" ? "Stock In" : "Stock Out",
              ]}
            />
            <Area type="monotone" dataKey="stockIn" name="Stock In" stroke="#0f766e" fill="url(#fill-stock-in)" strokeWidth={2.5} />
            <Area type="monotone" dataKey="stockOut" name="Stock Out" stroke="#dc2626" fill="transparent" strokeWidth={2.5} />
          </AreaChart>
        </ResponsiveContainer>
      </div>
    </DashboardCard>
  );
}
