"use client";

import type { FormInstance, MenuProps } from "antd";
import dayjs from "dayjs";

import { getLegacyPaymentTermDays } from "@/lib/payment-terms";
import type { PaymentTerm } from "@/types/payment-term";

export function getStoredUserStoreCurrency() {
  const user = typeof window !== "undefined" ? JSON.parse(localStorage.getItem("user") || "{}") : {};

  return {
    defaultStoreCurrencyId: user?.store?.currencyId as string | undefined,
    storeCurrencyId: user?.store?.currencyId as string | undefined,
    fallbackStoreCurrencyCode: (user?.store?.currency?.code || user?.store?.currencyCode || "") as string,
  };
}

export function resolveCurrencyCode({
  selectedCurrencyId,
  selectedCurrencyCode,
  storeCurrencyId,
  storeCurrencyCode,
}: {
  selectedCurrencyId?: string;
  selectedCurrencyCode?: string;
  storeCurrencyId?: string;
  storeCurrencyCode?: string;
}) {
  if (selectedCurrencyId && storeCurrencyId && selectedCurrencyId === storeCurrencyId) {
    return storeCurrencyCode || "";
  }

  return selectedCurrencyCode || storeCurrencyCode || "";
}

export function formatMoneyLabel(currency: string, amount: number) {
  return `${currency ? `${currency} ` : ""}${Number(amount || 0).toLocaleString(undefined, {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  })}`.trim();
}

export function buildDiscountOptions(currency: string, storeCurrencyCode: string): MenuProps["items"] {
  return [
    { key: "percent", label: "%" },
    { key: "fixed", label: currency || storeCurrencyCode || "Amount" },
  ];
}

export function updateDueDateFromPaymentTerm({
  form,
  paymentTerms,
  value,
}: {
  form: FormInstance;
  paymentTerms: PaymentTerm[] | undefined;
  value: string;
}) {
  const days = paymentTerms?.find((term) => term.code === value)?.days ?? getLegacyPaymentTermDays(value);
  const dateValue = form.getFieldValue("date");

  if (dateValue && typeof days === "number") {
    form.setFieldsValue({ dueDate: dayjs(dateValue).add(days, "day") });
  }
}
