import { Badge, Button } from "antd";
import Input from "antd/es/input/Input";
import { RiSearchLine } from "react-icons/ri";
import { LuListFilter } from "react-icons/lu";
import { useEffect, useState } from "react";
import useDebouncedValue from "@/hooks/useDebouncedValue";

interface AppSearchProps {
  placeholder?: string;
  className?: string;
  menu?: unknown;
  onReset?: () => void;
  onSearchChange?: (v: { search?: string }) => void;
  onFilterClick?: () => void;
  filterCount?: number;
}

export function AppSearch({ placeholder = "Search...", className = "", onReset, onSearchChange, onFilterClick, filterCount = 0 }: AppSearchProps) {
  const [searchValue, setSearchValue] = useState("");
  const debounceSearchValue = useDebouncedValue(searchValue);

  const handleSearchChange = (value: string) => {
    setSearchValue(value);
    if (!value) onReset?.();
  };

  useEffect(() => {
    if (onSearchChange) {
      onSearchChange({ search: debounceSearchValue });
    }
  }, [debounceSearchValue]);

  return (
    <div className={`w-[320px] !h-[32px] flex items-center gap-x-3 relative ${className}`}>
      <Input allowClear size="small" onChange={(e) => handleSearchChange(e.target.value)} placeholder={placeholder} className="!bg-[#fafafad6] !border-gray-200/80 !placeholder-gray-500 !rounded-full !py-[.37rem] !pl-8 w-full" />
      <div className="absolute text-gray-500 top-0 left-0 rounded-full px-2 py-[9px] flex items-center">
        <RiSearchLine />
      </div>
      {onFilterClick ? (
        <div className="absolute top-0 bottom-0 flex items-center pr-1 right-0">
          <Badge count={filterCount} size="small" offset={[-4, 2]}>
            <Button onClick={onFilterClick} size="small" className="!text-xs" icon={<LuListFilter />}>
              Filter
            </Button>
          </Badge>
        </div>
      ) : null}
    </div>
  );
}
