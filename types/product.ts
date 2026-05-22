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
  sellingPrice: number;
  costPrice?: number;
  sku: string;
  type?: string;
  sourceProductName?: string;
  sourceQuantity?: number;
  conversionType?: "source_to_repack" | "repack_to_source";
  conversionQuantity?: number;
  repackUnitName?: string;
  availableStock?: number;
  conversionRule?: string;
  channels: number;
}
