"use client";

import AppTable from "@/components/ui/AppTable";
import type { TableProps } from "antd/es/table";
import { ActionDropdown, DropdownItemLabel } from "../../ui/ActionDropdown";
import AppTag from "../../ui/AppTag";

import { ExpenseCategoryViewItemAction } from "./ExpenseCategoryView";
import { ExpenseCategory } from "@/types/transaction";
import { BsLock, BsUnlock } from "react-icons/bs";

interface ExpenseCategoryTableProps extends ExpenseCategoryViewItemAction {
  expenseCategories: ExpenseCategory[];
}

export default function ExpenseCategoryTable({ expenseCategories, onToggleLock, onDelete, openEditModal }: ExpenseCategoryTableProps) {
  const columns: TableProps<ExpenseCategory>["columns"] = [
    {
      title: "Name",
      dataIndex: "name",
      key: "name",
      className: "!pl-8",
      width: "20%",

      render: (_, record) => (
        <div className="flex items-center capitalize">
          <span>{record.name}</span>
        </div>
      ),
    },
    {
      title: "Description",
      dataIndex: "description",
      key: "description",
      width: "40%",
      render: (text: string) => <p className=" line-clamp-1 text-ellipsis capitalize">{text}</p>,
    },

    {
      title: "Status",
      dataIndex: "isLocked",
      key: "isLocked",
      width: "10%",
      render: (status: string) => <AppTag value={status ? "Locked" : "Opened"} />,
    },

    {
      key: "id",
      align: "right",
      dataIndex: "id",
      className: "!pr-8",
      width: "10%",
      render: (id, expenseCategory) => (
        <ActionDropdown
          openEditModal={() => openEditModal(expenseCategory)}
          onDelete={() => onDelete(id)}
          menu={{
            items: [
              {
                key: "3",
                label: <DropdownItemLabel text={expenseCategory.isLocked ? "Open" : "Lock"} icon={expenseCategory.isLocked ? <BsLock size={15} /> : <BsUnlock size={15} />} />,
                onClick: () => onToggleLock(id, !expenseCategory.isLocked),
              },
            ],
          }}
        />
      ),
    },
  ];

  return (
    <>
      <AppTable columns={columns} dataSource={expenseCategories ? expenseCategories : []} className="custom-table" rowClassName="hover:bg-gray-50" pagination={false} />
    </>
  );
}
