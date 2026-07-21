"use client";

import { DashboardPageContainer } from "@/components/dashboard/DashboardPageContainer";
import { DashboardStateCard } from "@/components/dashboard/DashboardStateCard";
import { DashboardToolbar } from "@/components/dashboard/DashboardToolbar";
import { StoreSelector } from "@/components/dashboard/StoreSelector";
import { CategoryContributionCard } from "@/components/dashboard/sales-report/CategoryContributionCard";
import { DiscountReportCard } from "@/components/dashboard/sales-report/DiscountReportCard";
import { GrossProfitCard } from "@/components/dashboard/sales-report/GrossProfitCard";
import { SalesByChannelCard } from "@/components/dashboard/sales-report/SalesByChannelCard";
import { SalesOverviewCard } from "@/components/dashboard/sales-report/SalesOverviewCard";
import { SalesReportShimmer } from "@/components/dashboard/sales-report/SalesReportShimmer";
import { TopCustomersCard } from "@/components/dashboard/sales-report/TopCustomersCard";
import { TopSellingProductsCard } from "@/components/dashboard/sales-report/TopSellingProductsCard";
import { usePermissions } from "@/hooks/usePermissions";
import { useGetLocationsQuery, useGetSalesReportQuery } from "@/lib/redux/services";
import { RootState } from "@/lib/store";
import { LocationStatus, StorePermission } from "@/types/index";
import type { SalesReportResponse } from "@/types/sales-report";
import dayjs, { Dayjs } from "dayjs";
import { Button, DatePicker, Select } from "antd";
import { DownloadOutlined, ReloadOutlined } from "@ant-design/icons";
import { useMemo, useState } from "react";
import { useSelector } from "react-redux";

const { RangePicker } = DatePicker;

export default function SalesReportsPage() {
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
  } = useGetSalesReportQuery(query, {
    skip: !ready || !canViewReport,
  });

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
        <SalesReportShimmer />
      ) : isError ? (
        <DashboardStateCard title="Sales report could not be loaded" description="Check your connection and try refreshing the report." actionLabel="Try again" onAction={() => refetch()} />
      ) : report && hasReportData(report) ? (
        <div className="space-y-4">
              <SalesOverviewCard report={report} />
              
          <div className="grid grid-cols-1 gap-4 xl:grid-cols-2">
            <GrossProfitCard report={report} />
            <DiscountReportCard report={report} />
          </div>
          <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
            <TopCustomersCard report={report} />
            <CategoryContributionCard report={report} />
          </div>
          <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
            <SalesByChannelCard report={report} />
            <TopSellingProductsCard report={report} />
          </div>
        </div>
      ) : (
        <DashboardStateCard title="No sales in this period" description="Choose another date range or location to view sales performance." />
      )}
    </DashboardPageContainer>
  );
}

function hasReportData(report: SalesReportResponse) {
  return report.summary.grossRevenue.value !== 0 || report.summary.canceledOrders.value !== 0 || report.overview.length > 0;
}

function downloadReport(report: SalesReportResponse) {
  const money = (value: number) => `${report.currencyCode} ${Number(value || 0).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
  const rows: Array<Array<string | number>> = [["Section", "Label", "Value", "Secondary", "Details"]];

  rows.push(
    ["Summary", "Gross Revenue", money(report.summary.grossRevenue.value), "", ""],
    ["Summary", "Net Sales", money(report.summary.netSales.value), "", ""],
    ["Summary", "Total Sales", report.summary.totalSales.value, "", ""],
    ["Summary", "Canceled Orders", report.summary.canceledOrders.value, "", ""],
    ["Summary", "Gross Profit", money(report.summary.grossProfit.value), "", ""],
    ["Summary", "Total Discount", money(report.summary.totalDiscount.value), "", ""],
  );

  report.overview.forEach((item) => rows.push(["Sales Overview", item.label, money(item.revenue), item.orders, "orders"]));
  report.orderProfits.forEach((item) => rows.push(["Order Profit", item.orderNumber, money(item.totalAmount), money(item.grossProfit), item.customerName]));
  report.topCustomers.forEach((item) => rows.push(["Top Customers", item.name, money(item.netSales), item.orderCount, "orders"]));
  report.salesByChannel.forEach((item) => rows.push(["Sales by Channel", item.channel, money(item.netSales), `${item.share}%`, ""]));
  report.categoryContribution.forEach((item) => rows.push(["Category Contribution", item.name, money(item.netSales), item.unitsSold, "units"]));
  report.topProducts.forEach((item) => rows.push(["Top Products", item.name, money(item.netSales), item.unitsSold, "units"]));
  report.discountTrend.forEach((item) => rows.push(["Discount Trend", item.label, money(item.discount), "", ""]));

  const csv = rows.map((row) => row.map(csvCell).join(",")).join("\n");
  const url = URL.createObjectURL(new Blob([csv], { type: "text/csv;charset=utf-8" }));
  const link = document.createElement("a");
  link.href = url;
  link.download = `sales-report-${dayjs(report.period.dateFrom).format("YYYY-MM-DD")}-${dayjs(report.period.dateTo).format("YYYY-MM-DD")}.csv`;
  link.click();
  URL.revokeObjectURL(url);
}

function csvCell(value: string | number) {
  const text = String(value ?? "");
  return `"${text.replaceAll('"', '""')}"`;
}
