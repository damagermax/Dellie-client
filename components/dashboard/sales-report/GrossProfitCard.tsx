"use client";

import { DashboardCard } from "@/components/dashboard/DashboardCard";
import type { SalesReportResponse } from "@/types/sales-report";
import { formatDashboardMoney } from "../dashboard-utils";

export function GrossProfitCard({ report }: { report: SalesReportResponse }) {
  const money = (value: number) => formatDashboardMoney(report.currencyCode, value);

  return (
    <DashboardCard contentClassName="space-y-5">
      <div>
        <p className="text-xs text-gray-500">Total gross profit</p>
        <p className="mt-1 text-2xl font-semibold text-gray-950">{money(report.summary.grossProfit.value)}</p>
      </div>

      {report.orderProfits.length ? (
        report.orderProfits.map((row) => (
          <div key={row.id} className="border-b border-gray-100 pb-4 last:border-b-0 last:pb-0">
            <div className="flex items-start justify-between gap-3">
              <div className="min-w-0">
                <p className="font-medium text-gray-950">{row.orderNumber}</p>
                <p className="mt-1 text-xs text-gray-500">
                  {row.customerName} · {row.itemCount} {row.itemCount === 1 ? "item" : "items"}
                </p>
              </div>
              <div className="text-right">
                <p className="font-semibold text-gray-950">{money(row.totalAmount)}</p>
                <p className="mt-1 text-xs text-gray-500">Profit {money(row.grossProfit)}</p>
              </div>
            </div>
          </div>
        ))
      ) : (
        <p className="py-8 text-center text-sm text-gray-500">No fulfilled sales with realized profit</p>
      )}
    </DashboardCard>
  );
}
