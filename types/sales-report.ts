export interface SalesReportQuery {
  dateFrom: string;
  dateTo: string;
  locationId?: string;
  storeId?: string;
}

export interface SalesReportMetric {
  value: number;
}

export interface SalesReportResponse {
  currencyCode: string;
  period: {
    dateFrom: string;
    dateTo: string;
    previousDateFrom: string;
    previousDateTo: string;
    bucket: "day" | "week" | "month";
  };
  summary: {
    grossRevenue: SalesReportMetric;
    netSales: SalesReportMetric;
    totalSales: SalesReportMetric;
    canceledOrders: SalesReportMetric;
    grossProfit: SalesReportMetric;
    totalDiscount: SalesReportMetric;
  };
  overview: Array<{ label: string; revenue: number; orders: number }>;
  discountTrend: Array<{ label: string; discount: number }>;
  orderProfits: Array<{
    id: string;
    orderNumber: string;
    customerName: string;
    itemCount: number;
    totalAmount: number;
    grossProfit: number;
  }>;
  topCustomers: Array<{ id?: string; name: string; orderCount: number; paidOrderCount: number; netSales: number }>;
  salesByChannel: Array<{ channel: "POS" | "Manual" | "Website"; netSales: number; share: number }>;
  categoryContribution: Array<{ id?: string; name: string; unitsSold: number; netSales: number; share: number }>;
  topProducts: Array<{ id: string; name: string; unitsSold: number; netSales: number }>;
}
