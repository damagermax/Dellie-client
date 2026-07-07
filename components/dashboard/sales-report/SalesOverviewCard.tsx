"use client";

import { cn } from "@/lib/utils";
import { SalesChart } from "@/components/dashboard/SalesChart";
import { DashboardCard } from "@/components/dashboard/DashboardCard";
import type { SalesReportResponse } from "@/types/sales-report";
import { formatDashboardMoney } from "../dashboard-utils";

export function SalesOverviewCard({ report }: { report: SalesReportResponse }) {
  const money = (value: number) => formatDashboardMoney(report.currencyCode, value);
  const metrics = [
    {
      title: "Gross Revenue",
      value: money(report.summary.grossRevenue.value),
      hint: "Sales before discounts, returns, and tax adjustments",
    },
    {
      title: "Net Sales",
      value: money(report.summary.netSales.value),
      hint: "Sales after discounts and returns",
    },
    {
      title: "Total Sales",
      value: report.summary.totalSales.value.toLocaleString(),
      hint: "All open and closed sales in the selected period",
    },
    {
      title: "Canceled Orders",
      value: report.summary.canceledOrders.value.toLocaleString(),
      hint: "Sales canceled in the selected period",
    },
  ];

  return (
    <DashboardCard contentClassName="space-y-4 px-6 py-6">
      <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 xl:grid-cols-4 xl:gap-0">
        {metrics.map((metric, index) => {
          return (
            <div key={metric.title} className={cn("", index > 0 && "xl:border-l pl-5 xl:border-gray-200", index < 2 && "sm:border-r sm:border-gray-200 sm:pr-5 xl:border-r-0 xl:pr-0", index >= 2 && "sm:pl-5 xl:pl-5")}>
              <div>
                <p className="text-xs font-medium text-gray-500">{metric.title}</p>
                <p className="mt-1 text-xl font-semibold text-gray-950">{metric.value}</p>
              </div>
              <p className="mt-1 text-[11px] leading-5 text-gray-500">{metric.hint}</p>
            </div>
          );
        })}
      </div>
      <SalesChart data={report.overview} currencyCode={report.currencyCode} />
    </DashboardCard>
  );
}
