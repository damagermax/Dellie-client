"use client";

import { Cell, Pie, PieChart, ResponsiveContainer, Tooltip } from "recharts";
import { DashboardCard } from "@/components/dashboard/DashboardCard";
import type { SalesReportResponse } from "@/types/sales-report";
import { formatDashboardMoney } from "../dashboard-utils";

const channelColors = { POS: "#2563eb", Manual: "#f59e0b", Website: "#16a34a" } as const;

export function SalesByChannelCard({ report }: { report: SalesReportResponse }) {
  const money = (value: number) => formatDashboardMoney(report.currencyCode, value);
  const channels = (["POS", "Manual", "Website"] as const).map((channel) => {
    const value = report.salesByChannel.find((item) => item.channel === channel);
    return { channel, netSales: value?.netSales || 0, share: value?.share || 0, color: channelColors[channel] };
  });

  return (
    <DashboardCard title="Sales by Channel" description="Revenue share across POS, manual, and website sales." className="h-full">
      <div className="grid gap-4 lg:grid-cols-[220px_minmax(0,1fr)] lg:items-center">
        <div className="h-44 w-full">
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie data={channels} dataKey="netSales" nameKey="channel" innerRadius={52} outerRadius={84} paddingAngle={3}>
                {channels.map((entry) => (
                  <Cell key={entry.channel} fill={entry.color} />
                ))}
              </Pie>
              <Tooltip formatter={(value) => money(Number(value))} />
            </PieChart>
          </ResponsiveContainer>
        </div>
        <div className="space-y-4">
          {channels.map((entry) => (
            <div key={entry.channel} className="flex items-start justify-between gap-3 border-b border-gray-100 pb-3 last:border-b-0 last:pb-0">
              <div className="flex items-center gap-3">
                <span className="h-3 w-3 rounded-full" style={{ backgroundColor: entry.color }} />
                <div>
                  <p className="font-medium text-gray-950">{entry.channel}</p>
                  <p className="mt-1 text-xs text-gray-500">{entry.share.toFixed(1)}% of channel sales</p>
                </div>
              </div>
              <p className="font-semibold text-gray-950">{money(entry.netSales)}</p>
            </div>
          ))}
        </div>
      </div>
    </DashboardCard>
  );
}
