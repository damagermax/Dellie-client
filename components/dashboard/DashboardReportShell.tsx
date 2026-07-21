"use client";

import { DownloadOutlined, FilterOutlined, ReloadOutlined } from "@ant-design/icons";
import { Area, AreaChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";
import { Button, DatePicker, Select, Space, Tag } from "antd";
import { StoreSelector } from "./StoreSelector";
import type { Dayjs } from "dayjs";

const { RangePicker } = DatePicker;

type Metric = {
  title: string;
  value: string;
  hint: string;
  trend?: number;
  color?: string;
};

type TrendSeries = {
  key: string;
  name: string;
  color: string;
};

type ListItem = {
  label: string;
  value: string;
  meta?: string;
  status?: string;
  statusColor?: string;
};

interface DashboardReportShellProps {
  title: string;
  description: string;
  filterOptions: Array<string | { label: string; value: string }>;
  metrics: Metric[];
  compactMetrics?: boolean;
  trendCardClassName?: string;
  trendTitle?: string;
  trendSubtitle?: string;
  trendData?: Array<Record<string, string | number>>;
  trendSeries?: TrendSeries[];
  mainSection?: React.ReactNode;
  sidePanels: Array<{
    title: string;
    description: string;
    items: ListItem[];
    extraContent?: React.ReactNode;
  }>;
  filterValue?: string;
  onFilterChange?: (value: string) => void;
  dateRange?: [Dayjs, Dayjs];
  onDateRangeChange?: (value: [Dayjs, Dayjs] | null) => void;
  onRefresh?: () => void;
  onDownload?: () => void;
  refreshing?: boolean;
  showFilterAction?: boolean;
}

export function DashboardReportShell({
  title,
  description,
  filterOptions,
  metrics,
  compactMetrics = false,
  trendCardClassName,
  trendTitle,
  trendSubtitle,
  trendData,
  trendSeries,
  mainSection,
  sidePanels,
  filterValue,
  onFilterChange,
  dateRange,
  onDateRangeChange,
  onRefresh,
  onDownload,
  refreshing = false,
  showFilterAction = true,
}: DashboardReportShellProps) {
  return (
    <div className="bg-gray-50 md:bg-white md:p-6 h-full">
      <div className="mb-6 flex flex-col gap-5 xl:flex-row xl:items-start xl:justify-between">
        <div>
          <h1 className="text-2xl font-semibold text-gray-950">{title}</h1>
          <p className="mt-2 max-w-3xl text-sm text-gray-500">{description}</p>
        </div>

        <div className="flex flex-col gap-4 lg:flex-row lg:items-center">
          <Select className="min-w-[200px]" placeholder={typeof filterOptions[0] === "string" ? filterOptions[0] : filterOptions[0]?.label} value={filterValue} onChange={onFilterChange}>
            {filterOptions.map((option) => (
              <Select.Option key={typeof option === "string" ? option : option.value} value={typeof option === "string" ? option : option.value}>
                {typeof option === "string" ? option : option.label}
              </Select.Option>
            ))}
          </Select>

          <div className="flex flex-wrap items-center gap-4">
            <RangePicker value={dateRange} onChange={(value) => onDateRangeChange?.(value as [Dayjs, Dayjs] | null)} />
            <StoreSelector />
            <Space>
              <Button aria-label="Refresh report" icon={<ReloadOutlined spin={refreshing} />} onClick={onRefresh} disabled={refreshing} />
              <Button aria-label="Download report" icon={<DownloadOutlined />} onClick={onDownload} />
              {showFilterAction ? <Button aria-label="More filters" icon={<FilterOutlined />} /> : null}
            </Space>
          </div>
        </div>
      </div>

      <div className="mb-6 grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {metrics.map((metric) => (
          <div key={metric.title} className="h-full rounded-sm border border-gray-200 bg-white" style={{ padding: compactMetrics ? 14 : 18 }}>
            <div className="flex items-start justify-between gap-3">
              <div>
                <p className={compactMetrics ? "text-xs font-medium text-gray-500" : "text-sm font-medium text-gray-500"}>{metric.title}</p>
                <p className={compactMetrics ? "mt-1 text-xl font-semibold text-gray-950" : "mt-2 text-2xl font-semibold text-gray-950"}>{metric.value}</p>
              </div>
              {typeof metric.trend === "number" ? (
                <Tag color={metric.trend >= 0 ? "green" : "red"} className="!m-0 !rounded-full !px-2">
                  {metric.trend >= 0 ? "+" : ""}
                  {metric.trend.toFixed(1)}%
                </Tag>
              ) : null}
            </div>
            <p className={compactMetrics ? "mt-2 text-[11px] leading-5 text-gray-500" : "mt-3 text-xs text-gray-500"}>{metric.hint}</p>
          </div>
        ))}
      </div>

      <div className="mb-6">
        {mainSection ? (
          <div className="mb-6">{mainSection}</div>
        ) : trendTitle && trendSubtitle && trendData && trendSeries ? (
          <div className={["mb-6 rounded-sm border border-gray-200 bg-white", trendCardClassName].filter(Boolean).join(" ")}>
            <div className="border-b border-gray-100 px-6 py-4">
              <div className="flex flex-col gap-1">
                <span>{trendTitle}</span>
                <span className="text-xs font-normal text-gray-500">{trendSubtitle}</span>
              </div>
            </div>
            <div className="px-6 pb-6">
              <div className="h-80 w-full pt-4">
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={trendData}>
                    <defs>
                      {trendSeries.map((series) => (
                        <linearGradient key={series.key} id={`fill-${series.key}`} x1="0" y1="0" x2="0" y2="1">
                          <stop offset="5%" stopColor={series.color} stopOpacity={0.22} />
                          <stop offset="95%" stopColor={series.color} stopOpacity={0.02} />
                        </linearGradient>
                      ))}
                    </defs>
                    <CartesianGrid stroke="#f1f5f9" vertical={false} />
                    <XAxis dataKey="label" tickLine={false} axisLine={false} />
                    <YAxis tickLine={false} axisLine={false} />
                    <Tooltip />
                    {trendSeries.map((series) => (
                      <Area key={series.key} type="monotone" dataKey={series.key} name={series.name} stroke={series.color} fill={`url(#fill-${series.key})`} strokeWidth={2.5} />
                    ))}
                  </AreaChart>
                </ResponsiveContainer>
              </div>
            </div>
          </div>
        ) : null}
      </div>

      <div className="grid grid-cols-1  gap-4 lg:grid-cols-2">
        {sidePanels.map((panel) => (
          <div key={panel.title}>
            <div className="space-y-4">
              <div className="h-full rounded-sm border border-gray-200 bg-white">
                <div className="border-b border-gray-100 px-6 py-4">
                  <div className="flex flex-col gap-1">
                    <span>{panel.title}</span>
                    <span className="text-xs font-normal text-gray-500">{panel.description}</span>
                  </div>
                </div>
                <div className="space-y-4  md:min-h-77.5 px-6 py-5">
                  {panel.items.map((item) => (
                    <div key={`${panel.title}-${item.label}`} className="flex items-start justify-between gap-3 border-b border-gray-100 pb-4 last:border-b-0 last:pb-0">
                      <div className="min-w-0">
                        <p className="font-medium text-gray-900">{item.label}</p>
                        {item.meta ? <p className="mt-1 text-xs text-gray-500">{item.meta}</p> : null}
                      </div>
                      <div className="text-right">
                        {item.value ? <p className="font-semibold text-gray-950">{item.value}</p> : null}
                        {item.status ? (
                          <Tag className="!mt-2 !mr-0 !rounded-full !px-2" color={item.statusColor || statusColor(item.status)}>
                            {item.status}
                          </Tag>
                        ) : null}
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {panel.extraContent}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

function statusColor(status: string) {
  const value = status.toLowerCase();
  if (value.includes("paid") || value.includes("healthy") || value.includes("received")) return "green";
  if (value.includes("partial") || value.includes("watch") || value.includes("pending")) return "gold";
  if (value.includes("overdue") || value.includes("out") || value.includes("critical")) return "red";
  return "blue";
}

export function DashboardSectionHeader({ title, description }: { title: string; description: string }) {
  return (
    <div className="flex flex-col gap-1">
      <span>{title}</span>
      <span className="text-xs font-normal text-gray-500">{description}</span>
    </div>
  );
}
