export interface PurchaseReportQuery {
  dateFrom: string;
  dateTo: string;
  locationId?: string;
  storeId?: string;
}

export interface PurchaseReportMetric {
  value: number;
}

export interface PurchaseReportResponse {
  currencyCode: string;
  period: {
    dateFrom: string;
    dateTo: string;
    previousDateFrom: string;
    previousDateTo: string;
    bucket: "day" | "week" | "month";
  };
  summary: {
    purchaseSpend: PurchaseReportMetric;
    stockReceived: PurchaseReportMetric;
    totalPurchases: PurchaseReportMetric;
    canceledPurchaseOrders: PurchaseReportMetric;
  };
  trend: Array<{ label: string; spend: number; receivedUnits: number }>;
  topSuppliers: Array<{
    id?: string;
    name: string;
    purchaseCount: number;
    spend: number;
  }>;
  pendingReceipts: Array<{
    purchaseId: string;
    purchaseNumber: string;
    lineItemId: string;
    productId: string;
    productName: string;
    outstandingQuantity: number;
    expectedDeliveryDate?: string;
  }>;
}
