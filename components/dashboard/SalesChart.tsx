"use client";

import { useState } from "react";
import { Area, AreaChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";
import { cn } from "@/lib/utils";

interface SalesChartProps {
  data: Array<{ label: string; revenue: number; orders: number }>;
  currencyCode: string;
}

type SalesMetric = "revenue" | "orders";

const chartConfig: Record<
  SalesMetric,
  {
    label: string;
    description: string;
    color: string;
    gradientId: string;
  }
> = {
  revenue: {
    label: "Revenue",
    description: "Sales value across the selected period.",
    color: "#2563eb",
    gradientId: "fill-sales-revenue",
  },
  orders: {
    label: "Orders",
    description: "All open and closed sales in the selected period.",
    color: "#f59e0b",
    gradientId: "fill-sales-orders",
  },
};

export function SalesChart({ data, currencyCode }: SalesChartProps) {
  const [metric, setMetric] = useState<SalesMetric>("revenue");
  const active = chartConfig[metric];

  const formatCurrency = (value: number) => `${currencyCode}\u00A0${Number(value || 0).toLocaleString()}`;
  const formatValue = (value: number) => (metric === "revenue" ? formatCurrency(value) : `${value.toLocaleString()} orders`);
  const normalizeTooltipValue = (value: number | string | ReadonlyArray<number | string> | undefined) => {
    if (Array.isArray(value)) return Number(value[0] || 0);
    return Number(value || 0);
  };

  return (
    <div className="mt-6">
      <div className="mb-4 flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <p className="text-sm font-medium text-gray-950">{active.label} Trend</p>
          <p className="mt-1 text-xs text-gray-500">{active.description}</p>
        </div>
        <div className="inline-flex rounded-sm border border-gray-200 bg-gray-50 p-1">
          {(["revenue", "orders"] as const).map((item) => (
            <button key={item} type="button" onClick={() => setMetric(item)} className={cn("rounded-sm px-3 py-1.5 text-xs font-medium transition-colors", metric === item ? "bg-white text-gray-950" : "text-gray-500 hover:text-gray-900")}>
              {chartConfig[item].label}
            </button>
          ))}
        </div>
      </div>

      <div className="h-80 w-full">
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart data={data}>
            <defs>
              <linearGradient id={active.gradientId} x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor={active.color} stopOpacity={0.22} />
                <stop offset="95%" stopColor={active.color} stopOpacity={0.02} />
              </linearGradient>
            </defs>
            <CartesianGrid stroke="#f1f5f9" vertical={false} />
            <XAxis dataKey="label" tickLine={false} axisLine={false} />
            <YAxis
              width={88}
              tickLine={false}
              axisLine={false}
              allowDecimals={metric === "revenue"}
              tickFormatter={(value) => formatValue(Number(value))}
            />
            <Tooltip formatter={(value) => [formatValue(normalizeTooltipValue(value)), active.label]} />
            <Area type="monotone" dataKey={metric} name={active.label} stroke={active.color} fill={`url(#${active.gradientId})`} strokeWidth={2.5} />
          </AreaChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
