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
      className={`group border  flex h-full cursor-pointer flex-col overflow-hidden  bg-white md:rounded-md  transition-all duration-200 ${available ? "border-gray-200/80  hover:-translate-y-0.5 hover:border-[#2d837d]/25 " : "border-gray-200 bg-gray-50/70 opacity-70"}`}
    >
      <div className="relative aspect-[4/2.8] w-full overflow-hidden ">
        <div className="absolute left-3 top-3 z-10 flex items-center gap-2">
          {!available ? <span className="rounded-full bg-stone-900 px-2.5 py-1 text-[10px] font-semibold uppercase tracking-[0.12em] text-white">Sold out</span> : null}
          {quantity > 0 ? <span className="rounded-full bg-[#2d837d] px-2.5 py-1 text-[10px] font-semibold uppercase tracking-[0.12em] text-white">x{quantity}</span> : null}
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

      <div className="flex flex-1 flex-col p-1 pb-2 md:p-3">
        <div className=" md:flex  flex-col-reverse">
          <p className="text-xs md:text-sm md:font-semibold tracking-[-0.02em] text-stone-950">{price}</p>

          <h3 className="line-clamp-1  text-xs md:text-sm  md:font-medium mt-1  text-stone-900">{name}</h3>
        </div>
      </div>
    </article>
  );
}
