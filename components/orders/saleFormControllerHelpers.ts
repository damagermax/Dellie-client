"use client";

import dayjs from "dayjs";

import type { Address } from "@/types/contact";
import type { PurchaseDiscountType, Sale, Tax } from "@/types/index";

import type { SaleFormLineItem } from "./saleFormSections";

type SaleDiscountState = { discountValue: number; discountType: PurchaseDiscountType };

export function normalizeSaleAddress(address?: Address | null): Address | undefined {
  if (!address) return undefined;

  const normalized = {
    street: address.street?.trim() || undefined,
    city: address.city?.trim() || undefined,
    state: address.state?.trim() || undefined,
    country: address.country?.trim() || undefined,
    postalCode: address.postalCode?.trim() || undefined,
  };

  return Object.values(normalized).some(Boolean) ? normalized : undefined;
}

export function serializeSaleAddress(address?: Address | null) {
  const normalized = normalizeSaleAddress(address);
  return normalized ? JSON.stringify(normalized) : undefined;
}

export function parseSerializedSaleAddress(value?: string) {
  if (!value) return undefined;

  try {
    return normalizeSaleAddress(JSON.parse(value) as Address);
  } catch {
    return undefined;
  }
}

export function formatSaleAddress(address?: Address | null) {
  const normalized = normalizeSaleAddress(address);
  if (!normalized) return "";

  return [normalized.street, normalized.city, normalized.state, normalized.postalCode, normalized.country].filter(Boolean).join(", ");
}

export function getDefaultSaleFormValues({
  defaultStoreCurrencyId,
  deliveryEnabled,
  pickupEnabled,
  paymentTermsEnabled,
}: {
  defaultStoreCurrencyId?: string;
  deliveryEnabled: boolean;
  pickupEnabled: boolean;
  paymentTermsEnabled: boolean;
}) {
  const defaultFulfillmentMethod = deliveryEnabled ? "delivery" : pickupEnabled ? "pickup" : "delivery";

  return {
    date: dayjs(),
    dueDate: paymentTermsEnabled ? dayjs() : undefined,
    currencyId: defaultStoreCurrencyId,
    rate: 1,
    fulfillmentMethod: defaultFulfillmentMethod,
  };
}

export function getSaleFormValues(sale: Sale) {
  return {
    contactId: sale.contactId?.id,
    date: dayjs(sale.date),
    fulfillmentMethod: sale.fulfillmentMethod || "delivery",
    deliveryDate: sale.deliveryDate ? dayjs(sale.deliveryDate) : undefined,
    deliveryAddress: serializeSaleAddress(sale.deliveryAddress),
    location: sale.locationId?.id,
    currencyId: sale.currencyId?.id,
    rate: sale.rate || 1,
    paymentTerm: sale.paymentTerms,
    dueDate: sale.dueDate ? dayjs(sale.dueDate) : undefined,
  };
}

export function mapSaleLineItems(sale: Sale): SaleFormLineItem[] {
  return sale.lineItems.map((item) => ({
    id: typeof item.productId === "string" ? item.productId : item.productId.id,
    productName: item.productName,
    productSku: item.productSku || (typeof item.productId === "string" ? undefined : item.productId.sku),
    productImageUrl: item.productUrl || (typeof item.productId === "string" ? undefined : item.productId.media?.[0]?.url),
    quantity: item.quantity,
    unitPrice: item.unitPrice,
    discountValue: item.discountValue,
    discountType: item.discountType,
  }));
}

export function syncSaleLineItemTaxes({
  current,
  sale,
  taxes,
  documentTax,
}: {
  current: SaleFormLineItem[];
  sale: Sale;
  taxes: Tax[];
  documentTax?: Tax;
}) {
  return current.map((item) => ({
    ...item,
    tax: documentTax
      ? undefined
      : taxes.find(
          (tax) =>
            tax.id === sale.lineItems.find((line) => (typeof line.productId === "string" ? line.productId : line.productId.id) === item.id)?.taxId,
        ),
  }));
}

export function clearSaleLineItemTaxes(current: SaleFormLineItem[]) {
  return current.map((item) => ({ ...item, tax: undefined }));
}

