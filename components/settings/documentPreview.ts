import { Purchase } from "@/types/purchase";
import { Sale } from "@/types/sale";
import { StoreDocumentTemplateKey, StoreDocumentsSettings } from "@/types/store-settings";
import { Payment, TransactionType } from "@/types/transaction";

export type DocumentModuleKey = keyof StoreDocumentsSettings;
export type SaleDocumentType = "invoice" | "receipt";
export type SaleDocumentPaperSize = "compact" | "full_page";

export interface DocumentBrandingContext {
  name?: string;
  category?: string;
  logoUrl?: string;
}

interface SaleDocumentHtmlOptions {
  sale: Sale;
  type: SaleDocumentType;
  paperSize?: SaleDocumentPaperSize;
  template: StoreDocumentTemplateKey;
  branding: DocumentBrandingContext;
  resolvedNames: Record<string, string>;
  paymentTermsLabel?: string;
  selectedPayment?: Payment;
}

const samplePurchase: Purchase = {
  id: "sample-purchase",
  purchaseNumber: "PO-2026-0142",
  type: "purchase",
  status: "open",
  receiptStatus: "partially_received",
  locked: false,
  isDeleted: false,
  contactId: {
    id: "supplier-1",
    name: "Northwind Supply Co.",
    email: "purchasing@northwind.example",
    phone: "+1 (415) 555-0188",
  },
  locationId: {
    id: "location-1",
    name: "Main Warehouse",
    address: "14 Industrial Ave, San Francisco, CA",
  },
  currencyId: {
    id: "currency-usd",
    code: "USD",
    name: "US Dollar",
  },
  createdBy: {
    id: "user-1",
    name: "Maya Chen",
    email: "maya@example.com",
  },
  date: "2026-06-24T09:00:00.000Z",
  deliveryDate: "2026-06-28T09:00:00.000Z",
  rate: 1,
  paymentTerms: "net_30",
  dueDate: "2026-07-24T09:00:00.000Z",
  note: "Restock fast-moving items for month-end demand.",
  discountValue: 120,
  discountType: "fixed",
  taxId: "tax-1",
  lineItems: [
    {
      id: "purchase-line-1",
      productId: { id: "product-1", name: "Cold Brew Bottle", sku: "CB-750" },
      productName: "Cold Brew Bottle",
      productSku: "CB-750",
      quantity: 24,
      unitPrice: 8.5,
      subtotal: 204,
      discountValue: 0,
      discountType: "fixed",
      discountAmount: 0,
      taxAmount: 15.3,
      total: 219.3,
      fulfilledQuantity: 12,
      returnedQuantity: 0,
    },
    {
      id: "purchase-line-2",
      productId: { id: "product-2", name: "Label Roll", sku: "LBL-02" },
      productName: "Label Roll",
      productSku: "LBL-02",
      quantity: 40,
      unitPrice: 2.25,
      subtotal: 90,
      discountValue: 0,
      discountType: "fixed",
      discountAmount: 0,
      taxAmount: 6.75,
      total: 96.75,
      fulfilledQuantity: 40,
      returnedQuantity: 0,
    },
    {
      id: "purchase-line-3",
      productId: { id: "product-3", name: "Shipping Carton", sku: "BOX-12" },
      productName: "Shipping Carton",
      productSku: "BOX-12",
      quantity: 60,
      unitPrice: 1.75,
      subtotal: 105,
      discountValue: 0,
      discountType: "fixed",
      discountAmount: 0,
      taxAmount: 7.88,
      total: 112.88,
      fulfilledQuantity: 0,
      returnedQuantity: 0,
    },
  ],
  taxes: [{ name: "Sales Tax", value: 7.5, amount: 29.93, baseAmount: 29.93 }],
  subTotal: 399,
  discountAmount: 120,
  taxAmount: 29.93,
  amount: 308.93,
  balance: 158.93,
  paymentStatus: "partial",
  payments: [],
  attachments: [],
  createdAt: "2026-06-24T09:00:00.000Z",
  updatedAt: "2026-06-25T11:30:00.000Z",
};

const sampleSale: Sale = {
  id: "sample-sale",
  saleNumber: "INV-2026-0814",
  documentNumber: "INV-2026-0814",
  type: "sale",
  status: "open",
  fulfillmentMethod: "delivery",
  receiptStatus: "received",
  locked: false,
  isDeleted: false,
  contactId: {
    id: "customer-1",
    name: "Luna Market",
    email: "accounts@lunamarket.example",
    phone: "+1 (628) 555-0134",
  },
  locationId: {
    id: "location-1",
    name: "Downtown Store",
    address: "220 Market Street, San Francisco, CA",
  },
  currencyId: {
    id: "currency-usd",
    code: "USD",
    name: "US Dollar",
  },
  createdBy: {
    id: "user-2",
    name: "Jordan Fields",
    email: "jordan@example.com",
  },
  date: "2026-06-26T10:00:00.000Z",
  deliveryDate: "2026-06-27T10:00:00.000Z",
  rate: 1,
  paymentTerms: "net_15",
  dueDate: "2026-07-11T10:00:00.000Z",
  note: "Weekly replenishment order.",
  source: "Manual Sale",
  deliveryFee: 0,
  posFulfillmentMode: "fulfill_now",
  discountValue: 35,
  discountType: "fixed",
  taxId: "tax-1",
  lineItems: [
    {
      id: "sale-line-1",
      productId: { id: "product-10", name: "Signature Tote", sku: "TOTE-01" },
      productName: "Signature Tote",
      productSku: "TOTE-01",
      quantity: 8,
      unitPrice: 28,
      subtotal: 224,
      discountValue: 0,
      discountType: "fixed",
      discountAmount: 0,
      taxAmount: 16.8,
      total: 240.8,
      fulfilledQuantity: 8,
      returnedQuantity: 0,
    },
    {
      id: "sale-line-2",
      productId: { id: "product-11", name: "Ceramic Mug", sku: "MUG-04" },
      productName: "Ceramic Mug",
      productSku: "MUG-04",
      quantity: 12,
      unitPrice: 14.5,
      subtotal: 174,
      discountValue: 0,
      discountType: "fixed",
      discountAmount: 0,
      taxAmount: 13.05,
      total: 187.05,
      fulfilledQuantity: 12,
      returnedQuantity: 0,
    },
    {
      id: "sale-line-3",
      productId: { id: "product-12", name: "Gift Wrap Pack", sku: "WRAP-03" },
      productName: "Gift Wrap Pack",
      productSku: "WRAP-03",
      quantity: 20,
      unitPrice: 4.75,
      subtotal: 95,
      discountValue: 0,
      discountType: "fixed",
      discountAmount: 0,
      taxAmount: 7.13,
      total: 102.13,
      fulfilledQuantity: 20,
      returnedQuantity: 0,
    },
  ],
  taxes: [{ name: "Sales Tax", value: 7.5, amount: 36.98, baseAmount: 36.98 }],
  subTotal: 493,
  discountAmount: 35,
  taxAmount: 36.98,
  amount: 494.98,
  balance: 124.98,
  paymentStatus: "partial",
  payments: [],
  createdAt: "2026-06-26T10:00:00.000Z",
  updatedAt: "2026-06-26T12:00:00.000Z",
};

const samplePosReceipt: Sale = {
  ...sampleSale,
  id: "sample-pos-sale",
  saleNumber: "RCPT-2026-1448",
  documentNumber: "RCPT-2026-1448",
  source: "POS",
  paymentTerms: "due_on_receipt",
  dueDate: "2026-06-26T10:00:00.000Z",
  contactId: {
    id: "walk-in",
    name: "Walk-in customer",
  },
  lineItems: [
    {
      id: "pos-line-1",
      productId: { id: "product-20", name: "Vanilla Candle", sku: "CND-08" },
      productName: "Vanilla Candle",
      productSku: "CND-08",
      quantity: 2,
      unitPrice: 18,
      subtotal: 36,
      discountValue: 0,
      discountType: "fixed",
      discountAmount: 0,
      taxAmount: 2.7,
      total: 38.7,
      fulfilledQuantity: 2,
      returnedQuantity: 0,
    },
    {
      id: "pos-line-2",
      productId: { id: "product-21", name: "Match Box", sku: "MTC-02" },
      productName: "Match Box",
      productSku: "MTC-02",
      quantity: 1,
      unitPrice: 4.5,
      subtotal: 4.5,
      discountValue: 0,
      discountType: "fixed",
      discountAmount: 0,
      taxAmount: 0.34,
      total: 4.84,
      fulfilledQuantity: 1,
      returnedQuantity: 0,
    },
  ],
  taxes: [{ name: "Sales Tax", value: 7.5, amount: 3.04, baseAmount: 3.04 }],
  subTotal: 40.5,
  discountAmount: 0,
  taxAmount: 3.04,
  amount: 43.54,
  balance: 0,
  paymentStatus: "paid",
  payments: [
    {
      id: "pos-payment-1",
      type: TransactionType.PAYMENT,
      date: new Date("2026-06-26T10:00:00.000Z"),
      status: "completed",
      amount: 50,
      baseAmount: 50,
      rate: 1,
      currency: { code: "USD", id: "currency-usd" },
      paymentMethod: { id: "payment-cash", name: "Cash" },
      createdBy: { id: "user-2", name: "Jordan Fields" },
    },
    {
      id: "pos-change-1",
      type: TransactionType.CHANGE,
      date: new Date("2026-06-26T10:00:00.000Z"),
      status: "completed",
      amount: 6.46,
      baseAmount: 6.46,
      rate: 1,
      currency: { code: "USD", id: "currency-usd" },
      paymentMethod: { id: "payment-cash", name: "Cash" },
      note: "POS change given",
      createdBy: { id: "user-2", name: "Jordan Fields" },
    },
  ],
};

function amount(currency: string, value: number | undefined) {
  const numeric = Number(value || 0);
  const prefix = numeric < 0 ? "-" : "";
  return `${prefix}${currency} ${Math.abs(numeric).toFixed(2)}`.trim();
}

function escapeHtml(value: string | number | undefined) {
  return String(value ?? "")
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#39;");
}

