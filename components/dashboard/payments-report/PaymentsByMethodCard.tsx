"use client";

import { DashboardCard } from "@/components/dashboard/DashboardCard";
import { formatDashboardMoney } from "@/components/dashboard/dashboard-utils";
import type { CashflowReportResponse } from "@/types/finance-report";
import { Cell, Pie, PieChart, ResponsiveContainer, Tooltip } from "recharts";

const METHOD_COLORS = [
  "#2563eb",
  "#7c3aed",
  "#0f766e",
  "#f59e0b",
  "#e11d48",
  "#64748b",
];

export function PaymentsByMethodCard({
  report,
}: {
  report: CashflowReportResponse;
}) {
  const methods = (report.paymentMethods || []).map((method, index) => ({
    ...method,
    color: METHOD_COLORS[index % METHOD_COLORS.length],
  }));

  return (
    <DashboardCard
      title="Payments by Method"
      description="Payment value split across the methods used in this period."
    >
      {methods.length ? (
        <div className="grid gap-5 xl:grid-cols-[190px_minmax(0,1fr)] xl:items-center">
          <div className="h-48 w-full" aria-label="Payments by method chart">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={methods}
                  dataKey="amount"
                  nameKey="name"
                  innerRadius={50}
                  outerRadius={78}
                  paddingAngle={3}
                >
                  {methods.map((method) => (
                    <Cell key={method.name} fill={method.color} />
                  ))}
                </Pie>
                <Tooltip
                  formatter={(value) =>
                    formatDashboardMoney(
                      report.currencyCode,
                      Number(value ?? 0),
                    )
                  }
                />
              </PieChart>
            </ResponsiveContainer>
          </div>

          <div className="divide-y divide-gray-100">
            {methods.map((method) => (
              <div
                key={method.name}
                className="flex items-center justify-between gap-3 py-3 first:pt-0 last:pb-0"
              >
                <div className="flex min-w-0 items-start gap-3">
                  <span
                    className="mt-1.5 h-2.5 w-2.5 shrink-0 rounded-full"
                    style={{ backgroundColor: method.color }}
                  />
                  <div className="min-w-0">
                    <p className="truncate font-medium text-gray-900">
                      {method.name}
                    </p>
                    <p className="mt-0.5 text-xs text-gray-500">
                      {method.paymentCount}{" "}
                      {method.paymentCount === 1 ? "payment" : "payments"} ·{" "}
                      {method.share.toFixed(1)}%
                    </p>
                  </div>
                </div>
                <p className="shrink-0 font-semibold text-gray-950">
                  {formatDashboardMoney(report.currencyCode, method.amount)}
                </p>
              </div>
            ))}
          </div>
        </div>
      ) : (
        <p className="py-8 text-center text-sm text-gray-500">
          Payment-method activity will appear here.
        </p>
      )}
    </DashboardCard>
  );
}
