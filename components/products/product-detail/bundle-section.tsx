"use client";

import Link from "next/link";
import { Empty } from "antd";
import type { TableProps } from "antd/es/table";

import AppTable from "@/components/ui/AppTable";
import { ITEM_TYPE } from "@/components/products/ProductFormModal";
import { getProductTypeLabel } from "@/lib/products/type-label";

import { ProductThumb } from "./shared";
import type { ProductDetail } from "./types";
import { formatQuantity } from "./utils";

export function BundleSection({ product }: { product: ProductDetail }) {
  const components = product.bundleComponents || [];
  const rows = components.map((component) => ({
    id: component.productId || `${component.productName}-${component.sku}`,
    productId: component.productId,
    name: component.productName || "-",
    sku: component.sku || "-",
    type: component.type,
    imageUrl: component.imageUrl || undefined,
    quantityRequired: component.quantityRequired,
    availableQuantity: component.availableQuantity,
  }));

  const columns: TableProps<(typeof rows)[number]>["columns"] = [
    {
      title: "Name",
      dataIndex: "name",
      className: "!pl-8",
      key: "name",
      width: "40%",
      render: (name, row) => (
        <div className="flex items-center gap-x-3">
          <ProductThumb src={row.imageUrl} name={name} />
          <div className="min-w-0">
            {row.productId ? (
              <Link href={`/products/${row.productId}`} className="font-medium text-gray-700 transition-colors hover:text-indigo-600">
                {name}
              </Link>
            ) : (
              <p className="font-medium text-gray-700">{name}</p>
            )}
            <p className="text-xs text-gray-500">
              {row.sku} | <span className="capitalize">{getProductTypeLabel({ type: row.type })}</span>
            </p>
          </div>
        </div>
      ),
    },
    {
      title: "Required Qty",
      key: "quantityRequired",
      render: (_, row) => formatQuantity(row.quantityRequired),
    },
    {
      title: "Available Qty",
      key: "availableQuantity",
      render: (_, row) => (row.type === ITEM_TYPE.NON_STOCK ? <span className="text-sm text-gray-500">Not tracked</span> : formatQuantity(row.availableQuantity)),
    },
  ];

  return components.length ? (
    <>
      <div className="divide-y divide-gray-200 border-y border-gray-200 md:hidden">
        {rows.map((row) => (
          <div key={row.id} className="px-4 py-4">
            <div className="flex items-center gap-3">
              <ProductThumb src={row.imageUrl} name={row.name} />
              <div className="min-w-0 flex-1">
                <p className="truncate font-medium text-gray-950">{row.name}</p>
                <p className="mt-1 text-xs text-gray-500">
                  {row.sku} · {getProductTypeLabel({ type: row.type })}
                </p>
              </div>
            </div>
            <div className="mt-3 flex justify-between text-sm">
              <span className="text-gray-500">Required {formatQuantity(row.quantityRequired)}</span>
              <span className="font-medium text-gray-900">Available {row.type === ITEM_TYPE.NON_STOCK ? "Not tracked" : formatQuantity(row.availableQuantity)}</span>
            </div>
          </div>
        ))}
      </div>
      <div className="hidden md:block">
        <AppTable<(typeof rows)[number]> columns={columns} dataSource={rows} rowKey="id" pagination={false} />
      </div>
    </>
  ) : (
    <Empty className="py-10" description="No bundle components have been configured." />
  );
}
