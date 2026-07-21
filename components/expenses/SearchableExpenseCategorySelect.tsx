import useDebouncedValue from "@/hooks/useDebouncedValue";
import { useGetCategoriesQuery } from "@/lib/redux/services";
import { ExpenseCategory } from "@/types/transaction";
import { Select, Spin } from "antd";
import { useState } from "react";
import { CategoriesQueryParams, CategoryType } from "@/types/category";

interface SearchableExpenseCategorySelectProps {
  value?: string | string[];
  onChange?: (value: string | string[]) => void;
  onAddCategory?: () => void;
  type: CategoryType;
  includeAllOption?: boolean;
  allLabel?: string;
}

const ALL_OPTION_VALUE = "__all__";

export function SearchableExpenseCategorySelect({ value, type, onChange, onAddCategory, includeAllOption = false, allLabel = "All" }: SearchableExpenseCategorySelectProps) {
  const [categoriesQuery, setCategoriesQuery] = useState<CategoriesQueryParams>({ type });

  const debounceExpenseCategoriesQuery = useDebouncedValue(categoriesQuery);

  const handleFilterChange = (values: Partial<CategoriesQueryParams>) => {
    setCategoriesQuery((prev) => ({ ...prev, ...values }));
  };

  const { data: categories, isLoading } = useGetCategoriesQuery(debounceExpenseCategoriesQuery);
  const options = [
    ...(includeAllOption
      ? [
          {
            value: ALL_OPTION_VALUE,
            label: allLabel,
          },
        ]
      : []),
    ...(categories?.data?.map((category: ExpenseCategory) => ({
      value: category.id,
      label: (
        <div className="flex items-center gap-x-2">
          <p>{category.name}</p>
        </div>
      ),
    })) || []),
  ];

  return (
    <>
      <Select
        placeholder="category"
        showSearch
        labelInValue={false}
        value={value}
        onChange={(newValues) => {
          onChange?.(newValues);
        }}
        className="w-full"
        filterOption={false}
        onSearch={(value) => handleFilterChange({ search: value })}
        notFoundContent={isLoading ? <Spin size="small" /> : <span>No categories found</span>}
        popupRender={(menu) => (
          <>
            {onAddCategory ? (
              <div
                className="px-3 py-2 cursor-pointer hover:bg-gray-100 text-blue-500"
                onMouseDown={(e) => e.preventDefault()}
                onClick={() => {
                  onAddCategory();
                }}
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
    </>
  );
}
