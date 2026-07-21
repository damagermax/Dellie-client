"use client";

import { getProductRefId, useResolvedProductNameMap } from "@/components/products/ResolvedProductName";
import { Sale } from "@/types/index";

export function useSaleReturnLines(sale: Sale) {
  const resolvedNames = useResolvedProductNameMap(
    sale.lineItems.map((line) => ({
      id: getProductRefId(line.productId),
      name: line.productName,
    })),
  );

  return sale.lineItems
    .map((line) => ({
      id: line.id,
      name: resolvedNames[getProductRefId(line.productId) || line.productName] || line.productName,
      sku: productSku(line),
      imageUrl: line.productUrl || productImage(line.productId),
      maxQuantity: Math.max(Number(line.fulfilledQuantity || 0) - Number(line.returnedQuantity || 0), 0),
    }))
    .filter((line) => line.maxQuantity > 0);
}

function productImage(product: Sale["lineItems"][number]["productId"]) {
  return typeof product === "string" ? undefined : product.media?.[0]?.url;
}

function productSku(line: Sale["lineItems"][number]) {
  return line.productSku || (typeof line.productId === "string" ? undefined : line.productId.sku);
}
