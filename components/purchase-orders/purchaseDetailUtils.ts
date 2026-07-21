import { Purchase } from "@/types/index";

export function purchaseApiError(error: any, fallback: string) {
  const message = error?.data?.message;
  return Array.isArray(message) ? message.join(" ") : message || fallback;
}

export function visiblePurchaseDeleteRestrictions(purchase: Purchase) {
  const restrictions: string[] = [];

  if (purchase.locked) restrictions.push("it is locked");
  return restrictions;
}
