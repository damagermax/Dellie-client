import { Sale } from "@/types/index";

export function saleApiError(error: any, fallback: string) {
  const message = error?.data?.message;
  return Array.isArray(message) ? message.join(" ") : message || fallback;
}

export function visibleSaleDeleteRestrictions(sale: Sale) {
  const adjustedBalance = Math.round(Number(sale.balance || 0) * 100) !== Math.round(Number(sale.amount || 0) * 100);
  const restrictions: string[] = [];

  if (sale.locked) restrictions.push("it is locked");
  if (sale.payments?.length || adjustedBalance) restrictions.push("payments have been recorded");
  return restrictions;
}
