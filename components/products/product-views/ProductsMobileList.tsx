"use client";

import { MenuProps, Tag } from "antd";
import Link from "next/link";
import { LuEye } from "react-icons/lu";
import PreviewImage from "@/components/ui/PreviewImage";
import ResponsiveActionMenu from "@/components/ui/ResponsiveActionMenu";
import { ProductListItem } from "@/types/product";
import { ITEM_TYPE } from "../ProductFormModal";
import { getNormalPrice } from "@/lib/products/pricing";

interface ProductsMobileListProps {
  products: ProductListItem[];
}

const productTypeLabel = (type?: string) =>
  type?.replaceAll("_", " ").toLowerCase() || "product";

const getStockLabel = (product: ProductListItem) => {
  if (
    product.type &&
    [ITEM_TYPE.STOCK, ITEM_TYPE.PACKAGING].includes(product.type)
  ) {
    return Number(product.availableStock || 0) > 0
      ? `${Number(product.availableStock || 0).toLocaleString()} Available`
      : "Sold out";
  }

  return "Available";
};

const getStockColor = (product: ProductListItem) => {
  if (
    product.type &&
    [ITEM_TYPE.STOCK, ITEM_TYPE.PACKAGING].includes(product.type) &&
    Number(product.availableStock || 0) <= 0
  ) {
    return "red";
  }

  return "green";
};

export default function ProductsMobileList({
  products,
}: ProductsMobileListProps) {
  return (
    <div className="md:hidden">
      {products.map((product) => {
        const actions: MenuProps["items"] = [
          {
            key: "view",
            label: (
              <Link
                href={`/products/${product.id}`}
                className="flex items-center gap-3 !text-gray-800"
              >
                <LuEye size={17} />
                <span>View Details</span>
              </Link>
            ),
          },
        ];

        return (
          <div
            key={product.id}
            className="flex items-start gap-3 border-b border-gray-100 px-4 py-4"
          >
            <Link
              href={`/products/${product.id}`}
              className="flex min-w-0 flex-1 items-start gap-3"
            >
              <div className="flex h-12 w-12 shrink-0 items-center justify-center overflow-hidden rounded-lg bg-gray-50">
                <PreviewImage
                  src={product.imageUrl}
                  alt={product.name}
                  width={48}
                  height={48}
                />
              </div>
              <div className="min-w-0 flex-1">
                <div className="flex items-start justify-between gap-3">
                  <div className="min-w-0">
                    <p className="line-clamp-2 text-[15px] font-semibold text-gray-900">
                      {product.name}
                    </p>
                    <p className="mt-1 truncate text-sm capitalize text-gray-500">
                      {product.sku} · {productTypeLabel(product.type)}
                    </p>
                  </div>
                  <p className="shrink-0 text-sm font-semibold text-gray-900">
                    {product.formattedNormalPrice || `GHS ${getNormalPrice(product).toFixed(2)}`}
                  </p>
                </div>
                <div className="mt-3 flex flex-wrap items-center gap-2 text-xs text-gray-500">
                  <span className="max-w-[140px] truncate rounded-full bg-gray-100 px-2 py-1 text-gray-600">
                    {product.categoryName || "Uncategorized"}
                  </span>
                  <Tag
                    className="!m-0 !rounded-full !px-2"
                    color={getStockColor(product)}
                  >
                    {getStockLabel(product)}
                  </Tag>
                  {product.type === ITEM_TYPE.PACKAGING &&
                    product.conversionRule && (
                      <span className="line-clamp-1 w-full text-gray-500">
                        {product.conversionRule}
                      </span>
                    )}
                </div>
              </div>
            </Link>
            <ResponsiveActionMenu items={actions} title={product.name} />
          </div>
        );
      })}
    </div>
  );
}
