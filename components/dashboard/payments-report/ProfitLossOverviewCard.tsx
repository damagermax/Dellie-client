"use client";

import { DashboardCard } from "@/components/dashboard/DashboardCard";
import { formatDashboardMoney } from "@/components/dashboard/dashboard-utils";
import { cn } from "@/lib/utils";
import type { ExpenseReportResponse } from "@/types/finance-report";
import type { SalesReportResponse } from "@/types/sales-report";
import {
  Area,
  AreaChart,
  CartesianGrid,
  Line,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";

interface ProfitLossMetric {
  title: string;
  value: string;
  hint: string;
  tone?: "positive" | "negative";
}

export function ProfitLossOverviewCard({
  salesReport,
  expenseReport,
}: {
  salesReport: SalesReportResponse;
  expenseReport: ExpenseReportResponse;
}) {
  const money = (value: number) =>
    formatDashboardMoney(salesReport.currencyCode, value);
  const grossProfit = salesReport.summary.grossProfit.value;
  const operatingExpenses = expenseReport.summary.totalExpenses;
  const netProfit = grossProfit - operatingExpenses;

  const metrics: ProfitLossMetric[] = [
    {
      title: "Net Sales",
      value: money(salesReport.summary.netSales.value),
      hint: "Sales after discounts and returns in the selected period",
    },
    {
      title: "Gross Profit",
      value: money(grossProfit),
      hint: "Sales margin retained after product cost of sales",
    },
    {
      title: "Operating Expenses",
      value: money(operatingExpenses),
      hint: "Expenses recorded in the selected period",
      tone: "negative" as const,
    },
    {
      title: "Net Profit / Loss",
      value: money(netProfit),
      hint: "Gross profit after operating expenses",
      tone: netProfit < 0 ? ("negative" as const) : ("positive" as const),
    },
  ];

  const expenseByLabel = new Map(
    expenseReport.trend.map((item) => [item.label, item.total]),
  );
  const trend = salesReport.overview.map((item) => {
    const expenses = expenseByLabel.get(item.label) ?? 0;
    return {
      label: item.label,
      netSales: item.revenue,
      expenses,
      profit: item.revenue - expenses,
    };
  });

  const normalizeValue = (
    value: number | string | ReadonlyArray<number | string> | undefined,
  ) => {
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
              index < 2 &&
                "sm:border-r sm:border-gray-200 sm:pr-5 xl:border-r-0 xl:pr-0",
              index >= 2 && "sm:pl-5",
            )}
          >
            <p className="text-xs font-medium text-gray-500">{metric.title}</p>
            <p
              className={cn(
                "mt-1 text-xl font-semibold text-gray-950",
                metric.tone === "negative" && "text-red-600",
                metric.tone === "positive" &&
                  metric.title === "Net Profit / Loss" &&
                  "text-green-700",
              )}
            >
              {metric.value}
            </p>
            <p className="mt-1 text-[11px] leading-5 text-gray-500">
              {metric.hint}
            </p>
          </div>
        ))}
      </div>

      <div className="mt-6">
        <p className="text-sm font-medium text-gray-950">Profit Trend</p>
        <p className="mt-1 text-xs text-gray-500">
          Net sales versus operating expenses across the selected period.
        </p>
      </div>
      <div className="h-80 w-full pt-4">
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart data={trend}>
            <defs>
              <linearGradient id="fill-profit-net-sales" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#2563eb" stopOpacity={0.2} />
                <stop offset="95%" stopColor="#2563eb" stopOpacity={0.02} />
              </linearGradient>
            </defs>
            <CartesianGrid stroke="#f1f5f9" vertical={false} />
            <XAxis dataKey="label" tickLine={false} axisLine={false} />
            <YAxis tickLine={false} axisLine={false} />
            <Tooltip
              formatter={(value, name) => [
                money(normalizeValue(value)),
                name === "netSales"
                  ? "Net sales"
                  : name === "expenses"
                    ? "Expenses"
                    : "Net profit / loss",
              ]}
            />
            <Area
              type="monotone"
              dataKey="netSales"
              stroke="#2563eb"
              fill="url(#fill-profit-net-sales)"
              strokeWidth={2.5}
            />
            <Line
              type="monotone"
              dataKey="expenses"
              stroke="#dc2626"
              strokeWidth={2.25}
              dot={false}
            />
            <Line
              type="monotone"
              dataKey="profit"
              stroke="#16a34a"
              strokeWidth={2.25}
              dot={false}
            />
          </AreaChart>
        </ResponsiveContainer>
      </div>
    </DashboardCard>
  );
}
