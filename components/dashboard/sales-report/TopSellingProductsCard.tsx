"use client";

import { DashboardCard } from "@/components/dashboard/DashboardCard";
import type { SalesReportResponse } from "@/types/sales-report";
import { formatDashboardMoney } from "../dashboard-utils";

export function TopSellingProductsCard({ report }: { report: SalesReportResponse }) {
  const money = (value: number) => formatDashboardMoney(report.currencyCode, value);

  return (
    <DashboardCard title="Top Selling Products" description="Best-selling products by units sold and revenue generated." className="h-full" contentClassName="space-y-4">
      {report.topProducts.length ? (
        report.topProducts.map((product) => (
          <div key={product.id} className="flex items-start justify-between gap-3 border-b border-gray-100 pb-4 last:border-b-0 last:pb-0">
            <div className="min-w-0">
              <p className="font-medium text-gray-950">{product.name}</p>
              <p className="mt-1 text-xs text-gray-500">{product.unitsSold.toLocaleString()} units sold</p>
            </div>
            <p className="font-semibold text-gray-950">{money(product.netSales)}</p>
          </div>
        ))
      ) : (
        <p className="py-8 text-center text-sm text-gray-500">No product sales</p>
      )}
    </DashboardCard>
  );
}
