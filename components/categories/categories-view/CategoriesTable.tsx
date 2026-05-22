"use client";

import { ActionDropdown, DropdownItemLabel } from "@/components/ui/ActionDropdown";
import AppTable from "@/components/ui/AppTable";
import type { TableProps } from "antd/es/table";
import { TbReplace } from "react-icons/tb";
import { Category, CategoryType } from "@/types/category";
import Image from "next/image";
import { CategoriesViewItemAction } from "./CategoriesList";
import PreviewImage from "@/components/ui/PreviewImage";

interface CategoriesTableProps extends CategoriesViewItemAction {
  categories: Category[];
}

export default function CategoriesTable({ categories, onDelete, openEditModal, onActivate, onDeactivate }: CategoriesTableProps) {
  const columns: TableProps<Category>["columns"] = [
    {
      title: "Category",
      key: "name",
      className: "!pl-8",
      width: "70%",
      dataIndex: "name",
      render: (_, record) => (
        <div className="flex items-center">
          {record.type == CategoryType.PRODUCT && <div className="flex-shrink-0 h-10 w-10 rounded-md overflow-hidden bg-gray-100 mr-3"></div>}
          <div>
            <div className="font-medium text-gray-900">{record.name}</div>
            <div className="text-sm text-gray-500 capitalize line-clamp-1">{record.description} </div>
          </div>
        </div>
      ),
    },

    // {
    //   title: "Parent Category",
    //   dataIndex: "parentCategory",
    //   key: "parentCategory",
    //   render: (text: string, category: Category) => <p className="  capitalize">{text || category?.expenseFields?.subtype?.toLowerCase() || "—"}</p>,
    // },

    {
      title: "Status",
      key: "status",
      dataIndex: "status",
      render: (_, record) => <span className={`px-2 py-1 rounded-full text-xs ${record.status === "active" ? "bg-green-100 text-green-800" : "bg-gray-100 text-gray-800"}`}>{record.status}</span>,
    },

    {
      title: "",
      dataIndex: "id",
      key: "id",
      render: (id, category) => (
        <div>
          <ActionDropdown
            onDelete={() => {
              onDelete(id);
            }}
            openEditModal={() => openEditModal(category)}
            onActivate={() => onActivate(id)}
            onDeactivate={() => onDeactivate(id)}
            status={category.status}
          />
        </div>
      ),
      align: "center",
      className: "!pr-8",
    },
  ];

  return (
    <div className="">
      <AppTable<Category> columns={columns} dataSource={categories} className="custom-table" />
    </div>
  );
}
