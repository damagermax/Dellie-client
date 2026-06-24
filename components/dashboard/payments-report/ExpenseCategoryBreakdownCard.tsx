"use client";

import { DashboardCard } from "@/components/dashboard/DashboardCard";
import { formatDashboardMoney } from "@/components/dashboard/dashboard-utils";
import type { ExpenseReportResponse } from "@/types/finance-report";
import { Cell, Pie, PieChart, ResponsiveContainer, Tooltip } from "recharts";

const CATEGORY_COLORS = ["#7c3aed", "#2563eb", "#0f766e", "#f59e0b", "#e11d48"];

export function ExpenseCategoryBreakdownCard({ report }: { report: ExpenseReportResponse }) {
  const categories = report.categories.map((category, index) => ({
    ...category,
    color: CATEGORY_COLORS[index % CATEGORY_COLORS.length],
  }));

  return (
    <DashboardCard className="h-full" title="Spending by Category" description="Categories consuming the highest expense value.">
      {categories.length ? (
        <div className="grid gap-5 lg:grid-cols-[220px_minmax(0,1fr)] lg:items-center">
          <div className="h-52 w-full" aria-label="Expense spending by category chart">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie data={categories} dataKey="total" nameKey="name" innerRadius={54} outerRadius={86} paddingAngle={3}>
                  {categories.map((category) => (
                    <Cell key={category.id || category.name} fill={category.color} />
                  ))}
                </Pie>
                <Tooltip formatter={(value) => formatDashboardMoney(report.currencyCode, Number(value ?? 0))} />
              </PieChart>
            </ResponsiveContainer>
          </div>

          <div className="divide-y divide-gray-100">
            {categories.map((category) => (
              <div key={category.id || category.name} className="flex items-center justify-between gap-3 py-3 first:pt-0 last:pb-0">
                <div className="flex min-w-0 items-start gap-3">
                  <span className="mt-1.5 h-2.5 w-2.5 shrink-0 rounded-full" style={{ backgroundColor: category.color }} />
                  <div className="min-w-0">
                    <p className="truncate font-medium text-gray-900">{category.name}</p>
                    <p className="mt-0.5 text-xs text-gray-500">
                      {category.expenseCount} {category.expenseCount === 1 ? "expense" : "expenses"} · {category.share.toFixed(1)}%
                    </p>
                  </div>
                </div>
                <p className="shrink-0 font-semibold text-gray-950">{formatDashboardMoney(report.currencyCode, category.total)}</p>
              </div>
            ))}
          </div>
        </div>
      ) : (
        <p className="py-8 text-center text-sm text-gray-500">Category spending will appear here.</p>
      )}
    </DashboardCard>
  );
}
