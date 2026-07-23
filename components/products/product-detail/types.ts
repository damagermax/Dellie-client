"use client";

import type { ReactNode } from "react";

import { ITEM_TYPE } from "@/components/products/ProductFormModal";
import type { ProductVariantRow } from "@/components/products/ProductVariantsTable";
import { ProductPriceTier } from "@/lib/products/pricing";

export type InventorySummary = {
  availableQuantity?: number;
  inventoryValue?: number;
  activeBatches?: number;
  expiredQuantity?: number;
  expiringSoonQuantity?: number;
  averageCost?: number;
};

export type InventoryLocation = {
  id?: string;
  locationId?: string;
  locationName?: string;
  onHand?: number;
  available?: number;
  unavailable?: number;
  reserved?: number;
  incoming?: number;
  committed?: number;
};

export type AvailableLocation = {
  id?: string;
  locationId?: string;
  locationName?: string;
};

export type InventoryBatch = {
  id?: string;
  batchNumber?: string;
  locationId?: string;
  locationName?: string;
  quantity?: number;
  remainingQuantity?: number;
  unitCost?: number;
  source?: string;
  sourceDate?: string;
  expiryDate?: string;
  status?: string;
  assemblyComponents?: Array<{
    productId?: string;
    productName?: string;
    sku?: string;
    imageUrl?: string | null;
    quantity?: number;
    totalCost?: number;
    unitCost?: number;
  }>;
};

export type ProductOrderHistoryItem = {
  id: string;
  type: "sale" | "purchase";
  status?: "open" | "closed" | "draft";
  receiptStatus?: "pending" | "partially_received" | "received";
  isDeleted?: boolean;
  source?: string;
  saleNumber?: string;
  quoteNumber?: string;
  purchaseNumber?: string;
  documentNumber?: string;
  contactId?: { id?: string; name?: string };
  locationId?: { id?: string; name?: string };
  currencyId?: { id?: string; code?: string; name?: string };
  date?: string;
  amount?: number;
  balance?: number;
  formattedTotal?: string;
  formattedBalance?: string;
  quantity?: number;
  fulfilledQuantity?: number;
  returnedQuantity?: number;
};

export type BundleComponent = {
  productId?: string;
  productName?: string;
  sku?: string;
  type?: string;
  imageUrl?: string | null;
  quantityRequired?: number;
  availableQuantity?: number;
  availableBundles?: number;
};

export type ProductionComponent = {
  productId?: string;
  productName?: string;
  sku?: string;
  type?: string;
  imageUrl?: string | null;
  quantityRequired?: number;
  availableQuantity?: number;
  availableByLocation?: Record<string, number>;
};

export type ProductDetail = Record<string, unknown> & {
  id: string;
  name: string;
  type: ITEM_TYPE;
  status?: "active" | "archived";
  sku?: string;
  barcode?: string;
  categoryId?: string;
  categoryName?: string;
  description?: string;
  weight?: number;
  priceTiers?: ProductPriceTier[];
  costPrice?: number;
  wholesalePrice?: number;
  availableStock?: number;
  lowStockThreshold?: number;
  minOrderLevel?: number;
  allowOversell?: boolean;
  showInStorefront?: boolean;
  showInPOS?: boolean;
  sourceProductId?: string;
  sourceQuantity?: number;
  conversionType?: string;
  conversionQuantity?: number;
  repackUnitName?: string;
  media?: Array<{ url?: string; key?: string; type?: string }>;
  imageUrl?: string;
  createdAt?: string;
  updatedAt?: string;
  sourceProductName?: string;
  parentProductName?: string;
  conversionRule?: string;
  bundleAvailability?: number;
  bundleComponents?: BundleComponent[];
  productionComponents?: ProductionComponent[];
  bundleItems?: Array<{
    productId?:
      | {
          id?: string;
          name?: string;
          sku?: string;
          media?: { url?: string }[];
          priceTiers?: ProductPriceTier[];
        }
      | string;
    quantity?: number;
  }>;
  hasVariants?: boolean;
  isAvailable?: boolean;
  variants?: ProductVariantRow[];
  inventory?: {
    summary?: InventorySummary;
    locations?: InventoryLocation[];
    batches?: InventoryBatch[];
  };
  availableLocations?: AvailableLocation[];
  orderHistory?: ProductOrderHistoryItem[];
  sourceInventory?: {
    summary?: InventorySummary;
  };
  productId?: string;
};

export type DetailTab = {
  key: string;
  label: ReactNode;
  children: ReactNode;
};
