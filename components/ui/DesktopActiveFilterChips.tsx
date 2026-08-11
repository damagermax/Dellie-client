"use client";

import { X } from "lucide-react";

export interface ActiveFilterChipItem {
  key: string;
  label: string;
  removable?: boolean;
  onRemove?: () => void;
}

interface DesktopActiveFilterChipsProps {
  items: ActiveFilterChipItem[];
  className?: string;
}

export function DesktopActiveFilterChips({ items, className = "" }: DesktopActiveFilterChipsProps) {
  if (!items.length) return null;

  return (
    <div className={`hidden flex-wrap gap-1.5 md:flex ${className}`.trim()}>
      {items.map((item) => (
        <div key={item.key} className="inline-flex items-center gap-1 rounded-full border border-gray-200 bg-gray-50 px-2.5 py-1 text-xs text-gray-700">
          <span className="truncate leading-4">{item.label}</span>
          {item.removable !== false && item.onRemove ? (
            <button type="button" onClick={item.onRemove} className="inline-flex h-3.5 w-3.5 items-center justify-center rounded-full text-gray-500 transition hover:bg-gray-200 hover:text-gray-700" aria-label={`Remove ${item.label} filter`}>
              <X size={10} />
            </button>
          ) : null}
        </div>
      ))}
    </div>
  );
}
