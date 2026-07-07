"use client";

import { AppModal } from "@/components/ui/AppModal";
import { DashboardCard } from "@/components/dashboard/DashboardCard";
import type { InventoryReportResponse } from "@/types/inventory-report";
import { useMemo, useState } from "react";

const PREVIEW_LIMIT = 5;

export function ReturnsCard({ report }: { report: InventoryReportResponse }) {
  const [viewMoreOpen, setViewMoreOpen] = useState(false);
  const previewReturns = useMemo(() => report.returns.slice(0, PREVIEW_LIMIT), [report.returns]);
  const hasOverflow = report.returns.length > PREVIEW_LIMIT;

  return (
    <>
      <DashboardCard
        className="h-full"
        title="Returns"
        description="Recent sales and purchase returns affecting inventory movement."
        contentClassName="space-y-4"
        headerExtra={
          hasOverflow ? (
            <button type="button" onClick={() => setViewMoreOpen(true)} className="shrink-0 text-sm font-medium text-[#2d837d] transition hover:text-[#256b66]">
              View more
            </button>
          ) : null
        }
      >
        {report.returns.length ? previewReturns.map((item) => <ReturnRow key={item.returnId} item={item} />) : <p className="py-8 text-center text-sm text-gray-500">No inventory returns were recorded in this period.</p>}
      </DashboardCard>

      <AppModal open={viewMoreOpen} toggle={() => setViewMoreOpen(false)} title="Returns" footer={null} width={760} height="70vh">
        <div className="space-y-4 bg-white px-6 py-5">
          {report.returns.map((item) => (
            <ReturnRow key={item.returnId} item={item} />
          ))}
        </div>
      </AppModal>
    </>
  );
}

function ReturnRow({ item }: { item: InventoryReportResponse["returns"][number] }) {
  return (
    <div className="flex items-start justify-between gap-3 border-b border-gray-100 pb-4 last:border-b-0 last:pb-0">
      <div className="min-w-0">
        <p className="font-medium text-gray-900">
          {item.type === "sale" ? "Sales Return" : "Purchase Return"} · {item.productName}
        </p>
        <p className="mt-1 text-xs text-gray-500">{item.reference}</p>
      </div>
      <p className="shrink-0 font-semibold text-gray-950">{item.quantity.toLocaleString()} units</p>
    </div>
  );
}
