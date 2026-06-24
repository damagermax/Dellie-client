"use client";

import { DashboardCard } from "@/components/dashboard/DashboardCard";
import type { PurchaseReportResponse } from "@/types/purchase-report";
import { formatDashboardMoney } from "../dashboard-utils";

export function TopSuppliersCard({ report }: { report: PurchaseReportResponse }) {
  return (
    <DashboardCard title="Top Suppliers" description="Suppliers with the highest purchase volume this cycle." contentClassName="space-y-4">
      {report.topSuppliers.length ? (
        report.topSuppliers.map((supplier) => (
          <div key={supplier.id || supplier.name} className="flex items-start justify-between gap-3 border-b border-gray-100 pb-4 last:border-b-0 last:pb-0">
            <div className="min-w-0">
              <p className="font-medium text-gray-900">{supplier.name}</p>
              <p className="mt-1 text-xs text-gray-500">
                {supplier.purchaseCount} {supplier.purchaseCount === 1 ? "purchase" : "purchases"}
              </p>
            </div>
            <p className="font-semibold text-gray-950">{formatDashboardMoney(report.currencyCode, supplier.spend)}</p>
          </div>
        ))
      ) : (
        <p className="py-8 text-center text-sm text-gray-500">Supplier performance will appear here.</p>
      )}
    </DashboardCard>
  );
}
