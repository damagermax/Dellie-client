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
