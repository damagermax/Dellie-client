"use client";

import { useEffect, useMemo } from "react";
import { useSearchParams } from "next/navigation";
import SaleFormModal from "@/components/orders/SaleFormModal";
import SalesMobileList from "@/components/orders/SalesMobileList";
import SaleShareDocumentModal from "@/components/orders/SaleShareDocumentModal";
import { AddButton, FloatingAddButton } from "@/components/ui/AppButtons";
import { AppNotFoundView } from "@/components/ui/AppNotFoundView";
import { AppSearch } from "@/components/ui/AppSearchInput";
import AppPaginationFooter from "@/components/ui/AppPaginationFooter";
import AppTable from "@/components/ui/AppTable";
import { AppViewLoader } from "@/components/ui/AppViewLoader";
import MobileInfiniteScrollFooter from "@/components/ui/MobileInfiniteScrollFooter";
import MobileListShimmer from "@/components/ui/MobileListShimmer";
import { SalesFilterDrawer } from "@/components/orders/SalesFilterDrawer";
import { DesktopQuickFilterSegment } from "@/components/ui/DesktopQuickFilterSegment";
import { buildSalesColumns } from "./_lib/salesPageConfig";
import { useSalesPageController } from "./_lib/useSalesPageController";
import { useSelector } from "react-redux";
import { RootState } from "@/lib/store";

type SalesQuickFilter = "all" | "quote" | "unpaid" | "paid" | "unfulfilled" | "fulfilled";

