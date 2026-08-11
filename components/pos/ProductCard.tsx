"use client";
import NextImage from "next/image";
import { useState } from "react";
import ProductImagePlaceholder from "@/components/ui/ProductImagePlaceholder";

type ProductCardProps = {
  name: string;
  imageUrl?: string;
  price: string;
  quantity: number;
  available: boolean;
  onDecrease: () => void;
  onIncrease: () => void;
};

export default function ProductCard({ name, imageUrl, price, quantity, available, onIncrease }: ProductCardProps) {
  const [imageFailed, setImageFailed] = useState(false);
  const showPlaceholder = !imageUrl || imageFailed;

  return (
    <article
      onClick={() => {
        if (available) {
          onIncrease();
        }
      }}
      className={`group flex h-full cursor-pointer flex-col overflow-hidden border bg-white transition-all duration-200 md:rounded-md ${available ? "border-gray-200 hover:border-[#2d837d]/40 md:hover:-translate-y-0.5" : "border-gray-200 bg-gray-50/70 opacity-70"}`}
    >
      <div className="relative aspect-square w-full overflow-hidden md:aspect-[4/2.8]">
        <div className="absolute left-2 top-2 z-10 flex items-center gap-1 md:left-3 md:top-3 md:gap-2">
          {!available ? <span className="bg-stone-900 px-2 py-1 text-[9px] font-semibold uppercase tracking-[0.08em] text-white md:rounded-full md:px-2.5 md:text-[10px]">Sold out</span> : null}
          {quantity > 0 ? <span className="bg-[#2d837d] px-2 py-1 text-[10px] font-bold text-white md:rounded-full md:px-2.5 md:font-semibold md:uppercase md:tracking-[0.12em]">{quantity}</span> : null}
        </div>

        {showPlaceholder ? (
          <div className="h-full w-full p-1 md:p-4">
            <ProductImagePlaceholder label="Product image" />
          </div>
        ) : (
          <NextImage
            src={imageUrl}
            alt={name}
            fill
            sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 16vw"
            className={`object-cover transition-transform duration-300 ${available ? "scale-[1] group-hover:scale-[1.03]" : "grayscale-[0.2]"}`}
            onError={() => setImageFailed(true)}
          />
        )}
      </div>

      <div className="flex flex-1 flex-col px-2 pb-2.5 pt-2 md:p-3">
        <div className="flex flex-1 flex-col-reverse justify-end">
          <p className="mt-1 text-xs font-semibold tracking-[-0.02em] text-[#236d68] md:text-sm md:text-stone-950">{price}</p>
          <h3 className="line-clamp-2 min-h-8 text-xs font-medium leading-4 text-stone-900 md:mt-1 md:min-h-0 md:text-sm">{name}</h3>
        </div>
      </div>
    </article>
  );
}
