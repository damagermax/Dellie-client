"use client";

import { Pencil } from "lucide-react";

import { ITEM_TYPE } from "@/components/products/ProductFormModal";
import type { ProductPriceTier } from "@/lib/products/pricing";

import type { ProductDetail } from "./types";
import { formatMargin, formatMoney, formatQuantity, getRequiredPriceTiers, priceTierDescription } from "./utils";

export function PricingCostOverviewCard({ product, canManageProduct, onEditProduct, enableTradePrice }: { product: ProductDetail; canManageProduct: boolean; onEditProduct: () => void; enableTradePrice: boolean }) {
  const summary = product.inventory?.summary || {};
  const tiers = getRequiredPriceTiers(product.priceTiers, enableTradePrice);

  return (
    <section className="overflow-hidden border-b border-gray-200 bg-[#f3f3f3] md:border-b-0 md:border-r">
      <div className="flex flex-wrap items-center justify-between gap-3 px-4 py-5 md:px-5">
        <h2 className="text-lg font-medium tracking-normal text-gray-900">Pricing &amp; Cost</h2>
      </div>
      <div className="mx-4 border-t border-gray-300" />
      <div className="grid gap-3 px-2 py-4">
        {tiers.map((tier, index) => (
          <PriceTierCard key={tier.name} tier={tier} costPrice={product.costPrice} isNormal={index === 0} canEdit={canManageProduct} onEdit={onEditProduct} />
        ))}
      </div>
      <div className={`mx-4 grid gap-2.5 py-4 ${product.type === ITEM_TYPE.STOCK ? "sm:grid-cols-2" : "sm:grid-cols-1"}`}>
        <CostMetric label="Cost" value={formatMoney(product.costPrice)} />
        {product.type === ITEM_TYPE.STOCK ? <CostMetric label="Inventory Value" value={formatMoney(summary.inventoryValue)} /> : null}
      </div>
    </section>
  );
}

function PriceTierCard({ tier, costPrice, isNormal, canEdit, onEdit }: { tier: ProductPriceTier; costPrice?: number; isNormal: boolean; canEdit: boolean; onEdit: () => void }) {
  return (
    <article className="overflow-hidden">
      <div className="flex gap-3 p-3">
        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap items-start justify-between gap-2.5">
            <div className="min-w-0">
              <h3 className="text-sm font-semibold text-gray-900">{tier.name}</h3>
              <p className="mt-0.5 text-xs text-gray-500">{priceTierDescription(tier.name, isNormal)}</p>
            </div>
            <div className="flex items-start gap-2">
              <p className="text-right text-lg font-medium tracking-normal text-gray-950">{formatMoney(tier.price)}</p>
              {canEdit ? (
                <button type="button" aria-label={`Edit ${tier.name}`} onClick={onEdit} className="mt-0.5 inline-flex h-7 w-7 items-center justify-center rounded-full bg-gray-100 text-gray-600 transition hover:bg-gray-200 hover:text-gray-900">
                  <Pencil size={13} />
                </button>
              ) : null}
            </div>
          </div>

          <div className="mt-3 grid grid-cols-3 overflow-hidden rounded-md border border-gray-100 bg-white/60">
            <TierStat label="MOQ" value={formatQuantity(tier.moq)} />
            <TierStat label="Discount" value={`${formatQuantity(tier.discountPercent)}%`} />
            <TierStat label="Margin" value={formatMargin(tier.price, costPrice)} />
          </div>
        </div>
      </div>
    </article>
  );
}

function TierStat({ label, value }: { label: string; value: string }) {
  return (
    <div className="border-r border-gray-200 px-2.5 py-1.5 last:border-r-0">
      <p className="text-[11px] font-medium uppercase tracking-[0.1em] text-gray-400">{label}</p>
      <p className="mt-0.5 text-sm font-semibold text-gray-900">{value}</p>
    </div>
  );
}

function CostMetric({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-md bg-white px-3 py-2.5">
      <p className="text-[11px] font-medium uppercase tracking-[0.1em] text-gray-400">{label}</p>
      <p className="mt-0.5 text-sm font-semibold text-gray-900">{value}</p>
    </div>
  );
}
