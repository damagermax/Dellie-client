import { DashboardOverviewQueryParams, DashboardOverviewResponse } from "@/types/dashboard-overview";
import { baseApi } from "./baseApi";

export const dashboardOverviewApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    getDashboardOverview: builder.query<DashboardOverviewResponse, DashboardOverviewQueryParams | void>({
      query: (params) => ({ url: "reports/dashboard/overview", params }),
      keepUnusedDataFor: 60,
    }),
  }),
});

export const { useGetDashboardOverviewQuery } = dashboardOverviewApi;
