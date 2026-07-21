"use client";

import { DashboardCard } from "@/components/dashboard/DashboardCard";
import { formatDashboardMoney } from "@/components/dashboard/dashboard-utils";
import type { CashflowReportResponse } from "@/types/finance-report";
import dayjs from "dayjs";

export function OverdueBalancesCard({
  report,
}: {
  report: CashflowReportResponse;
}) {
  return (
    <DashboardCard
      title="Overdue Balances"
      description="Sale and purchase balances that have passed their due dates."
      contentClassName="space-y-4"
    >
      {report.overdueBalances.length ? (
        report.overdueBalances.map((item) => (
          <div
            key={item.id}
            className="flex items-start justify-between gap-3 border-b border-gray-100 pb-4 last:border-b-0 last:pb-0"
          >
            <div className="min-w-0">
              <p className="font-medium text-gray-900">{item.contactName}</p>
              <p className="mt-1 text-xs text-gray-500">
                {item.reference} · Due{" "}
                {dayjs(item.dueDate).format("DD MMM YYYY")}
              </p>
            </div>
            <p className="shrink-0 font-semibold text-red-600">
              {formatDashboardMoney(report.currencyCode, item.balance)}
            </p>
          </div>
        ))
      ) : (
        <p className="py-8 text-center text-sm text-gray-500">
          No sale or purchase balances are overdue.
        </p>
      )}
    </DashboardCard>
  );
}
