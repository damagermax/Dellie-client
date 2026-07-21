"use client";

import { Area, AreaChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";
import { DashboardCard } from "@/components/dashboard/DashboardCard";
import { cn } from "@/lib/utils";
import type { PurchaseReportResponse } from "@/types/purchase-report";
import { formatDashboardMoney } from "../dashboard-utils";

export function PurchasingTrendCard({ report }: { report: PurchaseReportResponse }) {
  const metrics = [
    {
      title: "Purchase Spend",
      value: formatDashboardMoney(report.currencyCode, report.summary.purchaseSpend.value),
      hint: "Committed supplier spend after discounts and tax",
    },
    {
      title: "Stock Received",
      value: `${report.summary.stockReceived.value.toLocaleString()} units`,
      hint: "Stock and packaging units received in the selected period",
    },
    {
      title: "Total Purchases",
      value: report.summary.totalPurchases.value.toLocaleString(),
      hint: "All open and closed purchases in the selected period",
    },
    {
      title: "Canceled Purchase Orders",
      value: report.summary.canceledPurchaseOrders.value.toLocaleString(),
      hint: "Purchase orders canceled in the selected period",
    },
  ];
  const normalizeTooltipValue = (value: number | string | ReadonlyArray<number | string> | undefined) => {
    if (Array.isArray(value)) return Number(value[0] || 0);
    return Number(value || 0);
  };

  return (
    <DashboardCard className="mb-12" contentClassName="px-6 py-6">
      <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 xl:grid-cols-4 xl:gap-0">
        {metrics.map((metric, index) => {
          return (
            <div
              key={metric.title}
              className={cn(
                index > 0 && "xl:border-l xl:border-gray-200 xl:pl-5",
                index < 2 && "sm:border-r sm:border-gray-200 sm:pr-5 xl:border-r-0 xl:pr-0",
                index >= 2 && "sm:pl-5",
              )}
            >
              <div>
                <p className="text-xs font-medium text-gray-500">{metric.title}</p>
                <p className="mt-1 text-xl font-semibold text-gray-950">{metric.value}</p>
              </div>
              <p className="mt-1 text-[11px] leading-5 text-gray-500">{metric.hint}</p>
            </div>
          );
        })}
      </div>

      <div className="mt-6">
        <p className="text-sm font-medium text-gray-950">Purchasing Trend</p>
        <p className="mt-1 text-xs text-gray-500">Purchase spend and stock receipts across the selected period.</p>
      </div>

      <div className="h-80 w-full pt-4">
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart data={report.trend}>
            <defs>
              <linearGradient id="fill-spend" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#0f766e" stopOpacity={0.22} />
                <stop offset="95%" stopColor="#0f766e" stopOpacity={0.02} />
              </linearGradient>
            </defs>
            <CartesianGrid stroke="#f1f5f9" vertical={false} />
            <XAxis dataKey="label" tickLine={false} axisLine={false} />
            <YAxis tickLine={false} axisLine={false} />
            <Tooltip
              formatter={(value, name) => {
                const number = normalizeTooltipValue(value);
                return name === "Spend"
                  ? [formatDashboardMoney(report.currencyCode, number), "Spend"]
                  : [`${number.toLocaleString()} units`, "Received"];
              }}
            />
            <Area type="monotone" dataKey="spend" name="Spend" stroke="#0f766e" fill="url(#fill-spend)" strokeWidth={2.5} />
            <Area type="monotone" dataKey="receivedUnits" name="Received" stroke="#f59e0b" fill="transparent" strokeWidth={2.5} />
          </AreaChart>
        </ResponsiveContainer>
      </div>
    </DashboardCard>
  );
}
