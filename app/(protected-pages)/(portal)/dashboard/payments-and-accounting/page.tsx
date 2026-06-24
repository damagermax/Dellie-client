"use client";

import { DashboardPageContainer } from "@/components/dashboard/DashboardPageContainer";
import { DashboardStateCard } from "@/components/dashboard/DashboardStateCard";
import { DashboardToolbar } from "@/components/dashboard/DashboardToolbar";
import { StoreSelector } from "@/components/dashboard/StoreSelector";
import { CashflowBalancesCard } from "@/components/dashboard/payments-report/CashflowBalancesCard";
import { CashflowOverviewCard } from "@/components/dashboard/payments-report/CashflowOverviewCard";
import { ExpenseCategoryBreakdownCard } from "@/components/dashboard/payments-report/ExpenseCategoryBreakdownCard";
import { ExpenseOverviewCard } from "@/components/dashboard/payments-report/ExpenseOverviewCard";
import { FinanceReportShimmer } from "@/components/dashboard/payments-report/FinanceReportShimmer";
import { LargestExpensesCard } from "@/components/dashboard/payments-report/LargestExpensesCard";
import { OverdueBalancesCard } from "@/components/dashboard/payments-report/OverdueBalancesCard";
import { PaymentsByMethodCard } from "@/components/dashboard/payments-report/PaymentsByMethodCard";
import { ProfitLossOverviewCard } from "@/components/dashboard/payments-report/ProfitLossOverviewCard";
import { RecentPaymentActivityCard } from "@/components/dashboard/payments-report/RecentPaymentActivityCard";
import { SettlementMetricsCard } from "@/components/dashboard/payments-report/SettlementMetricsCard";
import { usePermissions } from "@/hooks/usePermissions";
import {
  useGetCashflowReportQuery,
  useGetCategoriesQuery,
  useGetExpenseReportQuery,
  useGetSalesReportQuery,
} from "@/lib/redux/services";
import { RootState } from "@/lib/store";
import { CategoryStatus, CategoryType, StorePermission } from "@/types/index";
import type {
  CashflowReportResponse,
  ExpenseReportResponse,
} from "@/types/finance-report";
import type { SalesReportResponse } from "@/types/sales-report";
import { DownloadOutlined, ReloadOutlined } from "@ant-design/icons";
import { Button, DatePicker, Select } from "antd";
import dayjs, { Dayjs } from "dayjs";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { Suspense, useMemo, useState } from "react";
import { useSelector } from "react-redux";

const { RangePicker } = DatePicker;
type FinanceView = "cashflow" | "profit-loss" | "expenses";

const FINANCE_VIEW_OPTIONS: Array<{ value: FinanceView; label: string }> = [
  { value: "cashflow", label: "Overview" },
  { value: "profit-loss", label: "Profit & Loss" },
  { value: "expenses", label: "Expenses" },
];

export default function PaymentsAndAccountingPage() {
  return (
    <Suspense
      fallback={
        <DashboardPageContainer>
          <FinanceReportShimmer />
        </DashboardPageContainer>
      }
    >
      <FinanceReportContent />
    </Suspense>
  );
}

