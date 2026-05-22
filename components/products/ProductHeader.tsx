"use client";

import { ArrowLeft, Box, CheckCircle, Edit } from "lucide-react";
import Link from "next/link";
import { ProductHeaderProps } from "./types";

export function ProductHeader({ product, totalStock, onEdit }: ProductHeaderProps) {
    return (
        <div className="">
            <Link href="/products" className="flex mb-6    items-center text-sm text-gray-600 hover:text-gray-900">
                <ArrowLeft className="w-4 h-4 mr-2" />
                Back to Products
            </Link>

            <div className="py-6 border-b border-gray-100 flex justify-between items-center">
                <div>
                    <h1 className="text-2xl font-semibold text-gray-900">{product.name}</h1>
                    <p className="mt-1 text-sm text-gray-500">{product.description}</p>
                    {product.hasVariants && (
                        <div className="mt-2 flex items-center">
                            <Box className="w-4 h-4 text-gray-400 mr-1.5" />
                            <span className="text-sm text-gray-500">
                                {product.variants?.length} variants • {totalStock} in stock
                            </span>
                        </div>
                    )}
                </div>
                <div className="flex space-x-3">
                    <button
                        onClick={onEdit}
                        className="px-4 py-2 border border-gray-300 rounded-lg text-sm font-medium text-gray-700 hover:bg-gray-50 flex items-center"
                    >
                        <Edit className="w-4 h-4 mr-2" />
                        Edit
                    </button>
                    <button
                        className={`px-4 py-2 rounded-lg text-sm font-medium flex items-center ${
                            product.status === "active"
                                ? "bg-green-100 text-green-800 hover:bg-green-200"
                                : "bg-gray-100 text-gray-800 hover:bg-gray-200"
                        }`}
                    >
                        <CheckCircle className="w-4 h-4 mr-2" />
                        {product.status === "active" ? "Active" : "Draft"}
                    </button>
                </div>
            </div>
        </div>
    );
}
