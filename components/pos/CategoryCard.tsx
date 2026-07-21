"use client";

import type { ReactNode } from "react";

type CategoryCardProps = {
  title: string;
  count: number;
  active?: boolean;
  onClick: () => void;
};

export default function CategoryCard({ title, count, active = false, onClick }: CategoryCardProps) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`flex  shrink-0  items-center justify-center rounded-[18px] border px-4 py-2 text-center transition ${
        active ? "border-[#7a39cc] bg-[#f6efff] shadow-[0_8px_24px_rgba(122,57,204,0.08)]" : "border-[#dfdfdf] bg-[#fafafa] hover:border-[#cfcfcf] hover:bg-white"
      }`}
    >
      <div className={` text-[15px] font-semibold leading-tight ${active ? "text-[#6f38c5]" : "text-[#b0b0b0]"}`}>{title}</div>
    </button>
  );
}
