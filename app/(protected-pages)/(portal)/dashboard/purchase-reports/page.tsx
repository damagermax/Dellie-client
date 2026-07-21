"use client";

import { DashboardPageContainer } from "@/components/dashboard/DashboardPageContainer";
import { DashboardStateCard } from "@/components/dashboard/DashboardStateCard";
import { DashboardToolbar } from "@/components/dashboard/DashboardToolbar";
import { StoreSelector } from "@/components/dashboard/StoreSelector";
import { PendingReceiptFocusCard } from "@/components/dashboard/purchase-report/PendingReceiptFocusCard";
import { PurchaseReportShimmer } from "@/components/dashboard/purchase-report/PurchaseReportShimmer";
import { PurchasingTrendCard } from "@/components/dashboard/purchase-report/PurchasingTrendCard";
import { TopSuppliersCard } from "@/components/dashboard/purchase-report/TopSuppliersCard";
import { usePermissions } from "@/hooks/usePermissions";
import { useGetLocationsQuery, useGetPurchaseReportQuery } from "@/lib/redux/services";
import { RootState } from "@/lib/store";
import { LocationStatus, StorePermission } from "@/types/index";
import type { PurchaseReportResponse } from "@/types/purchase-report";
import { DownloadOutlined, ReloadOutlined } from "@ant-design/icons";
import { Button, DatePicker, Select } from "antd";
import dayjs, { Dayjs } from "dayjs";
import { useMemo, useState } from "react";
import { useSelector } from "react-redux";

const { RangePicker } = DatePicker;

export default function PurchaseReportsPage() {
  const [dateRange, setDateRange] = useState<[Dayjs, Dayjs]>(() => [dayjs().startOf("month"), dayjs()]);
  const [locationId, setLocationId] = useState("all");
  const { ready, hasPermission } = usePermissions();
  const canViewReport = hasPermission(StorePermission.REPORTS_VIEW);
  const purchasesEnabled = useSelector((state: RootState) => state.currentUser.storeSettings.enabledModules.purchases);
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
  } = useGetPurchaseReportQuery(query, { skip: !ready || !canViewReport || !purchasesEnabled });

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

  if (ready && !purchasesEnabled) {
    return (
      <DashboardPageContainer>
        <DashboardStateCard title="Purchases are turned off" description="Turn the purchases module back on to view purchase reports." />
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
        <PurchaseReportShimmer />
      ) : isError ? (
        <DashboardStateCard title="Purchase report could not be loaded" description="Check your connection and try refreshing the report." actionLabel="Try again" onAction={() => refetch()} />
      ) : report && hasReportData(report) ? (
        <div className="space-y-6">
          <PurchasingTrendCard report={report} />
          <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
            <TopSuppliersCard report={report} />
            <PendingReceiptFocusCard report={report} />
          </div>
        </div>
      ) : (
        <DashboardStateCard title="No purchase activity in this period" description="Choose another date range or location to view purchasing performance." />
      )}
    </DashboardPageContainer>
  );
}

function hasReportData(report: PurchaseReportResponse) {
  return (
    report.summary.purchaseSpend.value !== 0 ||
    report.summary.stockReceived.value !== 0 ||
    report.summary.canceledPurchaseOrders.value !== 0 ||
    report.pendingReceipts.length > 0
  );
}

function downloadReport(report: PurchaseReportResponse) {
  const money = (value: number) =>
    `${report.currencyCode} ${Number(value || 0).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
  const rows: Array<Array<string | number>> = [["Section", "Label", "Value", "Secondary", "Details"]];

  rows.push(
    ["Summary", "Purchase Spend", money(report.summary.purchaseSpend.value), "", ""],
    ["Summary", "Stock Received", report.summary.stockReceived.value, "units", ""],
    ["Summary", "Total Purchases", report.summary.totalPurchases.value, "", ""],
    ["Summary", "Canceled Purchase Orders", report.summary.canceledPurchaseOrders.value, "", ""],
  );
  report.trend.forEach((item) => rows.push(["Purchasing Trend", item.label, money(item.spend), item.receivedUnits, "units received"]));
  report.topSuppliers.forEach((item) => rows.push(["Top Suppliers", item.name, money(item.spend), item.purchaseCount, "purchases"]));
  report.pendingReceipts.forEach((item) =>
    rows.push(["Pending Receipts", item.productName, item.outstandingQuantity, item.purchaseNumber, item.expectedDeliveryDate || ""]),
  );

  const csv = rows.map((row) => row.map(csvCell).join(",")).join("\n");
  const url = URL.createObjectURL(new Blob([csv], { type: "text/csv;charset=utf-8" }));
  const link = document.createElement("a");
  link.href = url;
  link.download = `purchase-report-${dayjs(report.period.dateFrom).format("YYYY-MM-DD")}-${dayjs(report.period.dateTo).format("YYYY-MM-DD")}.csv`;
  link.click();
  URL.revokeObjectURL(url);
}

function csvCell(value: string | number) {
  const text = String(value ?? "");
  return `"${text.replaceAll('"', '""')}"`;
}
