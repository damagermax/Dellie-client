import type { PurchaseReportQuery, PurchaseReportResponse } from "@/types/purchase-report";
import { baseApi } from "./baseApi";

export const purchaseReportsApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    getPurchaseReport: builder.query<PurchaseReportResponse, PurchaseReportQuery>({
      query: ({ dateFrom, dateTo, locationId }) => ({
        url: "reports/purchases",
        params: { dateFrom, dateTo, locationId },
      }),
      keepUnusedDataFor: 60,
    }),
  }),
});

export const { useGetPurchaseReportQuery } = purchaseReportsApi;
