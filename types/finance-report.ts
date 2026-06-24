export interface FinanceReportQuery {
  dateFrom: string;
  dateTo: string;
  storeId?: string;
}

export interface ExpenseReportQuery extends FinanceReportQuery {
  categoryId?: string;
}

interface FinanceReportPeriod {
  dateFrom: string;
  dateTo: string;
  bucket: "day" | "week" | "month";
}

export interface CashflowReportResponse {
  currencyCode: string;
  period: FinanceReportPeriod;
  summary: {
    receivables: number;
    payables: number;
    cashCollected: number;
    cashOutflow: number;
    netCashFlow: number;
  };
  trend: Array<{ label: string; inflow: number; outflow: number }>;
  overdueBalances: Array<{
    id: string;
    type: "sale" | "purchase";
    reference: string;
    contactName: string;
    dueDate: string;
    balance: number;
  }>;
  paymentMethods: Array<{
    name: string;
    paymentCount: number;
    amount: number;
    share: number;
  }>;
  settlementMetrics: Array<{
    documentType: "sale" | "purchase" | "expense";
    payments: { amount: number; count: number };
    refunds: { amount: number; count: number };
    writeOffs: { amount: number; count: number };
  }>;
  recentPayments: Array<{
    id: string;
    direction: "inflow" | "outflow";
    label: string;
    reference: string;
    contactName: string;
    paymentMethodName?: string;
    amount: number;
    date: string;
  }>;
}

export interface ExpenseReportResponse {
  currencyCode: string;
  period: FinanceReportPeriod;
  summary: {
    totalExpenses: number;
    paidAmount: number;
    outstandingAmount: number;
    expenseCount: number;
  };
  trend: Array<{ label: string; total: number }>;
  categories: Array<{
    id?: string;
    name: string;
    expenseCount: number;
    total: number;
    share: number;
  }>;
  largestExpenses: Array<{
    id: string;
    note: string;
    contactName: string;
    categoryName: string;
    date: string;
    total: number;
    paid: number;
    outstanding: number;
  }>;
}
