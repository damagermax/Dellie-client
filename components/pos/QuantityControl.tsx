"use client";

import { Minus, Plus } from "lucide-react";

type QuantityControlProps = {
  value: number;
  onDecrease: () => void;
  onIncrease: () => void;
  decreaseDisabled?: boolean;
  increaseDisabled?: boolean;
};

export default function QuantityControl({ value, onDecrease, onIncrease, decreaseDisabled = false, increaseDisabled = false }: QuantityControlProps) {
  return (
    <div className="inline-flex items-center justify-between gap-1 w-full rounded-xl border border-stone-200/70 bg-gradient-to-b from-stone-50/80 to-white p-1 shadow-sm shadow-stone-200/30">
      <button
        type="button"
        onClick={onDecrease}
        disabled={decreaseDisabled}
        className="flex h-9 w-9 items-center justify-center rounded-lg bg-gradient-to-b from-stone-400 to-stone-500 text-white shadow-sm shadow-stone-300/30 ring-1 ring-stone-500/20 transition-all duration-200 hover:from-stone-500 hover:to-stone-600 hover:shadow-md hover:shadow-stone-400/30 active:scale-90 disabled:cursor-not-allowed disabled:opacity-30 disabled:from-stone-200 disabled:to-stone-200 disabled:shadow-none disabled:ring-0 disabled:hover:from-stone-200 disabled:hover:to-stone-200"
        aria-label="Decrease quantity"
      >
        <Minus size={15} strokeWidth={2.5} />
      </button>

      <div className="flex min-w-[3rem] items-center justify-center px-3 text-[17px] font-bold tracking-tight text-stone-700">{value}</div>

      <button
        type="button"
        onClick={onIncrease}
        disabled={increaseDisabled}
        className="flex h-9 w-9 items-center justify-center rounded-lg bg-gradient-to-b from-stone-400 to-stone-500 text-white shadow-sm shadow-stone-300/30 ring-1 ring-stone-500/20 transition-all duration-200 hover:from-stone-500 hover:to-stone-600 hover:shadow-md hover:shadow-stone-400/30 active:scale-90 disabled:cursor-not-allowed disabled:opacity-30 disabled:from-stone-200 disabled:to-stone-200 disabled:shadow-none disabled:ring-0 disabled:hover:from-stone-200 disabled:hover:to-stone-200"
        aria-label="Increase quantity"
      >
        <Plus size={15} strokeWidth={2.5} />
      </button>
    </div>
  );
}
