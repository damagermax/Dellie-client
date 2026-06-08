"use client";

import { EllipsisVertical } from "lucide-react";
import Link from "next/link";
import PreviewImage from "@/components/ui/PreviewImage";

type ProductViewItem = {
  id?: string;
  key?: string;
  name: string;
  image?: string;
  imageUrl?: string;
  listed?: string;
  price?: string;
  sellingPrice?: number;
  stock?: number;
  availableStock?: number;
  sku?: string;
};

interface ProductListViewProps {
  products: ProductViewItem[];
}

export default function ProductListView({ products }: ProductListViewProps) {
  return (
    <div className="divide-y divide-gray-200">
      {products.map((product) => {
        const productId = product.id || product.key;
        const stock = Number(product.availableStock ?? product.stock ?? 0);
        const price =
          product.price ||
          `GHS ${Number(product.sellingPrice || 0).toFixed(2)}`;

        return (
          <div
            key={productId}
            className="p-4 px-8 hover:bg-gray-50 transition-colors"
          >
            <div className="flex items-center">
              <div className="flex-shrink-0 h-16 w-16 rounded-md overflow-hidden bg-gray-100">
                <PreviewImage
                  src={product.imageUrl || product.image}
                  alt={product.name}
                  width={64}
                  height={64}
                />
              </div>
              <div className="ml-4 flex-1 min-w-0">
                <div className="flex justify-between">
                  <h3 className="text-sm font-medium text-gray-900 truncate">
                    <Link
                      href={`/products/${productId}`}
                      className="hover:text-indigo-600"
                    >
                      {product.name}
                    </Link>
                  </h3>
                  <div className="ml-2 flex-shrink-0 flex">
                    <p className="text-sm font-medium text-gray-900">{price}</p>
                  </div>
                </div>

                <div className="mt-1 flex justify-between">
                  <div className="flex space-x-2">
                    <p className="text-sm text-gray-500 truncate">
                      {product.sku}
                    </p>
                    <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-800">
                      {product.listed || "Published"}
                    </span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <p
                      className={`text-sm ${stock === 0 ? "text-red-600" : "text-gray-600"}`}
                    >
                      {stock === 0 ? "Out of stock" : `${stock} in stock`}
                    </p>
                  </div>
                </div>
              </div>
              <button className="text-gray-400 cursor-pointer hover:text-gray-600 transition-colors">
                <EllipsisVertical className=" ml-2 " />
              </button>{" "}
            </div>
          </div>
        );
      })}
    </div>
  );
}
