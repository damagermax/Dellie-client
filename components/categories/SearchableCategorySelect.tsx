import useDebouncedValue from "@/hooks/useDebouncedValue";
import { useGetCategoriesQuery } from "@/lib/redux/services";
import { CategoriesQueryParams, CategoryStatus, CategoryType } from "@/types/category";
import { Select, Spin } from "antd";
import { useEffect, useState } from "react";

interface SearchableCategorySelectProps {
  value?: string;
  onChange?: (value: string) => void;
  type?: CategoryType;
  includeAllOption?: boolean;
  allLabel?: string;
  onAddCategory?: () => void;
}

const ALL_OPTION_VALUE = "__all__";
export function SearchableCategorySelect({ value, onChange, type = CategoryType.PRODUCT, includeAllOption = false, allLabel = "All", onAddCategory }: SearchableCategorySelectProps) {
  const [categoriesQuery, setCategoriesQuery] = useState<CategoriesQueryParams>({ type });

  const debounceCategoriesQuery = useDebouncedValue(categoriesQuery);
  const handleFilterChange = (values: Partial<CategoriesQueryParams>) => {
    setCategoriesQuery((prev) => ({ ...prev, ...values, type }));
  };

  useEffect(() => {
    setCategoriesQuery({ type });
  }, [type]);

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
    ...((categories || []).map((cat: { id: string; name: string; status?: CategoryStatus }) => ({
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
      onSearch={(value) => handleFilterChange({ search: value })}
      notFoundContent={isLoading ? <Spin size="small" /> : "No results found"}
      dropdownRender={(menu) => (
        <>
          {onAddCategory ? (
            <div
              className="cursor-pointer px-3 py-2 text-blue-500 hover:bg-gray-100"
              onMouseDown={(e) => e.preventDefault()}
              onClick={onAddCategory}
            >
              + Add Category
            </div>
          ) : null}
          {menu}
        </>
      )}
      options={options}
      onSelect={(selected) => {
        if (selected === ALL_OPTION_VALUE) {
          onChange?.("" as string);
        }
      }}
    />
  );
}
