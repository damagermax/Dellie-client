"use client";

import dayjs from "dayjs";

import type { ProductListItem, Purchase, PurchaseDiscountType, Tax } from "@/types/index";

import type { ProductLineItem } from "./purchaseFormSections";

type PurchaseDiscountState = { discountValue: number; discountType: PurchaseDiscountType };

export function getDefaultPurchaseFormValues({
  defaultStoreCurrencyId,
  paymentTermsEnabled,
}: {
  defaultStoreCurrencyId?: string;
  paymentTermsEnabled: boolean;
}) {
  return { date: dayjs(), dueDate: paymentTermsEnabled ? dayjs() : undefined, currencyId: defaultStoreCurrencyId, rate: 1 };
}

export function getPurchaseFormValues(purchase: Purchase) {
  return {
    contactId: purchase.contactId?.id,
    date: dayjs(purchase.date),
    deliveryDate: purchase.deliveryDate ? dayjs(purchase.deliveryDate) : undefined,
    location: purchase.locationId?.id,
    currencyId: purchase.currencyId?.id,
    rate: purchase.rate || 1,
    paymentTerm: purchase.paymentTerms,
    dueDate: purchase.dueDate ? dayjs(purchase.dueDate) : undefined,
  };
}

export function mapPurchaseLineItems(purchase: Purchase): ProductLineItem[] {
  return purchase.lineItems.map((item) => ({
    id: typeof item.productId === "string" ? item.productId : item.productId.id,
    productName: item.productName,
    productImageUrl: item.productUrl || (typeof item.productId === "string" ? undefined : item.productId.media?.[0]?.url),
    quantity: item.quantity,
    unitPrice: item.unitPrice,
    weight: item.weight,
  }));
}

export function syncPurchaseLineItemTaxes({
  current,
  purchase,
  taxes,
  documentTax,
}: {
  current: ProductLineItem[];
  purchase: Purchase;
  taxes: Tax[];
  documentTax?: Tax;
}) {
  return current.map((item) => ({
    ...item,
    tax: documentTax ? undefined : taxes.find((tax) => tax.id === purchase.lineItems.find((line) => (typeof line.productId === "string" ? line.productId : line.productId.id) === item.id)?.taxId),
  }));
}

export function clearPurchaseLineItemTaxes(current: ProductLineItem[]) {
  return current.map((item) => ({ ...item, tax: undefined }));
}

export function calculatePurchaseLineTotal(item: ProductLineItem, rate: number) {
  const subtotal = item.quantity * item.unitPrice;
  const totalTaxRate = item.tax?.items?.reduce((sum, tax) => sum + tax.value, 0) || 0;
  const tax = subtotal * (totalTaxRate / 100);
  const total = subtotal + tax;
  const taxItems =
    item.tax?.items.map((tax) => ({
      name: tax.name,
      rate: tax.value,
      amount: (subtotal * tax.value) / 100,
    })) ?? [];

  return { subtotal, tax, total, baseTotal: total * rate, taxItems };
}

export function buildPurchaseSummary({
  lineItems,
  discount,
  selectedTax,
  rate,
}: {
  lineItems: ProductLineItem[];
  discount: PurchaseDiscountState;
  selectedTax?: Tax;
  rate: number;
}) {
  const lineTotals = lineItems.map((item) => calculatePurchaseLineTotal(item, rate));
  const itemsSubTotal = lineTotals.reduce((sum, line) => sum + line.subtotal, 0);
  const globalDiscount = discount.discountType === "percent" ? (itemsSubTotal * discount.discountValue) / 100 : discount.discountValue;
  const subTotal = Math.max(itemsSubTotal - globalDiscount, 0);
  const taxItems = selectedTax
    ? selectedTax.items.map((tax) => ({
        name: `${tax.name} @${tax.value}%`,
        amount: (subTotal * tax.value) / 100,
      }))
    : lineTotals.flatMap((line) => line.taxItems);

  const taxSummary = Object.entries(
    taxItems.reduce<Record<string, number>>((acc, tax) => {
      acc[tax.name] = (acc[tax.name] ?? 0) + tax.amount;
      return acc;
    }, {}),
  ).map(([name, amount]) => ({ name, amount }));

  const tax = taxSummary.reduce((sum, item) => sum + item.amount, 0);
  const total = subTotal + tax;

  return {
    itemsSubTotal,
    globalDiscount,
    subTotal,
    tax,
    total,
    baseTotal: total * rate,
    taxSummary,
  };
}

export function buildPurchasePayload({
  values,
  lineItems,
  discount,
  isDifferentProductTax,
  selectedTaxId,
  paymentTermsEnabled,
  multiCurrencyEnabled,
}: {
  values: {
    contactId: string;
    date: { toISOString: () => string };
    deliveryDate?: { toISOString: () => string };
    location: string;
    currencyId?: string;
    rate?: number;
    paymentTerm?: string;
    dueDate?: { toISOString: () => string };
  };
  lineItems: ProductLineItem[];
  discount: PurchaseDiscountState;
  isDifferentProductTax: boolean;
  selectedTaxId?: string;
  paymentTermsEnabled: boolean;
  multiCurrencyEnabled: boolean;
}) {
  const payload = {
    contactId: values.contactId,
    date: values.date.toISOString(),
    deliveryDate: values.deliveryDate?.toISOString(),
    locationId: values.location,
    discountValue: discount.discountValue,
    discountType: discount.discountType,
    taxId: isDifferentProductTax ? undefined : selectedTaxId,
    lineItems: lineItems.map((item) => ({
      productId: item.id,
      quantity: item.quantity,
      unitPrice: item.unitPrice,
      weight: Number(item.weight || 0),
      taxId: isDifferentProductTax ? item.tax?.id : undefined,
    })),
  };

  return {
    ...payload,
    ...(multiCurrencyEnabled ? { currencyId: values.currencyId, rate: Number(values.rate || 1) } : {}),
    ...(paymentTermsEnabled ? { paymentTerms: values.paymentTerm, dueDate: values.dueDate?.toISOString() } : {}),
  };
}

export function appendPurchaseLineItem(current: ProductLineItem[], product: ProductListItem) {
  const existingItem = current.find((item) => item.id === product.id);
  if (existingItem) {
    return current.map((item) => (item.id === product.id ? { ...item, quantity: item.quantity + 1 } : item));
  }

  return [
    ...current,
    {
      id: product.id,
      productName: product.name,
      productImageUrl: product.imageUrl,
      quantity: 1,
      unitPrice: Number(product.costPrice || 0),
      weight: 0,
    },
  ];
}
