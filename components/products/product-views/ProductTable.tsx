"use client";

import AppTable from "@/components/ui/AppTable";
import PreviewImage from "@/components/ui/PreviewImage";
import { ProductListItem } from "@/types/product";
import type { TableProps } from "antd/es/table";
import Link from "next/link";
import { CiLink } from "react-icons/ci";
import { RiMoreLine } from "react-icons/ri";
import { ITEM_TYPE } from "../ProductFormModal";
import { getProductPriceLabel } from "@/lib/products/pricing";
import { getProductTypeLabel } from "@/lib/products/type-label";
import { useStoreCurrencyCode } from "@/hooks/useStoreCurrencyCode";

interface ProductTableProps {
  products: ProductListItem[];
  pagination?: TableProps<ProductListItem>["pagination"];
}

export default function ProductsTable({ products, pagination }: ProductTableProps) {
  const currencyCode = useStoreCurrencyCode();
  const columns: TableProps<ProductListItem>["columns"] = [
    {
      title: "Name",
      dataIndex: "name",
      className: "!pl-8",
      key: "name",
      width: "35%",
      render: (name: string, data: ProductListItem) => (
        <div className="flex gap-x-3 items-center">
          <div className={`flex-shrink-0 h-10 w-10   ${!data.imageUrl && "p-1  bg-gray-100"} rounded-sm flex  justify-center items-center  overflow-hidden `}>
            <PreviewImage src={data.imageUrl} />
          </div>
          <Link href={`/products/${data.id}`} className="hover:text-indigo-600 !text-gray-500 transition-colors">
            <div>
              <div className="flex items-center gap-2">
                <p className="font-medium  line-clamp-1 text-gray-700">{name}</p>
                {Boolean(data.variants?.length) && <span className="inline-flex rounded-full bg-[#eef4ff] px-2 py-0.5 text-[11px] font-medium text-[#3559a6]">{data.variants?.length} variants</span>}
              </div>
              <p className="text-xs  text-gray-700">
                {data.sku} | <span className="capitalize">{getProductTypeLabel(data)}</span>
              </p>
            </div>
          </Link>
        </div>
      ),
    },

    {
      title: "Category",
      dataIndex: "categoryName",
      key: "categoryName",
      render: (category: string | undefined) => <span className={`inline-flex max-w-full rounded-full px-3 py-1 text-sm ${category ? "bg-gray-100 text-gray-700" : "bg-gray-50 text-gray-400"}`}>{category || "Uncategorized"}</span>,
    },

    {
      title: "Price",
      dataIndex: "priceTiers",
      key: "priceTiers",
      render: (_: ProductListItem["priceTiers"], product: ProductListItem) => getProductPriceLabel(product, currencyCode),
    },
    {
      title: "Status",
      dataIndex: "availableStock",
      key: "availableStock",
      render: (stock: number, product: ProductListItem) => {
        if (product?.type && [ITEM_TYPE.STOCK, ITEM_TYPE.PACKAGING]?.includes(product?.type)) {
          const isOutOfStock = stock === 0;

          return (
            <>
              <span className={`border px-2  font-medium border-solid   rounded-full inline-block ${isOutOfStock ? "text-red-600 border-red-600 bg-red-50" : "text-green-700 border-green-200 bg-green-50"}`}>
                {isOutOfStock ? "Sold out" : `${stock || 0} Available`}
              </span>
              {product.type === "PACKAGING" && product.conversionRule && <p className="text-xs mt-1 w-fit text-gray-700"> {product.conversionRule}</p>}
            </>
          );
        } else {
          return <span className=" text-green-700 -border border-green-200 bg-green-50 font-medium px-2 py-1 text-sm  rounded-sm  capitalize ">Available </span>;
        }
      },
    },

    {
      title: "",
      dataIndex: "key",
      key: "actions",
      render: () => (
        <div className="flex gap-x-3 items-center justify-end">
          <div className="p-[2px] rounded-full bg-gray-100 text-gray-600 cursor-pointer w-[2rem] flex items-center justify-center h-[2rem]">
            <CiLink size={17} />
          </div>

          <div className="p-[2px] rounded-full bg-gray-100 text-gray-600 cursor-pointer w-[2rem] flex items-center justify-center h-[2rem]">
            <RiMoreLine size={15} />
          </div>
        </div>
      ),
      align: "center",
      className: "!pr-8",
    },
  ];

  return (
    <AppTable<ProductListItem>
      columns={columns}
      dataSource={products}
      pagination={pagination}
      rowKey="id"
      expandable={{
        indentSize: 0,
        defaultExpandAllRows: true,
      }}
    />
  );
}
