"use client";

import { Button, Divider, Modal, Tag, message } from "antd";
import { Printer, Share2 } from "lucide-react";
import { useSelector } from "react-redux";
import { formatDate } from "@/lib/dateUtils";
import { useGetPaymentTermsQuery } from "@/lib/redux/services";
import { getPaymentTermLabel } from "@/lib/payment-terms";
import { RootState } from "@/lib/store";
import { Sale, Store } from "@/types/index";
import { PaymentTerm } from "@/types/payment-term";
import { saleDocumentNumber } from "./saleUtils";
import { getProductRefId, useResolvedProductNameMap } from "@/components/products/ResolvedProductName";

export type SaleDocumentType = "invoice" | "receipt";
export type SaleDocumentPaperSize = "compact" | "full_page";

interface SaleShareDocumentModalProps {
  open: boolean;
  toggle: () => void;
  sale: Sale;
  type: SaleDocumentType;
  paperSize?: SaleDocumentPaperSize;
}

function amount(currency: string, value: number | undefined) {
  const amount = Number(value || 0);
  const prefix = amount < 0 ? "-" : "";
  return `${prefix}${currency} ${Math.abs(amount).toFixed(2)}`;
}

function documentLabel(type: SaleDocumentType) {
  return type === "invoice" ? "Invoice" : "Receipt";
}

function escapeHtml(value: string | number | undefined) {
  return String(value ?? "")
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#39;");
}

function saleDocumentText(sale: Sale, store: Store | null, type: SaleDocumentType, resolvedNames: Record<string, string>) {
  const currency = sale.currencyId?.code || "";
  const label = documentLabel(type);
  const customer = sale.contactId?.name || sale.contactId?.displayName || "Walk-in customer";
  const itemLines = sale.lineItems.map(
    (line) => `${resolvedNames[getProductRefId(line.productId) || line.productName] || line.productName} x ${line.quantity} @ ${amount(currency, line.unitPrice)} = ${amount(currency, line.total)}`,
  );

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
    Number(sale.taxAmount || 0) > 0 ? `Tax: ${amount(currency, sale.taxAmount)}` : undefined,
    `Total: ${amount(currency, sale.amount)}`,
    type === "receipt" ? `Paid: ${amount(currency, Number(sale.amount) - Number(sale.balance))}` : undefined,
    `Balance: ${amount(currency, sale.balance)}`,
  ]
    .filter((line) => line !== undefined)
    .join("\n");
}

