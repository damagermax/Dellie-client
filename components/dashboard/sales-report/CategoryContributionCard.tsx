"use client";

import { DashboardCard } from "@/components/dashboard/DashboardCard";
import type { SalesReportResponse } from "@/types/sales-report";
import { formatDashboardMoney } from "../dashboard-utils";

export function CategoryContributionCard({ report }: { report: SalesReportResponse }) {
  const money = (value: number) => formatDashboardMoney(report.currencyCode, value);

  return (
    <DashboardCard className="h-full" title="Category Contribution" description="How each product category contributes to current sales value and unit movement." contentClassName="space-y-4">
      {report.categoryContribution.length ? (
        report.categoryContribution.map((category) => (
          <div key={category.id || category.name} className="flex items-start justify-between gap-3 border-b border-gray-100 pb-4 last:border-b-0 last:pb-0">
            <div className="min-w-0">
              <p className="font-medium text-gray-900">{category.name}</p>
              <p className="mt-1 text-xs text-gray-500">
                {category.unitsSold.toLocaleString()} units sold · {category.share.toFixed(1)}% of sales value
              </p>
            </div>
            <p className="font-semibold text-gray-950">{money(category.netSales)}</p>
          </div>
        ))
      ) : (
        <p className="py-8 text-center text-sm text-gray-500">Category contribution will appear here.</p>
      )}
    </DashboardCard>
  );
}
