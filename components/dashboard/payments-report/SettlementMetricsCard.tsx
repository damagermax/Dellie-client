"use client";

import { DashboardCard } from "@/components/dashboard/DashboardCard";
import { formatDashboardMoney } from "@/components/dashboard/dashboard-utils";
import type { CashflowReportResponse } from "@/types/finance-report";

const DOCUMENT_LABELS = {
  sale: "Sales",
  purchase: "Purchases",
  expense: "Expenses",
} as const;

const METRICS = [
  { key: "payments", label: "Payments" },
  { key: "refunds", label: "Refunds" },
  { key: "writeOffs", label: "Write-offs" },
] as const;

export function SettlementMetricsCard({
  report,
}: {
  report: CashflowReportResponse;
}) {
  const rows = report.settlementMetrics || [];

  return (
    <DashboardCard
      title="Settlement Activity"
      description="Payments, refunds, and write-offs recorded against each document type."
      contentClassName="overflow-x-auto"
    >
      <div className="min-w-[520px]">
        <div className="grid grid-cols-[120px_repeat(3,minmax(0,1fr))] gap-x-4 pb-3 text-xs font-medium uppercase tracking-wide text-gray-500">
          <span>Document</span>
          {METRICS.map((metric) => (
            <span key={metric.key}>{metric.label}</span>
          ))}
        </div>

        <div className="divide-y divide-gray-100 border-t border-gray-100">
          {rows.map((row) => (
            <div
              key={row.documentType}
              className="grid grid-cols-[120px_repeat(3,minmax(0,1fr))] gap-x-4 py-4"
            >
              <p className="font-medium text-gray-900">
                {DOCUMENT_LABELS[row.documentType]}
              </p>
              {METRICS.map((metric) => {
                const value = row[metric.key];
                return (
                  <div key={metric.key}>
                    <p className="font-semibold text-gray-950">
                      {formatDashboardMoney(report.currencyCode, value.amount)}
                    </p>
                    <p className="mt-1 text-xs text-gray-500">
                      {value.count} {value.count === 1 ? "entry" : "entries"}
                    </p>
                  </div>
                );
              })}
            </div>
          ))}
        </div>
      </div>
    </DashboardCard>
  );
}
