import useDebouncedValue from "@/hooks/useDebouncedValue";
import { useGetLocationsQuery } from "@/lib/redux/services";
import { LocationsQueryParams, LocationStatus } from "@/types/location";
import { Select, Spin } from "antd";
import { useState } from "react";

interface SearchableLocationSelectProps {
  value?: string[];
  onChange?: (value: string[]) => void;
  mode?: undefined | "multiple";
}

export function SearchableLocationSelect({ value, onChange, mode }: SearchableLocationSelectProps) {
  const [locationsQuery, setLocationsQuery] = useState<LocationsQueryParams>();

  const debounceContactsQuery = useDebouncedValue(locationsQuery);

  const { data: locations, isSuccess, isLoading } = useGetLocationsQuery(debounceContactsQuery);

  return (
    <Select
      placeholder="Search and select categories"
      showSearch
      labelInValue={false}
      mode={mode}
      value={value} // controlled value
      onChange={(newValues) => {
        onChange?.(newValues); // tell AntD Form about change
      }}
      className="w-full"
      filterOption={false}
      onSearch={(value) => setLocationsQuery({ search: value })}
      notFoundContent={isLoading ? <Spin size="small" /> : "No results found"}
      options={locations?.map((location) => ({
        value: location.id,
        label: (
          <div className=" flex items-center gap-x-2">
            <p className={` text-xs text-gray-500 w-[8px] h-[8px] rounded-sm ${location.status == LocationStatus.ACTIVE ? "bg-green-300" : "bg-red-300 "}`}></p>
            <p>{location.name}</p>
          </div>
        ),
      }))}
    />
  );
}
