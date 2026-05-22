"use client";

import Image from "next/image";
import Link from "next/link";

import { Edit2 } from "lucide-react";
import { Product } from "../types";

interface ProductCardViewProps {
  products: any[];
}

export default function ProductCardView({ products }: ProductCardViewProps) {
  return (
    <div className="grid grid-cols-1   sm:grid-cols-2 lg:grid-cols-4 xl:grid-cols-5 gap-5 px-8">
      {products.map((product) => (
        <div key={product.key} className="bg-white rounded-lg hover:border border border-gray-200 overflow-hidden hover:shadow-md transition-shadow">
          <div className="relative  bg-gray-100">
            <div className="relative   aspect-video bg-gray-100">
              <Image src={product.image} alt={product.name} fill className="object-cover" priority />
            </div>

            <div className="absolute top-0 m-2 ">
              <span className={`px-2 py-1 scale rounded-full text-xs ${product.listed === "Published" ? "bg-green-100 text-green-800" : "bg-gray-100 text-gray-800"}`}>{product.listed}</span>
            </div>
          </div>
          <div className="p-4">
            <div>
              <h3 className="font-medium text-sm text-gray-900 line-clamp-2 mb-1">
                <Link href={`/products/${product.key}`} className="hover:text-indigo-600">
                  {product.name}
                </Link>
              </h3>
              <span className="font-semibold number text-gray-900">{product.price}</span>
            </div>

            <div className="flex justify-between items-center mt-2">
              <span className={`text-sm ${product.stock === 0 ? "text-red-600" : "text-gray-600"}`}>{product.stock === 0 ? "Out of stock" : `${product.stock} in stock`}</span>

              <div className="flex  space-x-2">
                <button className="text-gray-400 hover:text-gray-600 transition-colors">
                  <Edit2 className="w-4 h-4 cursor-pointer" />
                </button>
              </div>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}
