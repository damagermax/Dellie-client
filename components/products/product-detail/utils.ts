"use client";

import dayjs from "dayjs";

import { NORMAL_PRICE_TIER_NAME, ProductPriceTier, TRADE_PRICE_TIER_NAME, defaultPriceTiers } from "@/lib/products/pricing";

import { InventoryBatch } from "./types";

export function saleSourceColor(source?: string) {
  if (source === "POS") return "green";
  if (source === "Online Store") return "blue";
  if (source === "Sales Order") return "gold";
  return "default";
}

export function receiptStatusColor(status?: string) {
  if (status === "received") return "green";
  if (status === "partially_received") return "gold";
  return "blue";
}

export function formatMoney(value: unknown) {
  const amount = Number(value || 0);
  return new Intl.NumberFormat("en-GH", {
    style: "currency",
    currency: "GHS",
    maximumFractionDigits: 2,
  }).format(amount);
}

export function getRequiredPriceTiers(tiers?: ProductPriceTier[], enableTradePrice = true) {
  const fallback = defaultPriceTiers(0);
  const normal = tiers?.[0] || fallback[0];
  if (!enableTradePrice) {
    return [{ ...normal, name: NORMAL_PRICE_TIER_NAME }];
  }
  const trade = tiers?.find((tier) => tier.name === TRADE_PRICE_TIER_NAME) || fallback[1];
  return [
    { ...normal, name: NORMAL_PRICE_TIER_NAME },
    { ...trade, name: TRADE_PRICE_TIER_NAME },
  ];
}

export function priceTierDescription(name: string, isNormal: boolean) {
  if (isNormal) return "Default customer-facing price";
  if (name === TRADE_PRICE_TIER_NAME) return "Trade and bulk customer price";
  return "Custom product price";
}

export function formatMargin(priceValue: unknown, costValue: unknown) {
  const price = numberValue(priceValue);
  if (price <= 0) return "0%";
  const margin = ((price - numberValue(costValue)) / price) * 100;
  return `${Math.round(margin)}%`;
}

export function numberValue(value: unknown) {
  const amount = Number(value || 0);
  return Number.isFinite(amount) ? amount : 0;
}

export function formatQuantity(value: unknown) {
  const amount = Number(value || 0);
  return new Intl.NumberFormat("en-GH", { maximumFractionDigits: 6 }).format(amount);
}

export function formatDate(value?: string | Date | null) {
  if (!value) return "-";
  const date = dayjs(value);
  return date.isValid() ? date.format("DD MMM YYYY") : "-";
}

export function formatBatchSource(value?: string | null) {
  if (!value) return "-";
  return value
    .split("_")
    .filter(Boolean)
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1).toLowerCase())
    .join(" ");
}

export function isExpiredBatch(batch: InventoryBatch) {
  if (!batch.expiryDate) return false;
  const expiry = dayjs(batch.expiryDate);
  return expiry.isValid() && expiry.endOf("day").isBefore(dayjs());
}

export function isExpiringSoonBatch(batch: InventoryBatch) {
  if (!batch.expiryDate) return false;
  const expiry = dayjs(batch.expiryDate);
  if (!expiry.isValid()) return false;
  if (isExpiredBatch(batch)) return false;
  return expiry.endOf("day").diff(dayjs(), "day") <= 30;
}

export function sortBatchesByPriority(a: InventoryBatch, b: InventoryBatch) {
  const aExpired = isExpiredBatch(a);
  const bExpired = isExpiredBatch(b);
  if (aExpired !== bExpired) return aExpired ? -1 : 1;

  const aExpiringSoon = isExpiringSoonBatch(a);
  const bExpiringSoon = isExpiringSoonBatch(b);
  if (aExpiringSoon !== bExpiringSoon) return aExpiringSoon ? -1 : 1;

  const aExpiry = a.expiryDate ? dayjs(a.expiryDate) : null;
  const bExpiry = b.expiryDate ? dayjs(b.expiryDate) : null;
  if (aExpiry?.isValid() && bExpiry?.isValid() && !aExpiry.isSame(bExpiry)) {
    return aExpiry.valueOf() - bExpiry.valueOf();
  }
  if (aExpiry?.isValid() && !bExpiry?.isValid()) return -1;
  if (!aExpiry?.isValid() && bExpiry?.isValid()) return 1;

  const aDate = a.sourceDate ? dayjs(a.sourceDate) : null;
  const bDate = b.sourceDate ? dayjs(b.sourceDate) : null;
  if (aDate?.isValid() && bDate?.isValid() && !aDate.isSame(bDate)) {
    return bDate.valueOf() - aDate.valueOf();
  }
  if (aDate?.isValid() && !bDate?.isValid()) return -1;
  if (!aDate?.isValid() && bDate?.isValid()) return 1;

  return (a.batchNumber || "").localeCompare(b.batchNumber || "");
}

export function getMutationErrorMessage(error: unknown, fallback: string) {
  if (typeof error === "object" && error !== null) {
    const data = (error as { data?: { message?: string | string[] } }).data;
    if (Array.isArray(data?.message)) return data.message[0] || fallback;
    if (typeof data?.message === "string" && data.message.trim()) return data.message;
  }
  return fallback;
}

export function isFormValidationError(error: unknown) {
  return typeof error === "object" && error !== null && "errorFields" in error;
}
