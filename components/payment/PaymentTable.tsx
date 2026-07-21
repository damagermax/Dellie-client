import { Payment } from "@/types/transaction";
import { TableProps } from "antd";
import React from "react";
import { ActionDropdown } from "../ui/ActionDropdown";
import { formatDate } from "@/lib/dateUtils";
import AppTable from "../ui/AppTable";
import { PaymentViewItemAction } from "./PaymentView";
import { canMutatePayment } from "@/lib/paymentMutationWindow";

interface Props extends PaymentViewItemAction {
  payments: Payment[];
  canManage?: boolean;
}

const PaymentTable = ({ payments, openEditModal, onDelete, canManage = true }: Props) => {
  const showActionColumn = canManage && payments.some((payment) => canMutatePayment(payment));

  const columns: TableProps<Payment>["columns"] = [
    {
      title: "Date",
      dataIndex: "date",
      key: "date",
      className: "!pl-8",
      width: 140,
      render: (_, record) => (
        <div className="flex items-center">
          <span>{formatDate(record.date)}</span>
        </div>
      ),
    },

    {
      title: "Category",
      dataIndex: "type",
      key: "type",
      width: 180,
      render: (_, record) => <p className="capitalize">{record.type?.replace(/_/g, " ")}</p>,
    },
    {
      title: "Method",
      dataIndex: "paymentMethod",
      key: "paymentMethod",
      width: 180,
      render: (paymentMethod: Payment["paymentMethod"]) => paymentMethod?.name || "-",
    },

    {
      title: "Amount",
      dataIndex: "amount",
      key: "amount",
      width: 150,
      render: (_, record) => (
        <p className="line-clamp-1 text-ellipsis">
          {record.currency?.code} {record?.amount?.toLocaleString()}
        </p>
      ),
    },

    ...(showActionColumn
      ? [
          {
            title: "",
            key: "actions",
            dataIndex: "id",
            align: "right" as const,
            className: "!pr-8",
            width: 140,
            render: (id: string, record: Payment) => (canMutatePayment(record) ? <ActionDropdown openEditModal={() => openEditModal(record)} onDelete={() => onDelete(id)} /> : null),
          },
        ]
      : []),
  ];
  return (
    <div>
      <AppTable columns={columns} dataSource={payments || []} className="custom-table" scrollX={900} rowClassName="hover:bg-gray-50" />
    </div>
  );
};

export default PaymentTable;
