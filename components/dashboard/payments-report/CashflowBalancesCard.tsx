"use client";

import { DashboardCard } from "@/components/dashboard/DashboardCard";
import { formatDashboardMoney } from "@/components/dashboard/dashboard-utils";
import { cn } from "@/lib/utils";

interface CashflowBalancesCardProps {
  currencyCode: string;
  receivables: number;
  payables: number;
}

interface CashflowBalanceMetric {
  title: string;
  value: string;
  hint: string;
  tone?: "positive" | "negative";
}

export function CashflowBalancesCard({
  currencyCode,
  receivables,
  payables,
}: CashflowBalancesCardProps) {
  const money = (value: number) => formatDashboardMoney(currencyCode, value);
  const netBalance = receivables - payables;
  const metrics: CashflowBalanceMetric[] = [
    {
      title: "Total Receivables",
      value: money(receivables),
      hint: "All open customer balances, including overdue",
    },
    {
      title: "Total Payables",
      value: money(payables),
      hint: "All open purchase and expense balances, including overdue",
    },
    {
      title: "Net Balance",
      value: money(netBalance),
      hint: "Total receivables minus total payables",
      tone: netBalance < 0 ? "negative" : "positive",
    },
  ];

  return (
    <DashboardCard contentClassName="px-6 py-6">
      <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 xl:grid-cols-3 xl:gap-0">
        {metrics.map((metric, index) => (
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
            <p
              className={cn(
                "mt-1 text-xl font-semibold text-gray-950",
                metric.tone === "negative" && "text-red-600",
                metric.tone === "positive" &&
                  metric.title === "Net Balance" &&
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
    </DashboardCard>
  );
}
