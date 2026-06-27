import useDebouncedValue from "@/hooks/useDebouncedValue";
import { useGetCategoriesQuery } from "@/lib/redux/services";
import { CategoriesQueryParams, CategoryStatus, CategoryType } from "@/types/category";
import { Select, Spin } from "antd";
import { useState } from "react";

interface SearchableCategorySelectProps {
  value?: string;
  onChange?: (value: string) => void;
  type?: CategoryType;
  includeAllOption?: boolean;
  allLabel?: string;
}

const ALL_OPTION_VALUE = "__all__";

export function SearchableCategorySelect({ value, onChange, type = CategoryType.PRODUCT, includeAllOption = false, allLabel = "All" }: SearchableCategorySelectProps) {
  const [categoriesQuery, setCategoriesQuery] = useState<CategoriesQueryParams>({ type });

  const debounceCategoriesQuery = useDebouncedValue(categoriesQuery);

  const { data: categories, isLoading } = useGetCategoriesQuery(debounceCategoriesQuery);
  const options = [
    ...(includeAllOption
      ? [
          {
            value: ALL_OPTION_VALUE,
            label: allLabel,
          },
        ]
      : []),
    ...(categories?.data?.map((cat) => ({
      value: cat.id,
      label: (
        <div className=" flex items-center gap-x-2">
          <p className={` text-xs text-gray-500 w-[8px] h-[8px] rounded-sm ${cat.status == CategoryStatus.ACTIVE ? "bg-green-300" : "bg-red-300 "}`}></p>
          <p>{cat.name}</p>
        </div>
      ),
    })) || []),
  ];

  return (
    <Select
      placeholder="Search and select categories"
      showSearch
      labelInValue={false}
      value={value} // controlled value
      onChange={(newValues: string) => {
        onChange?.(newValues); // tell AntD Form about change
      }}
      className="w-full"
      filterOption={false}
      onSearch={(value) => setCategoriesQuery({ search: value, type })}
      notFoundContent={isLoading ? <Spin size="small" /> : "No results found"}
      options={options}
      onSelect={(selected) => {
        if (selected === ALL_OPTION_VALUE) {
          onChange?.("" as string);
        }
      }}
    />
  );
}