function formatDate(value: string | undefined) {
  if (!value) return "-";
  return new Intl.DateTimeFormat("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  }).format(new Date(value));
}

function receiptDocumentDate(sale: Sale, selectedPayment?: Payment) {
  return formatDate(String(selectedPayment?.date || sale.date));
}

function receiptPaymentMethod(sale: Sale, selectedPayment?: Payment) {
  return selectedPayment?.paymentMethod?.name;
}

function receiptPaymentAmount(sale: Sale, selectedPayment?: Payment) {
  return selectedPayment ? Number(selectedPayment.amount || 0) : Math.max(Number(sale.amount || 0) - Number(sale.balance || 0), 0);
}

function receiptBalanceAfterPayment(sale: Sale) {
  return Number(sale.balance || 0);
}

function showLogo(template: StoreDocumentTemplateKey) {
  return template !== "minimal";
}

function logoMarkup(branding: DocumentBrandingContext, template: StoreDocumentTemplateKey, variant: "inline" | "center" | "badge" = "inline") {
  if (!showLogo(template) || !branding.logoUrl) {
    return "";
  }

  if (variant === "center") {
    return `<div class="logo-center"><img src="${escapeHtml(branding.logoUrl)}" alt="Business logo" /></div>`;
  }

  if (variant === "badge") {
    return `<div class="logo-badge"><img src="${escapeHtml(branding.logoUrl)}" alt="Business logo" /></div>`;
  }

  return `<div class="logo-inline"><img src="${escapeHtml(branding.logoUrl)}" alt="Business logo" /></div>`;
}

function businessName(branding: DocumentBrandingContext) {
  return branding.name || "Dellie";
}

function saleLabel(type: SaleDocumentType) {
  return type === "invoice" ? "Invoice" : "Receipt";
}

function saleNumber(sale: Sale) {
  return sale.documentNumber || sale.saleNumber || sale.quoteNumber || sale.id;
}

function isPickupSale(sale: Sale) {
  return sale.fulfillmentMethod === "pickup";
}

function saleLocationLabel(sale: Sale) {
  return isPickupSale(sale) ? "Pickup Location" : "Delivery";
}

function saleScheduleLabel(sale: Sale) {
  return isPickupSale(sale) ? "Pickup" : "Delivery";
}

function saleFulfillmentLabel(sale: Sale) {
  return isPickupSale(sale) ? "Pickup" : "Fulfillment";
}

function saleStoreLocationName(sale: Sale) {
  return sale.locationId?.name?.trim() || "";
}

function saleStoreLocationAddress(sale: Sale) {
  return sale.locationId?.address?.trim() || "";
}

function renderStoreLocationHeaderLines(sale: Sale) {
  const lines = [saleStoreLocationName(sale), saleStoreLocationAddress(sale)].filter(Boolean);
  return lines.map((line) => `<div class="store-location-line">${escapeHtml(line)}</div>`).join("");
}

function saleDeliveryAddressText(sale: Sale) {
  return [
    sale.deliveryAddress?.street,
    sale.deliveryAddress?.city,
    sale.deliveryAddress?.state,
    sale.deliveryAddress?.country,
    sale.deliveryAddress?.postalCode,
  ]
    .filter(Boolean)
    .join(", ");
}

function renderSaleDestinationBlock(sale: Sale) {
  const scheduleLabel = saleScheduleLabel(sale);
  const deliveryDate = formatDate(sale.deliveryDate);

  if (isPickupSale(sale)) {
    return `<p>${escapeHtml(`${scheduleLabel}: ${deliveryDate}`)}</p>`;
  }

  const addressParts = saleDeliveryAddressText(sale);

  const lines = [
    `<p><strong>${escapeHtml(addressParts || "No delivery address provided")}</strong></p>`,
    `<p>${escapeHtml(`${scheduleLabel}: ${deliveryDate}`)}</p>`,
  ];

  return lines.join("");
}

function saleTheme(template: StoreDocumentTemplateKey) {
  switch (template) {
    case "bold":
      return {
        page: "#eef2ff",
        surface: "#ffffff",
        border: "#c7d2fe",
        accent: "#4f46e5",
        accentStrong: "#312e81",
        accentSoft: "#eef2ff",
        textMuted: "#4338ca",
        tableHeader: "#4f46e5",
        tableHeaderText: "#ffffff",
      };
    case "classic":
      return {
        page: "#fffaf0",
        surface: "#fffdf7",
        border: "#e7c98c",
        accent: "#9a6700",
        accentStrong: "#7c4a03",
        accentSoft: "#f8edd2",
        textMuted: "#9a6700",
        tableHeader: "#f3e1b4",
        tableHeaderText: "#7c4a03",
      };
    case "minimal":
      return {
        page: "#ffffff",
        surface: "#ffffff",
        border: "#e5e7eb",
        accent: "#111827",
        accentStrong: "#111827",
        accentSoft: "#f8fafc",
        textMuted: "#6b7280",
        tableHeader: "#f8fafc",
        tableHeaderText: "#475569",
      };
    default:
      return {
        page: "#f3f4f6",
        surface: "#ffffff",
        border: "#cbd5e1",
        accent: "#111827",
        accentStrong: "#111827",
        accentSoft: "#e5e7eb",
        textMuted: "#475569",
        tableHeader: "#111827",
        tableHeaderText: "#ffffff",
      };
  }
}

function thermalTheme(template: StoreDocumentTemplateKey) {
  switch (template) {
    case "bold":
      return {
        page: "#eef2ff",
        shell: "#ffffff",
        border: "#c7d2fe",
        accent: "#4f46e5",
        accentStrong: "#312e81",
        muted: "#4f46e5",
      };
    case "classic":
      return {
        page: "#fffaf0",
        shell: "#fffdf7",
        border: "#e7c98c",
        accent: "#9a6700",
        accentStrong: "#7c4a03",
        muted: "#9a6700",
      };
    case "minimal":
      return {
        page: "#ffffff",
        shell: "#ffffff",
        border: "#d1d5db",
        accent: "#111827",
        accentStrong: "#111827",
        muted: "#6b7280",
      };
    default:
      return {
        page: "#f3f4f6",
        shell: "#ffffff",
        border: "#cbd5e1",
        accent: "#111827",
        accentStrong: "#111827",
        muted: "#475569",
      };
  }
}

function renderSaleRows(sale: Sale, currency: string, resolvedNames: Record<string, string>) {
  return sale.lineItems
    .map((line) => {
      const name = resolvedNames[String(typeof line.productId === "string" ? line.productId : line.productId?.id || "")] || resolvedNames[line.productName] || line.productName;
      return `<tr>
        <td>${escapeHtml(name)}${line.productSku ? `<div class="subtle">SKU: ${escapeHtml(line.productSku)}</div>` : ""}</td>
        <td class="right">${escapeHtml(line.quantity)}</td>
        <td class="right">${escapeHtml(amount(currency, line.unitPrice))}</td>
        <td class="right">${escapeHtml(amount(currency, line.total))}</td>
      </tr>`;
    })
    .join("");
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

function renderReceiptTaxRows(currency: string, sale: Sale, mutedClass = "") {
  return saleTaxSummary(sale)
    .map((tax) => `<div class="totals-row"><span${mutedClass ? ` class="${mutedClass}"` : ""}>${escapeHtml(tax.name)}</span><span>${escapeHtml(amount(currency, tax.amount))}</span></div>`)
    .join("");
}

function renderSummaryRows(
  currency: string,
  subTotal: number,
  discountAmount: number,
  taxes: Array<{ name: string; amount: number }>,
  deliveryFee: number,
  showDeliveryFee: boolean,
  total: number,
  balance: number,
  paid?: number,
) {
  return `
    <tr><td>Subtotal</td><td class="right">${escapeHtml(amount(currency, subTotal))}</td></tr>
    ${discountAmount > 0 ? `<tr><td>Discount</td><td class="right">- ${escapeHtml(amount(currency, discountAmount))}</td></tr>` : ""}
    ${taxes.map((tax) => `<tr><td>${escapeHtml(tax.name)}</td><td class="right">${escapeHtml(amount(currency, tax.amount))}</td></tr>`).join("")}
    ${showDeliveryFee && deliveryFee > 0 ? `<tr><td>Delivery Fee</td><td class="right">${escapeHtml(amount(currency, deliveryFee))}</td></tr>` : ""}
    <tr class="total"><td>Total</td><td class="right">${escapeHtml(amount(currency, total))}</td></tr>
    ${paid !== undefined ? `<tr><td>Paid</td><td class="right">${escapeHtml(amount(currency, paid))}</td></tr>` : ""}
    <tr><td>Balance</td><td class="right">${escapeHtml(amount(currency, balance))}</td></tr>
  `;
}

function renderModernSaleDocument(options: SaleDocumentHtmlOptions) {
  const { sale, type, branding, resolvedNames, paymentTermsLabel = "Standard terms", selectedPayment } = options;
  const currency = sale.currencyId?.code || "";
  const theme = saleTheme("modern");
  const customer = sale.contactId?.name || "Walk-in customer";
  const locationLabel = saleLocationLabel(sale);
  const rows = renderSaleRows(sale, currency, resolvedNames);
  const summaryRows = renderSummaryRows(
    currency,
    sale.subTotal,
    sale.discountAmount,
    saleTaxSummary(sale),
    Number(sale.deliveryFee || 0),
    !isPickupSale(sale),
    sale.amount,
    type === "receipt" ? receiptBalanceAfterPayment(sale, selectedPayment) : sale.balance,
    type === "receipt" ? receiptPaymentAmount(sale, selectedPayment) : undefined,
  );

  return `<!doctype html>
<html>
  <head>
    <meta charset="utf-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1" />
    <title>${escapeHtml(saleLabel(type))} ${escapeHtml(saleNumber(sale))}</title>
    <style>
      * { box-sizing: border-box; }
      body { margin: 0; padding: 18px; background: ${theme.page}; color: #0f172a; font: 13px Inter, Arial, sans-serif; }
      .sheet { max-width: 980px; margin: 0 auto; background: ${theme.surface}; border: 1px solid ${theme.border}; }
      .hero { display: grid; grid-template-columns: minmax(0, 1.7fr) 280px; gap: 0; border-bottom: 1px solid ${theme.border}; }
      .brand-panel { padding: 22px; background: white; border-right: 1px solid ${theme.border}; }
      .doc-panel { padding: 22px; background: ${theme.accentSoft}; }
      .brand { display: flex; gap: 14px; align-items: flex-start; }
      .logo-inline img { width: 56px; height: 56px; object-fit: contain; background: white; padding: 8px; border: 1px solid ${theme.border}; }
      .eyebrow { color: ${theme.accent}; font-size: 12px; letter-spacing: 0.16em; text-transform: uppercase; font-weight: 700; }
      h1 { margin: 8px 0 4px; font-size: 24px; }
      .muted { color: ${theme.textMuted}; }
      .store-location-line { margin-top: 4px; color: ${theme.textMuted}; }
      .doc-panel .type { font-size: 12px; letter-spacing: 0.16em; text-transform: uppercase; color: ${theme.accent}; font-weight: 700; }
      .doc-panel .number { margin-top: 8px; font-size: 22px; font-weight: 700; color: ${theme.accentStrong}; }
      .doc-panel .meta-row { display: flex; justify-content: space-between; gap: 8px; margin-top: 8px; color: ${theme.textMuted}; font-size: 12px; padding-top: 8px; border-top: 1px solid ${theme.border}; }
      .content { padding: 18px 22px 22px; }
      .meta-grid { display: grid; grid-template-columns: 1.1fr .9fr; gap: 0; border: 1px solid ${theme.border}; }
      .meta-card { padding: 14px; background: white; min-height: 100%; }
      .meta-card + .meta-card { border-left: 1px solid ${theme.border}; background: #f8fafc; }
      .meta-card .label { color: ${theme.textMuted}; font-size: 11px; letter-spacing: 0.12em; text-transform: uppercase; }
      .meta-card p { margin: 6px 0 0; }
      .table-shell { margin-top: 16px; border: 1px solid ${theme.border}; overflow: hidden; }
      table { width: 100%; border-collapse: collapse; }
      th { background: ${theme.tableHeader}; color: ${theme.tableHeaderText}; font-size: 12px; letter-spacing: 0.08em; text-transform: uppercase; text-align: left; }
      th, td { padding: 10px 12px; border-bottom: 1px solid ${theme.border}; vertical-align: top; }
      .subtle { margin-top: 3px; color: ${theme.textMuted}; font-size: 11px; }
      .right { text-align: right; }
      .bottom { display: grid; grid-template-columns: minmax(0, 1.2fr) 280px; gap: 16px; margin-top: 16px; align-items: start; }
      .note { border-left: 4px solid ${theme.accent}; background: ${theme.accentSoft}; padding: 14px; color: ${theme.textMuted}; min-height: 100%; }
      .note p { margin: 8px 0 0; }
      .summary { border: 1px solid ${theme.border}; padding: 12px 14px; background: white; }
      .summary td { padding: 4px 0; border: 0; }
      .summary .total td { padding-top: 9px; border-top: 2px solid ${theme.accentStrong}; font-size: 15px; font-weight: 700; color: ${theme.accentStrong}; }
      .footer { margin-top: 16px; border-top: 1px solid ${theme.border}; padding-top: 12px; color: ${theme.textMuted}; display: flex; justify-content: space-between; gap: 12px; text-transform: uppercase; letter-spacing: 0.08em; font-size: 10px; }
      @media (max-width: 720px) {
        .hero,
        .meta-grid,
        .bottom {
          grid-template-columns: 1fr;
        }

        .brand-panel {
          border-right: 0;
          border-bottom: 1px solid ${theme.border};
        }

        .meta-card + .meta-card {
          border-left: 0;
          border-top: 1px solid ${theme.border};
        }
      }

      @media print { body { padding: 0; } @page { margin: 14mm; } }
    </style>
  </head>
  <body>
    <div class="sheet">
      <div class="hero">
        <div class="brand-panel">
          <div class="brand">
            ${logoMarkup(branding, "modern", "inline")}
            <div>
              <div class="eyebrow">${escapeHtml(type === "invoice" ? "Sales Invoice" : "Sales Receipt")}</div>
              <h1>${escapeHtml(businessName(branding))}</h1>
              ${renderStoreLocationHeaderLines(sale)}
            </div>
          </div>
        </div>
        <div class="doc-panel">
          <div class="type">${escapeHtml(saleLabel(type))}</div>
          <div class="number">${escapeHtml(saleNumber(sale))}</div>
          <div class="meta-row"><span>Date</span><span>${escapeHtml(type === "receipt" ? receiptDocumentDate(sale, selectedPayment) : formatDate(sale.date))}</span></div>
          <div class="meta-row"><span>Due</span><span>${escapeHtml(formatDate(sale.dueDate))}</span></div>
          ${type === "receipt" && receiptPaymentMethod(sale, selectedPayment) ? `<div class="meta-row"><span>Method</span><span>${escapeHtml(receiptPaymentMethod(sale, selectedPayment) || "")}</span></div>` : ""}
        </div>
      </div>
      <div class="content">
        <div class="meta-grid">
          <div class="meta-card">
            <div class="label">${escapeHtml(type === "invoice" ? "Bill To" : "Customer")}</div>
            <p><strong>${escapeHtml(customer)}</strong></p>
            <p>${escapeHtml(sale.contactId?.email)}</p>
            <p>${escapeHtml(sale.contactId?.phone)}</p>
          </div>
          <div class="meta-card">
            <div class="label">${escapeHtml(locationLabel)}</div>
            ${renderSaleDestinationBlock(sale)}
          </div>
        </div>
        <div class="table-shell">
          <table>
            <thead><tr><th>Item</th><th class="right">Qty</th><th class="right">Price</th><th class="right">Amount</th></tr></thead>
            <tbody>${rows}</tbody>
          </table>
        </div>
        <div class="bottom">
          <div class="note">
            <strong>Order note</strong>
            <p>${escapeHtml(sale.note || `Prepared with current pricing, taxes, and ${saleScheduleLabel(sale).toLowerCase()} details.`)}</p>
          </div>
          <table class="summary">${summaryRows}</table>
        </div>
        <div class="footer"><span>Prepared by ${escapeHtml(businessName(branding))}</span><span>${escapeHtml(paymentTermsLabel)}</span></div>
      </div>
    </div>
  </body>
</html>`;
}

function renderMinimalSaleDocument(options: SaleDocumentHtmlOptions) {
  const { sale, type, branding, resolvedNames, paymentTermsLabel = "Standard terms", paperSize = "full_page", selectedPayment } = options;
  const currency = sale.currencyId?.code || "";
  const theme = saleTheme("minimal");
  const customer = sale.contactId?.name || "Walk-in customer";
  const fulfillmentLabel = saleFulfillmentLabel(sale);
  const rows = renderSaleRows(sale, currency, resolvedNames);
  const summaryRows = renderSummaryRows(
    currency,
    sale.subTotal,
    sale.discountAmount,
    saleTaxSummary(sale),
    Number(sale.deliveryFee || 0),
    !isPickupSale(sale),
    sale.amount,
    type === "receipt" ? receiptBalanceAfterPayment(sale, selectedPayment) : sale.balance,
    type === "receipt" ? receiptPaymentAmount(sale, selectedPayment) : undefined,
  );
  const compact = type === "receipt" && paperSize === "compact";

  return `<!doctype html>
<html>
  <head>
    <meta charset="utf-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1" />
    <title>${escapeHtml(saleLabel(type))} ${escapeHtml(saleNumber(sale))}</title>
    <style>
      * { box-sizing: border-box; }
      body { margin: 0; padding: ${compact ? "12px" : "18px"}; background: ${theme.page}; color: #111827; font: ${compact ? "11px" : "13px"} Inter, Arial, sans-serif; }
      .sheet { margin: 0 auto; max-width: ${compact ? "680px" : "940px"}; background: white; border: 1px solid ${theme.border}; padding: ${compact ? "12px" : "18px"}; }
      .masthead { display: grid; grid-template-columns: minmax(0, 1.2fr) 220px; gap: 18px; align-items: end; padding-bottom: 10px; border-bottom: 2px solid #111827; }
      .eyebrow { font-size: 11px; letter-spacing: 0.16em; text-transform: uppercase; color: ${theme.textMuted}; }
      .title { margin-top: 6px; font-size: ${compact ? "18px" : "24px"}; font-weight: 700; letter-spacing: -0.03em; }
      .company { margin-top: 4px; color: ${theme.textMuted}; }
      .store-location-line { margin-top: 4px; color: ${theme.textMuted}; }
      .doc-meta { border-left: 1px solid ${theme.border}; padding-left: 14px; }
      .doc-meta-row { display: flex; justify-content: space-between; gap: 8px; padding: 4px 0; border-bottom: 1px solid ${theme.border}; }
      .doc-meta-row:last-child { border-bottom: 0; }
      .label { color: ${theme.textMuted}; text-transform: uppercase; letter-spacing: 0.12em; font-size: 10px; }
      .contact-strip { display: grid; grid-template-columns: minmax(0, 1fr) minmax(0, 1fr) 220px; gap: 14px; margin-top: 14px; padding-bottom: 12px; border-bottom: 1px solid ${theme.border}; }
      .contact-block p, .terms p { margin: 4px 0 0; }
      .terms { text-align: right; }
      .section-title { font-size: 10px; letter-spacing: 0.14em; text-transform: uppercase; color: ${theme.textMuted}; margin-bottom: 6px; }
      table { width: 100%; border-collapse: collapse; }
      .ledger { margin-top: 14px; }
      th { background: transparent; color: ${theme.tableHeaderText}; font-size: 11px; text-transform: uppercase; text-align: left; border-bottom: 1px solid #111827; }
      th, td { padding: ${compact ? "6px 5px" : "9px 8px"}; border-bottom: 1px solid ${theme.border}; vertical-align: top; }
      .right { text-align: right; }
      .subtle { margin-top: 3px; color: ${theme.textMuted}; font-size: 11px; }
      .closing { display: grid; grid-template-columns: minmax(0, 1fr) ${compact ? "100%" : "240px"}; gap: 16px; margin-top: 14px; align-items: start; }
      .note { border-top: 1px solid ${theme.border}; padding-top: 10px; color: ${theme.textMuted}; line-height: 1.55; }
      .summary { width: 100%; border-top: 2px solid #111827; padding-top: 8px; }
      .summary td { padding: 4px 0; border: 0; }
      .summary .total td { padding-top: 8px; border-top: 1px solid ${theme.border}; font-size: 14px; font-weight: 700; color: #111827; }
      .footer { margin-top: 14px; padding-top: 10px; border-top: 1px solid ${theme.border}; color: ${theme.textMuted}; display: flex; justify-content: space-between; gap: 10px; }
      .footer span:last-child { text-align: right; }
      @media (max-width: 720px) {
        .masthead, .contact-strip, .closing { grid-template-columns: 1fr; }
        .doc-meta { border-left: 0; padding-left: 0; }
        .terms, .footer span:last-child { text-align: left; }
      }
      @media print { body { padding: 0; } @page { margin: ${compact ? "8mm" : "16mm"}; } }
    </style>
  </head>
  <body>
    <div class="sheet">
      <div class="masthead">
        <div>
          <div class="eyebrow">${escapeHtml(type === "invoice" ? "Billing Document" : "Sale Confirmation")}</div>
          <div class="title">${escapeHtml(saleLabel(type))}</div>
          <div class="company">${escapeHtml(businessName(branding))}</div>
          ${renderStoreLocationHeaderLines(sale)}
        </div>
        <div class="doc-meta">
          <div class="doc-meta-row"><span class="label">Number</span><span>${escapeHtml(saleNumber(sale))}</span></div>
          <div class="doc-meta-row"><span class="label">Issued</span><span>${escapeHtml(type === "receipt" ? receiptDocumentDate(sale, selectedPayment) : formatDate(sale.date))}</span></div>
          <div class="doc-meta-row"><span class="label">Due</span><span>${escapeHtml(formatDate(sale.dueDate))}</span></div>
          ${type === "receipt" && receiptPaymentMethod(sale, selectedPayment) ? `<div class="doc-meta-row"><span class="label">Method</span><span>${escapeHtml(receiptPaymentMethod(sale, selectedPayment) || "")}</span></div>` : ""}
        </div>
      </div>
      <div class="contact-strip">
        <div class="contact-block">
          <div class="section-title">${escapeHtml(type === "invoice" ? "Bill To" : "Customer")}</div>
          <p><strong>${escapeHtml(customer)}</strong></p>
          <p>${escapeHtml(sale.contactId?.email)}</p>
          <p>${escapeHtml(sale.contactId?.phone)}</p>
        </div>
        <div class="contact-block">
          <div class="section-title">${escapeHtml(fulfillmentLabel)}</div>
          ${renderSaleDestinationBlock(sale)}
        </div>
        <div class="terms">
          <div class="section-title">Terms</div>
          <p>${escapeHtml(paymentTermsLabel)}</p>
          <p>${escapeHtml(type === "invoice" ? "Payment expected by due date." : "Payment received against this receipt.")}</p>
        </div>
      </div>
      <table class="ledger">
        <thead><tr><th>Item</th><th class="right">Qty</th><th class="right">Unit Price</th><th class="right">Amount</th></tr></thead>
        <tbody>${rows}</tbody>
      </table>
      <div class="closing">
        <div class="note">${escapeHtml(sale.note || `Prepared as a concise operational document with current pricing, taxes, and ${fulfillmentLabel.toLowerCase()} details.`)}</div>
        <table class="summary">${summaryRows}</table>
      </div>
      <div class="footer"><span>${escapeHtml(businessName(branding))}</span><span>${escapeHtml(paymentTermsLabel)}</span></div>
    </div>
  </body>
</html>`;
}

function renderBoldSaleDocument(options: SaleDocumentHtmlOptions) {
  const { sale, type, branding, resolvedNames, paymentTermsLabel = "Standard terms", selectedPayment } = options;
  const currency = sale.currencyId?.code || "";
  const theme = saleTheme("bold");
  const customer = sale.contactId?.name || "Walk-in customer";
  const scheduleLabel = saleScheduleLabel(sale);
  const locationLabel = saleLocationLabel(sale);
  const rows = renderSaleRows(sale, currency, resolvedNames);
  const summaryRows = renderSummaryRows(
    currency,
    sale.subTotal,
    sale.discountAmount,
    saleTaxSummary(sale),
    Number(sale.deliveryFee || 0),
    !isPickupSale(sale),
    sale.amount,
    type === "receipt" ? receiptBalanceAfterPayment(sale, selectedPayment) : sale.balance,
    type === "receipt" ? receiptPaymentAmount(sale, selectedPayment) : undefined,
  );

  return `<!doctype html>
<html>
  <head>
    <meta charset="utf-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1" />
    <title>${escapeHtml(saleLabel(type))} ${escapeHtml(saleNumber(sale))}</title>
    <style>
      * { box-sizing: border-box; }
      body { margin: 0; padding: 18px; background: ${theme.page}; color: #111827; font: 13px Inter, Arial, sans-serif; }
      .sheet { max-width: 980px; margin: 0 auto; background: ${theme.surface}; border: 1px solid ${theme.border}; overflow: hidden; }
      .hero { background: linear-gradient(135deg, ${theme.accentStrong}, ${theme.accent}); color: white; padding: 20px 22px; display: flex; justify-content: space-between; gap: 18px; }
      .hero-left { display: flex; gap: 12px; align-items: center; }
      .logo-badge img { width: 52px; height: 52px; object-fit: contain; background: white; padding: 8px; }
      .eyebrow { font-size: 12px; letter-spacing: 0.2em; text-transform: uppercase; opacity: 0.8; }
      h1 { margin: 6px 0 0; font-size: 22px; }
      .store-location-line { margin-top: 4px; font-size: 12px; opacity: 0.85; }
      .hero-right { text-align: right; }
      .hero-right .number { font-size: 22px; font-weight: 800; }
      .content { padding: 18px 22px 22px; }
      .meta-strip { display: grid; grid-template-columns: repeat(4, minmax(0, 1fr)); gap: 10px; margin-bottom: 16px; }
      .meta-item { background: ${theme.accentSoft}; border: 1px solid ${theme.border}; padding: 12px; }
      .meta-item .label { color: ${theme.textMuted}; font-size: 11px; letter-spacing: 0.12em; text-transform: uppercase; }
      .meta-item strong { display: block; margin-top: 6px; }
      .table-shell { border: 1px solid ${theme.border}; overflow: hidden; }
      table { width: 100%; border-collapse: collapse; }
      th { background: ${theme.tableHeader}; color: ${theme.tableHeaderText}; font-size: 12px; letter-spacing: 0.08em; text-transform: uppercase; text-align: left; }
      th, td { padding: 10px 12px; border-bottom: 1px solid ${theme.border}; vertical-align: top; }
      .subtle { margin-top: 3px; color: ${theme.textMuted}; font-size: 11px; }
      .right { text-align: right; }
      .bottom { display: grid; grid-template-columns: minmax(0, 1fr) 300px; gap: 16px; margin-top: 16px; }
      .note { padding: 14px; background: white; border: 1px solid ${theme.border}; }
      .note p { margin: 8px 0 0; }
      .summary { padding: 14px 16px; background: ${theme.accentStrong}; color: white; }
      .summary table { width: 100%; }
      .summary td { padding: 5px 0; border: 0; }
      .summary .total td { padding-top: 9px; border-top: 1px solid rgba(255,255,255,0.2); font-size: 16px; font-weight: 800; }
      .footer { margin-top: 16px; color: ${theme.textMuted}; text-align: center; }
      @media (max-width: 720px) {
        .hero {
          display: block;
        }

        .hero-right {
          margin-top: 14px;
          text-align: left;
        }

        .meta-strip {
          grid-template-columns: repeat(2, minmax(0, 1fr));
        }

        .bottom {
          grid-template-columns: 1fr;
        }
      }

      @media print { body { padding: 0; } @page { margin: 14mm; } }
    </style>
  </head>
  <body>
    <div class="sheet">
      <div class="hero">
        <div class="hero-left">
          ${logoMarkup(branding, "bold", "badge")}
          <div>
            <div class="eyebrow">${escapeHtml(saleLabel(type))}</div>
            <h1>${escapeHtml(businessName(branding))}</h1>
            ${renderStoreLocationHeaderLines(sale)}
          </div>
        </div>
        <div class="hero-right">
          <div class="eyebrow">${escapeHtml(type === "invoice" ? "Account Copy" : "Customer Copy")}</div>
          <div class="number">${escapeHtml(saleNumber(sale))}</div>
        </div>
      </div>
      <div class="content">
        <div class="meta-strip">
          <div class="meta-item"><div class="label">Customer</div><strong>${escapeHtml(customer)}</strong><span>${escapeHtml(sale.contactId?.phone)}</span></div>
          <div class="meta-item"><div class="label">${escapeHtml(type === "receipt" ? "Paid On" : "Date")}</div><strong>${escapeHtml(type === "receipt" ? receiptDocumentDate(sale, selectedPayment) : formatDate(sale.date))}</strong><span>${escapeHtml(type === "receipt" ? receiptPaymentMethod(sale, selectedPayment) || paymentTermsLabel : formatDate(sale.dueDate))}</span></div>
          <div class="meta-item"><div class="label">${escapeHtml(locationLabel)}</div><strong>${escapeHtml(isPickupSale(sale) ? "Pickup at store" : saleDeliveryAddressText(sale) || "No delivery address provided")}</strong><span>${escapeHtml(`${scheduleLabel}: ${formatDate(sale.deliveryDate)}`)}</span></div>
          <div class="meta-item"><div class="label">Terms</div><strong>${escapeHtml(paymentTermsLabel)}</strong></div>
        </div>
        <div class="table-shell">
          <table>
            <thead><tr><th>Item</th><th class="right">Qty</th><th class="right">Price</th><th class="right">Amount</th></tr></thead>
            <tbody>${rows}</tbody>
          </table>
        </div>
        <div class="bottom">
          <div class="note">
            <strong>Sales note</strong>
            <p>${escapeHtml(sale.note || `High-visibility layout intended for quick review of ${scheduleLabel.toLowerCase()} orders and approvals.`)}</p>
          </div>
          <div class="summary"><table>${summaryRows}</table></div>
        </div>
        <div class="footer">Thank you for doing business with ${escapeHtml(businessName(branding))}</div>
      </div>
    </div>
  </body>
</html>`;
}

function renderClassicSaleDocument(options: SaleDocumentHtmlOptions) {
  const { sale, type, branding, resolvedNames, paymentTermsLabel = "Standard terms", selectedPayment } = options;
  const currency = sale.currencyId?.code || "";
  const theme = saleTheme("classic");
  const customer = sale.contactId?.name || "Walk-in customer";
  const scheduleLabel = saleScheduleLabel(sale);
  const rows = renderSaleRows(sale, currency, resolvedNames);
  const summaryRows = renderSummaryRows(
    currency,
    sale.subTotal,
    sale.discountAmount,
    saleTaxSummary(sale),
    Number(sale.deliveryFee || 0),
    !isPickupSale(sale),
    sale.amount,
    type === "receipt" ? receiptBalanceAfterPayment(sale, selectedPayment) : sale.balance,
    type === "receipt" ? receiptPaymentAmount(sale, selectedPayment) : undefined,
  );

  return `<!doctype html>
<html>
  <head>
    <meta charset="utf-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1" />
    <title>${escapeHtml(saleLabel(type))} ${escapeHtml(saleNumber(sale))}</title>
    <style>
      * { box-sizing: border-box; }
      body { margin: 0; padding: 18px; background: ${theme.page}; color: #2c2214; font: 14px Georgia, "Times New Roman", serif; }
      .sheet { max-width: 920px; margin: 0 auto; background: ${theme.surface}; border: 1px solid ${theme.border}; padding: 22px 24px 20px; }
      .logo-center { text-align: center; margin-bottom: 8px; }
      .logo-center img { width: 62px; height: 62px; object-fit: contain; }
      .title { text-align: center; }
      .title h1 { margin: 0; font-size: 22px; letter-spacing: 0.04em; text-transform: uppercase; }
      .title .subtitle { margin-top: 4px; color: ${theme.textMuted}; font-size: 12px; }
      .store-location-line { margin-top: 4px; color: ${theme.textMuted}; }
      .rule { margin: 14px 0; border-top: 2px solid ${theme.border}; }
      .meta { display: grid; grid-template-columns: 1fr 1fr; gap: 16px; margin-bottom: 16px; }
      .meta-block .label { color: ${theme.textMuted}; font-size: 12px; text-transform: uppercase; letter-spacing: 0.14em; }
      .meta-block p { margin: 4px 0 0; }
      table { width: 100%; border-collapse: collapse; }
      th { background: ${theme.tableHeader}; color: ${theme.tableHeaderText}; font-size: 12px; text-transform: uppercase; text-align: left; }
      th, td { padding: 9px 8px; border-bottom: 1px solid ${theme.border}; vertical-align: top; }
      .subtle { margin-top: 3px; color: ${theme.textMuted}; font-size: 11px; }
      .right { text-align: right; }
      .summary { width: 280px; margin: 16px 0 0 auto; }
      .summary td { padding: 4px 0; border: 0; }
      .summary .total td { padding-top: 8px; border-top: 1px solid ${theme.border}; font-size: 15px; font-weight: 700; }
      .footer { margin-top: 18px; text-align: center; color: ${theme.textMuted}; font-size: 12px; }
      @media (max-width: 720px) {
        .meta {
          grid-template-columns: 1fr;
        }
      }

      @media print { body { padding: 0; } @page { margin: 16mm; } }
    </style>
  </head>
  <body>
    <div class="sheet">
      ${logoMarkup(branding, "classic", "center")}
      <div class="title">
        <h1>${escapeHtml(businessName(branding))}</h1>
        ${renderStoreLocationHeaderLines(sale)}
        <div class="subtitle">${escapeHtml(saleLabel(type))} · ${escapeHtml(saleNumber(sale))}</div>
      </div>
      <div class="rule"></div>
      <div class="meta">
        <div class="meta-block">
          <div class="label">${escapeHtml(type === "invoice" ? "Bill To" : "Customer")}</div>
          <p><strong>${escapeHtml(customer)}</strong></p>
          <p>${escapeHtml(sale.contactId?.email)}</p>
          <p>${escapeHtml(sale.contactId?.phone)}</p>
        </div>
        <div class="meta-block" style="text-align:right;">
          <div class="label">Document Info</div>
          <p>${escapeHtml(type === "receipt" ? "Date" : "Date")}: ${escapeHtml(type === "receipt" ? receiptDocumentDate(sale, selectedPayment) : formatDate(sale.date))}</p>
          <p>Due: ${escapeHtml(formatDate(sale.dueDate))}</p>
          <p>${escapeHtml(scheduleLabel)}: ${escapeHtml(formatDate(sale.deliveryDate))}</p>
          ${type === "receipt" && receiptPaymentMethod(sale, selectedPayment) ? `<p>Method: ${escapeHtml(receiptPaymentMethod(sale, selectedPayment) || "")}</p>` : ""}
          <p>Terms: ${escapeHtml(paymentTermsLabel)}</p>
        </div>
      </div>
      <table>
        <thead><tr><th>Item Description</th><th class="right">Qty</th><th class="right">Unit Price</th><th class="right">Extended</th></tr></thead>
        <tbody>${rows}</tbody>
      </table>
      <table class="summary">${summaryRows}</table>
      <div class="footer">${escapeHtml(sale.note || "Formal business document preview.")}</div>
    </div>
  </body>
</html>`;
}

function renderModernPosReceipt(options: SaleDocumentHtmlOptions) {
  const { sale, branding, resolvedNames, selectedPayment } = options;
  const currency = sale.currencyId?.code || "";
  const theme = thermalTheme("modern");
  const paidAmount = receiptPaymentAmount(sale, selectedPayment);
  const balanceAmount = receiptBalanceAfterPayment(sale, selectedPayment);
  const rows = sale.lineItems
    .map((line) => {
      const name = resolvedNames[String(typeof line.productId === "string" ? line.productId : line.productId?.id || "")] || resolvedNames[line.productName] || line.productName;
      return `<div class="line-item">
        <div class="line-main">${escapeHtml(name)}</div>
        <div class="line-sub"><span>${escapeHtml(line.quantity)} x ${escapeHtml(amount(currency, line.unitPrice))}</span><span>${escapeHtml(amount(currency, line.total))}</span></div>
      </div>`;
    })
    .join("");
  const taxRows = renderReceiptTaxRows(currency, sale);

  return `<!doctype html>
<html>
  <head>
    <meta charset="utf-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1" />
    <style>
      * { box-sizing: border-box; }
      body { margin: 0; padding: 18px; background: ${theme.page}; color: #111827; font: 12px "SF Mono", "Courier New", monospace; }
      .sheet { width: 322px; margin: 0 auto; padding: 0; background: ${theme.shell}; border: 1px solid ${theme.border}; }
      .center { text-align: center; }
      .header { padding: 16px; border-bottom: 1px solid ${theme.border}; background: #f8fafc; }
      .logo-inline { display: flex; justify-content: center; margin-bottom: 8px; }
      .logo-inline img { width: 52px; height: 52px; object-fit: contain; background: white; padding: 8px; border: 1px solid ${theme.border}; }
      .store { font-size: 18px; font-weight: 700; }
      .muted { color: ${theme.muted}; }
      .store-location-line { margin-top: 4px; }
      .pill { display: inline-flex; background: ${theme.accent}; color: white; padding: 4px 10px; font-size: 11px; margin-top: 10px; }
      .body { padding: 14px 16px 16px; }
      .rule { border-top: 1px dashed ${theme.border}; margin: 12px 0; }
      .meta-row, .totals-row { display: flex; justify-content: space-between; gap: 8px; margin: 3px 0; }
      .line-item { padding: 8px 0; border-bottom: 1px dashed ${theme.border}; }
      .line-main { font-weight: 700; line-height: 1.35; }
      .line-sub { display: flex; justify-content: space-between; gap: 8px; margin-top: 4px; color: ${theme.muted}; }
      .grand { border-top: 1px dashed ${theme.border}; padding-top: 8px; margin-top: 8px; font-size: 15px; font-weight: 700; }
      .status { display: inline-block; margin-top: 10px; padding: 3px 9px; background: ${theme.accent}; color: white; font-size: 11px; text-transform: uppercase; }
    </style>
  </head>
  <body>
    <div class="sheet">
      <div class="header center">
        ${logoMarkup(branding, "modern", "inline")}
        <div class="store">${escapeHtml(businessName(branding))}</div>
        ${renderStoreLocationHeaderLines(sale)}
        <div class="pill">Receipt ${escapeHtml(saleNumber(sale))}</div>
      </div>
      <div class="body">
      <div class="rule"></div>
      <div class="meta-row"><span>Date</span><span>${escapeHtml(receiptDocumentDate(sale, selectedPayment))}</span></div>
      <div class="meta-row"><span>Customer</span><span>${escapeHtml(sale.contactId?.name || "Walk-in customer")}</span></div>
      ${receiptPaymentMethod(sale, selectedPayment) ? `<div class="meta-row"><span>Method</span><span>${escapeHtml(receiptPaymentMethod(sale, selectedPayment) || "")}</span></div>` : ""}
      <div class="rule"></div>
      ${rows}
      <div class="totals-row"><span>Subtotal</span><span>${escapeHtml(amount(currency, sale.subTotal))}</span></div>
      ${taxRows}
      ${!isPickupSale(sale) && Number(sale.deliveryFee || 0) > 0 ? `<div class="totals-row"><span>Delivery Fee</span><span>${escapeHtml(amount(currency, sale.deliveryFee))}</span></div>` : ""}
      <div class="totals-row grand"><span>Total</span><span>${escapeHtml(amount(currency, sale.amount))}</span></div>
      <div class="totals-row"><span>Paid</span><span>${escapeHtml(amount(currency, paidAmount))}</span></div>
      <div class="totals-row"><span>Balance</span><span>${escapeHtml(amount(currency, balanceAmount))}</span></div>
      <div class="center"><div class="status">${escapeHtml(sale.paymentStatus)}</div></div>
      </div>
    </div>
  </body>
</html>`;
}

function renderMinimalPosReceipt(options: SaleDocumentHtmlOptions) {
  const { sale, branding, resolvedNames, selectedPayment } = options;
  const currency = sale.currencyId?.code || "";
  const theme = thermalTheme("minimal");
  const paidAmount = receiptPaymentAmount(sale, selectedPayment);
  const balanceAmount = receiptBalanceAfterPayment(sale, selectedPayment);
  const rows = sale.lineItems
    .map((line) => {
      const name = resolvedNames[String(typeof line.productId === "string" ? line.productId : line.productId?.id || "")] || resolvedNames[line.productName] || line.productName;
      return `<div class="line-item"><div>${escapeHtml(name)}</div><div class="line-sub"><span>${escapeHtml(line.quantity)} x ${escapeHtml(amount(currency, line.unitPrice))}</span><span>${escapeHtml(amount(currency, line.total))}</span></div></div>`;
    })
    .join("");

  return `<!doctype html>
<html>
  <head>
    <meta charset="utf-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1" />
    <style>
      * { box-sizing: border-box; }
      body { margin: 0; padding: 14px; background: ${theme.page}; color: #111827; font: 12px "SF Mono", "Courier New", monospace; }
      .sheet { width: 300px; margin: 0 auto; padding: 12px; background: ${theme.shell}; border: 1px solid ${theme.border}; }
      .center { text-align: center; }
      .muted { color: ${theme.muted}; }
      .store-location-line { margin-top: 4px; }
      .receipt-head { padding-bottom: 10px; border-bottom: 2px solid #111827; }
      .ticket { margin-top: 4px; letter-spacing: 0.08em; }
      .rule { border-top: 1px dashed ${theme.border}; margin: 10px 0; }
      .line-item { padding: 7px 0; border-bottom: 1px dashed ${theme.border}; }
      .line-main { color: #111827; font-weight: 700; }
      .line-sub, .totals-row, .meta-row { display: flex; justify-content: space-between; gap: 8px; margin-top: 3px; color: ${theme.muted}; }
      .strong { color: #111827; font-weight: 700; }
      .summary { margin-top: 10px; border-top: 2px solid #111827; padding-top: 8px; }
    </style>
  </head>
  <body>
    <div class="sheet">
      <div class="center receipt-head">
        <div class="strong">${escapeHtml(businessName(branding))}</div>
        ${renderStoreLocationHeaderLines(sale)}
        <div class="ticket muted">Receipt ${escapeHtml(saleNumber(sale))}</div>
      </div>
      <div class="rule"></div>
      <div class="meta-row"><span>Date</span><span>${escapeHtml(receiptDocumentDate(sale, selectedPayment))}</span></div>
      <div class="meta-row"><span>Customer</span><span>${escapeHtml(sale.contactId?.name || "Walk-in customer")}</span></div>
      ${receiptPaymentMethod(sale, selectedPayment) ? `<div class="meta-row"><span>Method</span><span>${escapeHtml(receiptPaymentMethod(sale, selectedPayment) || "")}</span></div>` : ""}
      <div class="rule"></div>
      ${rows}
      <div class="summary">
        <div class="totals-row"><span>Subtotal</span><span>${escapeHtml(amount(currency, sale.subTotal))}</span></div>
        ${renderReceiptTaxRows(currency, sale)}
        ${!isPickupSale(sale) && Number(sale.deliveryFee || 0) > 0 ? `<div class="totals-row"><span>Delivery Fee</span><span>${escapeHtml(amount(currency, sale.deliveryFee))}</span></div>` : ""}
        <div class="totals-row"><span>Paid</span><span>${escapeHtml(amount(currency, paidAmount))}</span></div>
        <div class="totals-row"><span>Balance</span><span>${escapeHtml(amount(currency, balanceAmount))}</span></div>
        <div class="totals-row strong"><span>Total</span><span>${escapeHtml(amount(currency, sale.amount))}</span></div>
      </div>
    </div>
  </body>
</html>`;
}

function renderBoldPosReceipt(options: SaleDocumentHtmlOptions) {
  const { sale, branding, resolvedNames, selectedPayment } = options;
  const currency = sale.currencyId?.code || "";
  const theme = thermalTheme("bold");
  const paidAmount = receiptPaymentAmount(sale, selectedPayment);
  const balanceAmount = receiptBalanceAfterPayment(sale, selectedPayment);
  const rows = sale.lineItems
    .map((line) => {
      const name = resolvedNames[String(typeof line.productId === "string" ? line.productId : line.productId?.id || "")] || resolvedNames[line.productName] || line.productName;
      return `<div class="line-item"><div class="line-main">${escapeHtml(name)}</div><div class="line-sub"><span>${escapeHtml(line.quantity)} x ${escapeHtml(amount(currency, line.unitPrice))}</span><span>${escapeHtml(amount(currency, line.total))}</span></div></div>`;
    })
    .join("");

  return `<!doctype html>
<html>
  <head>
    <meta charset="utf-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1" />
    <style>
      * { box-sizing: border-box; }
      body { margin: 0; padding: 18px; background: ${theme.page}; color: #111827; font: 12px "SF Mono", "Courier New", monospace; }
      .sheet { width: 322px; margin: 0 auto; background: ${theme.shell}; border: 1px solid ${theme.border}; overflow: hidden; }
      .hero { background: ${theme.accent}; color: white; padding: 16px; text-align: center; }
      .logo-badge { display: flex; justify-content: center; margin-bottom: 8px; }
      .logo-badge img { width: 46px; height: 46px; object-fit: contain; background: white; padding: 7px; }
      .store-location-line { margin-top: 4px; font-size: 11px; opacity: 0.85; }
      .content { padding: 14px 14px 16px; }
      .muted { color: ${theme.muted}; }
      .meta-row, .line-sub, .totals-row { display: flex; justify-content: space-between; gap: 8px; }
      .meta-row { margin: 4px 0; }
      .line-item { padding: 8px 0; border-bottom: 1px dashed ${theme.border}; }
      .line-main { font-weight: 700; }
      .line-sub { margin-top: 4px; color: ${theme.muted}; }
      .grand { margin-top: 10px; background: ${theme.accentStrong}; color: white; padding: 10px 12px; font-size: 15px; font-weight: 700; }
    </style>
  </head>
  <body>
    <div class="sheet">
      <div class="hero">
        ${logoMarkup(branding, "bold", "badge")}
        <div style="font-weight:700;">${escapeHtml(businessName(branding))}</div>
        ${renderStoreLocationHeaderLines(sale)}
        <div style="margin-top:4px; font-size:11px; opacity:0.85;">Receipt ${escapeHtml(saleNumber(sale))}</div>
      </div>
      <div class="content">
        <div class="meta-row"><span class="muted">Date</span><span>${escapeHtml(receiptDocumentDate(sale, selectedPayment))}</span></div>
        <div class="meta-row"><span class="muted">Customer</span><span>${escapeHtml(sale.contactId?.name || "Walk-in customer")}</span></div>
        ${receiptPaymentMethod(sale, selectedPayment) ? `<div class="meta-row"><span class="muted">Method</span><span>${escapeHtml(receiptPaymentMethod(sale, selectedPayment) || "")}</span></div>` : ""}
        <div style="margin-top:10px;">${rows}</div>
        <div class="totals-row" style="margin-top:10px;"><span class="muted">Subtotal</span><span>${escapeHtml(amount(currency, sale.subTotal))}</span></div>
        ${renderReceiptTaxRows(currency, sale, "muted")}
        ${!isPickupSale(sale) && Number(sale.deliveryFee || 0) > 0 ? `<div class="totals-row"><span class="muted">Delivery Fee</span><span>${escapeHtml(amount(currency, sale.deliveryFee))}</span></div>` : ""}
        <div class="totals-row"><span class="muted">Paid</span><span>${escapeHtml(amount(currency, paidAmount))}</span></div>
        <div class="totals-row"><span class="muted">Balance</span><span>${escapeHtml(amount(currency, balanceAmount))}</span></div>
        <div class="grand"><div class="totals-row"><span>Total</span><span>${escapeHtml(amount(currency, sale.amount))}</span></div></div>
      </div>
    </div>
  </body>
</html>`;
}

function renderClassicPosReceipt(options: SaleDocumentHtmlOptions) {
  const { sale, branding, resolvedNames, selectedPayment } = options;
  const currency = sale.currencyId?.code || "";
  const theme = thermalTheme("classic");
  const paidAmount = receiptPaymentAmount(sale, selectedPayment);
  const balanceAmount = receiptBalanceAfterPayment(sale, selectedPayment);
  const rows = sale.lineItems
    .map((line) => {
      const name = resolvedNames[String(typeof line.productId === "string" ? line.productId : line.productId?.id || "")] || resolvedNames[line.productName] || line.productName;
      return `<div class="line-item"><div class="line-main">${escapeHtml(name)}</div><div class="line-sub"><span>${escapeHtml(line.quantity)} x ${escapeHtml(amount(currency, line.unitPrice))}</span><span>${escapeHtml(amount(currency, line.total))}</span></div></div>`;
    })
    .join("");

  return `<!doctype html>
<html>
  <head>
    <meta charset="utf-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1" />
    <style>
      * { box-sizing: border-box; }
      body { margin: 0; padding: 18px; background: ${theme.page}; color: #3b2f1c; font: 12px Georgia, "Times New Roman", serif; }
      .sheet { width: 320px; margin: 0 auto; padding: 16px; background: ${theme.shell}; border: 1px solid ${theme.border}; }
      .center { text-align: center; }
      .logo-center { text-align: center; margin-bottom: 8px; }
      .logo-center img { width: 58px; height: 58px; object-fit: contain; }
      .store-location-line { margin-top: 4px; }
      .rule { margin: 10px 0; border-top: 1px solid ${theme.border}; }
      .muted { color: ${theme.muted}; }
      .meta-row, .line-sub, .totals-row { display: flex; justify-content: space-between; gap: 8px; }
      .meta-row { margin: 4px 0; }
      .line-item { padding: 7px 0; border-bottom: 1px solid ${theme.border}; }
      .line-main { font-weight: 700; }
      .line-sub { margin-top: 4px; color: ${theme.muted}; }
      .total { border-top: 1px solid ${theme.border}; margin-top: 10px; padding-top: 10px; font-size: 14px; font-weight: 700; }
    </style>
  </head>
  <body>
    <div class="sheet">
      ${logoMarkup(branding, "classic", "center")}
      <div class="center">
        <div style="font-weight:700; text-transform:uppercase;">${escapeHtml(businessName(branding))}</div>
        ${renderStoreLocationHeaderLines(sale)}
        <div class="muted">${escapeHtml(saleNumber(sale))}</div>
      </div>
      <div class="rule"></div>
      <div class="meta-row"><span class="muted">Date</span><span>${escapeHtml(receiptDocumentDate(sale, selectedPayment))}</span></div>
      <div class="meta-row"><span class="muted">Customer</span><span>${escapeHtml(sale.contactId?.name || "Walk-in customer")}</span></div>
      ${receiptPaymentMethod(sale, selectedPayment) ? `<div class="meta-row"><span class="muted">Method</span><span>${escapeHtml(receiptPaymentMethod(sale, selectedPayment) || "")}</span></div>` : ""}
      <div class="rule"></div>
      ${rows}
      <div class="totals-row"><span class="muted">Subtotal</span><span>${escapeHtml(amount(currency, sale.subTotal))}</span></div>
      ${renderReceiptTaxRows(currency, sale, "muted")}
      ${!isPickupSale(sale) && Number(sale.deliveryFee || 0) > 0 ? `<div class="totals-row"><span class="muted">Delivery Fee</span><span>${escapeHtml(amount(currency, sale.deliveryFee))}</span></div>` : ""}
      <div class="totals-row"><span class="muted">Paid</span><span>${escapeHtml(amount(currency, paidAmount))}</span></div>
      <div class="totals-row"><span class="muted">Balance</span><span>${escapeHtml(amount(currency, balanceAmount))}</span></div>
      <div class="totals-row total"><span>Total</span><span>${escapeHtml(amount(currency, sale.amount))}</span></div>
    </div>
  </body>
</html>`;
}

export function generateSaleDocumentHtml(options: SaleDocumentHtmlOptions) {
  const isPosReceipt = options.type === "receipt" && options.sale.source === "POS";

  if (isPosReceipt) {
    switch (options.template) {
      case "bold":
        return renderBoldPosReceipt(options);
      case "classic":
        return renderClassicPosReceipt(options);
      case "minimal":
        return renderMinimalPosReceipt(options);
      default:
        return renderModernPosReceipt(options);
    }
  }

  switch (options.template) {
    case "bold":
      return renderBoldSaleDocument(options);
    case "classic":
      return renderClassicSaleDocument(options);
    case "minimal":
      return renderMinimalSaleDocument(options);
    default:
      return renderModernSaleDocument(options);
  }
}

function purchasePreviewTheme(template: StoreDocumentTemplateKey) {
  switch (template) {
    case "bold":
      return { border: "#c7d2fe", accent: "#4f46e5", soft: "#eef2ff", textMuted: "#4338ca" };
    case "classic":
      return { border: "#e7c98c", accent: "#9a6700", soft: "#fff7df", textMuted: "#9a6700" };
    case "minimal":
      return { border: "#e5e7eb", accent: "#111827", soft: "#ffffff", textMuted: "#6b7280" };
    default:
      return { border: "#b5e3dc", accent: "#2d837d", soft: "#f2fbfa", textMuted: "#49616b" };
  }
}

function renderPurchasePreview(template: StoreDocumentTemplateKey, branding: DocumentBrandingContext) {
  const theme = purchasePreviewTheme(template);
  const currency = samplePurchase.currencyId?.code || "USD";
  const rows = samplePurchase.lineItems
    .map(
      (line: Purchase["lineItems"][number]) => `<tr><td>${escapeHtml(line.productName)}${line.productSku ? `<div class="subtle">SKU: ${escapeHtml(line.productSku)}</div>` : ""}</td><td class="right">${escapeHtml(line.quantity)}</td><td class="right">${escapeHtml(amount(currency, line.unitPrice))}</td><td class="right">${escapeHtml(amount(currency, line.total))}</td></tr>`,
    )
    .join("");

  if (template === "bold") {
    return `<!doctype html><html><head><meta charset="utf-8" /><meta name="viewport" content="width=device-width, initial-scale=1" /><style>
      *{box-sizing:border-box} body{margin:0;padding:18px;background:#eef2ff;color:#111827;font:13px Inter,Arial,sans-serif}
      .sheet{max-width:960px;margin:0 auto;background:#fff;border:1px solid ${theme.border};overflow:hidden}
      .hero{background:linear-gradient(135deg,#312e81,#4f46e5);color:white;padding:20px 22px;display:flex;justify-content:space-between;gap:16px}
      .hero-left{display:flex;gap:12px;align-items:center}.logo-badge img{width:52px;height:52px;object-fit:contain;background:white;padding:8px}
      .content{padding:18px 22px 22px}.meta{display:grid;grid-template-columns:repeat(4,minmax(0,1fr));gap:10px;margin-bottom:16px}
      .meta-item{background:#eef2ff;border:1px solid ${theme.border};padding:11px}.label{font-size:11px;letter-spacing:.12em;text-transform:uppercase;color:#4338ca}
      table{width:100%;border-collapse:collapse} th{background:#4f46e5;color:white;font-size:12px;text-transform:uppercase;text-align:left} th,td{padding:10px 12px;border-bottom:1px solid ${theme.border};vertical-align:top}.right{text-align:right}.subtle{margin-top:3px;color:#4338ca;font-size:11px}
      .summary{width:280px;margin:16px 0 0 auto;background:#312e81;color:white;padding:12px 14px}.summary table{width:100%}.summary td{padding:5px 0}.summary .total td{padding-top:8px;border-top:1px solid rgba(255,255,255,.2);font-size:15px;font-weight:800}
      @media (max-width:720px){.hero{display:block}.hero-left{margin-bottom:16px}.meta{grid-template-columns:repeat(2,minmax(0,1fr))}.summary{width:100%}}
    </style></head><body><div class="sheet"><div class="hero"><div class="hero-left">${logoMarkup(branding, template, "badge")}<div><div style="font-size:12px;letter-spacing:.18em;text-transform:uppercase;opacity:.8;">Purchase Order</div><div style="font-size:28px;font-weight:800;margin-top:6px;">${escapeHtml(businessName(branding))}</div></div></div><div style="text-align:right;"><div style="opacity:.8;font-size:12px;text-transform:uppercase;">Order Number</div><div style="font-size:28px;font-weight:800;">${escapeHtml(samplePurchase.purchaseNumber)}</div></div></div><div class="content"><div class="meta"><div class="meta-item"><div class="label">Supplier</div><strong>${escapeHtml(samplePurchase.contactId?.name)}</strong></div><div class="meta-item"><div class="label">Date</div><strong>${escapeHtml(formatDate(samplePurchase.date))}</strong></div><div class="meta-item"><div class="label">Delivery</div><strong>${escapeHtml(formatDate(samplePurchase.deliveryDate))}</strong></div><div class="meta-item"><div class="label">Location</div><strong>${escapeHtml(samplePurchase.locationId?.name)}</strong></div></div><table><thead><tr><th>Item</th><th class="right">Qty</th><th class="right">Unit Cost</th><th class="right">Amount</th></tr></thead><tbody>${rows}</tbody></table><div class="summary"><table><tr><td>Subtotal</td><td class="right">${escapeHtml(amount(currency, samplePurchase.subTotal))}</td></tr><tr><td>Discount</td><td class="right">- ${escapeHtml(amount(currency, samplePurchase.discountAmount))}</td></tr><tr><td>Tax</td><td class="right">${escapeHtml(amount(currency, samplePurchase.taxAmount))}</td></tr><tr class="total"><td>Total</td><td class="right">${escapeHtml(amount(currency, samplePurchase.amount))}</td></tr></table></div></div></div></body></html>`;
  }

  if (template === "classic") {
    return `<!doctype html><html><head><meta charset="utf-8" /><meta name="viewport" content="width=device-width, initial-scale=1" /><style>
      *{box-sizing:border-box} body{margin:0;padding:18px;background:#fffaf0;color:#3b2f1c;font:14px Georgia,"Times New Roman",serif}
      .sheet{max-width:920px;margin:0 auto;background:#fffdf7;border:1px solid ${theme.border};padding:22px 24px 20px}
      .logo-center{text-align:center;margin-bottom:8px}.logo-center img{width:62px;height:62px;object-fit:contain}.title{text-align:center}.title h1{margin:0;font-size:22px;text-transform:uppercase}.subtitle{margin-top:4px;color:${theme.textMuted};font-size:12px}.rule{margin:14px 0;border-top:2px solid ${theme.border}}
      .meta{display:grid;grid-template-columns:1fr 1fr;gap:16px;margin-bottom:16px}.meta p{margin:4px 0 0}.label{color:${theme.textMuted};font-size:12px;text-transform:uppercase;letter-spacing:.14em}
      table{width:100%;border-collapse:collapse} th{background:#f3e1b4;color:#7c4a03;font-size:12px;text-transform:uppercase;text-align:left} th,td{padding:9px 8px;border-bottom:1px solid ${theme.border};vertical-align:top}.right{text-align:right}.subtle{margin-top:3px;color:${theme.textMuted};font-size:11px}
      .summary{width:280px;margin:16px 0 0 auto}.summary td{padding:4px 0;border:0}.summary .total td{padding-top:8px;border-top:1px solid ${theme.border};font-size:15px;font-weight:700}
      @media (max-width:720px){.meta{grid-template-columns:1fr}.summary{width:100%}}
    </style></head><body><div class="sheet">${logoMarkup(branding, template, "center")}<div class="title"><h1>${escapeHtml(businessName(branding))}</h1><div class="subtitle">Purchase Order · ${escapeHtml(samplePurchase.purchaseNumber)}</div></div><div class="rule"></div><div class="meta"><div><div class="label">Supplier</div><p><strong>${escapeHtml(samplePurchase.contactId?.name)}</strong></p><p>${escapeHtml(samplePurchase.contactId?.email)}</p><p>${escapeHtml(samplePurchase.contactId?.phone)}</p></div><div style="text-align:right;"><div class="label">Document Info</div><p>Date: ${escapeHtml(formatDate(samplePurchase.date))}</p><p>Delivery: ${escapeHtml(formatDate(samplePurchase.deliveryDate))}</p><p>Location: ${escapeHtml(samplePurchase.locationId?.name)}</p><p>Terms: Net 30</p></div></div><table><thead><tr><th>Item Description</th><th class="right">Qty</th><th class="right">Unit Cost</th><th class="right">Extended</th></tr></thead><tbody>${rows}</tbody></table><table class="summary"><tr><td>Subtotal</td><td class="right">${escapeHtml(amount(currency, samplePurchase.subTotal))}</td></tr><tr><td>Discount</td><td class="right">- ${escapeHtml(amount(currency, samplePurchase.discountAmount))}</td></tr><tr><td>Tax</td><td class="right">${escapeHtml(amount(currency, samplePurchase.taxAmount))}</td></tr><tr class="total"><td>Total</td><td class="right">${escapeHtml(amount(currency, samplePurchase.amount))}</td></tr></table></div></body></html>`;
  }

  if (template === "minimal") {
    return `<!doctype html><html><head><meta charset="utf-8" /><meta name="viewport" content="width=device-width, initial-scale=1" /><style>
      *{box-sizing:border-box} body{margin:0;padding:18px;background:white;color:#111827;font:13px Inter,Arial,sans-serif}
      .sheet{max-width:920px;margin:0 auto;background:white;border:1px solid ${theme.border};padding:18px}
      .masthead{display:grid;grid-template-columns:minmax(0,1.2fr) 220px;gap:18px;align-items:end;padding-bottom:10px;border-bottom:2px solid #111827}.eyebrow{font-size:11px;letter-spacing:.16em;text-transform:uppercase;color:${theme.textMuted}}
      .title{margin-top:6px;font-size:24px;font-weight:700;letter-spacing:-.03em}.company{margin-top:4px;color:${theme.textMuted}}
      .doc-meta{border-left:1px solid ${theme.border};padding-left:14px}.doc-meta-row{display:flex;justify-content:space-between;gap:8px;padding:4px 0;border-bottom:1px solid ${theme.border}}.doc-meta-row:last-child{border-bottom:0}
      .label,.section-title{font-size:10px;letter-spacing:.14em;text-transform:uppercase;color:${theme.textMuted}}.contact-strip{display:grid;grid-template-columns:minmax(0,1fr) 220px;gap:14px;margin-top:14px;padding-bottom:12px;border-bottom:1px solid ${theme.border}}
      .contact-block p,.terms p{margin:4px 0 0}.terms{text-align:right} table{width:100%;border-collapse:collapse}.ledger{margin-top:14px}
      th{background:transparent;color:#475569;font-size:11px;text-transform:uppercase;text-align:left;border-bottom:1px solid #111827} th,td{padding:9px 8px;border-bottom:1px solid ${theme.border};vertical-align:top}.right{text-align:right}.subtle{margin-top:3px;color:${theme.textMuted};font-size:11px}
      .closing{display:grid;grid-template-columns:minmax(0,1fr) 240px;gap:16px;margin-top:14px;align-items:start}.note{border-top:1px solid ${theme.border};padding-top:10px;color:${theme.textMuted};line-height:1.55}
      .summary{width:100%;border-top:2px solid #111827;padding-top:8px}.summary td{padding:4px 0;border:0}.summary .total td{padding-top:8px;border-top:1px solid ${theme.border};font-size:14px;font-weight:700;color:#111827}
      @media (max-width:720px){.masthead,.contact-strip,.closing{grid-template-columns:1fr}.doc-meta{border-left:0;padding-left:0}.terms{text-align:left}}
    </style></head><body><div class="sheet"><div class="masthead"><div><div class="eyebrow">Supplier Order</div><div class="title">Purchase Order</div><div class="company">${escapeHtml(businessName(branding))}</div></div><div class="doc-meta"><div class="doc-meta-row"><span class="label">Number</span><span>${escapeHtml(samplePurchase.purchaseNumber)}</span></div><div class="doc-meta-row"><span class="label">Issued</span><span>${escapeHtml(formatDate(samplePurchase.date))}</span></div><div class="doc-meta-row"><span class="label">Delivery</span><span>${escapeHtml(formatDate(samplePurchase.deliveryDate))}</span></div></div></div><div class="contact-strip"><div class="contact-block"><div class="section-title">Supplier</div><p><strong>${escapeHtml(samplePurchase.contactId?.name)}</strong></p><p>${escapeHtml(samplePurchase.contactId?.email)}</p><p>${escapeHtml(samplePurchase.contactId?.phone)}</p></div><div class="terms"><div class="section-title">Terms</div><p>Net 30</p><p>${escapeHtml(samplePurchase.locationId?.name)}</p></div></div><table class="ledger"><thead><tr><th>Item</th><th class="right">Qty</th><th class="right">Unit Cost</th><th class="right">Amount</th></tr></thead><tbody>${rows}</tbody></table><div class="closing"><div class="note">${escapeHtml(samplePurchase.note || "Prepared for supplier confirmation with current quantities, costs, and delivery expectations.")}</div><table class="summary"><tr><td>Subtotal</td><td class="right">${escapeHtml(amount(currency, samplePurchase.subTotal))}</td></tr><tr><td>Tax</td><td class="right">${escapeHtml(amount(currency, samplePurchase.taxAmount))}</td></tr><tr class="total"><td>Total</td><td class="right">${escapeHtml(amount(currency, samplePurchase.amount))}</td></tr></table></div></div></body></html>`;
  }

  return `<!doctype html><html><head><meta charset="utf-8" /><meta name="viewport" content="width=device-width, initial-scale=1" /><style>
    *{box-sizing:border-box} body{margin:0;padding:18px;background:#f3f4f6;color:#0f172a;font:13px Inter,Arial,sans-serif}
    .sheet{max-width:960px;margin:0 auto;background:white;border:1px solid ${theme.border}}
    .hero{display:grid;grid-template-columns:minmax(0,1.65fr) 280px;border-bottom:1px solid ${theme.border}}.brand-panel{padding:22px;border-right:1px solid ${theme.border}}.doc-panel{padding:22px;background:#f8fafc}
    .brand{display:flex;gap:14px;align-items:flex-start}.logo-inline img{width:56px;height:56px;object-fit:contain;background:white;padding:8px;border:1px solid ${theme.border}}
    .eyebrow{color:${theme.accent};font-size:12px;letter-spacing:.16em;text-transform:uppercase;font-weight:700} h1{margin:8px 0 4px;font-size:24px}.muted{color:${theme.textMuted}}
    .doc-panel .type{font-size:12px;letter-spacing:.16em;text-transform:uppercase;color:${theme.accent};font-weight:700}.doc-panel .number{margin-top:8px;font-size:22px;font-weight:700;color:#111827}.doc-panel .meta-row{display:flex;justify-content:space-between;gap:8px;margin-top:8px;padding-top:8px;border-top:1px solid ${theme.border};color:${theme.textMuted};font-size:12px}
    .content{padding:18px 22px 22px}.meta-grid{display:grid;grid-template-columns:1.1fr .9fr;border:1px solid ${theme.border}}.meta-card{padding:14px;background:white}.meta-card + .meta-card{border-left:1px solid ${theme.border};background:#f8fafc}.meta-card .label{color:${theme.textMuted};font-size:11px;letter-spacing:.12em;text-transform:uppercase}.meta-card p{margin:6px 0 0}
    table{width:100%;border-collapse:collapse}.table-shell{margin-top:16px;border:1px solid ${theme.border};overflow:hidden}th{background:#111827;color:white;font-size:12px;letter-spacing:.08em;text-transform:uppercase;text-align:left}th,td{padding:10px 12px;border-bottom:1px solid ${theme.border};vertical-align:top}.right{text-align:right}.subtle{margin-top:3px;color:${theme.textMuted};font-size:11px}
    .bottom{display:grid;grid-template-columns:minmax(0,1.2fr) 280px;gap:16px;margin-top:16px;align-items:start}.note{border-left:4px solid #111827;background:#e5e7eb;padding:14px;color:${theme.textMuted}}.note p{margin:8px 0 0}.summary td{padding:4px 0;border:0}.summary .total td{padding-top:9px;border-top:2px solid #111827;font-size:15px;font-weight:700;color:#111827}
    @media (max-width:720px){.hero,.meta-grid,.bottom{grid-template-columns:1fr}.brand-panel{border-right:0;border-bottom:1px solid ${theme.border}}.meta-card + .meta-card{border-left:0;border-top:1px solid ${theme.border}}}
  </style></head><body><div class="sheet"><div class="hero"><div class="brand-panel"><div class="brand">${logoMarkup(branding, template, "inline")}<div><div class="eyebrow">Purchase Order</div><h1>${escapeHtml(businessName(branding))}</h1></div></div></div><div class="doc-panel"><div class="type">Purchase Order</div><div class="number">${escapeHtml(samplePurchase.purchaseNumber)}</div><div class="meta-row"><span>Date</span><span>${escapeHtml(formatDate(samplePurchase.date))}</span></div><div class="meta-row"><span>Delivery</span><span>${escapeHtml(formatDate(samplePurchase.deliveryDate))}</span></div><div class="meta-row"><span>Terms</span><span>Net 30</span></div></div></div><div class="content"><div class="meta-grid"><div class="meta-card"><div class="label">Supplier</div><p><strong>${escapeHtml(samplePurchase.contactId?.name)}</strong></p><p>${escapeHtml(samplePurchase.contactId?.email)}</p><p>${escapeHtml(samplePurchase.contactId?.phone)}</p></div><div class="meta-card"><div class="label">Location</div><p><strong>${escapeHtml(samplePurchase.locationId?.name)}</strong></p><p>${escapeHtml(samplePurchase.locationId?.address)}</p><p>Prepared by ${escapeHtml(samplePurchase.createdBy?.name)}</p></div></div><div class="table-shell"><table><thead><tr><th>Item</th><th class="right">Qty</th><th class="right">Unit Cost</th><th class="right">Amount</th></tr></thead><tbody>${rows}</tbody></table></div><div class="bottom"><div class="note"><strong>Purchase note</strong><p>${escapeHtml(samplePurchase.note || "Sample purchase order preview.")}</p></div><table class="summary"><tr><td>Subtotal</td><td class="right">${escapeHtml(amount(currency, samplePurchase.subTotal))}</td></tr><tr><td>Discount</td><td class="right">- ${escapeHtml(amount(currency, samplePurchase.discountAmount))}</td></tr><tr><td>Tax</td><td class="right">${escapeHtml(amount(currency, samplePurchase.taxAmount))}</td></tr><tr class="total"><td>Total</td><td class="right">${escapeHtml(amount(currency, samplePurchase.amount))}</td></tr></table></div></div></div></body></html>`;
}

export function generateDocumentPreviewHtml(moduleKey: DocumentModuleKey, template: StoreDocumentTemplateKey, branding: DocumentBrandingContext) {
  if (moduleKey === "purchaseOrderTemplate") {
    return renderPurchasePreview(template, branding);
  }

  if (moduleKey === "salesInvoiceTemplate") {
    return generateSaleDocumentHtml({
      sale: sampleSale,
      type: "invoice",
      template,
      branding,
      resolvedNames: {
        "product-10": "Signature Tote",
        "product-11": "Ceramic Mug",
        "product-12": "Gift Wrap Pack",
      },
      paymentTermsLabel: "Net 15",
    });
  }

  if (moduleKey === "salesReceiptTemplate") {
    return generateSaleDocumentHtml({
      sale: sampleSale,
      type: "receipt",
      template,
      branding,
      resolvedNames: {
        "product-10": "Signature Tote",
        "product-11": "Ceramic Mug",
        "product-12": "Gift Wrap Pack",
      },
      paymentTermsLabel: "Net 15",
    });
  }

  return generateSaleDocumentHtml({
    sale: samplePosReceipt,
    type: "receipt",
    template,
    branding,
    resolvedNames: {
      "product-20": "Vanilla Candle",
      "product-21": "Match Box",
    },
    paymentTermsLabel: "Due on receipt",
  });
}
