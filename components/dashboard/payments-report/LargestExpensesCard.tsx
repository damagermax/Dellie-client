"use client";

import { DashboardCard } from "@/components/dashboard/DashboardCard";
import { formatDashboardMoney } from "@/components/dashboard/dashboard-utils";
import type { ExpenseReportResponse } from "@/types/finance-report";

export function LargestExpensesCard({ report }: { report: ExpenseReportResponse }) {
  return (
    <DashboardCard className="h-full" title="Largest Expenses" description="Highest-value operating expenses in this period." contentClassName="space-y-4">
      {report.largestExpenses.length ? (
        report.largestExpenses.map((item) => (
          <div key={item.id} className="flex items-start justify-between gap-3 border-b border-gray-100 pb-4 last:border-b-0 last:pb-0">
            <div className="min-w-0">
              <p className="truncate font-medium text-gray-900">{item.note}</p>
              <p className="mt-1 text-xs text-gray-500">{item.categoryName} · {item.contactName}</p>
            </div>
            <div className="shrink-0 text-right">
              <p className="font-semibold text-gray-950">{formatDashboardMoney(report.currencyCode, item.total)}</p>
              {item.outstanding > 0 ? <p className="mt-1 text-xs text-red-500">{formatDashboardMoney(report.currencyCode, item.outstanding)} due</p> : null}
            </div>
          </div>
        ))
      ) : (
        <p className="py-8 text-center text-sm text-gray-500">Large expenses will appear here.</p>
      )}
    </DashboardCard>
  );
}
