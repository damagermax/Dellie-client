"use client";

import { AppModal } from "@/components/ui/AppModal";
import PreviewImage from "@/components/ui/PreviewImage";
import { getNormalPrice } from "@/lib/products/pricing";
import { ProductListItem } from "@/types/product";

type ProductVariantSelectorModalProps = {
  parent?: ProductListItem;
  onClose: () => void;
  onSelect: (variant: ProductListItem) => void;
  priceLabel?: (price: number) => string;
};

export function ProductVariantSelectorModal({ parent, onClose, onSelect, priceLabel }: ProductVariantSelectorModalProps) {
  const withParentName = (variant: ProductListItem) => {
    const parentName = parent?.name?.trim();
    const variantName = variant.name?.trim();

    if (!parentName || !variantName) {
      return variant;
    }

    const combinedName = variantName.startsWith(`${parentName} -`) ? variantName : `${parentName} - ${variantName}`;
    return { ...variant, name: combinedName };
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
      <div className="divide-y divide-gray-100 px-5 pb-5">
        {(parent?.variants || []).filter((variant) => variant.isAvailable !== false).map((variant) => (
          <button
            type="button"
            key={variant.id}
            onClick={() => onSelect(withParentName(variant))}
            className="flex w-full items-center justify-between gap-4 py-3 text-left transition hover:bg-gray-50"
          >
            <div className="flex min-w-0 items-center gap-3">
              <PreviewImage width={44} height={44} src={variant.imageUrl || parent?.imageUrl} />
              <div className="min-w-0">
                <p className="truncate font-medium text-gray-900">{parent?.name} - {variant.name}</p>
                <p className="text-xs text-gray-500">{variant.sku || "No SKU"} · {Number(variant.availableStock || 0)} available</p>
              </div>
            </div>
            <span className="shrink-0 text-sm font-semibold text-gray-800">{priceLabel ? priceLabel(getNormalPrice(variant)) : getNormalPrice(variant).toFixed(2)}</span>
          </button>
        ))}
      </div>
    </AppModal>
  );
}
