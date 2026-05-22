import { Product, ProductVariant, QuantityData } from "../../types/product";

export interface ProductVariantWithStock extends Omit<ProductVariant, "stock"> {
  stock: {
    [location: string]: QuantityData;
  };
}

export interface ProductDetailProps {
  product: Product;
  selectedVariant: ProductVariantWithStock | null;
  totalStock: number;
  onEdit: () => void;
}

export interface ProductGalleryProps {
  images: string[];
  selectedImage: string;
  onImageSelect: (image: string) => void;
  displayImage: string;
  displayName: string;
}

export interface ProductInfoProps {
  product: Product;
  selectedVariant: ProductVariantWithStock | null;
}

export interface ProductTagsProps {
  tags: string[];
}

export interface ProductHeaderProps {
  product: Product;
  totalStock: number;
  onEdit: () => void;
}

export type { Product, ProductVariant };
