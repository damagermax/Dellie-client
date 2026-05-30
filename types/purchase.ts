import { PaginatedResponse } from "./shared";

export type PurchaseDiscountType = "fixed" | "percent";
export type PurchaseReceiptStatus = "pending" | "partially_received" | "received";

export interface PurchaseLineItemInput {
  productId: string;
  quantity: number;
  unitPrice: number;
  taxId?: string;
}

export interface PurchaseLineItem extends Omit<PurchaseLineItemInput, "productId"> {
  id: string;
  productId: string | { id: string; name: string; sku?: string; type?: string; media?: { url: string }[] };
  productName: string;
  productSku?: string;
  productUrl?: string;
  subtotal: number;
  taxDescription?: string;
  taxRate?: number;
  taxAmount: number;
  total: number;
  fulfilledQuantity?: number;
  returnedQuantity?: number;
  landedCost?: number;
}

export interface CreatePurchaseInput {
  contactId: string;
  date: string;
  deliveryDate?: string;
  locationId: string;
  currencyId: string;
  rate: number;
  paymentTerms?: string;
  dueDate?: string;
  note?: string;
  discountValue?: number;
  discountType?: PurchaseDiscountType;
  taxId?: string;
  lineItems: PurchaseLineItemInput[];
}

export interface Purchase extends Omit<CreatePurchaseInput, "contactId" | "locationId" | "currencyId" | "lineItems"> {
  id: string;
  purchaseNumber: string;
  type: "purchase";
  status: "open" | "closed" | "draft";
  receiptStatus: PurchaseReceiptStatus;
  locked?: boolean;
  contactId?: { id: string; name: string; displayName?: string; email?: string; phone?: string };
  locationId?: { id: string; name: string; address?: string };
  currencyId?: { id: string; code: string; name?: string };
  createdBy?: { id: string; name: string; email?: string };
  lineItems: PurchaseLineItem[];
  fulfilledItems?: PurchaseStockEvent[];
  returnedItems?: PurchaseReturnEvent[];
  landedCosts?: PurchaseLandedCost[];
  landedCostTotal?: number;
  baseLandedCostTotal?: number;
  taxes?: { name: string; value: number; amount: number; baseAmount: number }[];
  subTotal: number;
  discountAmount: number;
  taxAmount: number;
  amount: number;
  balance: number;
  paymentStatus: "unpaid" | "partial" | "paid";
  payments?: unknown[];
  createdAt: string;
  updatedAt: string;
}

export interface UpdatePurchaseInput extends Partial<CreatePurchaseInput> {
  id: string;
}

export interface PurchaseQueryParams {
  page?: number;
  limit?: number;
  search?: string;
  status?: "open" | "closed" | "draft";
}

export type PurchasesResponse = PaginatedResponse<Purchase>;

export interface PurchaseOperationItemInput {
  lineItemId: string;
  quantity: number;
}

export interface FulfillPurchaseInput {
  id: string;
  items: PurchaseOperationItemInput[];
}

export interface ReturnPurchaseInput {
  id: string;
  items: (PurchaseOperationItemInput & { reason?: string })[];
}

export type PurchaseLandedCostAllocation = "BUY_VALUE" | "QUANTITY" | "WEIGHT";
export type PurchaseLandedCostScope = "ALL_ITEMS" | "SELECTED_ITEMS";

export interface AddPurchaseLandedCostInput {
  id: string;
  name: string;
  amount: number;
  currencyId: string;
  exchangeRate: number;
  allocationMethod: PurchaseLandedCostAllocation;
  appliesTo?: PurchaseLandedCostScope;
  contactId?: string;
  lineItemIds?: string[];
}

export interface PurchaseStockEvent {
  id: string;
  lineItemId: string;
  productId: string | { id: string; name: string; sku?: string; media?: { url: string }[] };
  quantity: number;
  fulfilledAt: string;
}

export interface PurchaseReturnEvent extends Omit<PurchaseStockEvent, "fulfilledAt"> {
  returnedAt: string;
  reason?: string;
}

export interface PurchaseLandedCost {
  id: string;
  name: string;
  amount: number;
  baseAmount: number;
  exchangeRate: number;
  allocationMethod: PurchaseLandedCostAllocation;
  appliesTo?: PurchaseLandedCostScope;
  currencyId: string | { id: string; code: string; name?: string };
  lineItemIds: string[];
}
