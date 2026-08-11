"use client";

import { useMemo } from "react";
import { useSearchParams } from "next/navigation";
import dayjs from "dayjs";
import PurchaseOrderFormModal from "@/components/purchase-orders/PurchaseOrderFormModal";
import PurchasesMobileList from "@/components/purchase-orders/PurchasesMobileList";
import { paymentStatusLabel } from "@/components/shared/paymentStatusLabel";
import { AddButton, FloatingAddButton } from "@/components/ui/AppButtons";
import { ActiveFilterChipItem, DesktopActiveFilterChips } from "@/components/ui/DesktopActiveFilterChips";
import { AppNotFoundView } from "@/components/ui/AppNotFoundView";
import { AppSearch } from "@/components/ui/AppSearchInput";
import AppPaginationFooter from "@/components/ui/AppPaginationFooter";
import AppTable from "@/components/ui/AppTable";
import { AppViewLoader } from "@/components/ui/AppViewLoader";
import MobileInfiniteScrollFooter from "@/components/ui/MobileInfiniteScrollFooter";
import MobileListShimmer from "@/components/ui/MobileListShimmer";
import { PurchasesFilterDrawer } from "@/components/purchase-orders/PurchasesFilterDrawer";
import { DesktopQuickFilterSegment } from "@/components/ui/DesktopQuickFilterSegment";
import { useAssignedLocationScope } from "@/hooks/useAssignedLocationScope";
import { useGetContactQuery, useGetLocationQuery } from "@/lib/redux/services";
import { buildPurchaseColumns } from "./_lib/purchasesPageConfig";
import { usePurchasesPageController } from "./_lib/usePurchasesPageController";

type PurchasesQuickFilter = "all" | "unpaid" | "paid" | "unfulfilled" | "fulfilled";

