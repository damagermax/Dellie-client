"use client";

import { ITEM_TYPE } from "@/components/products/ProductFormModal";

import { AvailableLocationsCard, InventoryOverviewCard } from "./inventory-overview-card";
import { PricingCostOverviewCard } from "./pricing-cost-overview-card";
import type { ProductDetail } from "./types";
import { numberValue } from "./utils";

export function OverviewSection({ product, canManageProduct, onEditProduct, enableTradePrice }: { product: ProductDetail; canManageProduct: boolean; onEditProduct: () => void; enableTradePrice: boolean }) {
  const stockLocations = product.type === ITEM_TYPE.STOCK ? product.inventory?.locations || [] : [];
  const totalOnHand = stockLocations.reduce((total, location) => total + numberValue(location.onHand), 0);
  const totalReserved = stockLocations.reduce((total, location) => total + numberValue(location.reserved), 0);
  const totalIncoming = stockLocations.reduce((total, location) => total + numberValue(location.incoming), 0);
  const maxQuantity = Math.max(...stockLocations.map((location) => numberValue(location.onHand) + numberValue(location.incoming)), 1);

  return (
    <div className="md:space-y-3 md:px-4 md:pt-0">
      <div className="grid overflow-clip md:rounded-lg xl:grid-cols-2">
        <PricingCostOverviewCard product={product} canManageProduct={canManageProduct} onEditProduct={onEditProduct} enableTradePrice={enableTradePrice} />
        {product.type === ITEM_TYPE.STOCK ? (
          <InventoryOverviewCard locations={stockLocations} maxQuantity={maxQuantity} totalOnHand={totalOnHand} totalReserved={totalReserved} totalIncoming={totalIncoming} />
        ) : (
          <AvailableLocationsCard locations={product.availableLocations || []} />
        )}
      </div>
    </div>
  );
}
