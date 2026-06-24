import { SalesReportQuery, SalesReportResponse } from "@/types/index";
import { baseApi } from "./baseApi";

export const salesReportsApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    getSalesReport: builder.query<SalesReportResponse, SalesReportQuery>({
      query: ({ dateFrom, dateTo, locationId }) => ({ url: "reports/sales", params: { dateFrom, dateTo, locationId } }),
      keepUnusedDataFor: 60,
    }),
  }),
});

export const { useGetSalesReportQuery } = salesReportsApi;