export default function PurchaseOrdersPage() {
  const searchParams = useSearchParams();
  const assignedScope = useAssignedLocationScope();
  const initialQuery = useMemo(
    () => ({
      page: 1,
      limit: 20,
      paymentStatus: readPurchasePaymentStatus(searchParams.get("paymentStatus")),
      fulfillmentStatus: readPurchaseFulfillmentStatus(searchParams.get("fulfillmentStatus")),
    }),
    [searchParams],
  );
  const controller = usePurchasesPageController(initialQuery);
  const { data: supplier } = useGetContactQuery(controller.query.supplierId || "", { skip: !controller.query.supplierId });
  const { data: location } = useGetLocationQuery(controller.query.locationId || "", { skip: !controller.query.locationId || (assignedScope.isRestricted && controller.query.locationId === assignedScope.assignedLocationId) });
  const purchasesQuickFilter: PurchasesQuickFilter | undefined =
    controller.query.paymentStatus === "unpaid" && !controller.query.fulfillmentStatus
      ? "unpaid"
      : controller.query.paymentStatus === "paid" && !controller.query.fulfillmentStatus
        ? "paid"
        : controller.query.fulfillmentStatus === "pending" && !controller.query.paymentStatus
          ? "unfulfilled"
          : controller.query.fulfillmentStatus === "received" && !controller.query.paymentStatus
            ? "fulfilled"
            : !controller.query.paymentStatus && !controller.query.fulfillmentStatus
              ? "all"
              : undefined;
  const columns = buildPurchaseColumns();
  const activeFilterChips = useMemo(() => {
    const dateLabel =
      controller.query.dateFrom || controller.query.dateTo
        ? `Date: ${controller.query.dateFrom ? dayjs(controller.query.dateFrom).format("DD MMM YYYY") : "Any"} - ${controller.query.dateTo ? dayjs(controller.query.dateTo).format("DD MMM YYYY") : "Any"}`
        : undefined;

    const items: Array<ActiveFilterChipItem | null> = [
      controller.query.status
        ? {
            key: "status",
            label: controller.query.status === "draft" ? "Draft" : controller.query.status === "open" ? "Open" : "Closed",
            onRemove: () => controller.setQuery((current) => ({ ...current, status: undefined, page: 1 })),
          }
        : null,
      controller.query.fulfillmentStatus
        ? {
            key: "fulfillmentStatus",
            label:
              controller.query.fulfillmentStatus === "received"
                ? "Fulfilled"
                : controller.query.fulfillmentStatus === "partially_received"
                  ? "Partially fulfilled"
                  : "Pending",
            onRemove: () => controller.setQuery((current) => ({ ...current, fulfillmentStatus: undefined, page: 1 })),
          }
        : null,
      controller.query.paymentStatus
        ? {
            key: "paymentStatus",
            label: paymentStatusLabel(controller.query.paymentStatus),
            onRemove: () => controller.setQuery((current) => ({ ...current, paymentStatus: undefined, page: 1 })),
          }
        : null,
      controller.query.supplierId
        ? {
            key: "supplierId",
            label: supplier?.name || "Supplier",
            onRemove: () => controller.setQuery((current) => ({ ...current, supplierId: undefined, page: 1 })),
          }
        : null,
      dateLabel
        ? {
            key: "dateRange",
            label: dateLabel,
            onRemove: () => controller.setQuery((current) => ({ ...current, dateFrom: undefined, dateTo: undefined, page: 1 })),
          }
        : null,
      controller.query.locationId
        ? {
            key: "locationId",
            label: assignedScope.isRestricted && controller.query.locationId === assignedScope.assignedLocationId ? assignedScope.assignedLocation?.name || "Assigned location" : location?.name || "Location",
            removable: !assignedScope.isRestricted,
            onRemove: assignedScope.isRestricted ? undefined : () => controller.setQuery((current) => ({ ...current, locationId: undefined, page: 1 })),
          }
        : null,
    ];

    return items.filter((item): item is ActiveFilterChipItem => item !== null);
  }, [assignedScope.assignedLocation?.name, assignedScope.assignedLocationId, assignedScope.isRestricted, controller, location?.name, supplier?.name]);

  return (
    <div>
      <h3 className="pageTittle px-4 md:px-8">Purchases</h3>
      <hr className="border-gray-200/80" />
      <div className="flex w-full flex-col gap-4 px-4 py-5 md:flex-row md:items-center md:justify-between md:px-8 md:py-8">
        <div className="flex w-full items-center gap-3 md:w-auto">
          <AppSearch
            placeholder="Search purchase number..."
            onReset={() => controller.setQuery((current) => ({ ...current, search: undefined, page: 1 }))}
            onSearchChange={(values) => controller.setQuery((current) => ({ ...current, ...values, page: 1 }))}
            onFilterClick={controller.openFilters}
            filterCount={controller.filterCount}
          />
          <DesktopQuickFilterSegment<PurchasesQuickFilter>
            value={purchasesQuickFilter}
            options={[
              { label: "All", value: "all" },
              { label: "Unpaid", value: "unpaid" },
              { label: "Paid", value: "paid" },
              { label: "Unfulfilled", value: "unfulfilled" },
              { label: "Fulfilled", value: "fulfilled" },
            ]}
            onChange={(value) =>
              controller.setQuery((current) => ({
                ...current,
                page: 1,
                paymentStatus: value === "unpaid" ? "unpaid" : value === "paid" ? "paid" : undefined,
                fulfillmentStatus: value === "unfulfilled" ? "pending" : value === "fulfilled" ? "received" : undefined,
              }))
            }
          />
        </div>
        <div className="flex gap-x-3 md:gap-x-5">
          <div className="hidden md:block">
            <AddButton onClick={controller.toggleForm} label="New Purchase" />
          </div>
        </div>
      </div>
      <DesktopActiveFilterChips items={activeFilterChips} className="px-4 pb-2 md:px-8" />

      <div className="hidden md:block">
        <AppViewLoader loading={controller.isLoading} />
      </div>
      {controller.isError && <p className="px-8 py-8 text-sm text-red-600">Purchases could not be loaded.</p>}
      {!controller.isError && <AppNotFoundView dataLength={controller.data?.data?.length || 0} loading={controller.isLoading} query={{ search: controller.query.search }} entity="Purchase" />}
      {!controller.isError && (
        <>
          <div className="hidden md:block">
            <AppTable columns={columns} dataSource={controller.data?.data || []} rowKey="id" pagination={false} disableFixedColumns />
            <AppPaginationFooter
              entity="purchases"
              dataLength={controller.data?.data?.length || 0}
              meta={controller.meta}
              page={controller.data?.page || controller.query.page}
              limit={controller.data?.limit || controller.query.limit}
              total={controller.data?.total}
              onChange={(page, limit) => controller.setQuery((current) => ({ ...current, page, limit }))}
            />
          </div>
          {controller.isLoading ? (
            <MobileListShimmer showAvatar={false} />
          ) : <PurchasesMobileList purchases={controller.mobileList.items} />}
          <MobileInfiniteScrollFooter
            entity="purchases"
            dataLength={controller.mobileList.items.length}
            hasNextPage={controller.mobileList.hasNextPage}
            isFetching={controller.isFetching && !controller.isLoading}
            sentinelRef={controller.mobileList.sentinelRef}
            onLoadMore={controller.mobileList.loadNextPage}
          />
        </>
      )}

      {controller.formOpen && <PurchaseOrderFormModal open={controller.formOpen} toggle={controller.toggleForm} />}
      {controller.editOpen && controller.selectedPurchase && <PurchaseOrderFormModal open={controller.editOpen} toggle={controller.toggleEdit} purchase={controller.selectedPurchase} />}
      <PurchasesFilterDrawer
        open={controller.filterOpen}
        filters={controller.draftFilters}
        onChange={(values) => controller.setDraftFilters((prev) => ({ ...prev, ...values }))}
        onClose={() => controller.setFilterOpen(false)}
        onApply={controller.applyFilters}
        onClear={controller.clearFilters}
      />
      <FloatingAddButton onClick={controller.toggleForm} label="New Purchase" />
    </div>
  );
}

function readPurchasePaymentStatus(value: string | null): "paid" | "partial" | "unpaid" | undefined {
  return value === "paid" || value === "partial" || value === "unpaid" ? value : undefined;
}

function readPurchaseFulfillmentStatus(value: string | null): "pending" | "partially_received" | "received" | undefined {
  return value === "pending" || value === "partially_received" || value === "received" ? value : undefined;
}