function FinanceReportContent() {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const view = getFinanceView(searchParams.get("view"));
  const [dateRange, setDateRange] = useState<[Dayjs, Dayjs]>(() => [
    dayjs().startOf("month"),
    dayjs(),
  ]);
  const [categoryId, setCategoryId] = useState("all");
  const { ready, hasPermission } = usePermissions();
  const canViewReport = hasPermission(StorePermission.REPORTS_VIEW);
  const activeStoreId = useSelector(
    (state: RootState) =>
      state.currentUser.activeStoreId ||
      state.currentUser.store?.id ||
      undefined,
  );
  const baseQuery = useMemo(
    () => ({
      dateFrom: dateRange[0].format("YYYY-MM-DD"),
      dateTo: dateRange[1].format("YYYY-MM-DD"),
      storeId: activeStoreId,
    }),
    [activeStoreId, dateRange],
  );

  const cashflow = useGetCashflowReportQuery(baseQuery, {
    skip: !ready || !canViewReport || view !== "cashflow",
  });
  const expenses = useGetExpenseReportQuery(
    {
      ...baseQuery,
      categoryId:
        view === "expenses" && categoryId !== "all" ? categoryId : undefined,
    },
    {
      skip:
        !ready ||
        !canViewReport ||
        (view !== "expenses" && view !== "profit-loss"),
    },
  );
  const sales = useGetSalesReportQuery(baseQuery, {
    skip: !ready || !canViewReport || view !== "profit-loss",
  });
  const { data: categoryData } = useGetCategoriesQuery(
    { type: CategoryType.EXPENSE, status: CategoryStatus.ACTIVE },
    { skip: !ready || !canViewReport || view !== "expenses" },
  );
  const categoryOptions = useMemo(
    () => [
      { label: "All expense categories", value: "all" },
      ...(categoryData?.data || []).map((category) => ({
        label: category.name,
        value: category.id,
      })),
    ],
    [categoryData],
  );

  const setView = (nextView: FinanceView) => {
    const params = new URLSearchParams(searchParams.toString());
    if (nextView === "cashflow") params.delete("view");
    else params.set("view", nextView);
    router.replace(`${pathname}${params.size ? `?${params.toString()}` : ""}`, {
      scroll: false,
    });
  };

  if (ready && !canViewReport) {
    return (
      <DashboardPageContainer>
        <DashboardStateCard
          title="You do not have permission to view reports."
          description="Ask a store administrator to grant report access."
        />
      </DashboardPageContainer>
    );
  }

  const loading =
    !ready ||
    (view === "cashflow" && cashflow.isLoading) ||
    (view === "profit-loss" && (sales.isLoading || expenses.isLoading)) ||
    (view === "expenses" && expenses.isLoading);
  const isError =
    (view === "cashflow" && cashflow.isError) ||
    (view === "profit-loss" && (sales.isError || expenses.isError)) ||
    (view === "expenses" && expenses.isError);
  const isFetching =
    (view === "cashflow" && cashflow.isFetching) ||
    (view === "profit-loss" && (sales.isFetching || expenses.isFetching)) ||
    (view === "expenses" && expenses.isFetching);

  const handleRefresh = () => {
    if (view === "cashflow") {
      void cashflow.refetch();
      return;
    }
    if (view === "profit-loss") {
      void sales.refetch();
      void expenses.refetch();
      return;
    }
    void expenses.refetch();
  };

  const handleDownload = () => {
    if (view === "cashflow" && cashflow.data) {
      downloadCashflow(cashflow.data);
      return;
    }
    if (view === "profit-loss" && sales.data && expenses.data) {
      downloadProfitLoss(sales.data, expenses.data);
      return;
    }
    if (view === "expenses" && expenses.data) {
      downloadExpenses(expenses.data);
    }
  };

  return (
    <DashboardPageContainer>
      <DashboardToolbar>
        <div className="inline-flex rounded-sm border border-gray-200 bg-gray-50 p-1">
          {FINANCE_VIEW_OPTIONS.map((item) => (
            <button
              key={item.value}
              type="button"
              onClick={() => setView(item.value)}
              className={`rounded-sm px-3 py-1.5 text-xs font-medium capitalize transition-colors ${
                view === item.value
                  ? "bg-white text-gray-950"
                  : "text-gray-500 hover:text-gray-900"
              }`}
            >
              {item.label}
            </button>
          ))}
        </div>
        <div className="flex flex-col gap-4 lg:flex-row lg:items-center">
          {view === "expenses" ? (
            <Select
              className="min-w-[220px]"
              value={categoryId}
              onChange={setCategoryId}
              options={categoryOptions}
            />
          ) : null}
          <RangePicker
            value={dateRange}
            onChange={(value) => value && setDateRange(value as [Dayjs, Dayjs])}
          />
          <StoreSelector />
          <div className="flex items-center gap-2">
            <Button
              aria-label="Refresh report"
              icon={<ReloadOutlined spin={isFetching && !loading} />}
              onClick={handleRefresh}
              disabled={isFetching && !loading}
            />
            <Button
              aria-label="Download report"
              icon={<DownloadOutlined />}
              onClick={handleDownload}
              disabled={
                (view === "cashflow" && !cashflow.data) ||
                (view === "profit-loss" && (!sales.data || !expenses.data)) ||
                (view === "expenses" && !expenses.data)
              }
            />
          </div>
        </div>
      </DashboardToolbar>

      {loading ? (
        <FinanceReportShimmer />
      ) : isError ? (
        <DashboardStateCard
          title={`${getFinanceViewLabel(view)} report could not be loaded`}
          description="Check your connection and try refreshing the report."
          actionLabel="Try again"
          onAction={handleRefresh}
        />
      ) : view === "cashflow" &&
        cashflow.data &&
        hasCashflowData(cashflow.data) ? (
        <div className="space-y-6">
          <CashflowBalancesCard
            currencyCode={cashflow.data.currencyCode}
            receivables={cashflow.data.summary.receivables}
            payables={cashflow.data.summary.payables}
          />
          <CashflowOverviewCard report={cashflow.data} />
          <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
            <OverdueBalancesCard report={cashflow.data} />
            <RecentPaymentActivityCard report={cashflow.data} />
            <PaymentsByMethodCard report={cashflow.data} />
            <SettlementMetricsCard report={cashflow.data} />
          </div>
        </div>
      ) : view === "profit-loss" &&
        sales.data &&
        expenses.data &&
        hasProfitLossData(sales.data, expenses.data) ? (
        <div className="space-y-6">
          <ProfitLossOverviewCard
            salesReport={sales.data}
            expenseReport={expenses.data}
          />
        </div>
      ) : view === "expenses" &&
        expenses.data &&
        hasExpenseData(expenses.data) ? (
        <div className="space-y-6">
          <ExpenseOverviewCard report={expenses.data} />
          <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
            <ExpenseCategoryBreakdownCard report={expenses.data} />
            <LargestExpensesCard report={expenses.data} />
          </div>
        </div>
      ) : (
        <DashboardStateCard
          title={
            view === "cashflow"
              ? "No cash activity in this period"
              : view === "profit-loss"
                  ? "No profit and loss activity in this period"
              : "No expenses in this period"
          }
          description="Choose another date range or filter to view financial activity."
        />
      )}
    </DashboardPageContainer>
  );
}

