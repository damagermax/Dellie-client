"use client";

import { DashboardCard } from "@/components/dashboard/DashboardCard";
import { formatDashboardMoney } from "@/components/dashboard/dashboard-utils";
import { cn } from "@/lib/utils";
import type { ExpenseReportResponse } from "@/types/finance-report";
import type { SalesReportResponse } from "@/types/sales-report";

interface ProfitLossBreakdownRow {
  label: string;
  value: string;
  meta: string;
  tone?: "positive" | "negative";
}

export function ProfitLossBreakdownCard({
  salesReport,
  expenseReport,
}: {
  salesReport: SalesReportResponse;
  expenseReport: ExpenseReportResponse;
}) {
  const money = (value: number) =>
    formatDashboardMoney(salesReport.currencyCode, value);
  const grossRevenue = salesReport.summary.grossRevenue.value;
  const discounts = salesReport.summary.totalDiscount.value;
  const netSales = salesReport.summary.netSales.value;
  const grossProfit = salesReport.summary.grossProfit.value;
  const costOfSales = netSales - grossProfit;
  const operatingExpenses = expenseReport.summary.totalExpenses;
  const netProfit = grossProfit - operatingExpenses;

  const rows: ProfitLossBreakdownRow[] = [
    {
      label: "Gross revenue",
      value: money(grossRevenue),
      meta: "Sales before discounts and returns",
    },
    {
      label: "Discounts given",
      value: money(discounts),
      meta: "Line and document discounts applied",
      tone: "negative" as const,
    },
    {
      label: "Cost of sales",
      value: money(costOfSales),
      meta: "Recognized product cost inside gross profit",
      tone: "negative" as const,
    },
    {
      label: "Gross profit",
      value: money(grossProfit),
      meta: "Net sales minus recognized product cost",
    },
    {
      label: "Operating expenses",
      value: money(operatingExpenses),
      meta: "Recorded expense value in the same period",
      tone: "negative" as const,
    },
    {
      label: "Net profit / loss",
      value: money(netProfit),
      meta: "Gross profit after operating expenses",
      tone: netProfit < 0 ? ("negative" as const) : ("positive" as const),
    },
  ];

  return (
    <DashboardCard
      title="Profit & Loss Breakdown"
      description="Trace how revenue converts into gross profit and final operating result."
      contentClassName="space-y-4"
    >
      {rows.map((row) => (
        <div
          key={row.label}
          className="flex items-start justify-between gap-3 border-b border-gray-100 pb-4 last:border-b-0 last:pb-0"
        >
          <div className="min-w-0">
            <p className="font-medium text-gray-900">{row.label}</p>
            <p className="mt-1 text-xs text-gray-500">{row.meta}</p>
          </div>
          <p
            className={cn(
              "shrink-0 font-semibold text-gray-950",
              row.tone === "negative" && "text-red-600",
              row.tone === "positive" && "text-green-700",
            )}
          >
            {row.value}
          </p>
        </div>
      ))}
    </DashboardCard>
  );
}
