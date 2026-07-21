"use client";

import { AppModal } from "@/components/ui/AppModal";
import { DashboardCard } from "@/components/dashboard/DashboardCard";
import type { PurchaseReportResponse } from "@/types/purchase-report";
import { useMemo, useState } from "react";

const PREVIEW_LIMIT = 5;

export function PendingReceiptFocusCard({ report }: { report: PurchaseReportResponse }) {
  const [viewMoreOpen, setViewMoreOpen] = useState(false);
  const previewReceipts = useMemo(() => report.pendingReceipts.slice(0, PREVIEW_LIMIT), [report.pendingReceipts]);
  const hasOverflow = report.pendingReceipts.length > PREVIEW_LIMIT;

  return (
    <>
      <DashboardCard
        title="Pending Receipt Focus"
        description="Open lines that may affect stock availability soonest."
        contentClassName="space-y-4"
        headerExtra={
          hasOverflow ? (
            <button type="button" onClick={() => setViewMoreOpen(true)} className="shrink-0 text-sm font-medium text-[#2d837d] transition hover:text-[#256b66]">
              View more
            </button>
          ) : null
        }
      >
        {report.pendingReceipts.length ? previewReceipts.map((item) => <PendingReceiptRow key={`${item.purchaseId}-${item.lineItemId}`} item={item} />) : <p className="py-8 text-center text-sm text-gray-500">No purchase lines are waiting to be received.</p>}
      </DashboardCard>

      <AppModal open={viewMoreOpen} toggle={() => setViewMoreOpen(false)} title="Pending Receipt Focus" footer={null} width={760} height="70vh">
        <div className="space-y-4 bg-white px-6 py-5">
          {report.pendingReceipts.map((item) => (
            <PendingReceiptRow key={`${item.purchaseId}-${item.lineItemId}`} item={item} />
          ))}
        </div>
      </AppModal>
    </>
  );
}

function PendingReceiptRow({ item }: { item: PurchaseReportResponse["pendingReceipts"][number] }) {
  return (
    <div className="flex items-start justify-between gap-3 border-b border-gray-100 pb-4 last:border-b-0 last:pb-0">
      <div className="min-w-0">
        <p className="font-medium text-gray-900">{item.productName}</p>
        <p className="mt-1 text-xs text-gray-500">{item.purchaseNumber}</p>
      </div>
      <p className="font-semibold text-gray-950">{item.outstandingQuantity.toLocaleString()} units</p>
    </div>
  );
}