function hasCashflowData(report: CashflowReportResponse) {
  return (
    report.summary.receivables !== 0 ||
    report.summary.payables !== 0 ||
    report.summary.cashCollected !== 0 ||
    report.summary.cashOutflow !== 0 ||
    report.overdueBalances.length > 0 ||
    (report.settlementMetrics || []).some(
      (item) =>
        item.payments.count > 0 ||
        item.refunds.count > 0 ||
        item.writeOffs.count > 0,
    )
  );
}

function hasExpenseData(report: ExpenseReportResponse) {
  return report.summary.expenseCount > 0;
}

function hasProfitLossData(
  salesReport: SalesReportResponse,
  expenseReport: ExpenseReportResponse,
) {
  return (
    salesReport.summary.grossRevenue.value !== 0 ||
    salesReport.summary.netSales.value !== 0 ||
    salesReport.summary.grossProfit.value !== 0 ||
    expenseReport.summary.totalExpenses !== 0
  );
}

function downloadCashflow(report: CashflowReportResponse) {
  const money = (value: number) => formatMoney(report.currencyCode, value);
  const rows: Array<Array<string | number>> = [
    ["Section", "Label", "Value", "Secondary", "Details"],
  ];
  rows.push(
    ["Summary", "Receivables", money(report.summary.receivables), "", ""],
    ["Summary", "Payables", money(report.summary.payables), "", ""],
    ["Summary", "Cash Collected", money(report.summary.cashCollected), "", ""],
    ["Summary", "Cash Outflow", money(report.summary.cashOutflow), "", ""],
    ["Summary", "Net Cash Flow", money(report.summary.netCashFlow), "", ""],
  );
  report.trend.forEach((item) =>
    rows.push([
      "Cashflow",
      item.label,
      money(item.inflow),
      money(item.outflow),
      "inflow / outflow",
    ]),
  );
  report.overdueBalances.forEach((item) =>
    rows.push([
      "Overdue",
      item.reference,
      money(item.balance),
      item.contactName,
      item.dueDate,
    ]),
  );
  (report.paymentMethods || []).forEach((item) =>
    rows.push([
      "Payment Methods",
      item.name,
      money(item.amount),
      `${item.share}%`,
      `${item.paymentCount} payments`,
    ]),
  );
  (report.settlementMetrics || []).forEach((item) => {
    const label =
      item.documentType[0].toUpperCase() + item.documentType.slice(1);
    rows.push(
      [
        "Settlement Activity",
        `${label} payments`,
        money(item.payments.amount),
        item.payments.count,
        "",
      ],
      [
        "Settlement Activity",
        `${label} refunds`,
        money(item.refunds.amount),
        item.refunds.count,
        "",
      ],
      [
        "Settlement Activity",
        `${label} write-offs`,
        money(item.writeOffs.amount),
        item.writeOffs.count,
        "",
      ],
    );
  });
  report.recentPayments.forEach((item) =>
    rows.push([
      "Payments",
      item.label,
      money(item.amount),
      item.direction,
      item.reference,
    ]),
  );
  saveCsv(rows, `cashflow-report-${filePeriod(report.period)}`);
}

