export interface DashboardOverviewSaleItem {
  id: string;
  documentNumber: string;
  customerName: string;
  date: string;
  amount: number;
  balance: number;
  currencyCode: string;
}

export interface DashboardOverviewWatchlistItem {
  id: string;
  productId: string;
  name: string;
  sku?: string;
  issue: "out_of_stock" | "stock_alert" | "expired" | "expiring_soon";
  availableQuantity?: number;
  lowStockThreshold?: number;
  affectedQuantity?: number;
  expiryDate?: string;
}

export interface DashboardAttentionCounts {
  unpaidSales: number;
  overdueInvoices: number;
  unfulfilledSales: number;
  unpaidPurchases: number;
  overdueExpenses: number;
}

export interface DashboardOverviewQueryParams {
  locationId?: string;
}

export interface DashboardOverviewResponse {
  currencyCode: string;
  summary: {
    revenueToday: number;
    salesToday: number;
    totalProducts: number;
    totalCustomers: number;
  };
  attentionCounts: DashboardAttentionCounts;
  criticalStockWatchlist: DashboardOverviewWatchlistItem[];
  salesToday: DashboardOverviewSaleItem[];
  recentSales: DashboardOverviewSaleItem[];
}
