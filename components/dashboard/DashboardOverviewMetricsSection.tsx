"use client";

import { DashboardCard } from "@/components/dashboard/DashboardCard";
import { formatDashboardMoney } from "@/components/dashboard/dashboard-utils";
import { cn } from "@/lib/utils";

interface DashboardOverviewMetricsSectionProps {
  currencyCode: string;
  revenueToday: number;
  salesToday: number;
  totalProducts: number;
  totalCustomers: number;
}

export function DashboardOverviewMetricsSection({ currencyCode, revenueToday, salesToday, totalProducts, totalCustomers }: DashboardOverviewMetricsSectionProps) {
  const metrics = [
    {
      title: "Revenue Today",
      value: formatDashboardMoney(currencyCode, revenueToday),
    },
    {
      title: "Sales Today",
      value: salesToday.toLocaleString(),
    },
    {
      title: "Total Products",
      value: totalProducts.toLocaleString(),
    },
    {
      title: "Total Customers",
      value: totalCustomers.toLocaleString(),
    },
  ];

  return (
    <DashboardCard className="border-gray-100 bg-gray-50/70" contentClassName="px-5 py-3.5">
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4 xl:gap-0">
        {metrics.map((metric, index) => (
          <div key={metric.title} className={cn(index > 0 && "xl:border-l xl:border-gray-200 xl:pl-4", index < metrics.length - 1 && "sm:border-r sm:border-gray-200 sm:pr-4 xl:border-r-0 xl:pr-0", index > 0 && "sm:pl-4")}>
            <p className="text-xs font-medium text-gray-500">{metric.title}</p>
            <p className="mt-1 text-lg font-semibold text-gray-900">{metric.value}</p>
          </div>
        ))}
      </div>
    </DashboardCard>
  );
}
