"use client";
import { AppSearch } from "@/components/ui/AppSearchInput";

import ProductFormModal from "@/components/products/ProductFormModal";
import ProductView from "@/components/products/product-views/ProductView";
import useToggle from "@/hooks/UseToggle";
import { useState } from "react";

import { ProductQueryParams } from "@/types/product";
import { ProductsFilterDrawer } from "@/components/products/ProductsFilterDrawer";

import { AccessDeniedView } from "@/components/ui/AccessDeniedView";
import { FloatingAddButton } from "@/components/ui/AppButtons";
import { AppViewLoader } from "@/components/ui/AppViewLoader";
import { Button } from "antd";
import { usePermissions } from "@/hooks/usePermissions";
import { StorePermission } from "@/types/store-access";
import { DesktopQuickFilterSegment } from "@/components/ui/DesktopQuickFilterSegment";
import { useSelector } from "react-redux";
import { RootState } from "@/lib/store";
import { useEffect, useMemo } from "react";

type ProductsQuickFilter = "all" | "out_of_stock" | "expiring_soon" | "archived";

export default function ProductsPage() {
  const { ready, hasPermission } = usePermissions();
  const trackQuantityEnabled = useSelector((state: RootState) => state.currentUser.storeSettings.features?.trackQuantityEnabled !== false);
  const [openProductForm, toggleProductForm] = useToggle();
  const [filterOpen, setFilterOpen] = useState(false);
  const view = "table";

  const [productsQuery, setProductsQuery] = useState<ProductQueryParams>({ page: 1, limit: 20 });
  const [draftFilters, setDraftFilters] = useState<ProductQueryParams>({});
  const filterCount =
    Number(Boolean(trackQuantityEnabled && productsQuery.type)) +
    Number(Boolean(productsQuery.categoryId)) +
    Number(Boolean(productsQuery.locationId)) +
    Number(Boolean(trackQuantityEnabled && productsQuery.stockStatus)) +
    Number(Boolean(productsQuery.status)) +
    Number(Boolean(trackQuantityEnabled && productsQuery.expiryStatus));
  const productsQuickFilter: ProductsQuickFilter | undefined =
    trackQuantityEnabled && productsQuery.stockStatus === "out_of_stock" && productsQuery.status !== "archived" && !productsQuery.expiryStatus
      ? "out_of_stock"
      : trackQuantityEnabled && productsQuery.expiryStatus === "expiring_soon" && !productsQuery.stockStatus && productsQuery.status !== "archived"
        ? "expiring_soon"
        : productsQuery.status === "archived" && !productsQuery.stockStatus && !productsQuery.expiryStatus
          ? "archived"
          : !productsQuery.stockStatus && !productsQuery.expiryStatus && !productsQuery.status
            ? "all"
            : undefined;

  const quickFilterOptions = useMemo(
    () =>
      [
        { label: "All", value: "all" },
        ...(trackQuantityEnabled ? [{ label: "Out of stock", value: "out_of_stock" as const }, { label: "Soon expiring", value: "expiring_soon" as const }] : []),
        { label: "Archived", value: "archived" },
      ] satisfies Array<{ label: string; value: ProductsQuickFilter }>,
    [trackQuantityEnabled],
  );

  useEffect(() => {
    if (trackQuantityEnabled) return;

    setDraftFilters((prev) => ({
      ...prev,
      type: undefined,
      stockStatus: undefined,
      expiryStatus: undefined,
    }));
    setProductsQuery((prev) => ({
      ...prev,
      type: undefined,
      stockStatus: undefined,
      expiryStatus: undefined,
      page: 1,
    }));
  }, [trackQuantityEnabled]);

  const handleFilterChange = (values: Partial<ProductQueryParams>) => {
    setProductsQuery((prev) => ({ ...prev, ...values, page: 1 }));
  };

  const openFilters = () => {
    setDraftFilters({
      type: trackQuantityEnabled ? productsQuery.type : undefined,
      categoryId: productsQuery.categoryId,
      locationId: productsQuery.locationId,
      stockStatus: trackQuantityEnabled ? productsQuery.stockStatus : undefined,
      status: productsQuery.status,
      expiryStatus: trackQuantityEnabled ? productsQuery.expiryStatus : undefined,
    });
    setFilterOpen(true);
  };

  const handleApplyFilters = () => {
    setProductsQuery((prev) => ({
      ...prev,
      type: trackQuantityEnabled ? draftFilters.type : undefined,
      categoryId: draftFilters.categoryId,
      locationId: draftFilters.locationId,
      stockStatus: trackQuantityEnabled ? draftFilters.stockStatus : undefined,
      status: draftFilters.status,
      expiryStatus: trackQuantityEnabled ? draftFilters.expiryStatus : undefined,
      page: 1,
    }));
    setFilterOpen(false);
  };

  const handleFilterReset = () => {
    setDraftFilters({});
    setProductsQuery((prev) => ({ ...prev, type: undefined, categoryId: undefined, locationId: undefined, stockStatus: undefined, status: undefined, expiryStatus: undefined, page: 1 }));
  };

  if (!ready) return <AppViewLoader loading />;

  if (!hasPermission(StorePermission.PRODUCTS_VIEW)) {
    return <AccessDeniedView title="Products" description="You do not have permission to view the products module." />;
  }

  return (
    <div>
      <div className="flex w-full flex-col gap-4 px-4 py-5 md:flex-row md:items-center md:justify-between md:px-8 md:py-8">
        <div className="flex w-full items-center gap-x-2 md:w-auto">
          <AppSearch placeholder="Search products, variants, SKUs, or barcodes" onReset={() => setProductsQuery((prev) => ({ ...prev, search: undefined, page: 1 }))} onSearchChange={handleFilterChange} onFilterClick={openFilters} filterCount={filterCount} />
          <DesktopQuickFilterSegment<ProductsQuickFilter>
            value={productsQuickFilter}
            options={quickFilterOptions}
            onChange={(value) =>
              setProductsQuery((prev) => ({
                ...prev,
                page: 1,
                stockStatus: trackQuantityEnabled && value === "out_of_stock" ? "out_of_stock" : undefined,
                expiryStatus: trackQuantityEnabled && value === "expiring_soon" ? "expiring_soon" : undefined,
                status: value === "archived" ? "archived" : undefined,
              }))
            }
          />
        </div>
        <div className="flex items-center justify-between gap-3">
          {hasPermission(StorePermission.PRODUCTS_MANAGE) && (
            <div className="hidden md:block">
              <Button type="primary" size="middle" className=" !shadow-none" onClick={toggleProductForm}>
                Add Product
              </Button>
            </div>
          )}
        </div>
      </div>
      <ProductView view={view} query={productsQuery} onQueryChange={setProductsQuery} />
      <ProductsFilterDrawer open={filterOpen} filters={draftFilters} onChange={(values) => setDraftFilters((prev) => ({ ...prev, ...values }))} onClose={() => setFilterOpen(false)} onApply={handleApplyFilters} onClear={handleFilterReset} />

      {openProductForm && <ProductFormModal open={openProductForm} toggle={toggleProductForm} />}
      {hasPermission(StorePermission.PRODUCTS_MANAGE) && <FloatingAddButton onClick={toggleProductForm} label="Add Product" />}
    </div>
  );
}
