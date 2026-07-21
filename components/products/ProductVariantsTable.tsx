"use client";

import AppTable from "@/components/ui/AppTable";
import PreviewImage from "../ui/PreviewImage";
import { ProductPriceTier, getNormalPrice } from "@/lib/products/pricing";
import type { TableProps } from "antd/es/table";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { ArrowUpRight } from "lucide-react";

export type ProductVariantRow = {
  id: string;
  name: string;
  sku?: string;
  barcode?: string;
  imageUrl?: string;
  categoryName?: string;
  productId?: string;
  status?: "active" | "archived";
  isAvailable?: boolean;
  priceTiers?: ProductPriceTier[];
  costPrice?: number;
  availableStock?: number;
  statusLabel?: string;
  formattedNormalPrice?: string;
};

export function ProductVariantsTable({ variants }: { variants: ProductVariantRow[] }) {
  const router = useRouter();

  const tableColumns: TableProps<ProductVariantRow>["columns"] = [
    {
      title: "Variant",
      className: "!pl-8",
      dataIndex: "name",
      key: "name",
      width: "34%",
      render: (name: string, variant: ProductVariantRow) => (
        <div className="flex items-center space-x-4">
          <div className="h-11 w-11 flex-shrink-0 overflow-hidden rounded-sm bg-gray-100">
            <PreviewImage height={44} width={44} src={variant.imageUrl} />
          </div>
          <div className="min-w-0">
            <Link href={`/products/${variant.id}`} className="block font-medium text-gray-800 transition-colors hover:text-[#2d837d]">
              <span className="line-clamp-1">{name || "-"}</span>
            </Link>
          </div>
        </div>
      ),
    },
    {
      title: "SKU",
      dataIndex: "sku",
      key: "sku",
      render: (sku?: string) => <span className="text-gray-600">{sku || "-"}</span>,
    },
    {
      title: "Price",
      dataIndex: "priceTiers",
      key: "priceTiers",
      render: (_: unknown, variant: ProductVariantRow) => variant.formattedNormalPrice || `GHS ${getNormalPrice(variant).toFixed(2)}`,
    },
    {
      title: "Status",
      dataIndex: "statusLabel",
      key: "statusLabel",
      render: (_statusLabel?: string, variant?: ProductVariantRow) => {
        const isArchived = variant?.status === "archived";
        const availableStock = Number(variant?.availableStock || 0);
        const isOutOfStock = availableStock <= 0;
        const label = isArchived ? `${availableStock} Archived` : isOutOfStock ? "Sold out" : `${availableStock} Available`;
        return (
          <span className={`inline-flex rounded-full border px-2 py-0.5 text-sm font-medium ${isArchived ? "border-gray-200 bg-gray-100 text-gray-600" : isOutOfStock ? "border-red-200 bg-red-50 text-red-600" : "border-green-200 bg-green-50 text-green-700"}`}>
            {label}
          </span>
        );
      },
    },
  ];

  return (
    <div className="border-t border-gray-200 bg-white">
      <div className="px-5 py-4">
        <h2 className="text-lg font-medium text-gray-800">Variants</h2>
        <p className="mt-1 text-sm text-gray-500">Open a variant to manage its stock, batches, pricing, and order history.</p>
      </div>

      {variants.length ? (
        <>
          <div className="divide-y divide-gray-200 border-t border-gray-200 md:hidden">
            {variants.map((variant) => {
              const outOfStock = Number(variant.availableStock || 0) <= 0;
              return (
                <Link key={variant.id} href={`/products/${variant.id}`} className="flex items-center gap-3 px-4 py-4 active:bg-gray-50">
                  <div className="h-12 w-12 shrink-0 overflow-hidden rounded-md border border-gray-200 bg-gray-50">
                    <PreviewImage height={48} width={48} src={variant.imageUrl} />
                  </div>
                  <div className="min-w-0 flex-1">
                    <div className="flex items-start justify-between gap-3">
                      <div className="min-w-0">
                        <p className="truncate font-medium text-gray-950">{variant.name || "Unnamed variant"}</p>
                        <p className="mt-0.5 truncate text-xs text-gray-500">SKU: {variant.sku || "-"}</p>
                      </div>
                      <span className="shrink-0 font-semibold text-gray-950">{variant.formattedNormalPrice || `GHS ${getNormalPrice(variant).toFixed(2)}`}</span>
                    </div>
                    <div className="mt-2 flex items-center justify-between gap-3 text-sm">
                      <span className={outOfStock ? "text-red-600" : "text-gray-600"}>{Number(variant.availableStock || 0)} available</span>
                      <ArrowUpRight size={16} className="text-gray-400" />
                    </div>
                  </div>
                </Link>
              );
            })}
          </div>
          <div className="hidden md:block">
            <AppTable<ProductVariantRow> dataSource={variants} columns={tableColumns} className="custom-table" pagination={false} rowKey="id" onRow={(variant) => ({ onClick: () => router.push(`/products/${variant.id}`), className: "cursor-pointer" })} />
          </div>
        </>
      ) : (
        <div className="border-t border-gray-200 px-5 py-10 text-center text-sm text-gray-500">No variants have been added for this product yet.</div>
      )}
    </div>
  );
}
