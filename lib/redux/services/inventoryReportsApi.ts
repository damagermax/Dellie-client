import type { InventoryReportQuery, InventoryReportResponse } from "@/types/inventory-report";
import { baseApi } from "./baseApi";

export const inventoryReportsApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    getInventoryReport: builder.query<InventoryReportResponse, InventoryReportQuery>({
      query: ({ dateFrom, dateTo, locationId }) => ({
        url: "reports/inventory",
        params: { dateFrom, dateTo, locationId },
      }),
      keepUnusedDataFor: 60,
    }),
  }),
});

export const { useGetInventoryReportQuery } = inventoryReportsApi;
