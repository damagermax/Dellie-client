import { Payment, Transaction } from "@/types/transaction";
import { TableProps } from "antd";
import React from "react";
import { ActionDropdown } from "../ui/ActionDropdown";
import AppTag from "../ui/AppTag";
import { formatDate } from "@/lib/dateUtils";
import AppTable from "../ui/AppTable";
import { PaymentViewItemAction } from "./PaymentView";

interface Props extends PaymentViewItemAction {
  payments: Payment[];
}

const PaymentTable = ({ payments, openEditModal, onDelete }: Props) => {
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

    {
      title: "Payment Account",
      dataIndex: "paidFrom",
      key: "paidFrom",
      width: 220,
      render: (_, record) => record.paidFrom?.name || record.paidTo?.name || "-",
    },

    {
      title: "",
      key: "actions",
      dataIndex: "id",
      align: "right",
      className: "!pr-8",
      width: 140,
      render: (id, record) => <ActionDropdown openEditModal={() => openEditModal(record)} onDelete={() => onDelete(id)} />,
    },
  ];
  return (
    <div>
      <AppTable columns={columns} dataSource={payments || []} className="custom-table" scrollX={900} rowClassName="hover:bg-gray-50" />
    </div>
  );
};

export default PaymentTable;