export function calculateSaleLineTotal(item: SaleFormLineItem) {
  const subtotal = item.quantity * item.unitPrice;
  const discountAmount = item.discountType === "percent" ? (subtotal * (item.discountValue || 0)) / 100 : item.discountValue || 0;
  const discountedSubtotal = Math.max(subtotal - discountAmount, 0);
  const taxItems =
    item.tax?.items.map((tax) => ({
      name: tax.name,
      amount: (discountedSubtotal * tax.value) / 100,
    })) || [];

  return {
    subtotal,
    discountAmount,
    discountedSubtotal,
    tax: taxItems.reduce((sum, itemTax) => sum + itemTax.amount, 0),
    taxItems,
  };
}

export function buildSaleSummary({
  lineItems,
  discount,
  selectedTax,
  deliveryFee,
  fulfillmentMethod,
  rate,
}: {
  lineItems: SaleFormLineItem[];
  discount: SaleDiscountState;
  selectedTax?: Tax;
  deliveryFee: number;
  fulfillmentMethod: "delivery" | "pickup";
  rate: number;
}) {
  const itemsTotal = lineItems.reduce((sum, item) => sum + calculateSaleLineTotal(item).discountedSubtotal, 0);
  const discountAmount = discount.discountType === "percent" ? (itemsTotal * discount.discountValue) / 100 : discount.discountValue;
  const subtotal = Math.max(itemsTotal - discountAmount, 0);
  const taxItems = selectedTax ? selectedTax.items.map((tax) => ({ name: `${tax.name} @${tax.value}%`, amount: (subtotal * tax.value) / 100 })) : lineItems.flatMap((item) => calculateSaleLineTotal(item).taxItems);
  const taxSummary = Object.entries(
    taxItems.reduce<Record<string, number>>((amounts, tax) => {
      amounts[tax.name] = (amounts[tax.name] || 0) + tax.amount;
      return amounts;
    }, {}),
  ).map(([name, amount]) => ({ name, amount }));
  const taxAmount = taxSummary.reduce((sum, tax) => sum + tax.amount, 0);
  const appliedDeliveryFee = fulfillmentMethod === "pickup" ? 0 : Number(deliveryFee || 0);
  const total = subtotal + taxAmount + appliedDeliveryFee;

  return {
    itemsTotal,
    discountAmount,
    subtotal,
    taxSummary,
    appliedDeliveryFee,
    total,
    baseTotal: total * rate,
  };
}

export function buildSalePayload({
  values,
  lineItems,
  discount,
  deliveryFee,
  differentProductTax,
  selectedTaxId,
  mode,
  paymentTermsEnabled,
  multiCurrencyEnabled,
}: {
  values: {
    contactId: string;
    date: { toISOString: () => string };
    fulfillmentMethod?: "delivery" | "pickup";
    deliveryDate?: { toISOString: () => string };
    deliveryAddress?: string;
    location: string;
    currencyId?: string;
    rate?: number;
    paymentTerm?: string;
    dueDate?: { toISOString: () => string };
  };
  lineItems: SaleFormLineItem[];
  discount: SaleDiscountState;
  deliveryFee: number;
  differentProductTax: boolean;
  selectedTaxId?: string;
  mode: "sale" | "quote";
  paymentTermsEnabled: boolean;
  multiCurrencyEnabled: boolean;
}) {
  const payload = {
    contactId: values.contactId,
    date: values.date.toISOString(),
    fulfillmentMethod: values.fulfillmentMethod || "delivery",
    deliveryDate: values.deliveryDate?.toISOString(),
    deliveryAddress: values.fulfillmentMethod === "pickup" ? undefined : parseSerializedSaleAddress(values.deliveryAddress),
    locationId: values.location,
    status: mode === "quote" ? ("draft" as const) : ("open" as const),
    discountValue: discount.discountValue,
    discountType: discount.discountType,
    deliveryFee: values.fulfillmentMethod === "pickup" ? 0 : Number(deliveryFee || 0),
    taxId: differentProductTax ? undefined : selectedTaxId,
    lineItems: lineItems.map((item) => ({
      productId: item.id,
      quantity: item.quantity,
      unitPrice: item.unitPrice,
      discountValue: item.discountValue,
      discountType: item.discountType,
      taxId: differentProductTax ? item.tax?.id : undefined,
    })),
  };

  return {
    ...payload,
    ...(multiCurrencyEnabled ? { currencyId: values.currencyId, rate: Number(values.rate || 1) } : {}),
    ...(paymentTermsEnabled ? { paymentTerms: values.paymentTerm, dueDate: values.dueDate?.toISOString() } : {}),
  };
}
