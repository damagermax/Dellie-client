export interface InventoryReportQuery {
  dateFrom: string;
  dateTo: string;
  locationId?: string;
  storeId?: string;
}

export interface InventoryReportResponse {
  currencyCode: string;
  period: {
    dateFrom: string;
    dateTo: string;
    bucket: "day" | "week" | "month";
  };
  summary: {
    inventoryValue: number;
    lowStockSkus: number;
    outOfStockSkus: number;
    expiringSoonBatches: number;
  };
  movementTrend: Array<{ label: string; stockIn: number; stockOut: number }>;
  criticalStock: Array<{
    productId: string;
    name: string;
    sku?: string;
    availableQuantity: number;
    lowStockThreshold?: number;
    status: "low_stock" | "out_of_stock";
    locationName?: string;
  }>;
  returns: Array<{
    returnId: string;
    transactionId: string;
    type: "sale" | "purchase";
    reference: string;
    productId: string;
    productName: string;
    quantity: number;
    returnedAt: string;
  }>;
}
