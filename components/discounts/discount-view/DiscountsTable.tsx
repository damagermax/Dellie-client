"use client";
import type { TableProps } from "antd/es/table";
import AppTag from "../../ui/AppTag";

import AppTable from "@/components/ui/AppTable";
import { Discount, DiscountMethod, DiscountType, DiscountAppliesTo } from "@/types/discount";
import { DiscountViewItemAction } from "./DiscountView";
import { ActionDropdown } from "@/components/ui/ActionDropdown";
import { LuCopy } from "react-icons/lu";

interface DiscountsTableProps extends DiscountViewItemAction {
  discounts: Discount[];
}

function discountValueLabel(discount: Discount): string {
  if (discount.type === DiscountType.FREE_SHIPPING) {
    return discount.freeShippingMinAmount ? `Free ship over GHS ${discount.freeShippingMinAmount}` : "Free shipping";
  }
  return discount.type === DiscountType.PERCENT ? `${discount.value}%` : `GHS ${discount.value}`;
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
        <p className="flex items-center gap-x-3">
          {value} {discount.method == DiscountMethod.CODE && <LuCopy className="bg-gray-100 cursor-pointer p-1 text-lg rounded-xs" />}
        </p>
      ),
    },

    {
      title: "Value",
      key: "value",
      width: "18%",
      render: (_, discount) => <span className="text-sm font-medium">{discountValueLabel(discount)}</span>,
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
      title: "Type",
      dataIndex: "type",
      key: "type",
      render: (type: DiscountType) => (
        <span className="capitalize text-sm text-gray-600">{type}</span>
      ),
    },

    {
      title: "Applies to",
      dataIndex: "appliesTo",
      key: "appliesTo",
      render: (appliesTo: DiscountAppliesTo) => (
        <span className="capitalize text-sm text-gray-600">{appliesTo || "both"}</span>
      ),
    },

    {
      title: "Products",
      key: "products",
      render: (_, discount) => (
        <span className="text-sm text-gray-600">{discount.applicableProductIds?.length || 0}</span>
      ),
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
