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
