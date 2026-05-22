'use client';

import { Tag, DollarSign, Hash, Package } from 'lucide-react';
import { ProductInfoProps } from './types';

export function ProductInfo({ product, selectedVariant }: ProductInfoProps) {
  return (
    <div className="space-y-6">
      <div className="space-y-4">
        <h2 className="text-lg font-medium text-gray-900">Product Information</h2>
        <div className="grid w-full grid-cols-2 gap-4">
          <div>
            <div className="text-sm font-medium text-gray-500 flex items-center">
              <Tag className="w-4 h-4 mr-2 text-gray-400" />
              Name
            </div>
            <div className="mt-1 text-sm text-gray-900">
              {selectedVariant ? `${product.name} - ${selectedVariant.name}` : product.name}
            </div>
          </div>
          <div>
            <div className="text-sm font-medium text-gray-500 flex items-center">
              <DollarSign className="w-4 h-4 mr-2 text-gray-400" />
              Price
            </div>
            <div className="mt-1 text-sm text-gray-900">
              ${(selectedVariant?.price || product.price).toFixed(2)}
            </div>
          </div>
          <div>
            <div className="text-sm font-medium text-gray-500 flex items-center">
              <Hash className="w-4 h-4 mr-2 text-gray-400" />
              SKU
            </div>
            <div className="mt-1 text-sm text-gray-900 font-mono">
              {selectedVariant?.sku || product.sku}
            </div>
          </div>
          <div>
            <div className="text-sm font-medium text-gray-500 flex items-center">
              <Package className="w-4 h-4 mr-2 text-gray-400" />
              Barcode
            </div>
            <div className="mt-1 text-sm text-gray-900 font-mono">
              {selectedVariant?.barcode || product.barcode}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
