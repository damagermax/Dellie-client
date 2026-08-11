"use client";

import { Input } from "antd";
import { ChevronDown, Search, X } from "lucide-react";
import { useEffect, useState } from "react";
import { MdOutlineHistoryToggleOff, MdOutlineShareLocation } from "react-icons/md";
import type { Category } from "@/types/index";

type PosHeaderProps = {
  counterName?: string;
  selectedLocationName?: string;
  categories: Category[];
  categoryId?: string;
  categoriesLoading: boolean;
  searchValue: string;
  onSearchChange: (value: string) => void;
  onSelectCategory: (categoryId?: string) => void;
  onOpenLocation: () => void;
  onOpenHistory: () => void;
};

export default function PosHeader({
  counterName,
  selectedLocationName,
  categories,
  categoryId,
  categoriesLoading,
  searchValue,
  onSearchChange,
  onSelectCategory,
  onOpenLocation,
  onOpenHistory,
}: PosHeaderProps) {
  const [searchOpen, setSearchOpen] = useState(Boolean(searchValue));

  useEffect(() => {
    if (searchValue) {
      setSearchOpen(true);
    }
  }, [searchValue]);

  const closeSearch = () => {
    onSearchChange("");
    setSearchOpen(false);
  };

  return (
    <div className="sticky top-0 z-20">
      <div className="border-b border-[#ece8f2] bg-gray-50 px-3 py-3 hidden md:block">
        <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
          <button type="button" className="px-3 text-left" onClick={onOpenLocation}>
            {counterName ? <p className="mb-1 text-xs font-semibold uppercase tracking-[0.14em] text-gray-500">{counterName}</p> : null}
            <p className="flex items-center gap-1 text-xs font-medium text-gray-700">
              <MdOutlineShareLocation />
              <span>POS Location</span>
            </p>
            <p className="font-semibold text-green-700">{selectedLocationName || "No location set"}</p>
          </button>

          <Input
            size="middle"
            allowClear
            prefix={<Search size={18} className="text-gray-500" />}
            placeholder="Search item here..."
            className="!w-full !rounded-lg !border-[#dad6e2] !bg-gray-200 !px-4 !text-[16px] md:!max-w-[360px]"
            value={searchValue}
            onChange={(event) => onSearchChange(event.target.value)}
          />

          <button type="button" onClick={onOpenHistory} className="flex items-center gap-1 rounded-full bg-gray-200 px-3 py-1 text-sm font-medium text-gray-700 transition-colors hover:bg-gray-300">
            <MdOutlineHistoryToggleOff />
            <span>History</span>
          </button>
        </div>
      </div>

      <div className="border-b border-gray-200 bg-white px-3 pb-3 pt-[max(10px,env(safe-area-inset-top))] md:hidden">
        <div className="flex flex-col gap-2.5">
          <div className="flex h-11 items-center border-b border-gray-200 pr-14">
            <button type="button" onClick={onOpenLocation} className="flex min-w-0 flex-1 items-center gap-2 bg-white text-left">
              <MdOutlineShareLocation className="shrink-0 text-lg text-[#2d837d]" />
              <span className="min-w-0 flex-1">
                <span className="block truncate text-sm font-semibold text-gray-950">{selectedLocationName || "No location set"}</span>
              </span>
              <ChevronDown size={16} className="shrink-0 text-gray-400" />
            </button>

            <button type="button" onClick={onOpenHistory} className="flex h-full min-w-[82px] shrink-0 items-center justify-center gap-1.5 border-l border-gray-200 bg-white px-3 text-sm font-medium text-gray-700 transition-colors hover:bg-gray-50">
              <MdOutlineHistoryToggleOff className="text-lg" />
              <span>History</span>
            </button>
          </div>

          <div className="grid grid-cols-[minmax(0,1fr)_44px] gap-2">
            <div className="relative">
              <select
                value={categoryId || "all"}
                onChange={(event) => onSelectCategory(event.target.value === "all" ? undefined : event.target.value)}
                disabled={categoriesLoading}
                className="h-11 w-full appearance-none rounded-md border border-gray-300 bg-[#f7f7f7] px-3 pr-9 text-sm font-medium text-gray-800 shadow-none outline-none"
                aria-label="Select category"
              >
                <option value="all">All</option>
                {categories.map((category) => (
                  <option key={category.id} value={category.id}>
                    {category.name}
                  </option>
                ))}
              </select>
              <ChevronDown size={16} className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-gray-400" />
            </div>
            <button
              type="button"
              onClick={() => (searchOpen ? closeSearch() : setSearchOpen(true))}
              className={`flex h-11 items-center justify-center rounded-md border text-gray-700 transition-colors ${searchOpen ? "border-[#2d837d] bg-[#eef8f7] text-[#236d68]" : "border-gray-300 bg-white hover:bg-gray-50"}`}
              aria-label={searchOpen ? "Close search" : "Search products"}
            >
              {searchOpen ? <X size={18} /> : <Search size={19} />}
            </button>
          </div>

          {searchOpen ? (
            <Input
              size="large"
              allowClear
              prefix={<Search size={18} className="text-gray-500" />}
              placeholder="Search items..."
              className="!h-11 !w-full !rounded-md !border-gray-300 !bg-[#f7f7f7] !px-3 !text-[16px] !shadow-none focus-within:!border-[#2d837d] lg:!max-w-[560px] lg:!bg-white"
              value={searchValue}
              onChange={(event) => onSearchChange(event.target.value)}
            />
          ) : null}
        </div>
      </div>
    </div>
  );
}
