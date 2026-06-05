import { Sale } from "@/types/index";

export function saleApiError(error: any, fallback: string) {
  const message = error?.data?.message;
  return Array.isArray(message) ? message.join(" ") : message || fallback;
}

export function saleDocumentNumber(sale: Sale) {
  return sale.documentNumber || (sale.status === "draft" ? sale.quoteNumber || sale.saleNumber : sale.saleNumber || sale.quoteNumber) || "";
}

export function visibleSaleDeleteRestrictions(sale: Sale) {
  const restrictions: string[] = [];

  if (sale.locked) restrictions.push("it is locked");
  return restrictions;
}
