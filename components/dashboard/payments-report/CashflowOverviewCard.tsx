"use client";

import { DashboardCard } from "@/components/dashboard/DashboardCard";
import { cn } from "@/lib/utils";
import type { CashflowReportResponse } from "@/types/finance-report";
import { Area, AreaChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";
import { formatDashboardMoney } from "../dashboard-utils";

export function CashflowOverviewCard({ report }: { report: CashflowReportResponse }) {
  const money = (value: number) => formatDashboardMoney(report.currencyCode, value);
  const cashMetrics = [
    { title: "Cash Collected", value: money(report.summary.cashCollected), hint: "Cash received during the selected period" },
    { title: "Cash Paid / Spent", value: money(report.summary.cashOutflow), hint: "Cash paid out during the selected period" },
    { title: "Net Cash Flow", value: money(report.summary.netCashFlow), hint: "Cash collected minus cash paid during the period" },
  ];
  const normalizeValue = (value: number | string | ReadonlyArray<number | string> | undefined) => {
    if (Array.isArray(value)) return Number(value[0] || 0);
    return Number(value || 0);
  };

  return (
    <DashboardCard contentClassName="px-6 py-6">
      <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 xl:grid-cols-3 xl:gap-0">
        {cashMetrics.map((metric, index) => (
          <div
            key={metric.title}
            className={cn(
              index > 0 && "xl:border-l xl:border-gray-200 xl:pl-5",
              index < 2 &&
                "sm:border-r sm:border-gray-200 sm:pr-5 xl:border-r-0 xl:pr-0",
              index > 0 && "sm:pl-5",
            )}
          >
            <p className="text-xs font-medium text-gray-500">{metric.title}</p>
            <p className={cn("mt-1 text-xl font-semibold", metric.title === "Net Cash Flow" && report.summary.netCashFlow < 0 ? "text-red-600" : "text-gray-950")}>{metric.value}</p>
            <p className="mt-1 text-[11px] leading-5 text-gray-500">{metric.hint}</p>
          </div>
        ))}
      </div>

      <div className="mt-6">
        <p className="text-sm font-medium text-gray-950">Cashflow Trend</p>
        <p className="mt-1 text-xs text-gray-500">Cash received versus cash paid across the selected period.</p>
      </div>
      <div className="h-80 w-full pt-4">
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart data={report.trend}>
            <defs>
              <linearGradient id="fill-cash-inflow" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#16a34a" stopOpacity={0.22} />
                <stop offset="95%" stopColor="#16a34a" stopOpacity={0.02} />
              </linearGradient>
            </defs>
            <CartesianGrid stroke="#f1f5f9" vertical={false} />
            <XAxis dataKey="label" tickLine={false} axisLine={false} />
            <YAxis tickLine={false} axisLine={false} />
            <Tooltip formatter={(value, name) => [money(normalizeValue(value)), name === "Inflow" ? "Inflow" : "Outflow"]} />
            <Area type="monotone" dataKey="inflow" name="Inflow" stroke="#16a34a" fill="url(#fill-cash-inflow)" strokeWidth={2.5} />
            <Area type="monotone" dataKey="outflow" name="Outflow" stroke="#dc2626" fill="transparent" strokeWidth={2.5} />
          </AreaChart>
        </ResponsiveContainer>
      </div>
    </DashboardCard>
  );
}
