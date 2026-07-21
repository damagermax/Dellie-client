import useDebouncedValue from "@/hooks/useDebouncedValue";
import { useGetLocationsQuery } from "@/lib/redux/services";
import { LocationsQueryParams, LocationStatus } from "@/types/location";
import { Select, Spin } from "antd";
import { useState } from "react";

interface SearchableLocationSelectProps {
  value?: string | string[];
  onChange?: (value: string | string[]) => void;
  mode?: undefined | "multiple";
  includeAllOption?: boolean;
  allLabel?: string;
}

const ALL_OPTION_VALUE = "__all__";

export function SearchableLocationSelect({ value, onChange, mode, includeAllOption = false, allLabel = "All" }: SearchableLocationSelectProps) {
  const [locationsQuery, setLocationsQuery] = useState<LocationsQueryParams>();

  const debounceContactsQuery = useDebouncedValue(locationsQuery);

  const { data: locations, isLoading } = useGetLocationsQuery(debounceContactsQuery);
  const options = [
    ...(includeAllOption
      ? [
          {
            value: ALL_OPTION_VALUE,
            label: allLabel,
          },
        ]
      : []),
    ...(locations?.map((location) => ({
      value: location.id,
      label: (
        <div className=" flex items-center gap-x-2">
          <p className={` text-xs text-gray-500 w-[8px] h-[8px] rounded-sm ${location.status == LocationStatus.ACTIVE ? "bg-green-300" : "bg-red-300 "}`}></p>
          <p>{location.name}</p>
        </div>
      ),
    })) || []),
  ];

  return (
    <Select
      placeholder="Search and select location"
      showSearch
      labelInValue={false}
      mode={mode}
      value={value}
      onChange={(newValues) => {
        onChange?.(newValues);
      }}
      className="w-full"
      filterOption={false}
      onSearch={(value) => setLocationsQuery({ search: value })}
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
