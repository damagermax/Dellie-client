"use client";

import { PackageSearch } from "lucide-react";
import { getNormalPrice } from "@/lib/products/pricing";
import type { Category, ProductListItem } from "@/types/index";
import { AppViewLoader } from "@/components/ui/AppViewLoader";
import CategoryCard from "./CategoryCard";
import ProductCard from "./ProductCard";
import { formatMoney, getProductImage, isTrackedInventory } from "./utils";

type PosProductGridProps = {
  categories: Category[];
  allProductsCount: number;
  categoryId?: string;
  categoryCounts: Map<string, number>;
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
  allProductsCount,
  categoryId,
  categoryCounts,
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
      <div className=" px-3 bg-[#F5F5F5] py-4 md:px-4">
        <div className="flex gap-4 overflow-x-auto ">
          <CategoryCard title="All Menu" count={allProductsCount} active={!categoryId} onClick={() => onSelectCategory(undefined)} />
          {categories.map((category) => (
            <CategoryCard key={category.id} title={category.name} count={categoryCounts.get(category.id) || 0} active={categoryId === category.id} onClick={() => onSelectCategory(category.id)} />
          ))}
        </div>
      </div>

      <div className="px-3  md:px-4 ">
        <AppViewLoader loading={productsLoading || categoriesLoading} />

        <div className="grid gap-1.5 md:gap-3 grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 ">
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

        {!visibleProducts.length && !productsLoading && (
          <div className="mt-5 rounded-[26px] border border-dashed border-[#dbd6e2] bg-[#fafafa] px-6 py-16 text-center">
            <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-[#f2e9ff] text-[#7a39cc]">
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
