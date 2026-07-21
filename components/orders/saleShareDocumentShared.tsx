"use client";

import { formatDate } from "@/lib/dateUtils";
import { DEFAULT_DOCUMENTS_SETTINGS, StoreDocumentTemplateKey, StoreDocumentsSettings } from "@/types/store-settings";
import { Store } from "@/types/store";
import { Payment, TransactionType } from "@/types/transaction";
import { Sale } from "@/types/sale";

import { SaleDocumentType } from "@/components/settings/documentPreview";
import { getProductRefId } from "@/components/products/ResolvedProductName";
import { saleDocumentNumber } from "./saleUtils";

export function SaleDocumentPreviewFrame({
  fullscreenPreview,
  thermalReceipt,
  label,
  documentHtml,
}: {
  fullscreenPreview: boolean;
  thermalReceipt: boolean;
  label: string;
  documentHtml: string;
}) {
  return (
    <div className={`overflow-hidden ${fullscreenPreview ? "h-[calc(100dvh-188px)]" : "mt-4 border border-gray-200 bg-gray-50"}`}>
      <iframe title={`${label} preview`} srcDoc={documentHtml} className={`w-full bg-white ${fullscreenPreview ? "h-full" : thermalReceipt ? "h-[720px]" : "h-[760px]"}`} />
    </div>
  );
}

export function documentLabel(type: SaleDocumentType) {
  return type === "invoice" ? "Invoice" : "Receipt";
}

export function eligibleReceiptPayments(sale: Sale) {
  const payments = (Array.isArray(sale.payments) ? sale.payments : []) as Payment[];
  return payments.filter((payment) => payment.type === TransactionType.PAYMENT);
}

export function resolveTemplateKey(type: SaleDocumentType, source: string | undefined, documents?: Partial<StoreDocumentsSettings>): StoreDocumentTemplateKey {
  const settings = {
    ...DEFAULT_DOCUMENTS_SETTINGS,
    ...(documents || {}),
  };

  if (type === "invoice") {
    return settings.salesInvoiceTemplate;
  }

  return source === "POS" ? settings.posReceiptTemplate : settings.salesReceiptTemplate;
}

function saleTaxSummary(sale: Sale) {
  const summary = Object.entries(
    (sale.taxes || []).reduce<Record<string, number>>((amounts, tax) => {
      const name = sale.taxId ? `${tax.name} @${tax.value}%` : tax.name;
      amounts[name] = (amounts[name] || 0) + Number(tax.amount || 0);
      return amounts;
    }, {}),
  ).map(([name, amount]) => ({ name, amount }));

  if (summary.length) {
    return summary;
  }

  return Number(sale.taxAmount || 0) > 0 ? [{ name: "Taxes", amount: Number(sale.taxAmount) }] : [];
}

export function saleDocumentText(
  sale: Sale,
  store: Store | null,
  type: SaleDocumentType,
  resolvedNames: Record<string, string>,
) {
  const currency = sale.currencyId?.code || "";
  const label = documentLabel(type);
  const customer = sale.contactId?.name || sale.contactId?.displayName || "Walk-in customer";
  const paidAmount = Math.max(Number(sale.amount || 0) - Number(sale.balance || 0), 0);
  const taxLines = saleTaxSummary(sale).map((tax) => `${tax.name}: ${amount(currency, tax.amount)}`);
  const itemLines = sale.lineItems.map((line: Sale["lineItems"][number]) => {
    const refId = getProductRefId(line.productId);
    const name = resolvedNames[refId || ""] || resolvedNames[line.productName] || line.productName;
    return `${name} x ${line.quantity} @ ${amount(currency, line.unitPrice)} = ${amount(currency, line.total)}`;
  });

  return [
    store?.name || "Dellie",
    `${label} ${saleDocumentNumber(sale)}`,
    `Date: ${formatDate(sale.date)}`,
    `Customer: ${customer}`,
    `Source: ${sale.source || "Manual Sale"}`,
    "",
    ...itemLines,
    "",
    `Subtotal: ${amount(currency, sale.subTotal)}`,
    Number(sale.discountAmount || 0) > 0 ? `Discount: - ${amount(currency, sale.discountAmount)}` : undefined,
    ...taxLines,
    sale.fulfillmentMethod !== "pickup" && Number(sale.deliveryFee || 0) > 0 ? `Delivery Fee: ${amount(currency, sale.deliveryFee)}` : undefined,
    `Total: ${amount(currency, sale.amount)}`,
    type === "receipt" ? `Paid: ${amount(currency, paidAmount)}` : undefined,
    `Balance: ${amount(currency, sale.balance)}`,
  ]
    .filter((line) => line !== undefined)
    .join("\n");
}

function amount(currency: string, value: number | undefined) {
  const numeric = Number(value || 0);
  const prefix = numeric < 0 ? "-" : "";
  return `${prefix}${currency} ${Math.abs(numeric).toFixed(2)}`;
}
