"use client";

import { getProductRefId, useResolvedProductNameMap } from "@/components/products/ResolvedProductName";
import { Purchase } from "@/types/index";

export function usePurchaseReturnLines(purchase: Purchase) {
  const resolvedNames = useResolvedProductNameMap(
    purchase.lineItems.map((line) => ({
      id: getProductRefId(line.productId),
      name: line.productName,
    })),
  );

  return purchase.lineItems
    .filter((line) => productType(line) !== "BUNDLE")
    .map((line) => ({
      id: line.id,
      name: resolvedNames[getProductRefId(line.productId) || line.productName] || line.productName,
      sku: productSku(line),
      imageUrl: line.productUrl || productImage(line.productId),
      maxQuantity: Math.max(Number(line.fulfilledQuantity || 0) - Number(line.returnedQuantity || 0), 0),
    }))
    .filter((line) => line.maxQuantity > 0);
}

function productImage(product: Purchase["lineItems"][number]["productId"]) {
  return typeof product === "string" ? undefined : product.media?.[0]?.url;
}

function productSku(line: Purchase["lineItems"][number]) {
  return line.productSku || (typeof line.productId === "string" ? undefined : line.productId.sku);
}

function productType(line: Purchase["lineItems"][number]) {
  return typeof line.productId === "string" ? line.productType : line.productId.type || line.productType;
}
