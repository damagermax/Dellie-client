"use client";

import { DashboardCard } from "@/components/dashboard/DashboardCard";
import type { InventoryReportResponse } from "@/types/inventory-report";

export function ReturnsCard({ report }: { report: InventoryReportResponse }) {
  return (
    <DashboardCard className="h-full" title="Returns" description="Recent sales and purchase returns affecting inventory movement." contentClassName="space-y-4">
      {report.returns.length ? (
        report.returns.map((item) => (
          <div key={item.returnId} className="flex items-start justify-between gap-3 border-b border-gray-100 pb-4 last:border-b-0 last:pb-0">
            <div className="min-w-0">
              <p className="font-medium text-gray-900">
                {item.type === "sale" ? "Sales Return" : "Purchase Return"} · {item.productName}
              </p>
              <p className="mt-1 text-xs text-gray-500">{item.reference}</p>
            </div>
            <p className="shrink-0 font-semibold text-gray-950">{item.quantity.toLocaleString()} units</p>
          </div>
        ))
      ) : (
        <p className="py-8 text-center text-sm text-gray-500">No inventory returns were recorded in this period.</p>
      )}
    </DashboardCard>
  );
}
