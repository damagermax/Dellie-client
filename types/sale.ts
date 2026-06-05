import { PaginatedResponse } from "./shared";
import { PurchaseDiscountType, PurchaseLineItem, PurchaseReceiptStatus, PurchaseReturnEvent, PurchaseStockEvent } from "./purchase";

export interface SaleLineItemInput {
  productId: string;
  quantity: number;
  unitPrice: number;
  discountValue?: number;
  discountType?: PurchaseDiscountType;
  taxId?: string;
}

export interface CreateSaleInput {
  contactId: string;
  date: string;
  deliveryDate?: string;
  locationId: string;
  currencyId: string;
  rate: number;
  status?: "open" | "draft";
  paymentTerms?: string;
  dueDate?: string;
  note?: string;
  source?: string;
  discountValue?: number;
  discountType?: PurchaseDiscountType;
  taxId?: string;
  lineItems: SaleLineItemInput[];
}

export interface Sale extends Omit<CreateSaleInput, "contactId" | "locationId" | "currencyId" | "lineItems"> {
  id: string;
  saleNumber?: string;
  quoteNumber?: string;
  documentNumber?: string;
  type: "sale";
  status: "open" | "closed" | "draft";
  receiptStatus: PurchaseReceiptStatus;
  locked?: boolean;
  isDeleted?: boolean;
  contactId?: { id: string; name: string; displayName?: string; email?: string; phone?: string };
  locationId?: { id: string; name: string; address?: string };
  currencyId?: { id: string; code: string; name?: string };
  createdBy?: { id: string; name: string; email?: string };
  lineItems: PurchaseLineItem[];
  fulfilledItems?: PurchaseStockEvent[];
  returnedItems?: PurchaseReturnEvent[];
  taxes?: { name: string; value: number; amount: number; baseAmount: number }[];
  subTotal: number;
  discountAmount: number;
  taxAmount: number;
  amount: number;
  balance: number;
  paymentStatus: "unpaid" | "partial" | "paid";
  source?: string;
  payments?: unknown[];
  createdAt: string;
  updatedAt: string;
}

export interface UpdateSaleInput extends Partial<CreateSaleInput> {
  id: string;
}

export interface SaleQueryParams {
  page?: number;
  limit?: number;
  search?: string;
  status?: "open" | "closed" | "draft";
}

export type SalesResponse = PaginatedResponse<Sale>;

export interface SaleOperationItemInput {
  lineItemId: string;
  quantity: number;
}

export interface FulfillSaleInput {
  id: string;
  items: SaleOperationItemInput[];
}

export interface UpdateSaleFulfillmentInput {
  id: string;
  fulfillmentId: string;
  quantity: number;
  date: string;
}