function printableDocument(sale: Sale, store: Store | null, type: SaleDocumentType, paperSize: SaleDocumentPaperSize, resolvedNames: Record<string, string>, paymentTerms: PaymentTerm[] = []) {
  const label = documentLabel(type);
  const currency = sale.currencyId?.code || "";
  const customer = sale.contactId?.name || sale.contactId?.displayName || "Walk-in customer";
  const compactReceipt = type === "receipt" && paperSize === "compact";
  const taxRows = (sale.taxes || [])
    .map((tax) => `<tr><td>${escapeHtml(tax.name)}</td><td class="right">${escapeHtml(amount(currency, tax.amount))}</td></tr>`)
    .join("");
  const rows = sale.lineItems
    .map(
      (line) => `<tr>
        <td>${escapeHtml(resolvedNames[getProductRefId(line.productId) || line.productName] || line.productName)}${line.productSku ? `<div class="muted">SKU: ${escapeHtml(line.productSku)}</div>` : ""}</td>
        <td class="right">${escapeHtml(line.quantity)}</td>
        <td class="right">${escapeHtml(amount(currency, line.unitPrice))}</td>
        <td class="right">${escapeHtml(amount(currency, line.total))}</td>
      </tr>`,
    )
    .join("");

  return `<!doctype html>
<html>
  <head>
    <meta charset="utf-8" />
    <title>${label} ${escapeHtml(saleDocumentNumber(sale))}</title>
    <style>
      * { box-sizing: border-box; }
      body { color: #111827; font: ${compactReceipt ? "12px" : "14px"} Arial, sans-serif; margin: 0; padding: ${compactReceipt ? "16px" : "42px"}; }
      h1 { font-size: ${compactReceipt ? "18px" : "25px"}; font-weight: 600; margin: 0 0 5px; }
      h2 { font-size: ${compactReceipt ? "16px" : "21px"}; margin: 0; text-transform: uppercase; }
      .sheet { margin: 0 auto; max-width: ${compactReceipt ? "300px" : "100%"}; }
      .top { align-items: start; border-bottom: 1px solid #e5e7eb; display: flex; justify-content: space-between; gap: 16px; padding-bottom: ${compactReceipt ? "16px" : "24px"}; }
      .muted { color: #6b7280; font-size: ${compactReceipt ? "11px" : "12px"}; margin-top: 4px; }
      .meta { display: flex; flex-direction: ${compactReceipt ? "column" : "row"}; gap: ${compactReceipt ? "12px" : "0"}; justify-content: space-between; margin: ${compactReceipt ? "18px 0" : "28px 0"}; }
      .meta p { margin: 5px 0; }
      table { border-collapse: collapse; width: 100%; }
      th { background: #f3f4f6; color: #4b5563; font-size: 12px; text-align: left; text-transform: uppercase; }
      th, td { border-bottom: 1px solid #e5e7eb; padding: ${compactReceipt ? "8px 6px" : "12px 10px"}; }
      .right { text-align: right; }
      .summary { margin: 24px 0 0 auto; width: ${compactReceipt ? "100%" : "290px"}; }
      .summary td { border: 0; padding: 5px 0; }
      .total td { border-top: 1px solid #d1d5db; font-size: 16px; font-weight: 600; padding-top: 12px; }
      .footer { border-top: 1px solid #e5e7eb; color: #6b7280; margin-top: ${compactReceipt ? "24px" : "55px"}; padding-top: 18px; text-align: center; }
      @media print {
        body { padding: 0; }
        @page { margin: ${compactReceipt ? "8mm" : "18mm"}; size: ${compactReceipt ? "80mm auto" : "auto"}; }
      }
    </style>
  </head>
  <body>
    <div class="sheet">
      <div class="top">
        <div><h1>${escapeHtml(store?.name || "Dellie")}</h1><div class="muted">Sales document</div></div>
        <div class="right"><h2>${label}</h2><p>${escapeHtml(saleDocumentNumber(sale))}</p></div>
      </div>
        <div class="meta">
          <div><div class="muted">${type === "invoice" ? "BILL TO" : "CUSTOMER"}</div><p><strong>${escapeHtml(customer)}</strong></p><p>${escapeHtml(sale.contactId?.email)}</p><p>${escapeHtml(sale.contactId?.phone)}</p></div>
        <div class="right"><p><span class="muted">Date:</span> ${escapeHtml(formatDate(sale.date))}</p><p><span class="muted">Due:</span> ${escapeHtml(formatDate(sale.dueDate))}</p><p><span class="muted">Location:</span> ${escapeHtml(sale.locationId?.name || "-")}</p><p><span class="muted">Source:</span> ${escapeHtml(sale.source || "Manual Sale")}</p></div>
        </div>
      <table>
        <thead><tr><th>Item</th><th class="right">Qty</th><th class="right">Unit Price</th><th class="right">Amount</th></tr></thead>
        <tbody>${rows}</tbody>
      </table>
      <table class="summary">
        <tr><td>Subtotal</td><td class="right">${escapeHtml(amount(currency, sale.subTotal))}</td></tr>
        ${Number(sale.discountAmount || 0) > 0 ? `<tr><td>Discount</td><td class="right">- ${escapeHtml(amount(currency, sale.discountAmount))}</td></tr>` : ""}
        ${taxRows}
        <tr class="total"><td>Total</td><td class="right">${escapeHtml(amount(currency, sale.amount))}</td></tr>
        ${type === "receipt" ? `<tr><td>Paid</td><td class="right">${escapeHtml(amount(currency, Number(sale.amount) - Number(sale.balance)))}</td></tr>` : ""}
        <tr><td>Balance</td><td class="right">${escapeHtml(amount(currency, sale.balance))}</td></tr>
      </table>
      <div class="footer">${type === "receipt" ? "Thank you for your business." : `Payment terms: ${escapeHtml(getPaymentTermLabel(sale.paymentTerms, paymentTerms))}`}</div>
    </div>
  </body>
</html>`;
}

