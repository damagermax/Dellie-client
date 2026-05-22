import useDebouncedValue from "@/hooks/useDebouncedValue";
import { useGetLocationsQuery } from "@/lib/redux/services";
import { CategoryStatus } from "@/types/category";
import { Select, Spin } from "antd";
import { useState } from "react";

interface SearchableLocationSelectProps {
  value?: string[];
  onChange?: (value: Record<string, string>[]) => void;
}

export function SearchableLocationSelect({ value, onChange }: SearchableLocationSelectProps) {
  const [query, setQuery] = useState({});

  const debounceQuery = useDebouncedValue(query);

  const { data: locations, isSuccess, isLoading } = useGetLocationsQuery(debounceQuery);

  return (
    <Select
      placeholder="Search and select categories"
      showSearch
      labelInValue
      mode="multiple"
      value={value}
      onChange={(newValues) => {
        const locationWithNames = newValues.map((item: any) => ({ title: item?.title, value: item?.value }));

        onChange?.(locationWithNames);
        console.log("==============", locationWithNames);
      }}
      className="w-full"
      filterOption={false}
      onSearch={(value) => setQuery({ search: value })}
      notFoundContent={isLoading ? <Spin size="small" /> : "No results found"}
      options={locations?.map((cat) => ({
        value: cat.id,
        title: cat.name,
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
