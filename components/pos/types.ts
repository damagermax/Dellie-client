"use client";

import type { Tax } from "@/types/index";
import type { PosOrderMethod } from "@/types/store-settings";

export type SelectedPosContact = {
  id: string;
  name: string;
} | null;

export type PosCartItem = {
  id: string;
  productId: string;
  name: string;
  sku: string;
  imageUrl?: string;
  type?: string;
  unitPrice: number;
  quantity: number;
  availableStock?: number;
  discountValue: number;
  discountType: "fixed" | "percent";
};

export type PosPaymentEntry = {
  id: string;
  paymentMethodId?: string;
  amount: number;
  reference?: string;
};

export const PAY_LATER_PAYMENT_METHOD_ID = "__pay_later__";

export type { PosOrderMethod };

export type SavedPosCart = {
  id: string;
  userId: string;
  dayKey: string;
  savedAt: string;
  cart: PosCartItem[];
  payments: PosPaymentEntry[];
  selectedTax?: Tax;
  categoryId?: string;
  searchValue?: string;
  selectedContact?: SelectedPosContact;
  formValues?: Record<string, unknown>;
};
