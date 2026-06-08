import useDebouncedValue from "@/hooks/useDebouncedValue";
import { useGetCategoriesQuery } from "@/lib/redux/services";
import { CategoriesQueryParams, CategoryStatus, CategoryType } from "@/types/category";
import { Select, Spin } from "antd";
import { useState } from "react";

interface SearchableCategorySelectProps {
  value?: string[];
  onChange?: (value: string[]) => void;
  type?: CategoryType;
}

export function SearchableCategorySelect({ value, onChange, type = CategoryType.PRODUCT }: SearchableCategorySelectProps) {
  const [categoriesQuery, setCategoriesQuery] = useState<CategoriesQueryParams>({ type });

  const debounceCategoriesQuery = useDebouncedValue(categoriesQuery);

  const { data: categories, isLoading } = useGetCategoriesQuery(debounceCategoriesQuery);

  return (
    <Select
      placeholder="Search and select categories"
      showSearch
      labelInValue={false}
      value={value} // controlled value
      onChange={(newValues) => {
        onChange?.(newValues); // tell AntD Form about change
      }}
      className="w-full"
      filterOption={false}
      onSearch={(value) => setCategoriesQuery({ search: value, type })}
      notFoundContent={isLoading ? <Spin size="small" /> : "No results found"}
      options={categories?.data?.map((cat) => ({
        value: cat.id,
        label: (
          <div className=" flex items-center gap-x-2">
            <p className={` text-xs text-gray-500 w-[8px] h-[8px] rounded-sm ${cat.status == CategoryStatus.ACTIVE ? "bg-green-300" : "bg-red-300 "}`}></p>
            <p>{cat.name}</p>
          </div>
        ),
      }))}
    />
  );
}
