import { Purchase } from "@/types/index";

export function purchaseApiError(error: any, fallback: string) {
  const message = error?.data?.message;
  return Array.isArray(message) ? message.join(" ") : message || fallback;
}

export function visiblePurchaseDeleteRestrictions(purchase: Purchase) {
  const restrictions: string[] = [];
  const toCents = (value: number) => Math.round(Number(value || 0) * 100);
  const hasReceivedStock =
    purchase.receiptStatus !== "pending" ||
    purchase.lineItems.some((line) => Number(line.fulfilledQuantity || 0) > 0) ||
    Boolean(purchase.fulfilledItems?.length);
  const hasReturnedStock =
    purchase.lineItems.some((line) => Number(line.returnedQuantity || 0) > 0) ||
    Boolean(purchase.returnedItems?.length);

  if (purchase.locked) restrictions.push("it is locked");
  if (hasReceivedStock) restrictions.push("stock has been received");
  if (hasReturnedStock) restrictions.push("stock has been returned");
  if (purchase.landedCosts?.length) restrictions.push("landed costs have been added");
  if (purchase.payments?.length || toCents(purchase.balance) !== toCents(purchase.amount)) {
    restrictions.push("payments have been recorded");
  }

  return restrictions;
}
