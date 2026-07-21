"use client";

import { Tag } from "antd";
import Link from "next/link";
import PreviewImage from "@/components/ui/PreviewImage";
import { ProductListItem } from "@/types/product";
import { ITEM_TYPE } from "../ProductFormModal";
import { getProductPriceLabel } from "@/lib/products/pricing";
import { getProductTypeLabel } from "@/lib/products/type-label";
import { useStoreCurrencyCode } from "@/hooks/useStoreCurrencyCode";

interface ProductsMobileListProps {
  products: ProductListItem[];
}

const mobileTagClassName = "!m-0 !rounded-full !border-0 !px-1.5 !py-0 !text-[12px] !leading-5";

const getStockLabel = (product: ProductListItem) => {
  if (product.type && [ITEM_TYPE.STOCK].includes(product.type)) {
    return Number(product.availableStock || 0) > 0 ? `${Number(product.availableStock || 0).toLocaleString()} Available` : "Sold out";
  }

  return "Available";
};

const getStockColor = (product: ProductListItem) => {
  if (product.type && [ITEM_TYPE.STOCK].includes(product.type) && Number(product.availableStock || 0) <= 0) {
    return "red";
  }

  return "green";
};

const abbreviateProductTypeLabel = (product: ProductListItem) => {
  const label = getProductTypeLabel(product);

  if (label === "stock bundle") return "SB";
  if (label === "non stock bundle") return "NSB";
  if (label === "non stock") return "NS";
  if (label === "stock") return "S";

  return label;
};

export default function ProductsMobileList({ products }: ProductsMobileListProps) {
  const currencyCode = useStoreCurrencyCode();
  return (
    <div className="md:hidden">
      {products.map((product) => {
        return (
          <div key={product.id} className=" border-b border-gray-100 px-4 py-4">
            <Link href={`/products/${product.id}`} className="flex min-w-0 flex-1  gap-3">
              <div className="flex  shrink-0 items-center justify-center overflow-hidden rounded-xs bg-gray-50">
                <PreviewImage src={product.imageUrl} alt={product.name} width={35} height={35} />
              </div>
              <div className="min-w-0 flex-1">
                <div className="">
                  <div>
                    <p className="line-clamp-2 text-sm   text-gray-900">{product.name}</p>

                    <div className="mt-0.5  flex items-center justify-between gap-2">
                      <p className="truncate text-xs capitalize text-gray-500">
                        {product.sku} ·
                        <Tag className={mobileTagClassName} color={getStockColor(product)}>
                          {getStockLabel(product)}
                        </Tag>
                      </p>

                      <p className="shrink-0 text-xs font-medium  text-gray-900">{getProductPriceLabel(product, currencyCode)}</p>
                    </div>

                    {/* <div className="flex mt-0.5 flex-wrap items-center gap-2 text-xs text-gray-500">
                      <Tag className={mobileTagClassName}>{product.categoryName || "Uncategorized"}</Tag>
                      {abbreviateProductTypeLabel(product)}
                    </div> */}
                  </div>
                </div>
              </div>
            </Link>
          </div>
        );
      })}
    </div>
  );
}
