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
  const subtotal = item.unitPrice * item.quantity;
  return item.discountType === "percent" ? (subtotal * item.discountValue) / 100 : item.discountValue;
}

export function getSavedCartTotal(savedCart: SavedPosCart) {
  const subtotal = (savedCart.cart || []).reduce((sum, item) => sum + item.unitPrice * item.quantity, 0);
  const discounts = (savedCart.cart || []).reduce((sum, item) => sum + lineDiscountAmount(item), 0);
  const taxableSubtotal = Math.max(subtotal - discounts, 0);
  const taxAmount =
    savedCart.selectedTax?.items?.reduce((sum, tax) => {
      return sum + taxableSubtotal * (Number(tax.value) / 100);
    }, 0) || 0;

  return Math.max(taxableSubtotal + taxAmount, 0);
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
  return ["STOCK", "PACKAGING", "BUNDLE"].includes(String(type || ""));
}

export function getProductImage(product: { imageUrl?: string | null; images?: string[] | null; media?: { url?: string | null }[] | null; productUrl?: string | null }) {
  return product.imageUrl || product.media?.[0]?.url || product.images?.[0] || product.productUrl || undefined;
}

export function getCartItem(cart: PosCartItem[], productId: string) {
  return cart.find((item) => item.productId === productId);
}

export function getCartTotals(cart: PosCartItem[], selectedTax?: Tax, payments: PosPaymentEntry[] = []) {
  const totalItems = cart.reduce((sum, item) => sum + item.quantity, 0);
  const subtotal = cart.reduce((sum, item) => sum + item.unitPrice * item.quantity, 0);
  const discounts = cart.reduce((sum, item) => sum + lineDiscountAmount(item), 0);
  const taxableSubtotal = Math.max(subtotal - discounts, 0);
  const taxAmount =
    selectedTax?.items.reduce((sum, tax) => {
      return sum + taxableSubtotal * (Number(tax.value) / 100);
    }, 0) || 0;
  const grandTotal = Math.max(taxableSubtotal + taxAmount, 0);
  const totalPaid = payments.reduce((sum, payment) => sum + Number(payment.amount || 0), 0);
  const balance = Math.max(grandTotal - totalPaid, 0);
  const change = Math.max(totalPaid - grandTotal, 0);

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
