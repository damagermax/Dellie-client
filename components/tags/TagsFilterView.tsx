import { MenuProps, Select } from "antd";
import { TagsQueryParams, TagStatus } from "@/types/tag";

interface TagsFilterPops {
  onChange: (value: Partial<TagsQueryParams>) => void;
  filters: TagsQueryParams;
}

export function TagsFilters({ onChange, filters }: TagsFilterPops): MenuProps["items"] {
  const statusOptions = Object.values(TagStatus).map((value) => ({
    value,
    label: value.charAt(0).toUpperCase() + value.slice(1), // Capitalize
  }));

  return [
    {
      key: "edit",
      label: (
        <>
          <label className="  inline-block mb-1">Status</label>
          <Select options={statusOptions} value={filters?.status} onSelect={(value) => onChange({ status: value })} className="w-full h-8 " placeholder="Select status..." onClick={(e) => e.stopPropagation()} />
        </>
      ),
    },
  ];
}
