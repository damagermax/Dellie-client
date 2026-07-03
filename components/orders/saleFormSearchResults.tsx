"use client";

import { Input } from "antd";
import { RiSearchLine } from "react-icons/ri";

import { ResolvedProductName } from "@/components/products/ResolvedProductName";
import PreviewImage from "@/components/ui/PreviewImage";
import type { ProductListItem } from "@/types/index";

type SaleProductSearchResultsProps = {
  availableProducts: ProductListItem[];
  searchValue: string;
  onSearchChange: (value: string) => void;
  onSelectProduct: (product: ProductListItem) => void;
};

export function SaleProductSearchResults({ availableProducts, searchValue, onSearchChange, onSelectProduct }: SaleProductSearchResultsProps) {
  return (
    <div className="bg-gray-100 px-5">
      <div className="sticky inset-0 z-50 py-4">
        <Input prefix={<RiSearchLine />} placeholder="Search for product " className="rounded-full!" value={searchValue} onChange={(event) => onSearchChange(event.target.value)} />
      </div>
      {searchValue ? (
        <div className="bg-white shadow-xl">
          {availableProducts.map((product) => (
            <div key={product.id} className="flex cursor-pointer items-center justify-between border-t border-gray-200 px-5 py-2" onClick={() => onSelectProduct(product)}>
              <div className="flex items-center gap-x-2">
                <PreviewImage width={28} height={28} src={product.imageUrl} />
                <div>
                  <ResolvedProductName name={product.name} productId={product.id} />
                  {product.sku !== "undefined" ? <p className="text-gray-500">{product.sku}</p> : null}
                </div>
              </div>
            </div>
          ))}
        </div>
      ) : null}
    </div>
  );
}
