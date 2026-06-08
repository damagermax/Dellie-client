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

export default function ProductCard({
  name,
  imageUrl,
  price,
  onIncrease,
}: ProductCardProps) {
  const [imageFailed, setImageFailed] = useState(false);
  const showPlaceholder = !imageUrl || imageFailed;

  return (
    <article
      onClick={onIncrease}
      className="group p-2 cursor-pointer flex h-full flex-col overflow-hidden rounded-2xl border border-gray-200/80 bg-white shadow-[0_10px_30px_rgba(15,23,42,0.05)] transition-transform duration-200 hover:-translate-y-0.5 hover:shadow-[0_14px_34px_rgba(15,23,42,0.08)]"
    >
      <div className="relative  aspect-[4/2.5] w-full rounded-lg   rounded-b-2xl overflow-clip! p-5! from-white to-gray-50">
        {showPlaceholder ? (
          <ProductImagePlaceholder label="Product image" />
        ) : (
          <NextImage
            src={imageUrl}
            alt={name}
            fill
            sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 16vw"
            className="object-cover scale-[1]  transition-transform duration-300 group-hover:scale-[1.02]"
            onError={() => setImageFailed(true)}
          />
        )}
      </div>

      <div className="flex flex-1 flex-col px-1 pt-2">
        <h3 className="line-clamp-1 -min-h-[48px] text-xs xl:text-[15px] text-gray-700">
          {name}
        </h3>

        {/* <div className="mt-2 hidden inline-flex hidden items-center rounded-full px-3 py-1 text-[12px] font-medium">
          <span className={`mr-2 h-2 w-2 rounded-full ${available ? "bg-[#34d399]" : "bg-[#fca5a5]"}`} />
          {available ? "Available" : "Not Available"}
        </div> */}

        <div className="  text-xs xl:text-[15px] font-semibold tracking-[-0.03em] text-[#121212]">
          {price}
        </div>

        <div className="">
          {/* <QuantityControl value={quantity} onDecrease={onDecrease} onIncrease={onIncrease} decreaseDisabled={quantity <= 0} increaseDisabled={!available} /> */}
        </div>
      </div>
    </article>
  );
}
