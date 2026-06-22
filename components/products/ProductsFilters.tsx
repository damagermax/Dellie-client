import { MenuProps, Select } from "antd";
import { ProductQueryParams } from "@/types/product";
import { SearchableCategorySelect } from "@/components/categories/SearchableCategorySelect";

export function ProductsFilters({ onChange, filters }: { onChange: (value: Partial<ProductQueryParams>) => void; filters: ProductQueryParams }): MenuProps["items"] {
  const field = (label: string, control: React.ReactNode, key: string) => ({ key, label: <div onClick={(event) => event.stopPropagation()}><label className="mb-1 block text-xs font-medium text-gray-500">{label}</label>{control}</div> });
  return [
    field("Type", <Select allowClear className="w-full" value={filters.type} onChange={(type) => onChange({ type })} options={[{ value: "STOCK", label: "Stock" }, { value: "NON_STOCK", label: "Non-stock" }]} />, "type"),
    field("Category", <SearchableCategorySelect value={filters.categoryId} onChange={(categoryId) => onChange({ categoryId })} />, "category"),
    field("Stock", <Select allowClear className="w-full" value={filters.stockStatus} onChange={(stockStatus) => onChange({ stockStatus })} options={[{ value: "in_stock", label: "In stock" }, { value: "out_of_stock", label: "Out of stock" }]} />, "stock"),
    field("Catalog status", <Select allowClear className="w-full" value={filters.status} onChange={(status) => onChange({ status })} options={[{ value: "active", label: "Active" }, { value: "archived", label: "Archived" }]} />, "status"),
  ];
}
