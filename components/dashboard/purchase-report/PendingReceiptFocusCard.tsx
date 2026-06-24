"use client";

import { DashboardCard } from "@/components/dashboard/DashboardCard";
import type { PurchaseReportResponse } from "@/types/purchase-report";

export function PendingReceiptFocusCard({ report }: { report: PurchaseReportResponse }) {
  return (
    <DashboardCard title="Pending Receipt Focus" description="Open lines that may affect stock availability soonest." contentClassName="space-y-4">
      {report.pendingReceipts.length ? (
        report.pendingReceipts.map((item) => (
          <div key={`${item.purchaseId}-${item.lineItemId}`} className="flex items-start justify-between gap-3 border-b border-gray-100 pb-4 last:border-b-0 last:pb-0">
            <div className="min-w-0">
              <p className="font-medium text-gray-900">{item.productName}</p>
              <p className="mt-1 text-xs text-gray-500">{item.purchaseNumber}</p>
            </div>
            <p className="font-semibold text-gray-950">{item.outstandingQuantity.toLocaleString()} units</p>
          </div>
        ))
      ) : (
        <p className="py-8 text-center text-sm text-gray-500">No purchase lines are waiting to be received.</p>
      )}
    </DashboardCard>
  );
}
