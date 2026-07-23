"use client";

import { DashboardOverviewMetricsSection } from "@/components/dashboard/DashboardOverviewMetricsSection";
import { DashboardPageContainer } from "@/components/dashboard/DashboardPageContainer";
import { DashboardCriticalStockWatchlistCard } from "@/components/dashboard/DashboardCriticalStockWatchlistCard";
import { DashboardStateCard } from "@/components/dashboard/DashboardStateCard";
import { DashboardOverviewSalesCard } from "@/components/dashboard/DashboardOverviewSalesCard";
import { DashboardOverviewShimmer } from "@/components/dashboard/DashboardOverviewShimmer";
import { DashboardToolbar } from "@/components/dashboard/DashboardToolbar";
import { usePermissions } from "@/hooks/usePermissions";
import { useGetDashboardOverviewQuery, useGetLocationsQuery } from "@/lib/redux/services";
import { RootState } from "@/lib/store";
import { LocationStatus } from "@/types/index";
import { StorePermission } from "@/types/store-access";
import { Select } from "antd";
import { useMemo, useState } from "react";
import { useSelector } from "react-redux";

export default function DashboardPage() {
  const [locationId, setLocationId] = useState("all");
  const { ready, hasPermission } = usePermissions();
  const canViewReport = hasPermission(StorePermission.REPORTS_VIEW);
  const trackQuantityEnabled = useSelector((state: RootState) => state.currentUser.storeSettings.features?.trackQuantityEnabled !== false);
  const { data: locations = [] } = useGetLocationsQuery({ status: LocationStatus.ACTIVE, parentsOnly: false });
  const query = useMemo(
    () => ({
      locationId: locationId === "all" ? undefined : locationId,
    }),
    [locationId],
  );
  const { data, isLoading, isError, refetch } = useGetDashboardOverviewQuery(query, { skip: !ready || !canViewReport });

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

  if (isLoading || !ready) {
    return (
      <DashboardPageContainer>
        <DashboardOverviewShimmer />
      </DashboardPageContainer>
    );
  }

  if (isError || !data) {
    return (
      <DashboardPageContainer>
        <DashboardStateCard title="Dashboard overview could not be loaded" description="Check your connection and try refreshing the dashboard." actionLabel="Try again" onAction={() => refetch()} />
      </DashboardPageContainer>
    );
  }

  const showingRecent = data.salesToday.length === 0;
  const sales = showingRecent ? data.recentSales : data.salesToday;
  const hasWatchlist = trackQuantityEnabled && data.criticalStockWatchlist.length > 0;

  return (
    <DashboardPageContainer>
      <div className="space-y-4">
        <DashboardToolbar className="mb-5">
          <div />
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
            <Select className="min-w-[220px]" value={locationId} onChange={setLocationId} options={locationOptions} />
          </div>
        </DashboardToolbar>
        <DashboardOverviewMetricsSection currencyCode={data.currencyCode} revenueToday={data.summary.revenueToday} salesToday={data.summary.salesToday} totalProducts={data.summary.totalProducts} totalCustomers={data.summary.totalCustomers} />
        {hasWatchlist ? (
          <div className="grid grid-cols-1 gap-4 xl:grid-cols-2">
            <div className="min-w-0">
              <DashboardOverviewSalesCard sales={sales} showingRecent={showingRecent} />
            </div>
            <div className="min-w-0">
              <DashboardCriticalStockWatchlistCard items={data.criticalStockWatchlist} />
            </div>
          </div>
        ) : (
          <DashboardOverviewSalesCard sales={sales} showingRecent={showingRecent} />
        )}
      </div>
    </DashboardPageContainer>
  );
}
