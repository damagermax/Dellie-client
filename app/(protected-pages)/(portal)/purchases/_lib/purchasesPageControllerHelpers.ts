"use client";

import type { Purchase, PurchaseQueryParams } from "@/types/index";

export function apiError(error: unknown, fallback: string) {
  const message = (error as { data?: { message?: string | string[] } })?.data?.message;
  return Array.isArray(message) ? message.join(" ") : message || fallback;
}

export function visibleDeleteRestrictions(purchase: Purchase) {
  const restrictions: string[] = [];
  const toCents = (value: number) => Math.round(Number(value || 0) * 100);
  const hasReceivedStock = purchase.receiptStatus !== "pending" || purchase.lineItems.some((line) => Number(line.fulfilledQuantity || 0) > 0) || Boolean(purchase.fulfilledItems?.length);

  if (purchase.locked) restrictions.push("it is locked");
  if (hasReceivedStock) restrictions.push("stock has been received");
  if (purchase.landedCosts?.length) restrictions.push("landed costs have been added");
  if (purchase.payments?.length || toCents(purchase.balance) !== toCents(purchase.amount)) {
    restrictions.push("payments have been recorded");
  }

  return restrictions;
}

export function countPurchaseFilters(query: PurchaseQueryParams) {
  return (
    Number(Boolean(query.status)) +
    Number(Boolean(query.fulfillmentStatus)) +
    Number(Boolean(query.paymentStatus)) +
    Number(Boolean(query.supplierId)) +
    Number(Boolean(query.dateFrom || query.dateTo)) +
    Number(Boolean(query.locationId))
  );
}

export function buildPurchaseDraftFilters(query: PurchaseQueryParams): PurchaseQueryParams {
  return {
    status: query.status,
    fulfillmentStatus: query.fulfillmentStatus,
    paymentStatus: query.paymentStatus,
    supplierId: query.supplierId,
    dateFrom: query.dateFrom,
    dateTo: query.dateTo,
    locationId: query.locationId,
  };
}

export function applyPurchaseFilters(current: PurchaseQueryParams, draftFilters: PurchaseQueryParams): PurchaseQueryParams {
  return {
    ...current,
    status: draftFilters.status,
    fulfillmentStatus: draftFilters.fulfillmentStatus,
    paymentStatus: draftFilters.paymentStatus,
    supplierId: draftFilters.supplierId,
    dateFrom: draftFilters.dateFrom,
    dateTo: draftFilters.dateTo,
    locationId: draftFilters.locationId,
    page: 1,
  };
}

export function clearPurchaseFilters(current: PurchaseQueryParams): PurchaseQueryParams {
  return {
    ...current,
    status: undefined,
    fulfillmentStatus: undefined,
    paymentStatus: undefined,
    supplierId: undefined,
    dateFrom: undefined,
    dateTo: undefined,
    locationId: undefined,
    page: 1,
  };
}
