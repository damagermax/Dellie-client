export type ProductPriceTier = {
  name: string;
  price: number;
  moq: number;
  discountPercent: number;
};

export type ProductWithPriceTiers = {
  priceTiers?: ProductPriceTier[];
  normalPrice?: number;
};

type ProductPriceDisplay = ProductWithPriceTiers & {
  formattedNormalPrice?: string;
  hasVariants?: boolean;
  variants?: unknown[];
  price?: string;
};

export const NORMAL_PRICE_TIER_NAME = "Normal Selling Price";
export const TRADE_PRICE_TIER_NAME = "Trade Price";

export function getNormalPrice(product?: ProductWithPriceTiers | null) {
  return Number(product?.priceTiers?.[0]?.price ?? product?.normalPrice ?? 0);
}

export function getProductPriceLabel(product: ProductPriceDisplay, currencyCode = "") {
  if (product.hasVariants || product.variants?.length) return "Variant pricing";

  return product.price || (currencyCode ? `${currencyCode} ${getNormalPrice(product).toFixed(2)}` : product.formattedNormalPrice || getNormalPrice(product).toFixed(2));
}

export function normalPriceTier(price = 0): ProductPriceTier {
  return {
    name: NORMAL_PRICE_TIER_NAME,
    price: Number(price || 0),
    moq: 1,
    discountPercent: 0,
  };
}

export function defaultPriceTiers(price = 0): ProductPriceTier[] {
  const value = Number(price || 0);
  return [
    normalPriceTier(value),
    {
      name: TRADE_PRICE_TIER_NAME,
      price: value,
      moq: 1,
      discountPercent: 0,
    },
  ];
}

export function getDefaultEditablePriceTiers(price = 0, enableTradePrice = true) {
  return enableTradePrice ? defaultPriceTiers(price) : [normalPriceTier(price)];
}

export function ensureDefaultPriceTiers(tiers: ProductPriceTier[], enableTradePrice = true) {
  const normal = tiers[0] || normalPriceTier(0);
  const extraTiers = tiers
    .slice(1)
    .filter((tier) => tier.name !== TRADE_PRICE_TIER_NAME && String(tier?.name || "").trim());

  if (!enableTradePrice) {
    return [{ ...normal, name: NORMAL_PRICE_TIER_NAME }, ...extraTiers];
  }

  const trade = tiers.find((tier) => tier.name === TRADE_PRICE_TIER_NAME) || {
    name: TRADE_PRICE_TIER_NAME,
    price: Number(normal.price || 0),
    moq: 1,
    discountPercent: 0,
  };

  return [{ ...normal, name: NORMAL_PRICE_TIER_NAME }, { ...trade, name: TRADE_PRICE_TIER_NAME }, ...extraTiers];
}

export function getEditablePriceTiers(product: { priceTiers?: ProductPriceTier[]; sellingPrice?: number }, enableTradePrice: boolean) {
  const source = product.priceTiers?.length ? product.priceTiers : getDefaultEditablePriceTiers(product.sellingPrice || 0, enableTradePrice);
  return ensureDefaultPriceTiers(source, enableTradePrice);
}

export function normalizePriceTierValues(values?: ProductPriceTier[], fallbackPrice = 0, enableTradePrice = true) {
  const tiers = ensureDefaultPriceTiers(values?.length ? values : getDefaultEditablePriceTiers(fallbackPrice, enableTradePrice), enableTradePrice);
  return tiers.map((tier, index) => ({
    name: index === 0 ? NORMAL_PRICE_TIER_NAME : index === 1 ? TRADE_PRICE_TIER_NAME : String(tier?.name || "").trim(),
    price: Number(tier?.price || 0),
    moq: Math.max(Number(tier?.moq || 1), 1),
    discountPercent: Math.max(Number(tier?.discountPercent || 0), 0),
  }));
}
