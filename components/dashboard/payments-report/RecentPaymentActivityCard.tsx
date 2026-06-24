"use client";

import { DashboardCard } from "@/components/dashboard/DashboardCard";
import { formatDashboardMoney } from "@/components/dashboard/dashboard-utils";
import type { CashflowReportResponse } from "@/types/finance-report";
import { cn } from "@/lib/utils";

export function RecentPaymentActivityCard({
  report,
}: {
  report: CashflowReportResponse;
}) {
  return (
    <DashboardCard
      title="Recent Payment Activity"
      description="Latest cash settlements and collections in this period."
      contentClassName="space-y-4"
    >
      {report.recentPayments.length ? (
        report.recentPayments.map((item) => (
          <div
            key={item.id}
            className="flex items-start justify-between gap-3 border-b border-gray-100 pb-4 last:border-b-0 last:pb-0"
          >
            <div className="min-w-0">
              <p className="font-medium text-gray-900">{item.label}</p>
              <p className="mt-1 text-xs text-gray-500">
                {item.reference} · {item.contactName}
                {item.paymentMethodName ? ` · ${item.paymentMethodName}` : ""}
              </p>
            </div>
            <p
              className={cn(
                "shrink-0 font-semibold",
                item.direction === "inflow" ? "text-green-600" : "text-red-600",
              )}
            >
              {item.direction === "inflow" ? "+" : "-"}{" "}
              {formatDashboardMoney(report.currencyCode, item.amount)}
            </p>
          </div>
        ))
      ) : (
        <p className="py-8 text-center text-sm text-gray-500">
          No cash payment activity was recorded in this period.
        </p>
      )}
    </DashboardCard>
  );
}
