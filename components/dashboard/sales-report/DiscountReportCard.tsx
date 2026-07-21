"use client";

import { Bar, BarChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";
import { DashboardCard } from "@/components/dashboard/DashboardCard";
import type { SalesReportResponse } from "@/types/sales-report";
import { formatDashboardMoney } from "../dashboard-utils";

export function DiscountReportCard({ report }: { report: SalesReportResponse }) {
  const money = (value: number) => formatDashboardMoney(report.currencyCode, value);

  return (
    <DashboardCard contentClassName="space-y-4">
      <div>
        <p className="text-xs text-gray-500">Total discount given</p>
        <p className="mt-1 text-2xl font-semibold text-gray-950">{money(report.summary.totalDiscount.value)}</p>
      </div>
      <div className="h-52 w-full">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={report.discountTrend}>
            <CartesianGrid stroke="#f1f5f9" vertical={false} />
            <XAxis dataKey="label" tickLine={false} axisLine={false} />
            <YAxis tickLine={false} axisLine={false} />
            <Tooltip formatter={(value) => [money(Number(value)), "Discount"]} />
            <Bar dataKey="discount" radius={[4, 4, 0, 0]} fill="#dc2626" />
          </BarChart>
        </ResponsiveContainer>
      </div>
    </DashboardCard>
  );
}
