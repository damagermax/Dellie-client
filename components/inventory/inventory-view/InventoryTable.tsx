"use client";

import AppTable from "@/components/ui/AppTable";
import PreviewImage from "@/components/ui/PreviewImage";
import { Inventory } from "@/types/inventory";
import { TableProps } from "antd";
import Link from "next/link";
import { RiMoreLine } from "react-icons/ri";

interface InventoryTableProps {
  inventory: Inventory[];
}

export default function InventoryTable({ inventory }: InventoryTableProps) {
  const columns: TableProps<Inventory>["columns"] = [
    {
      title: "Name",
      dataIndex: "id",
      className: "!pl-8",
      key: "id",
      width: "25%",
      render: (name: string, data: Inventory) => (
        <div className="flex gap-x-3 items-center">
          <div className="flex-shrink-0 h-10 w-10  overflow-hidden bg-gray-100 ">
            <PreviewImage src={data.imageUrl ? data.imageUrl : "/images/dellie-logo.png"} />
          </div>
          <Link href={`/products/${data.id}`} className="hover:text-indigo-600 !text-gray-500 transition-colors">
            <div>
              <p className="font-medium text-gray-800">{data.productName} </p>
              <p className="text-sm text-gray-500">{data?.variantName}</p>
            </div>
          </Link>
        </div>
      ),
    },

    {
      title: "Track Stock",
      dataIndex: "trackStock",
      key: "trackStock",
      align: "center",

      render: (trackStock) => <p className=" capitalize">{trackStock?.toString()}</p>,
    },

    {
      title: "Oversell",
      dataIndex: "allowOversell",
      key: "allowOversell",
      align: "center",
      render: (allowOversell) => <p className=" capitalize">{allowOversell?.toString()}</p>,
    },
    {
      title: "Committed",
      dataIndex: "committed",
      key: "committed",
      align: "center",
    },
    {
      title: "Unavailable",
      dataIndex: "unavailable",
      key: "unavailable",
      align: "center",
    },

    {
      title: "Available",
      dataIndex: "available",
      key: "availableNames",
      align: "center",
    },

    {
      title: "OnHand",
      dataIndex: "onHand",
      key: "onHand",
      align: "center",
    },
    {
      title: "",
      dataIndex: "id",
      key: "id",
      render: (key: string) => (
        <div className="flex gap-x-3 items-center justify-end">
          {}
          <div className="p-[2px] rounded-full bg-gray-100 text-gray-600 cursor-pointer w-[2rem] flex items-center justify-center h-[2rem]">
            <RiMoreLine size={15} />
          </div>
        </div>
      ),
      align: "center",
      className: "!pr-8",
    },
  ];

  return <AppTable<Inventory> columns={columns} dataSource={inventory} />;
}
