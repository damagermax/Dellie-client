"use client";

import { DashboardCard } from "@/components/dashboard/DashboardCard";
import { formatDashboardMoney } from "@/components/dashboard/dashboard-utils";
import { cn } from "@/lib/utils";
import type { ExpenseReportResponse } from "@/types/finance-report";
import { Area, AreaChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";

export function ExpenseOverviewCard({ report }: { report: ExpenseReportResponse }) {
  const money = (value: number) => formatDashboardMoney(report.currencyCode, value);
  const metrics = [
    { title: "Total Expenses", value: money(report.summary.totalExpenses), hint: "Expenses recorded in the selected period" },
    { title: "Paid", value: money(report.summary.paidAmount), hint: "Expense value already settled" },
    { title: "Outstanding", value: money(report.summary.outstandingAmount), hint: "Expense balances still awaiting payment" },
    { title: "Expense Count", value: report.summary.expenseCount.toLocaleString(), hint: "Expense records in the selected period" },
  ];
  const normalizeValue = (value: number | string | ReadonlyArray<number | string> | undefined) => {
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
        <p className="text-sm font-medium text-gray-950">Expense Trend</p>
        <p className="mt-1 text-xs text-gray-500">Recorded expense value across the selected period.</p>
      </div>
      <div className="h-80 w-full pt-4">
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart data={report.trend}>
            <defs>
              <linearGradient id="fill-expense-total" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#7c3aed" stopOpacity={0.22} />
                <stop offset="95%" stopColor="#7c3aed" stopOpacity={0.02} />
              </linearGradient>
            </defs>
            <CartesianGrid stroke="#f1f5f9" vertical={false} />
            <XAxis dataKey="label" tickLine={false} axisLine={false} />
            <YAxis tickLine={false} axisLine={false} />
            <Tooltip formatter={(value) => [money(normalizeValue(value)), "Expenses"]} />
            <Area type="monotone" dataKey="total" name="Expenses" stroke="#7c3aed" fill="url(#fill-expense-total)" strokeWidth={2.5} />
          </AreaChart>
        </ResponsiveContainer>
      </div>
    </DashboardCard>
  );
}
