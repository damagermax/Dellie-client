"use client";

import { DashboardPageContainer } from "@/components/dashboard/DashboardPageContainer";
import { DashboardStateCard } from "@/components/dashboard/DashboardStateCard";
import { DashboardToolbar } from "@/components/dashboard/DashboardToolbar";
import { StoreSelector } from "@/components/dashboard/StoreSelector";
import { CriticalStockWatchlistCard } from "@/components/dashboard/inventory-report/CriticalStockWatchlistCard";
import { InventoryReportShimmer } from "@/components/dashboard/inventory-report/InventoryReportShimmer";
import { ReturnsCard } from "@/components/dashboard/inventory-report/ReturnsCard";
import { StockMovementTrendCard } from "@/components/dashboard/inventory-report/StockMovementTrendCard";
import { usePermissions } from "@/hooks/usePermissions";
import { useGetInventoryReportQuery, useGetLocationsQuery } from "@/lib/redux/services";
import { RootState } from "@/lib/store";
import { LocationStatus, StorePermission } from "@/types/index";
import type { InventoryReportResponse } from "@/types/inventory-report";
import { DownloadOutlined, ReloadOutlined } from "@ant-design/icons";
import { Button, DatePicker, Select } from "antd";
import dayjs, { Dayjs } from "dayjs";
import { useMemo, useState } from "react";
import { useSelector } from "react-redux";

const { RangePicker } = DatePicker;

export default function InventoryReportPage() {
  const [dateRange, setDateRange] = useState<[Dayjs, Dayjs]>(() => [dayjs().startOf("month"), dayjs()]);
  const [locationId, setLocationId] = useState("all");
  const { ready, hasPermission } = usePermissions();
  const canViewReport = hasPermission(StorePermission.REPORTS_VIEW);
  const activeStoreId = useSelector((state: RootState) => state.currentUser.activeStoreId || state.currentUser.store?.id || undefined);
  const { data: locations = [] } = useGetLocationsQuery({ status: LocationStatus.ACTIVE, parentsOnly: false });

  const query = useMemo(
    () => ({
      dateFrom: dateRange[0].format("YYYY-MM-DD"),
      dateTo: dateRange[1].format("YYYY-MM-DD"),
      locationId: locationId === "all" ? undefined : locationId,
      storeId: activeStoreId,
    }),
    [activeStoreId, dateRange, locationId],
  );
  const {
    data: report,
    isLoading,
    isFetching,
    isError,
    refetch,
  } = useGetInventoryReportQuery(query, { skip: !ready || !canViewReport });

  const locationOptions = useMemo(() => {
    const options = [{ label: "All locations", value: "all" }];
    locations.forEach((location) => {
      options.push({ label: location.name, value: location.id });
      location.subLocations?.forEach((child) => options.push({ label: `${location.name} / ${child.name}`, value: child.id }));
    });
    return options;
  }, [locations]);

  if (ready && !canViewReport) {
    return (
      <DashboardPageContainer>
        <DashboardStateCard title="You do not have permission to view reports." description="Ask a store administrator to grant report access." />
      </DashboardPageContainer>
    );
  }

  const loading = isLoading || !ready;

  return (
    <DashboardPageContainer>
      <DashboardToolbar>
        <div />
        <div className="flex flex-col gap-4 lg:flex-row lg:items-center">
          <Select className="min-w-[220px]" value={locationId} onChange={setLocationId} options={locationOptions} />
          <RangePicker value={dateRange} onChange={(value) => value && setDateRange(value as [Dayjs, Dayjs])} />
          <StoreSelector />
          <div className="flex items-center gap-2">
            <Button aria-label="Refresh report" icon={<ReloadOutlined spin={isFetching && !isLoading} />} onClick={() => refetch()} disabled={isFetching && !isLoading} />
            <Button aria-label="Download report" icon={<DownloadOutlined />} onClick={() => report && downloadReport(report)} disabled={!report} />
          </div>
        </div>
      </DashboardToolbar>

      {loading ? (
        <InventoryReportShimmer />
      ) : isError ? (
        <DashboardStateCard title="Inventory report could not be loaded" description="Check your connection and try refreshing the report." actionLabel="Try again" onAction={() => refetch()} />
      ) : report && hasReportData(report) ? (
        <div className="space-y-6">
          <StockMovementTrendCard report={report} />
          <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
            <CriticalStockWatchlistCard report={report} />
            <ReturnsCard report={report} />
          </div>
        </div>
      ) : (
        <DashboardStateCard title="No inventory activity in this period" description="Choose another date range or location to view inventory performance." />
      )}
    </DashboardPageContainer>
  );
}

function hasReportData(report: InventoryReportResponse) {
  return (
    report.summary.inventoryValue !== 0 ||
    report.summary.lowStockSkus !== 0 ||
    report.summary.outOfStockSkus !== 0 ||
    report.summary.expiringSoonBatches !== 0 ||
    report.movementTrend.some((item) => item.stockIn !== 0 || item.stockOut !== 0) ||
    report.returns.length > 0
  );
}

function downloadReport(report: InventoryReportResponse) {
  const money = (value: number) =>
    `${report.currencyCode} ${Number(value || 0).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
  const rows: Array<Array<string | number>> = [["Section", "Label", "Value", "Secondary", "Details"]];

  rows.push(
    ["Summary", "Inventory Value", money(report.summary.inventoryValue), "", ""],
    ["Summary", "Low Stock SKUs", report.summary.lowStockSkus, "", ""],
    ["Summary", "Out of Stock", report.summary.outOfStockSkus, "", ""],
    ["Summary", "Expiring Soon", report.summary.expiringSoonBatches, "batches", ""],
  );
  report.movementTrend.forEach((item) => rows.push(["Stock Movement", item.label, item.stockIn, item.stockOut, "stock in / stock out"]));
  report.criticalStock.forEach((item) => rows.push(["Critical Stock", item.name, item.availableQuantity, item.status, item.locationName || "All locations"]));
  report.returns.forEach((item) => rows.push(["Returns", item.productName, item.quantity, item.type, item.reference]));

  const csv = rows.map((row) => row.map(csvCell).join(",")).join("\n");
  const url = URL.createObjectURL(new Blob([csv], { type: "text/csv;charset=utf-8" }));
  const link = document.createElement("a");
  link.href = url;
  link.download = `inventory-report-${dayjs(report.period.dateFrom).format("YYYY-MM-DD")}-${dayjs(report.period.dateTo).format("YYYY-MM-DD")}.csv`;
  link.click();
  URL.revokeObjectURL(url);
}

function csvCell(value: string | number) {
  const text = String(value ?? "");
  return `"${text.replaceAll('"', '""')}"`;
}
