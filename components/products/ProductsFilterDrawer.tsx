"use client";

import { Select } from "antd";
import { ProductQueryParams } from "@/types/product";
import { SearchableCategorySelect } from "@/components/categories/SearchableCategorySelect";
import { AppFilterDrawer } from "@/components/ui/AppFilterDrawer";
import { FilterField } from "@/components/ui/FilterField";

interface ProductsFilterDrawerProps {
  open: boolean;
  filters: ProductQueryParams;
  onChange: (value: Partial<ProductQueryParams>) => void;
  onClose: () => void;
  onApply: () => void;
  onClear: () => void;
}

export function ProductsFilterDrawer({ open, filters, onChange, onClose, onApply, onClear }: ProductsFilterDrawerProps) {
  return (
    <AppFilterDrawer title="Filter products" open={open} onClose={onClose} onApply={onApply} onClear={onClear}>
      <FilterField label="Type">
        <Select
          allowClear
          className="w-full"
          value={filters.type || ""}
          onChange={(type) => onChange({ type: (type as ProductQueryParams["type"]) || undefined })}
          options={[
            { value: "", label: "All" },
            { value: "STOCK", label: "Stock" },
            { value: "NON_STOCK", label: "Non-stock" },
            { value: "SERVICE", label: "Service" },
            { value: "BUNDLE", label: "Bundle" },
            { value: "PACKAGING", label: "Packaging" },
          ]}
        />
      </FilterField>

      <FilterField label="Category">
        <SearchableCategorySelect includeAllOption allLabel="All" value={filters.categoryId} onChange={(categoryId) => onChange({ categoryId: categoryId || undefined })} />
      </FilterField>

      <FilterField label="Stock">
        <Select
          allowClear
          className="w-full"
          value={filters.stockStatus || ""}
          onChange={(stockStatus) => onChange({ stockStatus: (stockStatus as ProductQueryParams["stockStatus"]) || undefined })}
          options={[
            { value: "", label: "All" },
            { value: "in_stock", label: "In stock" },
            { value: "out_of_stock", label: "Out of stock" },
          ]}
        />
      </FilterField>

      <FilterField label="Catalog status">
        <Select
          allowClear
          className="w-full"
          value={filters.status || ""}
          onChange={(status) => onChange({ status: (status as ProductQueryParams["status"]) || undefined })}
          options={[
            { value: "", label: "All" },
            { value: "active", label: "Active" },
            { value: "archived", label: "Archived" },
          ]}
        />
      </FilterField>
    </AppFilterDrawer>
  );
}
