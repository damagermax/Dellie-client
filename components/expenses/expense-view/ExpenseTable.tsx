"use client";

import AppTable from "@/components/ui/AppTable";
import type { TableProps } from "antd/es/table";
import { ActionDropdown, DropdownItemLabel } from "../../ui/ActionDropdown";
import AppTag from "../../ui/AppTag";

import { ExpenseViewItemAction } from "./ExpenseView";
import { Expense } from "@/types/transaction";
import { formatDate } from "@/lib/dateUtils";
import Link from "next/link";
import PreviewImage from "@/components/ui/PreviewImage";

interface ExpenseTableProps extends ExpenseViewItemAction {
  expenses: Expense[];
}

export default function ExpenseTable({ expenses, onDelete, openEditModal }: ExpenseTableProps) {
  const columns: TableProps<Expense>["columns"] = [
    {
      title: "Description",
      dataIndex: "date",
      key: "date",
      width: 255,
      render: (_, record) => (
        <div className=" flex gap-x-3 items-center">
          {/* <div className="flex-shrink-0 h-10 w-10   overflow-hidden ">
            <PreviewImage src="/images/invoice.png" />
          </div> */}

          <div>
            <Link href={`expenses/${record.id}`} className="line-clamp-1 text-gray-600! hover:text-blue-500! text-ellipsis capitalize cursor-pointer">
              {record?.note}
            </Link>
            <p className=" text-xs">{formatDate(record?.date)}</p>
          </div>
        </div>
      ),
      className: "!pl-8",
    },

    {
      title: "Category",
      dataIndex: "category",
      key: "category",
      width: 180,
      render: (_, record) => record.category?.name || "Uncategorized",
    },
    {
      title: "Contact",
      dataIndex: "contact",
      key: "contact",
      width: 180,
      render: (_, record) => record?.contact?.name || record?.contact?.displayName || "Open Market",
    },
    {
      title: "Amount",
      dataIndex: "baseAmount",
      key: "baseAmount",
      width: 150,

      render: (_, record) => {
        const paid = record.balance && record.balance >= 0;
        const owing = record.balance && record.balance < 0;
        return (
          <p className={`line-clamp-1 text-ellipsis capitalize  font-semibold  w-fit px-2 py-0 rounded-xl  ${paid && "border border-amber-600 text-amber-600"}`}>
            {record.currency?.code} {record.amount?.toLocaleString()}
          </p>
        );
      },
    },
    {
      title: "Balance",
      dataIndex: "baseBalance",
      key: "baseBalance",
      width: 150,
      render: (_, record) => {
        const owing = record.balance && record.balance < 0;
        return (
          <div>
            <p className={`line-clamp-1 text-ellipsis capitalize w-fit px-2 font-semibold ${owing && "border   rounded-xl border-red-500 text-red-500"} `}>
              {record.currency?.code} {record.balance?.toLocaleString()}
            </p>
          </div>
        );
      },
    },
    {
      key: "id",
      align: "right",
      dataIndex: "id",
      className: "!pr-8",
      width: 120,
      render: (id, expense) => <ActionDropdown openEditModal={() => openEditModal(expense)} onDelete={() => onDelete(id)} />,
    },
  ];

  return (
    <>
      <AppTable columns={columns} dataSource={expenses ? expenses : []} className="custom-table" rowClassName="hover:bg-gray-50" />
    </>
  );
}
