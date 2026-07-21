"use client";

import type { Payment, RefundItemInput, RefundItemSnapshot } from "@/types/transaction";
import type { Purchase } from "@/types/purchase";
import type { Sale } from "@/types/sale";

const QUANTITY_DECIMALS = 6;
type RefundableDocument = Sale | Purchase;

export type SaleRefundableLine = {
  lineItemId: string;
  productId?: string;
  productName: string;
  productSku?: string;
  returnedQuantity: number;
  alreadyRefundedQuantity: number;
  availableRefundableQuantity: number;
};

export type SaleRefundPreviewItem = RefundItemSnapshot & {
  returnedQuantity: number;
  alreadyRefundedQuantity: number;
  availableRefundableQuantity: number;
};

export type SaleRefundPreview = {
  remainingRetainedPaidAmount: number;
  originalRefundableMerchandiseAmount: number;
  selectedFullReturnedValue: number;
  paidRatio: number;
  totalRefundAmount: number;
  items: SaleRefundPreviewItem[];
};

function roundMoney(value: number) {
  return Math.round((Number(value || 0) + Number.EPSILON) * 100) / 100;
}

function roundQuantity(value: number) {
  return Number(Number(value || 0).toFixed(QUANTITY_DECIMALS));
}

function lineDiscountAmount(amount: number, value = 0, type: "fixed" | "percent" = "fixed") {
  if (!value) return 0;
  if (type === "percent") {
    return roundMoney(amount * (Number(value || 0) / 100));
  }

  return roundMoney(Math.min(Number(value || 0), amount));
}

function allocateTaxBreakdown(amount: number, taxes: Array<{ name?: string; value?: number }>) {
  if (!taxes.length || amount <= 0) return [];

  const raw = taxes.map((tax) => {
    const rawAmount = Number(amount || 0) * (Number(tax.value || 0) / 100);
    const roundedAmount = roundMoney(rawAmount);

    return {
      name: tax.name || "Tax",
      value: Number(tax.value || 0),
      amount: roundedAmount,
      remainder: rawAmount - roundedAmount,
    };
  });

  const targetTotal = roundMoney(raw.reduce((sum, tax) => sum + Number(amount || 0) * (tax.value / 100), 0));
  let diffInCents = Math.round((targetTotal - roundMoney(raw.reduce((sum, tax) => sum + tax.amount, 0))) * 100);

  if (diffInCents !== 0) {
    const ordered = raw
      .map((tax, index) => ({ index, remainder: tax.remainder }))
      .sort((left, right) => (diffInCents > 0 ? right.remainder - left.remainder : left.remainder - right.remainder));

    let cursor = 0;
    while (diffInCents !== 0 && ordered.length) {
      const target = raw[ordered[cursor % ordered.length].index];
      target.amount = roundMoney(target.amount + (diffInCents > 0 ? 0.01 : -0.01));
      diffInCents += diffInCents > 0 ? -1 : 1;
      cursor += 1;
    }
  }

  return raw.map((tax) => ({ name: tax.name, value: tax.value, amount: roundMoney(tax.amount) }));
}

function paymentRefundMode(payment?: Payment | null) {
  if (payment?.refundMode === "items" || payment?.refundMode === "manual") {
    return payment.refundMode;
  }

  return undefined;
}

function itemizedRefunds(payments: Payment[] = [], excludePaymentId?: string) {
  return payments.filter((payment) => payment.id !== excludePaymentId && payment.type === "refund" && paymentRefundMode(payment) === "items" && Array.isArray(payment.refundItems));
}

function lineId(line: Sale["lineItems"][number]) {
  return String(line.id);
}

function productId(line: Sale["lineItems"][number]) {
  return typeof line.productId === "string" ? line.productId : line.productId?.id;
}

function productName(line: Sale["lineItems"][number]) {
  return line.productName || (typeof line.productId === "string" ? "Item" : line.productId?.name) || "Item";
}

function productSku(line: Sale["lineItems"][number]) {
  return line.productSku || (typeof line.productId === "string" ? undefined : line.productId?.sku);
}

