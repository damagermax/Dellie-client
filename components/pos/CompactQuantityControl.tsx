"use client";

import { Minus, Plus } from "lucide-react";

type CompactQuantityControlProps = {
  value: number;
  onDecrease: () => void;
  onIncrease: () => void;
  decreaseDisabled?: boolean;
  increaseDisabled?: boolean;
};

export default function CompactQuantityControl({
  value,
  onDecrease,
  onIncrease,
  decreaseDisabled = false,
  increaseDisabled = false,
}: CompactQuantityControlProps) {
  return (
    <div className="grid h-7 grid-cols-[26px_minmax(1.8rem,1fr)_26px] items-stretch overflow-hidden rounded-md border border-gray-200 bg-white">
      <button
        type="button"
        onClick={onDecrease}
        disabled={decreaseDisabled}
        className="flex h-full items-center justify-center border-r border-gray-200 text-gray-600 transition-colors hover:bg-gray-50 disabled:cursor-not-allowed disabled:text-gray-300 disabled:hover:bg-white"
        aria-label="Decrease quantity"
      >
        <Minus size={11} />
      </button>
      <div className="flex min-w-0 items-center justify-center px-0.5 text-[11px] font-semibold text-gray-900">{value}</div>
      <button
        type="button"
        onClick={onIncrease}
        disabled={increaseDisabled}
        className="flex h-full items-center justify-center border-l border-gray-200 text-gray-600 transition-colors hover:bg-gray-50 disabled:cursor-not-allowed disabled:text-gray-300 disabled:hover:bg-white"
        aria-label="Increase quantity"
      >
        <Plus size={11} />
      </button>
    </div>
  );
}
