"use client";

import PreviewImage from "@/components/ui/PreviewImage";
import QuantityControl from "./QuantityControl";

type ProductCardProps = {
  name: string;
  imageUrl?: string;
  price: string;
  quantity: number;
  available: boolean;
  onDecrease: () => void;
  onIncrease: () => void;
};

export default function ProductCard({ name, imageUrl, price, quantity, available, onDecrease, onIncrease }: ProductCardProps) {
  return (
    <article className="flex h-full flex-col rounded-[18px] border border-[#dfdfdf] bg-white shadow-[0_8px_24px_rgba(15,23,42,0.04)]">
      <div className="p-3">
        <div className="flex aspect-[1.22] items-center justify-center rounded-[18px] border border-[#f0f0f0] bg-white p-4">
          <PreviewImage width={170} height={170} src={imageUrl} />
        </div>
      </div>

      <div className="flex flex-1 flex-col px-3 pb-3">
        <h3 className="line-clamp-2 min-h-[48px] text-[18px] font-semibold leading-[1.15] tracking-[-0.02em] text-[#111111]">{name}</h3>

        <div className="mt-2">
          <span
            className={`inline-flex items-center rounded-full px-3 py-1 text-[12px] font-medium ${
              available ? "bg-[#16a34a] text-white shadow-[0_4px_12px_rgba(22,163,74,0.18)]" : "bg-[#cf3b24] text-white shadow-[0_4px_12px_rgba(207,59,36,0.18)]"
            }`}
          >
            <span
              className={`mr-2 h-2 w-2 rounded-full ${available ? "bg-[#34d399]" : "bg-[#fca5a5]"}`}
            />
            {available ? "Available" : "Not Available"}
          </span>
        </div>

        <div className="mt-3 text-[21px] font-semibold tracking-[-0.03em] text-[#121212]">{price}</div>

        <div className="mt-auto pt-3">
          <QuantityControl value={quantity} onDecrease={onDecrease} onIncrease={onIncrease} decreaseDisabled={quantity <= 0} increaseDisabled={!available} />
        </div>
      </div>
    </article>
  );
}
