"use client";

import type { ReactNode } from "react";

type CategoryCardProps = {
  icon: ReactNode;
  title: string;
  count: number;
  active?: boolean;
  onClick: () => void;
};

export default function CategoryCard({ icon, title, count, active = false, onClick }: CategoryCardProps) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`flex h-[144px] w-[156px] shrink-0 flex-col items-center justify-center rounded-[18px] border px-4 py-4 text-center transition ${
        active
          ? "border-[#7a39cc] bg-[#f6efff] shadow-[0_8px_24px_rgba(122,57,204,0.08)]"
          : "border-[#dfdfdf] bg-[#fafafa] hover:border-[#cfcfcf] hover:bg-white"
      }`}
    >
      <div
        className={`flex h-10 w-10 items-center justify-center rounded-[10px] ${
          active ? "bg-[#6f38c5] text-white shadow-[0_6px_16px_rgba(111,56,197,0.24)]" : "bg-[#d9d9d9] text-[#8d8d8d]"
        }`}
      >
        {icon}
      </div>
      <div className={`mt-7 text-[15px] font-semibold leading-tight ${active ? "text-[#6f38c5]" : "text-[#b0b0b0]"}`}>{title}</div>
      <div className={`mt-1 text-xs ${active ? "text-[#6f38c5]" : "text-[#c4c4c4]"}`}>{count} items</div>
    </button>
  );
}
