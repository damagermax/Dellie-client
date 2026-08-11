"use client";

import { useEffect, useMemo, useState } from "react";
import { AppModal } from "@/components/ui/AppModal";
import PreviewImage from "@/components/ui/PreviewImage";
import CompactQuantityControl from "@/components/pos/CompactQuantityControl";
import { getNormalPrice } from "@/lib/products/pricing";
import { ProductListItem } from "@/types/product";

type ProductVariantSelectorModalProps = {
  parent?: ProductListItem;
  onClose: () => void;
  onSelect: (variant: ProductListItem, quantity: number) => void;
  priceLabel?: (price: number) => string;
};

export function ProductVariantSelectorModal({ parent, onClose, onSelect, priceLabel }: ProductVariantSelectorModalProps) {
  const [quantities, setQuantities] = useState<Record<string, number>>({});

  const visibleVariants = useMemo(() => (parent?.variants || []).filter((variant) => variant.status !== "archived"), [parent?.variants]);

  useEffect(() => {
    setQuantities(
      visibleVariants.reduce<Record<string, number>>((accumulator, variant) => {
        accumulator[variant.id] = 0;
        return accumulator;
      }, {}),
    );
  }, [visibleVariants, parent?.id]);

  const withParentName = (variant: ProductListItem) => {
    const parentName = parent?.name?.trim();
    const variantName = variant.name?.trim();

    if (!parentName || !variantName) {
      return variant;
    }

    const combinedName = variantName.startsWith(`${parentName} -`) ? variantName : `${parentName} - ${variantName}`;
    return { ...variant, name: combinedName };
  };

  const updateQuantity = (variantId: string, delta: number, maxQuantity?: number) => {
    setQuantities((current) => {
      const nextQuantity = Math.max(0, (current[variantId] ?? 0) + delta);
      if (typeof maxQuantity === "number" && maxQuantity >= 0) {
        return {
          ...current,
          [variantId]: Math.min(nextQuantity, maxQuantity),
        };
      }

      return {
        ...current,
        [variantId]: nextQuantity,
      };
    });
  };

  return (
    <AppModal
      open={Boolean(parent)}
      toggle={onClose}
      title={`Select ${parent?.name || "product"} variant`}
      footer={null}
      width={560}
      overlayClassName="bg-[#1c1917]/70 backdrop-blur-[2px]"
    >
      <div className="px-5 pb-5">
        {visibleVariants.length ? (
          <div className="divide-y divide-gray-100">
            {visibleVariants.map((variant) => {
              const availableStock = Number(variant.availableStock || 0);
              const quantity = quantities[variant.id] ?? 0;
              const isSoldOut = availableStock <= 0;
              const canIncrease = !isSoldOut && quantity < availableStock;
              const selectedQuantity = quantity > 0 ? quantity : 1;
              const unitPrice = getNormalPrice(variant);

              return (
                <div key={variant.id} className="py-3">
                  <div className="flex items-start gap-3">
                    <PreviewImage width={44} height={44} src={variant.imageUrl || parent?.imageUrl} />
                    <div className="min-w-0 flex-1">
                      <div className="flex items-start justify-between gap-3">
                        <p className="min-w-0 flex-1 truncate font-medium text-gray-900">
                          {parent?.name} - {variant.name}
                        </p>
                        <p className="shrink-0 text-sm font-semibold text-gray-800">{priceLabel ? priceLabel(unitPrice) : unitPrice.toFixed(2)}</p>
                      </div>

                      <div className="mt-2 flex items-center justify-between gap-3">
                        <p className="min-w-0 text-xs text-gray-500">
                          Available {availableStock}
                          {isSoldOut ? " · Sold out" : ""}
                        </p>
                        <div className="w-[86px] shrink-0">
                          <CompactQuantityControl
                            value={quantity}
                            onDecrease={() => updateQuantity(variant.id, -1, availableStock || undefined)}
                            onIncrease={() => updateQuantity(variant.id, 1, availableStock || undefined)}
                            decreaseDisabled={quantity <= 0}
                            increaseDisabled={!canIncrease}
                          />
                        </div>
                      </div>
                    </div>
                  </div>

                  <button
                    type="button"
                    onClick={() => {
                      onSelect(withParentName(variant), selectedQuantity);
                      onClose();
                    }}
                    disabled={isSoldOut}
                    className="mt-3 flex w-full items-center justify-center rounded-md border border-[#2d837d] bg-[#2d837d] px-3 py-2 text-sm font-semibold text-white transition-colors hover:bg-[#256b66] disabled:cursor-not-allowed disabled:border-gray-200 disabled:bg-gray-200 disabled:text-gray-500"
                  >
                    {isSoldOut ? "Sold out" : `Add ${selectedQuantity}`}
                  </button>
                </div>
              );
            })}
          </div>
        ) : (
          <div className="px-2 py-10 text-center text-sm text-gray-500">No variants available.</div>
        )}
      </div>
    </AppModal>
  );
}
