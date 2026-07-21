"use client";

import { Input } from "antd";
import { Search } from "lucide-react";
import { MdOutlineHistoryToggleOff, MdOutlineShareLocation } from "react-icons/md";

type PosHeaderProps = {
  counterName?: string;
  selectedLocationName?: string;
  searchValue: string;
  onSearchChange: (value: string) => void;
  onOpenLocation: () => void;
  onOpenHistory: () => void;
};

export default function PosHeader({ counterName, selectedLocationName, searchValue, onSearchChange, onOpenLocation, onOpenHistory }: PosHeaderProps) {
  return (
    <div className="sticky top-0 z-10 ">
      <div className="border-b bg-gray-50 border-[#ece8f2] px-3 py-3 ">
        <div className="flex  flex-col gap-3 md:flex-row lg:items-center lg:justify-between">
          <div className="px-3 cursor-pointer" onClick={onOpenLocation}>
            {counterName ? <p className="mb-1 text-xs font-semibold uppercase tracking-[0.14em] text-gray-500">{counterName}</p> : null}
            <p className="font-medium text-xs flex items-center gap-1 text-gray-700">
              <MdOutlineShareLocation /> <span> POS Location</span>
            </p>
            <p className=" text-green-700 font-semibold">{selectedLocationName || "No location set"}</p>
          </div>

          <Input
            size="middle"
            allowClear
            prefix={<Search size={18} className="text-gray-500" />}
            placeholder="Search item here..."
            className=" !w-[40%] !rounded-lg !border-[#dad6e2] !bg-gray-200 !px-4 !text-[16px] lg:!max-w-[360px]"
            value={searchValue}
            onChange={(event) => onSearchChange(event.target.value)}
          />

          <button type="button" onClick={onOpenHistory} className="flex items-center gap-1 rounded-full bg-gray-200 px-3 py-1 text-sm font-medium text-gray-700 transition-colors hover:bg-gray-300">
            <MdOutlineHistoryToggleOff />
            <p>History</p>
          </button>
        </div>
      </div>
    </div>
  );
}
