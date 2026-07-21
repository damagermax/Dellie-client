"use client";

import { AppModal } from "@/components/ui/AppModal";
import { DashboardCard } from "@/components/dashboard/DashboardCard";
import type { SalesReportResponse } from "@/types/sales-report";
import { formatDashboardMoney } from "../dashboard-utils";
import { useMemo, useState } from "react";

const PREVIEW_LIMIT = 5;

export function GrossProfitCard({ report }: { report: SalesReportResponse }) {
  const money = (value: number) => formatDashboardMoney(report.currencyCode, value);
  const [viewMoreOpen, setViewMoreOpen] = useState(false);
  const previewOrderProfits = useMemo(() => report.orderProfits.slice(0, PREVIEW_LIMIT), [report.orderProfits]);
  const hasOverflow = report.orderProfits.length > PREVIEW_LIMIT;

  return (
    <>
      <DashboardCard contentClassName="space-y-5">
        <div className="flex items-start justify-between gap-3">
          <div>
            <p className="text-xs text-gray-500">Total gross profit</p>
            <p className="mt-1 text-2xl font-semibold text-gray-950">{money(report.summary.grossProfit.value)}</p>
          </div>
          {hasOverflow ? (
            <button type="button" onClick={() => setViewMoreOpen(true)} className="shrink-0 text-sm font-medium text-[#2d837d] transition hover:text-[#256b66]">
              View more
            </button>
          ) : null}
        </div>

        {report.orderProfits.length ? previewOrderProfits.map((row) => <GrossProfitRow key={row.id} row={row} money={money} />) : <p className="py-8 text-center text-sm text-gray-500">No fulfilled sales with realized profit</p>}
      </DashboardCard>

      <AppModal open={viewMoreOpen} toggle={() => setViewMoreOpen(false)} title="Total gross profit" footer={null} width={760} height="70vh">
        <div className="space-y-5 bg-white px-6 py-5">
          <div>
            <p className="text-xs text-gray-500">Total gross profit</p>
            <p className="mt-1 text-2xl font-semibold text-gray-950">{money(report.summary.grossProfit.value)}</p>
          </div>
          <div className="space-y-4">
            {report.orderProfits.map((row) => (
              <GrossProfitRow key={row.id} row={row} money={money} />
            ))}
          </div>
        </div>
      </AppModal>
    </>
  );
}

function GrossProfitRow({
  row,
  money,
}: {
  row: SalesReportResponse["orderProfits"][number];
  money: (value: number) => string;
}) {
  return (
    <div className="border-b border-gray-100 pb-4 last:border-b-0 last:pb-0">
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
  );
}