function downloadExpenses(report: ExpenseReportResponse) {
  const money = (value: number) => formatMoney(report.currencyCode, value);
  const rows: Array<Array<string | number>> = [
    ["Section", "Label", "Value", "Secondary", "Details"],
  ];
  rows.push(
    ["Summary", "Total Expenses", money(report.summary.totalExpenses), "", ""],
    ["Summary", "Paid", money(report.summary.paidAmount), "", ""],
    ["Summary", "Outstanding", money(report.summary.outstandingAmount), "", ""],
    ["Summary", "Expense Count", report.summary.expenseCount, "", ""],
  );
  report.trend.forEach((item) =>
    rows.push(["Expense Trend", item.label, money(item.total), "", ""]),
  );
  report.categories.forEach((item) =>
    rows.push([
      "Categories",
      item.name,
      money(item.total),
      `${item.share}%`,
      `${item.expenseCount} expenses`,
    ]),
  );
  report.largestExpenses.forEach((item) =>
    rows.push([
      "Largest Expenses",
      item.note,
      money(item.total),
      money(item.outstanding),
      item.categoryName,
    ]),
  );
  saveCsv(rows, `expense-report-${filePeriod(report.period)}`);
}

function downloadProfitLoss(
  salesReport: SalesReportResponse,
  expenseReport: ExpenseReportResponse,
) {
  const money = (value: number) =>
    formatMoney(salesReport.currencyCode, value);
  const grossRevenue = salesReport.summary.grossRevenue.value;
  const discounts = salesReport.summary.totalDiscount.value;
  const netSales = salesReport.summary.netSales.value;
  const grossProfit = salesReport.summary.grossProfit.value;
  const costOfSales = netSales - grossProfit;
  const operatingExpenses = expenseReport.summary.totalExpenses;
  const netProfit = grossProfit - operatingExpenses;
  const rows: Array<Array<string | number>> = [
    ["Section", "Label", "Value", "Secondary", "Details"],
  ];
  rows.push(
    ["Summary", "Gross Revenue", money(grossRevenue), "", ""],
    ["Summary", "Net Sales", money(netSales), "", ""],
    ["Summary", "Gross Profit", money(grossProfit), "", ""],
    ["Summary", "Operating Expenses", money(operatingExpenses), "", ""],
    ["Summary", "Net Profit / Loss", money(netProfit), "", ""],
    ["Breakdown", "Discounts Given", money(discounts), "", ""],
    ["Breakdown", "Cost of Sales", money(costOfSales), "", ""],
  );
  salesReport.overview.forEach((item) => {
    const expenseMatch =
      expenseReport.trend.find((trend) => trend.label === item.label)?.total ?? 0;
    rows.push([
      "Profit Trend",
      item.label,
      money(item.revenue - expenseMatch),
      money(item.revenue),
      money(expenseMatch),
    ]);
  });
  expenseReport.categories.forEach((item) =>
    rows.push([
      "Expense Categories",
      item.name,
      money(item.total),
      `${item.share}%`,
      `${item.expenseCount} expenses`,
    ]),
  );
  saveCsv(rows, `profit-loss-report-${filePeriod(salesReport.period)}`);
}

function formatMoney(currencyCode: string, value: number) {
  return `${currencyCode} ${Number(value || 0).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
}

function filePeriod(period: { dateFrom: string; dateTo: string }) {
  return `${dayjs(period.dateFrom).format("YYYY-MM-DD")}-${dayjs(period.dateTo).format("YYYY-MM-DD")}`;
}

function saveCsv(rows: Array<Array<string | number>>, name: string) {
  const csv = rows.map((row) => row.map(csvCell).join(",")).join("\n");
  const url = URL.createObjectURL(
    new Blob([csv], { type: "text/csv;charset=utf-8" }),
  );
  const link = document.createElement("a");
  link.href = url;
  link.download = `${name}.csv`;
  link.click();
  URL.revokeObjectURL(url);
}

function csvCell(value: string | number) {
  const text = String(value ?? "");
  return `"${text.replaceAll('"', '""')}"`;
}

function getFinanceView(value: string | null): FinanceView {
  return value === "expenses" || value === "profit-loss"
    ? value
    : "cashflow";
}

function getFinanceViewLabel(view: FinanceView) {
  return FINANCE_VIEW_OPTIONS.find((item) => item.value === view)?.label || "Report";
}
