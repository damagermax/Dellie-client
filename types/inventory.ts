export interface Inventory {
  id: string;
  sku: string;
  imageUrl: string;
  allowOversell: string;
  minOrderLevel: string;
  trackStock: string;
  lowStockThreshold: string;
  productName: string;
  variantName: string;
  available: string;
  onHand: string;
  committed: string;
  unavailable: string;
}

export interface AdjustBatchInput {
  id: string;
  quantityDelta: number;
  reason?: string;
  effectiveDate?: string;
}

export interface TransferBatchInput {
  id: string;
  toLocationId: string;
  quantity: number;
  reason?: string;
  effectiveDate?: string;
}

export interface RestockProductInput {
  productId: string;
  locationId: string;
  quantity: number;
  unitCost: number;
  receivedDate: string;
  expiryDate?: string;
}
