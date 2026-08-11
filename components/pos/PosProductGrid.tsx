"use client";

import { PackageSearch } from "lucide-react";
import { getNormalPrice } from "@/lib/products/pricing";
import type { Category, ProductListItem } from "@/types/index";
import CategoryCard from "./CategoryCard";
import ProductCard from "./ProductCard";
import { formatMoney, getProductImage, isTrackedInventory } from "./utils";

type PosProductGridProps = {
  categories: Category[];
  categoryId?: string;
  visibleProducts: ProductListItem[];
  visibleProductNames: Record<string, string>;
  selectedCurrencyCode: string;
  productsLoading: boolean;
  categoriesLoading: boolean;
  getCartQuantity: (productId: string) => number;
  onSelectCategory: (categoryId?: string) => void;
  onAddProduct: (product: ProductListItem) => void;
};

export default function PosProductGrid({
  categories,
  categoryId,
  visibleProducts,
  visibleProductNames,
  selectedCurrencyCode,
  productsLoading,
  categoriesLoading,
  getCartQuantity,
  onSelectCategory,
  onAddProduct,
}: PosProductGridProps) {
  return (
    <>
      <div className="hidden px-3 bg-[#F5F5F5] py-4 md:block md:px-4">
        <div className="flex gap-4 overflow-x-auto">
          {categoriesLoading ? (
            <CategoryRailShimmer />
          ) : (
            <>
              <CategoryCard title="All Menu" active={!categoryId} onClick={() => onSelectCategory(undefined)} />
              {categories.map((category) => (
                <CategoryCard key={category.id} title={category.name} active={categoryId === category.id} onClick={() => onSelectCategory(category.id)} />
              ))}
            </>
          )}
        </div>
      </div>

      <div className="px-2 py-2 md:px-4 md:py-0">
        {productsLoading ? (
          <ProductGridShimmer />
        ) : (
          <div className="grid grid-cols-3 gap-1.5 md:grid-cols-4 md:gap-3 lg:grid-cols-5 xl:grid-cols-6">
            {visibleProducts.map((product) => {
              const quantity = getCartQuantity(product.id);
              const trackedInventory = isTrackedInventory(product.type);
              const unavailable = trackedInventory && Number(product.availableStock || 0) <= 0;

              return (
                <ProductCard
                  key={product.id}
                  name={visibleProductNames[product.id] || product.name}
                  imageUrl={getProductImage(product)}
                  price={product.hasVariants ? "Select variant" : formatMoney(selectedCurrencyCode, getNormalPrice(product))}
                  quantity={quantity}
                  available={!unavailable}
                  onDecrease={() => undefined}
                  onIncrease={() => onAddProduct(product)}
                />
              );
            })}
          </div>
        )}

        {!visibleProducts.length && !productsLoading && (
          <div className="mt-5 border-y border-dashed border-gray-300 bg-white px-6 py-16 text-center md:rounded-[26px] md:border">
            <div className="mx-auto flex h-16 w-16 items-center justify-center bg-[#edf7f6] text-[#2d837d] md:rounded-full">
              <PackageSearch size={30} />
            </div>
            <h3 className="mt-4 text-lg font-semibold text-gray-950">No products found</h3>
            <p className="mx-auto mt-2 max-w-md text-sm leading-6 text-gray-500">Try a different search term or switch category. Products matching the current system data will appear here.</p>
          </div>
        )}
      </div>
    </>
  );
}

function CategoryRailShimmer() {
  return (
    <>
      {Array.from({ length: 6 }).map((_, index) => (
        <div key={`pos-category-shimmer-${index}`} className="min-w-[112px] rounded-[18px] border border-stone-200 bg-white px-4 py-3">
          <div className="h-4 w-16 animate-pulse rounded bg-stone-200" />
        </div>
      ))}
    </>
  );
}

function ProductGridShimmer() {
  return (
    <div className="grid grid-cols-3 gap-1.5 md:grid-cols-4 md:gap-3 lg:grid-cols-5 xl:grid-cols-6">
      {Array.from({ length: 12 }).map((_, index) => (
        <div key={`pos-product-shimmer-${index}`} className="flex h-full flex-col overflow-hidden border border-gray-200/80 bg-white md:rounded-md">
          <div className="aspect-square w-full animate-pulse bg-stone-100 md:aspect-[4/2.8]" />
          <div className="flex flex-1 flex-col p-1 pb-2 md:p-3">
            <div className="h-4 w-16 animate-pulse rounded bg-stone-200" />
            <div className="mt-2 h-4 w-full animate-pulse rounded bg-stone-100" />
          </div>
        </div>
      ))}
    </div>
  );
}
