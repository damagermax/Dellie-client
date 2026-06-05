"use client";

import { Minus, Plus } from "lucide-react";

type QuantityControlProps = {
  value: number;
  onDecrease: () => void;
  onIncrease: () => void;
  decreaseDisabled?: boolean;
  increaseDisabled?: boolean;
};

export default function QuantityControl({
  value,
  onDecrease,
  onIncrease,
  decreaseDisabled = false,
  increaseDisabled = false,
}: QuantityControlProps) {
  return (
    <div className="grid grid-cols-[44px_minmax(0,1fr)_44px] items-center gap-2">
      <button
        type="button"
        onClick={onDecrease}
        disabled={decreaseDisabled}
        className="flex h-11 w-11 items-center justify-center rounded-[12px] border border-gray-200 bg-[#f3f4f6] text-[#7b4bc7] transition hover:border-gray-300 hover:bg-gray-100 disabled:cursor-not-allowed disabled:opacity-50"
        aria-label="Decrease quantity"
      >
        <Minus size={18} strokeWidth={2.5} />
      </button>

      <div className="flex h-11 items-center justify-center rounded-[12px] border border-gray-200 bg-white text-[15px] font-medium text-gray-950 shadow-[inset_0_1px_0_rgba(255,255,255,0.8)]">
        {value}
      </div>

      <button
        type="button"
        onClick={onIncrease}
        disabled={increaseDisabled}
        className="flex h-11 w-11 items-center justify-center rounded-[12px] border border-transparent bg-[#6f38c5] text-white shadow-[0_8px_20px_rgba(111,56,197,0.28)] transition hover:bg-[#5f2fb0] disabled:cursor-not-allowed disabled:bg-gray-300 disabled:shadow-none"
        aria-label="Increase quantity"
      >
        <Plus size={18} strokeWidth={2.5} />
      </button>
    </div>
  );
}
