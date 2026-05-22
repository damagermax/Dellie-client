import { MenuProps, Select } from "antd";
import { CategoriesQueryParams, CategoryStatus } from "@/types/category";

interface CategoriesFilterPops {
  onChange: (value: Partial<CategoriesQueryParams>) => void;
  filters: CategoriesQueryParams;
}

export function CategoriesFilters({ onChange, filters }: CategoriesFilterPops): MenuProps["items"] {
  const statusOptions = Object.values(CategoryStatus).map((value) => ({
    value,
    label: value.charAt(0).toUpperCase() + value.slice(1), // Capitalize
  }));

  return [
    {
      key: "status",
      label: (
        <>
          <label className="  inline-block mb-1">Status</label>
          <Select options={statusOptions} value={filters?.status} onSelect={(value) => onChange({ status: value })} className="w-full h-8 " placeholder="Select status..." onClick={(e) => e.stopPropagation()} />
        </>
      ),
    },
  ];
}