function lineTaxes(line: Sale["lineItems"][number]) {
  if (typeof line.taxRate === "number" && line.taxRate > 0) {
    return [{ name: line.taxDescription || "Tax", value: Number(line.taxRate || 0) }];
  }

  return [];
}

function paymentContribution(payment: Payment) {
  if (payment.type === "payment") return Number(payment.amount || 0);
  if (payment.type === "refund" || payment.type === "change") return -Number(payment.amount || 0);
  return 0;
}

function paymentSummary(payments: Payment[] = [], excludePaymentId?: string) {
  return roundMoney(
    payments.reduce((sum, payment) => {
      if (payment.id === excludePaymentId) return sum;
      return sum + paymentContribution(payment);
    }, 0),
  );
}

function lineOriginalMetrics(line: Sale["lineItems"][number], selectedQuantity: number, useFullQuantity = false) {
  const originalQuantity = Number(line.quantity || 0);
  const quantity = useFullQuantity ? originalQuantity : Number(selectedQuantity || 0);
  const ratio = originalQuantity > 0 ? quantity / originalQuantity : 0;
  const subtotal = roundMoney(quantity * Number(line.unitPrice || 0));

  const discountAmount =
    String(line.discountType || "fixed") === "percent"
      ? lineDiscountAmount(subtotal, Number(line.discountValue || 0), "percent")
      : roundMoney(Math.min(Number(line.discountValue || 0) * ratio, subtotal));

  const afterLineDiscount = roundMoney(subtotal - discountAmount);

  return {
    quantity,
    ratio,
    subtotal,
    discountAmount,
    afterLineDiscount,
  };
}

export function getRemainingRefundablePaidAmount(payments: Payment[] = [], excludePaymentId?: string) {
  return roundMoney(Math.max(paymentSummary(payments, excludePaymentId), 0));
}

export function getSaleRefundableLines(sale?: RefundableDocument, excludePaymentId?: string): SaleRefundableLine[] {
  if (!sale) return [];

  const refundedByLine = new Map<string, number>();
  for (const refund of itemizedRefunds(sale.payments || [], excludePaymentId)) {
    for (const item of refund.refundItems || []) {
      const key = String(item.lineItemId || "");
      if (!key) continue;
      refundedByLine.set(key, roundQuantity((refundedByLine.get(key) || 0) + Number(item.quantity || 0)));
    }
  }

  return sale.lineItems
    .map((line) => {
      const id = lineId(line);
      const returnedQuantity = roundQuantity(Number(line.returnedQuantity || 0));
      const alreadyRefundedQuantity = roundQuantity(refundedByLine.get(id) || 0);
      const availableRefundableQuantity = roundQuantity(Math.max(returnedQuantity - alreadyRefundedQuantity, 0));

      return {
        lineItemId: id,
        productId: productId(line),
        productName: productName(line),
        productSku: productSku(line),
        returnedQuantity,
        alreadyRefundedQuantity,
        availableRefundableQuantity,
      };
    })
    .filter((line) => line.returnedQuantity > 0);
}

