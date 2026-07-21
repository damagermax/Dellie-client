"use client";

import { AppModal } from "@/components/ui/AppModal";
import { DashboardCard } from "@/components/dashboard/DashboardCard";
import type { SalesReportResponse } from "@/types/sales-report";
import { formatDashboardMoney } from "../dashboard-utils";
import { useMemo, useState } from "react";

const PREVIEW_LIMIT = 5;

export function TopSellingProductsCard({ report }: { report: SalesReportResponse }) {
  const money = (value: number) => formatDashboardMoney(report.currencyCode, value);
  const [viewMoreOpen, setViewMoreOpen] = useState(false);
  const previewProducts = useMemo(() => report.topProducts.slice(0, PREVIEW_LIMIT), [report.topProducts]);
  const hasOverflow = report.topProducts.length > PREVIEW_LIMIT;

  return (
    <>
      <DashboardCard
        title="Top Selling Products"
        description="Best-selling products by units sold and revenue generated."
        className="h-full"
        contentClassName="space-y-4"
        headerExtra={
          hasOverflow ? (
            <button type="button" onClick={() => setViewMoreOpen(true)} className="shrink-0 text-sm font-medium text-[#2d837d] transition hover:text-[#256b66]">
              View more
            </button>
          ) : null
        }
      >
        {report.topProducts.length ? previewProducts.map((product) => <TopSellingProductRow key={product.id} product={product} money={money} />) : <p className="py-8 text-center text-sm text-gray-500">No product sales</p>}
      </DashboardCard>

      <AppModal open={viewMoreOpen} toggle={() => setViewMoreOpen(false)} title="Top Selling Products" footer={null} width={760} height="70vh">
        <div className="space-y-4 bg-white px-6 py-5">
          {report.topProducts.map((product) => (
            <TopSellingProductRow key={product.id} product={product} money={money} />
          ))}
        </div>
      </AppModal>
    </>
  );
}

function TopSellingProductRow({
  product,
  money,
}: {
  product: SalesReportResponse["topProducts"][number];
  money: (value: number) => string;
}) {
  return (
    <div className="flex items-start justify-between gap-3 border-b border-gray-100 pb-4 last:border-b-0 last:pb-0">
      <div className="min-w-0">
        <p className="font-medium text-gray-950">{product.name}</p>
        <p className="mt-1 text-xs text-gray-500">{product.unitsSold.toLocaleString()} units sold</p>
      </div>
      <p className="font-semibold text-gray-950">{money(product.netSales)}</p>
    </div>
  );
}
