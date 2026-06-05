import { Button, Divider, Dropdown, Space } from "antd";
import Input from "antd/es/input/Input";
import { RiSearchLine } from "react-icons/ri";
import { LuListFilter } from "react-icons/lu";
import type { MenuProps } from "antd";
import { useEffect, useState } from "react";
import useDebouncedValue from "@/hooks/useDebouncedValue";

interface AppSearchProps {
  placeholder?: string;
  className?: string;
  menu?: MenuProps;
  onReset?: () => void;
  onSearchChange?: (v: { search?: string }) => void;
}

export function AppSearch({ placeholder = "Search...", className = "", menu, onReset, onSearchChange }: AppSearchProps) {
  const items: MenuProps["items"] = [
    {
      key: "filter",
      label: "Filter",
      disabled: true,
      className: "w-[300px]",
    },
    {
      type: "divider",
    },

    ...(menu?.items ?? []),

    {
      type: "divider",
    },

    {
      key: "reset",
      label: (
        <div className=" flex justify-end text-sm">
          <p>Clear all filter</p>
        </div>
      ),
      onClick: onReset,
    },
  ];

  const [searchValue, setSearchValue] = useState("");

  const debounceSearchValue = useDebouncedValue(searchValue);

  const handleSearchChange = (value: string) => {
    setSearchValue(value);
  };

  useEffect(() => {
    if (onSearchChange) {
      onSearchChange({ search: debounceSearchValue });
    }
  }, [debounceSearchValue]);

  return (
    <div className={`w-[320px] !h-[32px] flex items-center gap-x-5 relative ${className}`}>
      <Input size="small" onChange={(e) => handleSearchChange(e.target.value)} placeholder={placeholder} className="!bg-[#fafafad6] !border-gray-200/80 !placeholder-gray-500 !rounded-full !py-[.37rem] !pl-8 w-full" />
      <div className="absolute text-gray-500 top-0 left-0 rounded-full px-2 py-[9px] flex items-center">
        <RiSearchLine />
      </div>

      <div className="absolute top-0 bottom-0 flex items-center pr-1 right-0">
        <Dropdown
          trigger={["click"]}
          menu={{ items }}
          placement="bottomRight"
          popupRender={(menu) => (
            <div style={{ marginTop: 10 }} className=" bg-white  shadow-[0_4px_20px_rgba(0,0,0,0.25)] overflow-hidden !rounded-lg  ">
              {menu}
            </div>
          )}
        >
          <Button onClick={(e) => e.preventDefault()} size="small" className="!text-xs" icon={<LuListFilter />}>
            Filter
          </Button>
        </Dropdown>
      </div>
    </div>
  );
}
