"use client";

import AppTable from "@/components/ui/AppTable";
import AppTag from "@/components/ui/AppTag";
import PreviewImage from "@/components/ui/PreviewImage";
import { ProductListItem } from "@/types/product";
import type { TableProps } from "antd/es/table";
import Link from "next/link";
import { CiLink } from "react-icons/ci";
import { RiMoreLine } from "react-icons/ri";

interface ProductTableProps {
  products: ProductListItem[];
}

export default function ProductsTable({ products }: ProductTableProps) {
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
            <PreviewImage src={data.imageUrl ? data.imageUrl : "/images/product.png"} />
          </div>
          <Link href={`/products/${data.id}`} className="hover:text-indigo-600 !text-gray-500 transition-colors">
            <div>
              <p className="font-medium  line-clamp-1 text-gray-600">{name}</p>
              <p className="text-xs  text-gray-500">{data.sku}</p>
              {data.type === "PACKAGING" && data.conversionRule && <p className="text-xs text-gray-500">Uses: {data.conversionRule}</p>}
            </div>
          </Link>
        </div>
      ),
    },

    {
      title: "Category",
      dataIndex: "categoryNames",
      key: "categoryNames",
      render: (category: string | undefined) => <p className=" line-clamp-1 ">{category}</p>,
    },

    {
      title: "Price",
      dataIndex: "sellingPrice",
      key: "sellingPrice",
      render: (price: number) => `GHS ${price.toFixed(2)}`,
    },
    {
      title: "Status",
      dataIndex: "availableStock",
      key: "availableStock",
      render: (stock: number) => {
        const isOutOfStock = stock === 0;
        return <span style={{ color: isOutOfStock ? "red" : "inherit" }}>{isOutOfStock ? "Out of stock" : `${stock || 0} in stock`}</span>;
      },
    },

    {
      title: "",
      dataIndex: "key",
      key: "actions",
      render: (key: string) => (
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

  return <AppTable<ProductListItem> columns={columns} dataSource={products} />;
}