export default function SalesPage() {
  const searchParams = useSearchParams();
  const quotesEnabled = useSelector((state: RootState) => state.currentUser.storeSettings.features?.quotesEnabled !== false);
  const initialQuery = useMemo(
    () => ({
      page: 1,
      limit: 20,
      paymentStatus: readPaymentStatus(searchParams.get("paymentStatus")),
      fulfillmentStatus: readSalesFulfillmentStatus(searchParams.get("fulfillmentStatus")),
      overdue: searchParams.get("overdue") === "true" ? true : undefined,
    }),
    [searchParams],
  );
  const controller = useSalesPageController(initialQuery);
  const salesQuickFilter: SalesQuickFilter | undefined =
    quotesEnabled && controller.query.status === "draft" && !controller.query.paymentStatus && !controller.query.fulfillmentStatus && !controller.query.overdue
      ? "quote"
      : controller.query.paymentStatus === "unpaid" && !controller.query.status && !controller.query.fulfillmentStatus && !controller.query.overdue
        ? "unpaid"
        : controller.query.paymentStatus === "paid" && !controller.query.status && !controller.query.fulfillmentStatus && !controller.query.overdue
          ? "paid"
          : controller.query.fulfillmentStatus === "pending" && !controller.query.status && !controller.query.paymentStatus && !controller.query.overdue
            ? "unfulfilled"
            : controller.query.fulfillmentStatus === "received" && !controller.query.status && !controller.query.paymentStatus && !controller.query.overdue
              ? "fulfilled"
              : !controller.query.status && !controller.query.paymentStatus && !controller.query.fulfillmentStatus && !controller.query.overdue
                ? "all"
                : undefined;
  const salesQuickFilterOptions = useMemo(
    () => [
      { label: "All", value: "all" as const },
      ...(quotesEnabled ? [{ label: "Quote", value: "quote" as const }] : []),
      { label: "Unpaid", value: "unpaid" as const },
      { label: "Paid", value: "paid" as const },
      { label: "Unfulfilled", value: "unfulfilled" as const },
      { label: "Fulfilled", value: "fulfilled" as const },
    ],
    [quotesEnabled],
  );

  useEffect(() => {
    if (quotesEnabled || controller.query.status !== "draft") return;
    controller.setQuery((current) => ({ ...current, status: undefined, page: 1 }));
  }, [controller, quotesEnabled]);

  const columns = buildSalesColumns();

  return (
    <div>
      <h3 className="pageTittle px-4 md:px-8">Sales</h3>
      <hr className="border-gray-200/80" />
      <div className="flex w-full flex-col gap-4 px-4 py-5 md:flex-row md:items-center md:justify-between md:px-8 md:py-8">
        <div className="flex w-full items-center gap-3 md:w-auto">
          <AppSearch placeholder="Search sale number..." onReset={() => controller.setQuery((current) => ({ ...current, search: undefined, page: 1 }))} onSearchChange={(values) => controller.setQuery((current) => ({ ...current, ...values, page: 1 }))} onFilterClick={controller.openFilters} filterCount={controller.filterCount} />
          <DesktopQuickFilterSegment<SalesQuickFilter>
            value={salesQuickFilter}
            options={salesQuickFilterOptions}
            onChange={(value) =>
              controller.setQuery((current) => ({
                ...current,
                page: 1,
                status: quotesEnabled && value === "quote" ? "draft" : undefined,
                paymentStatus: value === "unpaid" ? "unpaid" : value === "paid" ? "paid" : undefined,
                fulfillmentStatus: value === "unfulfilled" ? "pending" : value === "fulfilled" ? "received" : undefined,
                overdue: undefined,
              }))
            }
          />
        </div>
        <div className="flex gap-x-3 md:gap-x-5">
          <div className="hidden md:block">
            <AddButton onClick={controller.toggleForm} label="New Sale" />
          </div>
        </div>
      </div>

      <div className="hidden md:block">
        <AppViewLoader loading={controller.isLoading} />
      </div>
      {controller.isError && <p className="px-8 py-8 text-sm text-red-600">{controller.error ? "Sales could not be loaded." : "Sales could not be loaded."}</p>}
      {!controller.isError && <AppNotFoundView dataLength={controller.data?.data?.length || 0} loading={controller.isLoading} query={{ search: controller.query.search }} entity="Sale" />}
      {!controller.isError && (
        <>
          <div className="hidden md:block">
            <AppTable columns={columns} dataSource={controller.data?.data || []} rowKey="id" pagination={false} disableFixedColumns />
            <AppPaginationFooter entity="sales" dataLength={controller.data?.data?.length || 0} meta={controller.meta} page={controller.data?.page || controller.query.page} limit={controller.data?.limit || controller.query.limit} total={controller.data?.total} onChange={(page, limit) => controller.setQuery((current) => ({ ...current, page, limit }))} />
          </div>
          {controller.isLoading ? <MobileListShimmer showAvatar={false} /> : <SalesMobileList sales={controller.mobileList.items} />}
          <MobileInfiniteScrollFooter entity="sales" dataLength={controller.mobileList.items.length} hasNextPage={controller.mobileList.hasNextPage} isFetching={controller.isFetching && !controller.isLoading} sentinelRef={controller.mobileList.sentinelRef} onLoadMore={controller.mobileList.loadNextPage} />
        </>
      )}

      {controller.formOpen && <SaleFormModal open={controller.formOpen} toggle={controller.toggleForm} />}
      {controller.editOpen && controller.selectedSale && <SaleFormModal open={controller.editOpen} toggle={controller.toggleEdit} sale={controller.selectedSale} />}
      <SalesFilterDrawer open={controller.filterOpen} filters={controller.draftFilters} onChange={(values) => controller.setDraftFilters((prev) => ({ ...prev, ...values }))} onClose={() => controller.setFilterOpen(false)} onApply={controller.applyFilters} onClear={controller.clearFilters} />
      {controller.shareDocumentType && controller.selectedSale && <SaleShareDocumentModal open={Boolean(controller.shareDocumentType)} toggle={() => controller.setShareDocumentType(undefined)} sale={controller.selectedSale} type={controller.shareDocumentType} />}
      <FloatingAddButton onClick={controller.toggleForm} label="New Sale" />
    </div>
  );
}

function readPaymentStatus(value: string | null): "paid" | "partial" | "unpaid" | undefined {
  return value === "paid" || value === "partial" || value === "unpaid" ? value : undefined;
}

function readSalesFulfillmentStatus(value: string | null): "pending" | "partially_received" | "received" | undefined {
  return value === "pending" || value === "partially_received" || value === "received" ? value : undefined;
}
