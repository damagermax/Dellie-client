"use client";

import { DashboardCard } from "@/components/dashboard/DashboardCard";
import type { SalesReportResponse } from "@/types/sales-report";
import { formatDashboardMoney } from "../dashboard-utils";

export function TopCustomersCard({ report }: { report: SalesReportResponse }) {
  const money = (value: number) => formatDashboardMoney(report.currencyCode, value);

  return (
    <DashboardCard className="h-full" title="Top Customers" description="Customers driving the highest value this period." contentClassName="space-y-4">
      {report.topCustomers.length ? (
        report.topCustomers.map((customer) => (
          <div key={customer.id || customer.name} className="flex items-start justify-between gap-3 border-b border-gray-100 pb-4 last:border-b-0 last:pb-0">
            <div className="min-w-0">
              <p className="font-medium text-gray-900">{customer.name}</p>
              <p className="mt-1 text-xs text-gray-500">
                {customer.orderCount} {customer.orderCount === 1 ? "order" : "orders"} · {customer.paidOrderCount} paid
              </p>
            </div>
            <p className="font-semibold text-gray-950">{money(customer.netSales)}</p>
          </div>
        ))
      ) : (
        <p className="py-8 text-center text-sm text-gray-500">Customer performance will appear here.</p>
      )}
    </DashboardCard>
  );
}
