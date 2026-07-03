"use client";

import { Input } from "antd";
import { RiSearchLine } from "react-icons/ri";

import { ResolvedProductName } from "@/components/products/ResolvedProductName";
import PreviewImage from "@/components/ui/PreviewImage";
import type { ProductListItem } from "@/types/index";

type PurchaseProductSearchResultsProps = {
  products: ProductListItem[];
  searchValue: string;
  onSearchChange: (value: string) => void;
  onSelectProduct: (product: ProductListItem) => void;
};

export function PurchaseProductSearchResults({ products, searchValue, onSearchChange, onSelectProduct }: PurchaseProductSearchResultsProps) {
  return (
    <div className="bg-gray-100 px-5">
      <div className="sticky inset-0 z-50 py-4">
        <Input prefix={<RiSearchLine />} placeholder="Search for product " className="rounded-full!" value={searchValue} onChange={({ target: { value } }) => onSearchChange(value)} />
      </div>
      <div className="bg-white shadow-xl">
        {searchValue
          ? products.map((item) => (
              <div key={item.id} className="flex cursor-pointer items-center justify-between border-t border-gray-200 px-5 py-2" onClick={() => onSelectProduct(item)}>
                <div className="flex items-center gap-x-2">
                  <PreviewImage width={28} height={28} src={item.imageUrl} />
                  <div>
                    <ResolvedProductName name={item.name} productId={item.id} />
                    {item.sku !== "undefined" ? <p className="text-gray-500">{item.sku}</p> : null}
                  </div>
                </div>
              </div>
            ))
          : null}
      </div>
    </div>
  );
}
