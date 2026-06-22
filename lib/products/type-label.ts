type ProductTypeLike = {
  type?: string | null;
  bundleItems?: unknown[] | null;
};

export function hasBundleComponents(product?: ProductTypeLike | null) {
  return Array.isArray(product?.bundleItems) && product.bundleItems.length > 0;
}

export function getProductTypeLabel(product?: ProductTypeLike | null) {
  const type = String(product?.type || "").toUpperCase();

  if (hasBundleComponents(product)) {
    if (type === "STOCK") return "Stock Bundle";
    if (type === "NON_STOCK") return "Non Stock Bundle";
  }

  return type ? type.replaceAll("_", " ").toLowerCase() : "product";
}

