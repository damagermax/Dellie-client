import { MenuProps, Select } from "antd";
import { ProductQueryParams } from "@/types/product";

interface ProductsFilterPops {
  onChange: (value: Partial<ProductQueryParams>) => void;
  filters: ProductQueryParams;
}

export function ProductsFilters({ onChange, filters }: ProductsFilterPops): MenuProps["items"] {
  return [
    {
      key: "status",
      label: (
        <>
          <label className="  inline-block mb-1">Status</label>
          {/* <Select options={statusOptions} value={filters?.status} onSelect={(value) => onChange({ status: value })} className="w-full h-8 " placeholder="Select status..." onClick={(e) => e.stopPropagation()} /> */}
        </>
      ),
    },
  ];
}
