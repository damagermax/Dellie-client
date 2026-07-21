"use client";

import { AppModal } from "@/components/ui/AppModal";
import { DashboardCard } from "@/components/dashboard/DashboardCard";
import type { SalesReportResponse } from "@/types/sales-report";
import { formatDashboardMoney } from "../dashboard-utils";
import { useMemo, useState } from "react";

const PREVIEW_LIMIT = 5;

export function CategoryContributionCard({ report }: { report: SalesReportResponse }) {
  const money = (value: number) => formatDashboardMoney(report.currencyCode, value);
  const [viewMoreOpen, setViewMoreOpen] = useState(false);
  const previewCategories = useMemo(() => report.categoryContribution.slice(0, PREVIEW_LIMIT), [report.categoryContribution]);
  const hasOverflow = report.categoryContribution.length > PREVIEW_LIMIT;

  return (
    <>
      <DashboardCard
        className="h-full"
        title="Category Contribution"
        description="How each product category contributes to current sales value and unit movement."
        contentClassName="space-y-4"
        headerExtra={
          hasOverflow ? (
            <button type="button" onClick={() => setViewMoreOpen(true)} className="shrink-0 text-sm font-medium text-[#2d837d] transition hover:text-[#256b66]">
              View more
            </button>
          ) : null
        }
      >
        {report.categoryContribution.length ? previewCategories.map((category) => <CategoryContributionRow key={category.id || category.name} category={category} money={money} />) : <p className="py-8 text-center text-sm text-gray-500">Category contribution will appear here.</p>}
      </DashboardCard>

      <AppModal open={viewMoreOpen} toggle={() => setViewMoreOpen(false)} title="Category Contribution" footer={null} width={760} height="70vh">
        <div className="space-y-4 bg-white px-6 py-5">
          {report.categoryContribution.map((category) => (
            <CategoryContributionRow key={category.id || category.name} category={category} money={money} />
          ))}
        </div>
      </AppModal>
    </>
  );
}

function CategoryContributionRow({
  category,
  money,
}: {
  category: SalesReportResponse["categoryContribution"][number];
  money: (value: number) => string;
}) {
  return (
    <div className="flex items-start justify-between gap-3 border-b border-gray-100 pb-4 last:border-b-0 last:pb-0">
      <div className="min-w-0">
        <p className="font-medium text-gray-900">{category.name}</p>
        <p className="mt-1 text-xs text-gray-500">
          {category.unitsSold.toLocaleString()} units sold · {category.share.toFixed(1)}% of sales value
        </p>
      </div>
      <p className="font-semibold text-gray-950">{money(category.netSales)}</p>
    </div>
  );
}
