import useDebouncedValue from "@/hooks/useDebouncedValue";
import { useGetCategoriesQuery } from "@/lib/redux/services";
import { ExpenseCategory } from "@/types/transaction";
import { Select, Spin } from "antd";
import { useState } from "react";
import { CategoriesQueryParams, CategoryType } from "@/types/category";

interface SearchableExpenseCategorySelectProps {
  value?: string[];
  onChange?: (value: string[]) => void;
  onAddCategory: () => void;
  type: CategoryType;
}

export function SearchableExpenseCategorySelect({ value, type, onChange, onAddCategory }: SearchableExpenseCategorySelectProps) {
  const [categoriesQuery, setCategoriesQuery] = useState<CategoriesQueryParams>({ type });

  const debounceExpenseCategoriesQuery = useDebouncedValue(categoriesQuery);

  const handleFilterChange = (values: Partial<CategoriesQueryParams>) => {
    setCategoriesQuery((prev) => ({ ...prev, ...values }));
  };

  const { data: categories, isSuccess, isLoading } = useGetCategoriesQuery(debounceExpenseCategoriesQuery);

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
        notFoundContent={isLoading ? <Spin size="small" /> : <p className=" text-white">dd</p>}
        dropdownRender={(menu) => (
          <>
            <div
              className="px-3 py-2 cursor-pointer hover:bg-gray-100 text-blue-500"
              onMouseDown={(e) => e.preventDefault()} // prevents closing
              onClick={() => {
                onAddCategory();
              }}
            >
              + Add Category
            </div>

            {menu}
          </>
        )}
        options={[
          ...(categories?.data?.map((category: ExpenseCategory) => ({
            value: category.id,
            label: (
              <div className="flex items-center gap-x-2">
                <p>{category.name}</p>
              </div>
            ),
          })) || []),
        ]}
      />
    </>
  );
}
