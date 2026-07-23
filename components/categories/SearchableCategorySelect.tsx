import useDebouncedValue from "@/hooks/useDebouncedValue";
import { useGetCategoriesQuery } from "@/lib/redux/services";
import { CategoriesQueryParams, CategoryStatus, CategoryType } from "@/types/category";
import { Select, Spin } from "antd";
import { useEffect, useMemo, useState } from "react";

interface SearchableCategorySelectProps {
  value?: string;
  onChange?: (value: string) => void;
  type?: CategoryType;
  includeAllOption?: boolean;
  allLabel?: string;
}

const ALL_OPTION_VALUE = "__all__";
const PAGE_SIZE = 20;

export function SearchableCategorySelect({ value, onChange, type = CategoryType.PRODUCT, includeAllOption = false, allLabel = "All" }: SearchableCategorySelectProps) {
  const [categoriesQuery, setCategoriesQuery] = useState<CategoriesQueryParams>({ type, page: 1, limit: PAGE_SIZE });
  const [items, setItems] = useState<Array<{ id: string; name: string; status?: CategoryStatus }>>([]);

  const debounceCategoriesQuery = useDebouncedValue(categoriesQuery);
  const querySignature = useMemo(() => JSON.stringify({ type, search: debounceCategoriesQuery.search || "" }), [debounceCategoriesQuery.search, type]);
  const handleFilterChange = (values: Partial<CategoriesQueryParams>) => {
    setCategoriesQuery((prev) => ({ ...prev, ...values, page: 1, type, limit: PAGE_SIZE }));
  };

  useEffect(() => {
    setCategoriesQuery({ type, page: 1, limit: PAGE_SIZE });
    setItems([]);
  }, [type]);

  const { data: categories, isLoading, isFetching } = useGetCategoriesQuery(debounceCategoriesQuery);
  const hasNextPage = categories?.meta?.hasNextPage ?? ((categories?.data?.length || 0) === PAGE_SIZE);

  useEffect(() => {
    setItems([]);
  }, [querySignature]);

  useEffect(() => {
    if (!categories) return;

    setItems((current) => {
      if ((categories.meta?.page || categories.page || categoriesQuery.page || 1) <= 1) {
        return categories.data;
      }

      const existingIds = new Set(current.map((item) => item.id));
      const nextItems = categories.data.filter((item) => !existingIds.has(item.id));
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
    ...(items.map((cat) => ({
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
      options={options}
      onPopupScroll={(event) => {
        const target = event.target as HTMLDivElement;
        if (target.scrollTop + target.clientHeight >= target.scrollHeight - 24) {
          loadNextPage();
        }
      }}
      onSelect={(selected) => {
        if (selected === ALL_OPTION_VALUE) {
          onChange?.("" as string);
        }
      }}
    />
  );
}
