"use client";

import { AppModal } from "@/components/ui/AppModal";
import { DashboardCard } from "@/components/dashboard/DashboardCard";
import type { PurchaseReportResponse } from "@/types/purchase-report";
import { formatDashboardMoney } from "../dashboard-utils";
import { useMemo, useState } from "react";

const PREVIEW_LIMIT = 5;

export function TopSuppliersCard({ report }: { report: PurchaseReportResponse }) {
  const [viewMoreOpen, setViewMoreOpen] = useState(false);
  const previewSuppliers = useMemo(() => report.topSuppliers.slice(0, PREVIEW_LIMIT), [report.topSuppliers]);
  const hasOverflow = report.topSuppliers.length > PREVIEW_LIMIT;

  return (
    <>
      <DashboardCard
        title="Top Suppliers"
        description="Suppliers with the highest purchase volume this cycle."
        contentClassName="space-y-4"
        headerExtra={
          hasOverflow ? (
            <button type="button" onClick={() => setViewMoreOpen(true)} className="shrink-0 text-sm font-medium text-[#2d837d] transition hover:text-[#256b66]">
              View more
            </button>
          ) : null
        }
      >
        {report.topSuppliers.length ? previewSuppliers.map((supplier) => <TopSupplierRow key={supplier.id || supplier.name} supplier={supplier} currencyCode={report.currencyCode} />) : <p className="py-8 text-center text-sm text-gray-500">Supplier performance will appear here.</p>}
      </DashboardCard>

      <AppModal open={viewMoreOpen} toggle={() => setViewMoreOpen(false)} title="Top Suppliers" footer={null} width={760} height="70vh">
        <div className="space-y-4 bg-white px-6 py-5">
          {report.topSuppliers.map((supplier) => (
            <TopSupplierRow key={supplier.id || supplier.name} supplier={supplier} currencyCode={report.currencyCode} />
          ))}
        </div>
      </AppModal>
    </>
  );
}

function TopSupplierRow({
  supplier,
  currencyCode,
}: {
  supplier: PurchaseReportResponse["topSuppliers"][number];
  currencyCode: string;
}) {
  return (
    <div className="flex items-start justify-between gap-3 border-b border-gray-100 pb-4 last:border-b-0 last:pb-0">
      <div className="min-w-0">
        <p className="font-medium text-gray-900">{supplier.name}</p>
        <p className="mt-1 text-xs text-gray-500">
          {supplier.purchaseCount} {supplier.purchaseCount === 1 ? "purchase" : "purchases"}
        </p>
      </div>
      <p className="font-semibold text-gray-950">{formatDashboardMoney(currencyCode, supplier.spend)}</p>
    </div>
  );
}