export default function SaleShareDocumentModal({ open, toggle, sale, type, paperSize = "full_page" }: SaleShareDocumentModalProps) {
  const store = useSelector((state: RootState) => state.currentUser.store);
  const { data: paymentTerms } = useGetPaymentTermsQuery();
  const resolvedNames = useResolvedProductNameMap(
    sale.lineItems.map((line) => ({
      id: getProductRefId(line.productId),
      name: line.productName,
    })),
  );
  const label = documentLabel(type);
  const currency = sale.currencyId?.code || "";
  const paid = Number(sale.amount) - Number(sale.balance);

  const handleShare = async () => {
    const text = saleDocumentText(sale, store, type, resolvedNames);
    const html = printableDocument(sale, store, type, paperSize, resolvedNames, paymentTerms || []);
    const file = new File([html], `${label.toLowerCase()}-${saleDocumentNumber(sale)}.html`, { type: "text/html" });

    try {
      if (navigator.share) {
        if (navigator.canShare?.({ files: [file] })) {
          await navigator.share({ title: `${label} ${saleDocumentNumber(sale)}`, text, files: [file] });
        } else {
          await navigator.share({ title: `${label} ${saleDocumentNumber(sale)}`, text });
        }
        return;
      }
      await navigator.clipboard.writeText(text);
      message.success(`${label} copied. It is ready to share.`);
    } catch (error) {
      if ((error as Error)?.name !== "AbortError") {
        message.error(`${label} could not be shared.`);
      }
    }
  };

  const handlePrint = () => {
    const printWindow = window.open("", "_blank", "width=860,height=920");
    if (!printWindow) {
      message.error("Allow pop-ups to print this document.");
      return;
    }
    printWindow.document.write(printableDocument(sale, store, type, paperSize, resolvedNames, paymentTerms || []));
    printWindow.document.close();
    printWindow.focus();
    printWindow.addEventListener("load", () => printWindow.print());
  };

  return (
    <Modal
      open={open}
      onCancel={toggle}
      title={`Share ${label}`}
      width={paperSize === "compact" && type === "receipt" ? 420 : 760}
      footer={[
        <Button key="print" icon={<Printer size={15} />} onClick={handlePrint}>
          Print / Save PDF
        </Button>,
        <Button key="share" type="primary" icon={<Share2 size={15} />} onClick={handleShare}>
          Share {label}
        </Button>,
      ]}
    >
      <div className={`mt-5 rounded border border-gray-200 bg-white ${paperSize === "compact" && type === "receipt" ? "mx-auto max-w-[320px] p-4" : "p-7"}`}>
        <div className="mb-7 flex items-start justify-between border-b border-gray-200 pb-5">
          <div>
            <p className="text-xl font-semibold text-gray-900">{store?.name || "Dellie"}</p>
            <p className="mt-1 text-xs text-gray-500">Sales document</p>
          </div>
          <div className="text-right">
            <p className="text-lg font-semibold uppercase text-gray-900">{label}</p>
            <p className="text-sm text-gray-500">{saleDocumentNumber(sale)}</p>
            <p className="mt-1 text-xs uppercase tracking-[0.16em] text-gray-400">{sale.source || "Manual Sale"}</p>
          </div>
        </div>

        <div className="mb-7 flex justify-between text-sm">
          <div>
            <p className="mb-2 text-xs uppercase text-gray-500">{type === "invoice" ? "Bill To" : "Customer"}</p>
            <p className="font-medium">{sale.contactId?.name || sale.contactId?.displayName || "Walk-in customer"}</p>
            {sale.contactId?.email && <p className="text-gray-500">{sale.contactId.email}</p>}
            {sale.contactId?.phone && <p className="text-gray-500">{sale.contactId.phone}</p>}
          </div>
          <div className="text-right text-gray-600">
            <p>Date: {formatDate(sale.date)}</p>
            <p>Due: {formatDate(sale.dueDate)}</p>
            <p>Location: {sale.locationId?.name || "-"}</p>
            <p>Source: {sale.source || "Manual Sale"}</p>
          </div>
        </div>

        <table className="w-full text-sm">
          <thead className="bg-gray-50 text-xs uppercase text-gray-500">
            <tr>
              <th className="px-3 py-3 text-left">Item</th>
              <th className="px-3 py-3 text-right">Qty</th>
              <th className="px-3 py-3 text-right">Price</th>
              <th className="px-3 py-3 text-right">Amount</th>
            </tr>
          </thead>
          <tbody>
            {sale.lineItems.map((line) => (
              <tr key={line.id} className="border-b border-gray-100">
                <td className="px-3 py-3">
                  {resolvedNames[getProductRefId(line.productId) || line.productName] || line.productName}
                  {line.productSku && <p className="text-xs text-gray-500">SKU: {line.productSku}</p>}
                </td>
                <td className="px-3 py-3 text-right">{line.quantity}</td>
                <td className="px-3 py-3 text-right">{amount(currency, line.unitPrice)}</td>
                <td className="px-3 py-3 text-right">{amount(currency, line.total)}</td>
              </tr>
            ))}
          </tbody>
        </table>

        <div className="ml-auto mt-5 w-72 text-sm">
          <DocumentTotal label="Subtotal" value={amount(currency, sale.subTotal)} />
          {Number(sale.discountAmount || 0) > 0 && <DocumentTotal label="Discount" value={`- ${amount(currency, sale.discountAmount)}`} />}
          {(sale.taxes || []).map((tax) => <DocumentTotal key={`${tax.name}-${tax.value}`} label={tax.name} value={amount(currency, tax.amount)} />)}
          <Divider className="my-2" />
          <DocumentTotal label="Total" value={amount(currency, sale.amount)} strong />
          {type === "receipt" && <DocumentTotal label="Paid" value={amount(currency, paid)} />}
          <DocumentTotal label="Balance" value={amount(currency, sale.balance)} strong />
          {type === "receipt" && (
            <Tag className="mt-3 capitalize" color={sale.paymentStatus === "paid" ? "green" : sale.paymentStatus === "partial" ? "orange" : "blue"}>
              {sale.paymentStatus}
            </Tag>
          )}
        </div>
      </div>
    </Modal>
  );
}

function DocumentTotal({ label, value, strong = false }: { label: string; value: string; strong?: boolean }) {
  return (
    <div className={`mb-2 flex justify-between ${strong ? "font-semibold text-gray-900" : "text-gray-600"}`}>
      <span>{label}</span>
      <span>{value}</span>
    </div>
  );
}
