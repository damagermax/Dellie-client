import { Badge, Button } from "antd";
import Input from "antd/es/input/Input";
import { RiSearchLine } from "react-icons/ri";
import { LuListFilter } from "react-icons/lu";
import { useEffect, useRef, useState } from "react";
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

  const onSearchChangeRef = useRef(onSearchChange);

  useEffect(() => {
    onSearchChangeRef.current = onSearchChange;
  }, [onSearchChange]);

  const handleSearchChange = (value: string) => {
    setSearchValue(value);

    if (!value) {
      onReset?.();
    }
  };

  useEffect(() => {
    onSearchChangeRef.current?.({ search: debounceSearchValue });
  }, [debounceSearchValue]);

  return (
    <div className={`relative flex !h-[32px] w-full items-center gap-x-3 md:w-[320px] ${className}`}>
      <Input allowClear size="small" value={searchValue} onChange={(e) => handleSearchChange(e.target.value)} placeholder={placeholder} className="w-full !rounded-full !border-gray-200/80 !bg-[#fafafad6] !py-[.28rem] !pl-10 !pr-24 !placeholder-gray-500" />

      <div className="pointer-events-none absolute left-0 top-0 z-10 flex items-center rounded-full px-2 py-[9px] text-gray-500">
        <RiSearchLine />
      </div>

      {onFilterClick ? (
        <div className="absolute bottom-0 right-0 top-0 z-10 flex items-center pr-1">
          <Badge count={filterCount} size="small" offset={[-4, 2]}>
            <Button onClick={onFilterClick} size="small" className="!text-xs !shadow-none" icon={<LuListFilter />}>
              Filter
            </Button>
          </Badge>
        </div>
      ) : null}
    </div>
  );
}
