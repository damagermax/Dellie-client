import useDebouncedValue from "@/hooks/useDebouncedValue";
import { useGetCategoriesQuery } from "@/lib/redux/services";
import { ExpenseCategory } from "@/types/transaction";
import { Select, Spin } from "antd";
import { useEffect, useMemo, useState } from "react";
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
const PAGE_SIZE = 20;

export function SearchableExpenseCategorySelect({ value, type, onChange, onAddCategory, includeAllOption = false, allLabel = "All" }: SearchableExpenseCategorySelectProps) {
  const [categoriesQuery, setCategoriesQuery] = useState<CategoriesQueryParams>({ type, page: 1, limit: PAGE_SIZE });
  const [items, setItems] = useState<ExpenseCategory[]>([]);

  const debounceExpenseCategoriesQuery = useDebouncedValue(categoriesQuery);
  const querySignature = useMemo(() => JSON.stringify({ type, search: debounceExpenseCategoriesQuery.search || "" }), [debounceExpenseCategoriesQuery.search, type]);

  const handleFilterChange = (values: Partial<CategoriesQueryParams>) => {
    setCategoriesQuery((prev) => ({ ...prev, ...values, page: 1, type, limit: PAGE_SIZE }));
  };

  useEffect(() => {
    setCategoriesQuery({ type, page: 1, limit: PAGE_SIZE });
    setItems([]);
  }, [type]);

  const { data: categories, isLoading, isFetching } = useGetCategoriesQuery(debounceExpenseCategoriesQuery);
  const hasNextPage = categories?.meta?.hasNextPage ?? ((categories?.data?.length || 0) === PAGE_SIZE);

  useEffect(() => {
    setItems([]);
  }, [querySignature]);

  useEffect(() => {
    if (!categories) return;

    setItems((current) => {
      if ((categories.meta?.page || categories.page || categoriesQuery.page || 1) <= 1) {
        return categories.data as ExpenseCategory[];
      }

      const existingIds = new Set(current.map((item) => item.id));
      const nextItems = (categories.data as ExpenseCategory[]).filter((item) => !existingIds.has(item.id));
      return [...current, ...nextItems];
    });
  }, [categories, categoriesQuery.page]);

  const loadNextPage = () => {
    if (isFetching || !hasNextPage) return;

    setCategoriesQuery((prev) => ({ ...prev, page: (prev.page || 1) + 1, type, limit: PAGE_SIZE }));
  };
  const options = [
    ...(includeAllOption
      ? [
          {
            value: ALL_OPTION_VALUE,
            label: allLabel,
          },
        ]
      : []),
    ...(items.map((category: ExpenseCategory) => ({
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
        onPopupScroll={(event) => {
          const target = event.target as HTMLDivElement;
          if (target.scrollTop + target.clientHeight >= target.scrollHeight - 24) {
            loadNextPage();
          }
        }}
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
