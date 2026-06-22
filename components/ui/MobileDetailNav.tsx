"use client";

import { useState } from "react";

export type MobileDetailNavItem = { id: string; label: string };

export function MobileDetailNav({ items }: { items: MobileDetailNavItem[] }) {
  const [active, setActive] = useState(items[0]?.id);
  const navigate = (id: string) => {
    setActive(id);
    document.getElementById(id)?.scrollIntoView({ behavior: "smooth", block: "start" });
  };

  return (
    <nav className="sticky top-0 z-30 border-b border-gray-200 bg-white md:hidden" aria-label="Detail sections">
      <div className="flex gap-1 overflow-x-auto px-3 py-2 [scrollbar-width:none]">
        {items.map((item) => (
          <button key={item.id} type="button" onClick={() => navigate(item.id)} className={`shrink-0 rounded-full border px-3 py-1.5 text-sm font-medium ${active === item.id ? "border-[#2d837d] bg-[#eaf5f4] text-[#246b66]" : "border-gray-200 bg-white text-gray-600"}`}>
            {item.label}
          </button>
        ))}
      </div>
    </nav>
  );
}
