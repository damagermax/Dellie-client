import { Sale } from "@/types/index";

export function saleApiError(error: any, fallback: string) {
  const message = error?.data?.message;
  return Array.isArray(message) ? message.join(" ") : message || fallback;
}

export function saleDocumentNumber(sale: Sale) {
  return sale.documentNumber || (sale.status === "draft" ? sale.quoteNumber || sale.saleNumber : sale.saleNumber || sale.quoteNumber) || "";
}

export function saleFulfillmentStatusLabel(status?: string) {
  if (status === "received") return "fulfilled";
  if (status === "partially_received") return "partially fulfilled";
  return (status || "pending").replaceAll("_", " ");
}

export function saleDetailFulfillmentStatusLabel(sale: Pick<Sale, "fulfillmentMethod" | "receiptStatus">) {
  const status = sale.receiptStatus || "pending";
  const method = sale.fulfillmentMethod;

  if (method === "delivery") {
    if (status === "received") return "Delivered";
    if (status === "partially_received") return "Partial delivery";
    return "Pending delivery";
  }

  if (method === "pickup") {
    if (status === "received") return "Picked up";
    if (status === "partially_received") return "Partial pickup";
    return "Pending pickup";
  }

  if (method === "now") {
    if (status === "received") return "Fulfilled";
    if (status === "partially_received") return "Partially fulfilled";
    return "Pending fulfillment";
  }

  if (method === "dine_in") {
    if (status === "received") return "Served";
    if (status === "partially_received") return "Partially served";
    return "Open dine-in";
  }

  return saleFulfillmentStatusLabel(status);
}

export function visibleSaleDeleteRestrictions(sale: Sale) {
  const restrictions: string[] = [];

  if (sale.locked) restrictions.push("it is locked");
  return restrictions;
}
