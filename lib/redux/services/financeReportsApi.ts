import type { CashflowReportResponse, ExpenseReportQuery, ExpenseReportResponse, FinanceReportQuery } from "@/types/finance-report";
import { baseApi } from "./baseApi";

export const financeReportsApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    getCashflowReport: builder.query<CashflowReportResponse, FinanceReportQuery>({
      query: ({ dateFrom, dateTo }) => ({ url: "reports/finance/cashflow", params: { dateFrom, dateTo } }),
      keepUnusedDataFor: 60,
    }),
    getExpenseReport: builder.query<ExpenseReportResponse, ExpenseReportQuery>({
      query: ({ dateFrom, dateTo, categoryId }) => ({
        url: "reports/finance/expenses",
        params: { dateFrom, dateTo, categoryId },
      }),
      keepUnusedDataFor: 60,
    }),
  }),
});

export const { useGetCashflowReportQuery, useGetExpenseReportQuery } = financeReportsApi;
