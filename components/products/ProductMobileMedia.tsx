"use client";

import type { ElementType } from "react";

import ProductImagePlaceholder from "@/components/ui/ProductImagePlaceholder";

interface ProductMobileMediaProps {
  imageUrl?: string;
  displayName: string;
  showPlaceholder: boolean;
  canManage: boolean;
  onOpenMedia?: () => void;
  onImageError: () => void;
}

export function ProductMobileMedia({ imageUrl, displayName, showPlaceholder, canManage, onOpenMedia, onImageError }: ProductMobileMediaProps) {
  const Wrapper = (canManage ? "button" : "div") as ElementType;

  return (
    <Wrapper
      {...(canManage ? { type: "button", onClick: onOpenMedia } : {})}
      className="group relative block h-[220px] w-full overflow-hidden border-b border-[#2d837d]/20 bg-white text-left outline-none sm:h-[240px]"
    >
      {showPlaceholder ? (
        <ProductImagePlaceholder label="Product image" />
      ) : (
        <img className="h-full w-full object-cover object-center" src={imageUrl} alt={displayName || "Product"} onError={onImageError} />
      )}

      {canManage ? (
        <span className="absolute bottom-3 right-3 rounded-full bg-white/92 px-3 py-1 text-[11px] font-medium text-[#2d837d] shadow-sm ring-1 ring-black/5 backdrop-blur-sm">
          Manage media
        </span>
      ) : null}
    </Wrapper>
  );
}
