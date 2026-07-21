"use client";

import type { Tax } from "@/types/index";
import type { PosCartItem, PosPaymentEntry, SavedPosCart } from "./types";

export const SAVED_CARTS_KEY = "dellie-pos-saved-carts";
export const POS_MODAL_OVERLAY_STYLE = {
  background: "rgba(28, 25, 23, 0.68)",
  backdropFilter: "blur(2px)",
};

export function uid() {
  return `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
}

export function roundMoney(value: number) {
  return Math.round((Number(value || 0) + Number.EPSILON) * 100) / 100;
}

export function buildTaxBreakdown(taxableSubtotal: number, tax?: Tax) {
  if (!tax?.items?.length) {
    return [];
  }

  const rawBreakdown = tax.items.map((rule) => {
    const rawAmount = taxableSubtotal * (Number(rule.value || 0) / 100);
    const roundedAmount = roundMoney(rawAmount);

    return {
      name: `${rule.name} @${rule.value}%`,
      value: Number(rule.value || 0),
      rawAmount,
      amount: roundedAmount,
      remainder: rawAmount - roundedAmount,
    };
  });

  const targetTotal = roundMoney(
    taxableSubtotal * (rawBreakdown.reduce((sum, taxRule) => sum + Number(taxRule.value || 0), 0) / 100),
  );
  let differenceInCents = Math.round((targetTotal - roundMoney(rawBreakdown.reduce((sum, rule) => sum + rule.amount, 0))) * 100);

  if (differenceInCents !== 0) {
    const orderedIndexes = rawBreakdown
      .map((rule, index) => ({ index, remainder: rule.remainder }))
      .sort((left, right) => (differenceInCents > 0 ? right.remainder - left.remainder : left.remainder - right.remainder));

    let cursor = 0;
    while (differenceInCents !== 0 && orderedIndexes.length) {
      const target = rawBreakdown[orderedIndexes[cursor % orderedIndexes.length].index];
      target.amount = roundMoney(target.amount + (differenceInCents > 0 ? 0.01 : -0.01));
      differenceInCents += differenceInCents > 0 ? -1 : 1;
      cursor += 1;
    }
  }

  return rawBreakdown.map((rule) => ({
    name: rule.name,
    value: rule.value,
    amount: roundMoney(rule.amount),
  }));
}

export function formatMoney(currency: string, value: number) {
  const amount = Number(value || 0).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 });
  return currency ? `${currency} ${amount}` : amount;
}

export function parseMoneyInput(value?: string) {
  const normalized = String(value ?? "").replace(/[^\d.-]/g, "");
  const parsed = Number(normalized);
  return Number.isFinite(parsed) ? parsed : 0;
}

export function isCashPaymentMethodName(name?: string) {
  return String(name || "").trim().toLowerCase() === "cash";
}

export function getLocalDayKey(date = new Date()) {
  const year = date.getFullYear();
  const month = `${date.getMonth() + 1}`.padStart(2, "0");
  const day = `${date.getDate()}`.padStart(2, "0");
  return `${year}-${month}-${day}`;
}

export function getTodayRange() {
  const start = new Date();
  start.setHours(0, 0, 0, 0);
  const end = new Date();
  end.setHours(23, 59, 59, 999);
  return { start: start.toISOString(), end: end.toISOString(), dayKey: getLocalDayKey(start) };
}

export function formatHistoryTime(value?: string) {
  if (!value) return "--";
  return new Date(value).toLocaleTimeString([], {
    hour: "numeric",
    minute: "2-digit",
  });
}

export function lineDiscountAmount(item: PosCartItem) {
  const subtotal = roundMoney(item.unitPrice * item.quantity);
  return roundMoney(item.discountType === "percent" ? (subtotal * item.discountValue) / 100 : item.discountValue);
}

function lineSubtotalAfterDiscount(item: PosCartItem) {
  const subtotal = roundMoney(item.unitPrice * item.quantity);
  const discountAmount = lineDiscountAmount(item);
  return roundMoney(Math.max(subtotal - discountAmount, 0));
}

export function getSavedCartTotal(savedCart: SavedPosCart) {
  const taxableSubtotal = roundMoney((savedCart.cart || []).reduce((sum, item) => sum + lineSubtotalAfterDiscount(item), 0));
  const taxAmount = roundMoney(buildTaxBreakdown(taxableSubtotal, savedCart.selectedTax).reduce((sum, tax) => sum + tax.amount, 0));

  return roundMoney(Math.max(taxableSubtotal + taxAmount, 0));
}

export function getSavedCartItemCount(savedCart: SavedPosCart) {
  return (savedCart.cart || []).reduce((sum, item) => sum + item.quantity, 0);
}

export function paymentStatus(total: number, paid: number) {
  if (paid <= 0) return "unpaid";
  if (paid >= total) return "paid";
  return "partial";
}

export function isTrackedInventory(type?: string) {
  return ["STOCK", "BUNDLE"].includes(String(type || ""));
}

export function getProductImage(product: { imageUrl?: string | null; images?: string[] | null; media?: { url?: string | null }[] | null; productUrl?: string | null }) {
  return product.imageUrl || product.media?.[0]?.url || product.images?.[0] || product.productUrl || undefined;
}

export function getCartItem(cart: PosCartItem[], productId: string) {
  return cart.find((item) => item.productId === productId);
}

export function getCartTotals(cart: PosCartItem[], selectedTax?: Tax, payments: PosPaymentEntry[] = []) {
  const totalItems = cart.reduce((sum, item) => sum + item.quantity, 0);
  const subtotal = roundMoney(cart.reduce((sum, item) => sum + roundMoney(item.unitPrice * item.quantity), 0));
  const discounts = roundMoney(cart.reduce((sum, item) => sum + lineDiscountAmount(item), 0));
  const taxableSubtotal = roundMoney(cart.reduce((sum, item) => sum + lineSubtotalAfterDiscount(item), 0));
  const taxAmount = roundMoney(buildTaxBreakdown(taxableSubtotal, selectedTax).reduce((sum, tax) => sum + tax.amount, 0));
  const grandTotal = roundMoney(Math.max(taxableSubtotal + taxAmount, 0));
  const totalPaid = roundMoney(payments.reduce((sum, payment) => sum + Number(payment.amount || 0), 0));
  const balance = roundMoney(Math.max(grandTotal - totalPaid, 0));
  const change = roundMoney(Math.max(totalPaid - grandTotal, 0));

  return {
    totalItems,
    subtotal,
    discounts,
    taxableSubtotal,
    taxAmount,
    grandTotal,
    totalPaid,
    balance,
    change,
  };
}