export function computeSaleRefundPreview(sale?: RefundableDocument, selectedItems: RefundItemInput[] = [], excludePaymentId?: string): SaleRefundPreview {
  if (!sale) {
    return {
      remainingRetainedPaidAmount: 0,
      originalRefundableMerchandiseAmount: 0,
      selectedFullReturnedValue: 0,
      paidRatio: 0,
      totalRefundAmount: 0,
      items: [],
    };
  }

  const refundableLines = getSaleRefundableLines(sale, excludePaymentId);
  const refundableByLine = new Map(refundableLines.map((line) => [line.lineItemId, line]));
  const selectedByLine = new Map<string, number>();

  for (const item of selectedItems) {
    const id = String(item.lineItemId || "");
    if (!id) continue;
    selectedByLine.set(id, roundQuantity((selectedByLine.get(id) || 0) + Number(item.quantity || 0)));
  }

  const selectedLineRows = sale.lineItems
    .map((line) => {
      const info = refundableByLine.get(lineId(line));
      if (!info) return null;
      const quantity = roundQuantity(selectedByLine.get(info.lineItemId) || 0);
      if (quantity <= 0) return null;
      const cappedQuantity = roundQuantity(Math.min(quantity, info.availableRefundableQuantity));
      if (cappedQuantity <= 0) return null;

      return { line, info, quantity: cappedQuantity };
    })
    .filter(Boolean) as Array<{ line: Sale["lineItems"][number]; info: SaleRefundableLine; quantity: number }>;

  const originalLineSubTotals = sale.lineItems.map((line) => lineOriginalMetrics(line, Number(line.quantity || 0), true));
  const originalSubTotalAfterLineDiscount = roundMoney(originalLineSubTotals.reduce((sum, line) => sum + line.afterLineDiscount, 0));
  const originalDocumentDiscount =
    String(sale.discountType || "fixed") === "percent"
      ? lineDiscountAmount(originalSubTotalAfterLineDiscount, Number(sale.discountValue || 0), "percent")
      : roundMoney(Math.min(Number(sale.discountValue || 0), originalSubTotalAfterLineDiscount));
  const originalAfterDocumentDiscount = roundMoney(originalSubTotalAfterLineDiscount - originalDocumentDiscount);
  const originalTaxAmount = sale.taxId
    ? roundMoney(allocateTaxBreakdown(originalAfterDocumentDiscount, (sale.taxes || []).map((tax) => ({ name: tax.name, value: Number(tax.value || 0) }))).reduce((sum, tax) => sum + tax.amount, 0))
    : roundMoney(
        sale.lineItems.reduce((sum, line) => {
          const metrics = lineOriginalMetrics(line, Number(line.quantity || 0), true);
          return (
            sum +
            allocateTaxBreakdown(
              metrics.afterLineDiscount,
              lineTaxes(line),
            ).reduce((lineSum, tax) => lineSum + tax.amount, 0)
          );
        }, 0),
      );
  const originalRefundableMerchandiseAmount = roundMoney(originalAfterDocumentDiscount + originalTaxAmount);

  const selectedMetrics = selectedLineRows.map(({ line, info, quantity }) => {
    const metrics = lineOriginalMetrics(line, quantity);
    return {
      line,
      info,
      ...metrics,
    };
  });

  const selectedSubTotalAfterLineDiscount = roundMoney(selectedMetrics.reduce((sum, line) => sum + line.afterLineDiscount, 0));
  const selectedDocumentDiscount =
    String(sale.discountType || "fixed") === "percent"
      ? lineDiscountAmount(selectedSubTotalAfterLineDiscount, Number(sale.discountValue || 0), "percent")
      : originalSubTotalAfterLineDiscount > 0
        ? roundMoney(originalDocumentDiscount * (selectedSubTotalAfterLineDiscount / originalSubTotalAfterLineDiscount))
        : 0;
  const selectedAfterDocumentDiscount = roundMoney(selectedSubTotalAfterLineDiscount - selectedDocumentDiscount);

  const globalTaxes = sale.taxId
    ? allocateTaxBreakdown(selectedAfterDocumentDiscount, (sale.taxes || []).map((tax) => ({ name: tax.name, value: Number(tax.value || 0) })))
    : [];

  const perLineFullValues = selectedMetrics.map((entry) => {
    const lineTaxAmount = sale.taxId
      ? 0
      : roundMoney(
          allocateTaxBreakdown(
            entry.afterLineDiscount,
            lineTaxes(entry.line),
          ).reduce((sum, tax) => sum + tax.amount, 0),
        );

    const documentDiscountShare =
      selectedSubTotalAfterLineDiscount > 0
        ? roundMoney(selectedDocumentDiscount * (entry.afterLineDiscount / selectedSubTotalAfterLineDiscount))
        : 0;

    return {
      entry,
      computedSubtotal: entry.subtotal,
      computedDiscountAmount: roundMoney(entry.discountAmount + documentDiscountShare),
      computedTaxAmount: lineTaxAmount,
      fullItemValue: roundMoney(entry.afterLineDiscount - documentDiscountShare + lineTaxAmount),
      globalTaxShare: 0,
    };
  });

  if (sale.taxId && globalTaxes.length) {
    const totalGlobalTax = roundMoney(globalTaxes.reduce((sum, tax) => sum + tax.amount, 0));
    const totalBasis = roundMoney(perLineFullValues.reduce((sum, item) => sum + Math.max(item.entry.afterLineDiscount, 0), 0));
    let allocatedTax = 0;

    perLineFullValues.forEach((item, index) => {
      const share =
        index === perLineFullValues.length - 1
          ? roundMoney(totalGlobalTax - allocatedTax)
          : totalBasis > 0
            ? roundMoney(totalGlobalTax * (item.entry.afterLineDiscount / totalBasis))
            : 0;
      allocatedTax = roundMoney(allocatedTax + share);
      item.computedTaxAmount = share;
      item.globalTaxShare = share;
      item.fullItemValue = roundMoney(item.entry.afterLineDiscount - (item.computedDiscountAmount - item.entry.discountAmount) + share);
    });
  }

  const selectedFullReturnedValue = roundMoney(perLineFullValues.reduce((sum, item) => sum + item.fullItemValue, 0));
  const remainingRetainedPaidAmount = getRemainingRefundablePaidAmount(sale.payments || [], excludePaymentId);
  const paidRatio =
    originalRefundableMerchandiseAmount > 0
      ? Math.min(remainingRetainedPaidAmount / originalRefundableMerchandiseAmount, 1)
      : 0;
  const totalRefundAmount = roundMoney(selectedFullReturnedValue * paidRatio);

  const roundedItems = perLineFullValues.map((item) => {
    const rawRefundAmount = item.fullItemValue * paidRatio;
    return {
      ...item,
      rawRefundAmount,
      computedRefundAmount: roundMoney(rawRefundAmount),
      remainder: rawRefundAmount - roundMoney(rawRefundAmount),
    };
  });

  let differenceInCents = Math.round((totalRefundAmount - roundMoney(roundedItems.reduce((sum, item) => sum + item.computedRefundAmount, 0))) * 100);
  if (differenceInCents !== 0) {
    const ordered = roundedItems
      .map((item, index) => ({ index, remainder: item.remainder }))
      .sort((left, right) => (differenceInCents > 0 ? right.remainder - left.remainder : left.remainder - right.remainder));

    let cursor = 0;
    while (differenceInCents !== 0 && ordered.length) {
      const target = roundedItems[ordered[cursor % ordered.length].index];
      target.computedRefundAmount = roundMoney(target.computedRefundAmount + (differenceInCents > 0 ? 0.01 : -0.01));
      differenceInCents += differenceInCents > 0 ? -1 : 1;
      cursor += 1;
    }
  }

  return {
    remainingRetainedPaidAmount,
    originalRefundableMerchandiseAmount,
    selectedFullReturnedValue,
    paidRatio,
    totalRefundAmount,
    items: roundedItems.map((item) => ({
      lineItemId: item.entry.info.lineItemId,
      productId: item.entry.info.productId,
      productName: item.entry.info.productName,
      productSku: item.entry.info.productSku,
      quantity: item.entry.quantity,
      returnedQuantity: item.entry.info.returnedQuantity,
      alreadyRefundedQuantity: item.entry.info.alreadyRefundedQuantity,
      availableRefundableQuantity: item.entry.info.availableRefundableQuantity,
      computedFullItemValue: roundMoney(item.fullItemValue),
      computedRefundAmount: roundMoney(item.computedRefundAmount),
      computedSubtotal: roundMoney(item.computedSubtotal),
      computedDiscountAmount: roundMoney(item.computedDiscountAmount),
      computedTaxAmount: roundMoney(item.computedTaxAmount),
    })),
  };
}
