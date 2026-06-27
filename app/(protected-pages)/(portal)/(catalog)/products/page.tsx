"use client";
import { AppSearch } from "@/components/ui/AppSearchInput";

import ProductFormModal from "@/components/products/ProductFormModal";
import ProductView from "@/components/products/product-views/ProductView";
import useToggle from "@/hooks/UseToggle";
import { useState } from "react";

import { ProductQueryParams } from "@/types/product";
import { ProductsFilterDrawer } from "@/components/products/ProductsFilterDrawer";

import SettingsDrawer from "@/components/settings/SettingsDrawer";
import { AccessDeniedView } from "@/components/ui/AccessDeniedView";
import { AppViewLoader } from "@/components/ui/AppViewLoader";
import { Button } from "antd";
import { usePermissions } from "@/hooks/usePermissions";
import { StorePermission } from "@/types/store-access";

export default function ProductsPage() {
  const { ready, hasPermission } = usePermissions();
  const [openProductForm, toggleProductForm] = useToggle();
  const [filterOpen, setFilterOpen] = useState(false);
  const view = "table";

  const [productsQuery, setProductsQuery] = useState<ProductQueryParams>({ page: 1, limit: 20 });
  const [draftFilters, setDraftFilters] = useState<ProductQueryParams>({});
  const filterCount = Number(Boolean(productsQuery.type)) + Number(Boolean(productsQuery.categoryId)) + Number(Boolean(productsQuery.stockStatus)) + Number(Boolean(productsQuery.status));

  const handleFilterChange = (values: Partial<ProductQueryParams>) => {
    setProductsQuery((prev) => ({ ...prev, ...values, page: 1 }));
  };

  const openFilters = () => {
    setDraftFilters({
      type: productsQuery.type,
      categoryId: productsQuery.categoryId,
      stockStatus: productsQuery.stockStatus,
      status: productsQuery.status,
    });
    setFilterOpen(true);
  };

  const handleApplyFilters = () => {
    setProductsQuery((prev) => ({
      ...prev,
      type: draftFilters.type,
      categoryId: draftFilters.categoryId,
      stockStatus: draftFilters.stockStatus,
      status: draftFilters.status,
      page: 1,
    }));
    setFilterOpen(false);
  };

  const handleFilterReset = () => {
    setDraftFilters({});
    setProductsQuery((prev) => ({ ...prev, type: undefined, categoryId: undefined, stockStatus: undefined, status: undefined, page: 1 }));
  };

  if (!ready) return <AppViewLoader loading />;

  if (!hasPermission(StorePermission.PRODUCTS_VIEW)) {
    return <AccessDeniedView title="Products" description="You do not have permission to view the products module." />;
  }

  return (
    <div>
      <div className="flex w-full flex-col gap-4 px-4 py-5 md:flex-row md:justify-between md:px-8 md:py-8">
        <div className="flex w-full items-center gap-x-2 md:w-auto">
          <AppSearch placeholder="Search products, variants, SKUs, or barcodes" onReset={() => setProductsQuery((prev) => ({ ...prev, search: undefined, page: 1 }))} onSearchChange={handleFilterChange} onFilterClick={openFilters} filterCount={filterCount} />
        </div>

        <div className="flex items-center justify-between gap-3">
          {hasPermission(StorePermission.PRODUCTS_MANAGE) && (
            <Button type="primary" size="middle" className=" !shadow-none" onClick={toggleProductForm}>
              Add Product
            </Button>
          )}

          <SettingsDrawer />
        </div>
      </div>

      <ProductView view={view} query={productsQuery} onQueryChange={setProductsQuery} />
      <ProductsFilterDrawer open={filterOpen} filters={draftFilters} onChange={(values) => setDraftFilters((prev) => ({ ...prev, ...values }))} onClose={() => setFilterOpen(false)} onApply={handleApplyFilters} onClear={handleFilterReset} />

      {openProductForm && <ProductFormModal open={openProductForm} toggle={toggleProductForm} />}
    </div>
  );
}
