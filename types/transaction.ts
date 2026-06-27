export enum TransactionType {
  SALE = "sale",
  PURCHASE = "purchase",
  SUPPLIER_PAYMENT = "supplier_payment",
  SUPPLIER_ADVANCE = "supplier_advance",
  SUPPLIER_CREDIT = "supplier_credit",
  SUPPLIER_REFUND = "supplier_refund",
  CUSTOMER_PAYMENT = "customer_payment",
  ISSUE_CREDIT = "issue_credit",
  APPLY_CREDIT = "apple_credit",
  PAYMENT = "payment",
  CHANGE = "change",
  REFUND = "refund",
  WRITE_OFF = "write_off",
  EXPENSE = "expense",
  PURCHASE_LANDED_COST = "purchase_landed_cost",
}

export interface ExpenseCategory {
  id: string;
  name: string;
  description?: string;
  isLocked?: boolean;
}

export interface ApplyPaymentInput {
  type: TransactionType;
  date: Date;
  linkTransactionId: string;
  note?: string;
  rate?: number;
  amount: number;
  paymentMethodId?: string;
}

export interface UpdateAppliedPaymentInput extends Partial<ApplyPaymentInput> {
  id: string;
}

export interface UpdateExpenseCategoryInput {
  id: string;
  name: string;
  description?: string;
  isLocked: boolean;
}

export interface ExpenseCategoryQueryParams {
  search?: string | "";
  isLocked?: boolean;
}

export interface Payment {
  id: string;
  type: TransactionType;
  date: Date;
  status: string;
  amount: number;
  baseAmount: number;
  rate: number;
  currency: { code: string; id: string };
  paymentMethod?: { name: string; id: string };
  note?: string;
  createdBy: { name: string; id: string };
}

export type UpdatePaymentInput = UpdateAppliedPaymentInput;

export interface TransactionAttachment {
  url: string;
  key: string;
  type?: string;
}

export interface UpdateExpenseInput {
  id: string;
  type: TransactionType;
  note?: string;
  date?: Date;
  rate?: number;
  currencyId?: string;
  totalAmount?: number;
  categoryId?: number;
  contactId?: number;
}

export interface Transaction {
  id?: string;
  title?: string;
  type?: TransactionType;
  typeLabel?: string;
  documentNumber?: string;
  detailPath?: string;
  note?: string;
  date?: Date;
  status: string;
  statusLabel?: string;
  fulfillmentStatus?: string;
  fulfillmentStatusLabel?: string;
  paymentStatus?: string;
  paymentStatusLabel?: string;
  amount?: number;
  baseAmount?: number;
  rate?: number;
  balance?: number;
  currency?: { code: string; id: string };
  category?: { name: string; id: string };
  contact?: { name: string; displayName: string; id: string };
  paymentMethod?: { name: string; id: string };
  linkedDocumentSnapshot?: { id?: string; type: string; number: string; status?: string };
  linkedTransactionId?: string;
  formattedTotal?: string;
  formattedBalance?: string;
  createdAtFormatted?: string;
  updatedAtFormatted?: string;
  reference?: string;
  createdBy?: { name: string; id: string };
  attachments?: TransactionAttachment[];
  createdAt?: Date;
  updatedAt?: Date;
}

export interface Expense extends Transaction {
  payments: Transaction[];
}

export interface CreateExpenseInput {
  title: string;
  note?: string;
  date?: string;
  amount?: number;
  rate?: string;
  currencyId?: string;
  categoryId?: string;
}

export interface ExpenseQueryParams {
  type: TransactionType;
  page?: number;
  limit?: number;
  search?: string | "";
  category?: string;
  categoryId?: string;
  contactId?: string;
  status?: string;
  dateFrom?: string;
  dateTo?: string;
  sortBy?: string;
  sortOrder?: "asc" | "desc";
  amount?: number;
}

export interface TransactionSummaryQueryParams {
  type?: TransactionType;
  categoryId?: string;
  contactId?: string;
  date?: string;
}

export interface ExpenseSummary {
  toBePaid: number;
  paid: number;
  total: number;
}

export interface ContactTransactionQueryParams {
  bucket?: "all" | "receivables" | "payables";
  page?: number;
  limit?: number;
  search?: string;
  sortBy?: string;
  sortOrder?: "asc" | "desc";
  dateFrom?: string;
  dateTo?: string;
}
