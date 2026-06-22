import { ITEM_TYPE } from "@/components/products/ProductFormModal";
import { ProductPriceTier } from "@/lib/products/pricing";

export interface QuantityData {
  onHand: number;
  available: number;
  committed: number;
  unavailable: number;
}

export interface SimpleProductInventoryLevels extends QuantityData {
  id: string;
  locationName: string;
}

export interface ProductVariant {
  id: string;
  name: string;
  sku: string;
  barcode?: string;
  price: number;
  stock: Record<string, QuantityData>;
  image?: string;
}

export interface Product {
  id: string;
  name: string;
  description: string;
  price: number;
  costPrice: number;
  sku: string;
  barcode: string;
  tags: string[];
  images: string[];
  hasVariants: boolean;
  locations: string[];
  variants: ProductVariant[];
}

export interface ProductVariantWithStock extends Omit<ProductVariant, "stock"> {
  stock: Record<string, QuantityData>;
}

export interface ProductVariantsTableProps {
  variants: ProductVariantWithStock[];
  locations: string[];
  selectedVariantId?: string;
  onQuantityChange: (variantId: string, location: string, quantity: QuantityData) => void;
  onVariantClick: (variant: ProductVariant) => void;
}

export interface ProductQueryParams {
  search?: string | "";
  inPOS?: boolean;
  inStorefront?: boolean;
  type?: "STOCK" | "NON_STOCK" | "SERVICE" | "BUNDLE" | "PACKAGING";
  categoryId?: string;
  purchasable?: boolean;
  stockStatus?: "in_stock" | "out_of_stock";
  status?: "active" | "archived";
  sortBy?: string;
  sortOrder?: "asc" | "desc";
  page?: number;
  limit?: number;
}

export interface ProductListItem {
  id: string;
  name: string;
  imageUrl: string;
  description?: string;
  quantity?: number;
  category?: string;
  categoryId?: string;
  categoryName?: string;
  priceTiers?: ProductPriceTier[];
  normalPrice?: number;
  formattedNormalPrice?: string;
  costPrice?: number;
  sku: string;
  type?: ITEM_TYPE;
  sourceProductName?: string;
  sourceQuantity?: number;
  conversionType?: "source_to_repack" | "repack_to_source";
  conversionQuantity?: number;
  repackUnitName?: string;
  bundleItems?: Array<{
    productId?: string | { id?: string; name?: string };
    quantity?: number;
  }>;
  productId?: string;
  hasVariants?: boolean;
  isAvailable?: boolean;
  variants?: ProductListItem[];
  availableStock?: number;
  conversionRule?: string;
  channels: number;
}
