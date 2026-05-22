"use client";
import type { TableProps } from "antd/es/table";
import AppTag from "../../ui/AppTag";

import AppTable from "@/components/ui/AppTable";
import { Discount, DiscountMethod, DiscountType } from "@/types/discount";
import { DiscountViewItemAction } from "./DiscountView";
import { ActionDropdown } from "@/components/ui/ActionDropdown";
import { LuCopy } from "react-icons/lu";

interface DiscountsTableProps extends DiscountViewItemAction {
  discounts: Discount[];
}

export default function DiscountsTable({ discounts, onActivate, onDeactivate, onDelete, openEditModal }: DiscountsTableProps) {
  const columns: TableProps<Discount>["columns"] = [
    {
      title: "Discount",
      dataIndex: "name",
      key: "name",
      className: "!pl-8",
      width: "22%",
      render: (value, discount) => (
        <p className="flex  items-center gap-x-3">
          {value} {discount.method == DiscountMethod.CODE && <LuCopy className="bg-gray-100 cursor-pointer p-1 text-lg rounded-xs" />}
        </p>
      ),
    },

    {
      title: "Value",
      dataIndex: "value",
      key: "value",
      width: "10%",
      render: (value, discount) => (discount.type == DiscountType.PERCENT ? value + "%" : "GHS" + value),
    },
    {
      title: "Date",
      dataIndex: "startDate",
      key: "startDate",
      width: "20%",
      render: (startDate, discount) => {
        return (
          <span className="bg-gray-100 py-[4px] px-2 rounded-full text-[13px]">
            {startDate && <>{startDate}</>}
            {startDate && !discount?.endDate && " –  Till Deactivated"}
            {startDate && discount?.endDate && " – "}
            {discount?.endDate || (!startDate && "Till Deactivated")}
          </span>
        );
      },
    },

    {
      title: "Products",
      dataIndex: "products",
      key: "products",
      align: "center",
      render: (products) => products | 0,
    },

    {
      title: "Categories",
      dataIndex: "categories",
      key: "categories",
      align: "center",
      render: (categories) => categories | 0,
    },

    {
      title: "Status",
      dataIndex: "status",
      key: "status",
      className: "!pr-8",
      render: (status) => <AppTag value={status} />,
    },

    {
      key: "id",
      align: "right",
      dataIndex: "id",
      className: "!pr-8",
      width: "10%",
      render: (id, discount) => <ActionDropdown status={discount.status as any} onActivate={() => onActivate(id)} onDeactivate={() => onDeactivate(id)} openEditModal={() => openEditModal(discount)} onDelete={() => onDelete(id)} />,
    },
  ];

  return (
    <div className="">
      <AppTable<Discount> columns={columns} dataSource={discounts} className="custom-table" />
    </div>
  );
}
