import { MenuProps, Select } from "antd";
import { DiscountsQueryParams, DiscountStatus, DiscountType, DiscountMethod } from "@/types/discount";

interface DiscountsFilterPops {
  onChange: (value: Partial<DiscountsQueryParams>) => void;
  filters: DiscountsQueryParams;
}

export function DiscountsFilters({ onChange, filters }: DiscountsFilterPops): MenuProps["items"] {
  const statusOptions = Object.values(DiscountStatus).map((value) => ({
    value,
    label: value.charAt(0).toUpperCase() + value.slice(1), // Capitalize
  }));

  const typeOptions = Object.values(DiscountType).map((value) => ({
    value,
    label: value.charAt(0).toUpperCase() + value.slice(1), // Capitalize
  }));

  const methodOptions = Object.values(DiscountMethod).map((value) => ({
    value,
    label: value.charAt(0).toUpperCase() + value.slice(1), // Capitalize
  }));

  return [
    {
      key: "method",
      label: (
        <>
          <label className="  inline-block mb-1">Method</label>
          <Select options={methodOptions} value={filters?.method} onSelect={(value) => onChange({ method: value })} className="w-full h-8 " placeholder="Select status..." onClick={(e) => e.stopPropagation()} />
        </>
      ),
    },

    {
      key: "type",
      label: (
        <>
          <label className="  inline-block mb-1">Type</label>
          <Select options={typeOptions} value={filters?.type} onSelect={(value) => onChange({ type: value })} className="w-full h-8 " placeholder="Select  type..." onClick={(e) => e.stopPropagation()} />
        </>
      ),
    },

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
