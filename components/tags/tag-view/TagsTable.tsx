"use client";

import AppTable from "@/components/ui/AppTable";
import type { TableProps } from "antd/es/table";
import { ActionDropdown } from "../../ui/ActionDropdown";
import AppTag from "../../ui/AppTag";

import { Tag } from "../../../types/tag";

import { TagViewItemAction } from "./TagsView";

interface TagsTableProps extends TagViewItemAction {
  tags: Tag[];
}

export default function TagsTable({ tags, onActivate, onDeactivate, onDelete, openEditModal }: TagsTableProps) {
  const columns: TableProps<Tag>["columns"] = [
    {
      title: "Name",
      dataIndex: "name",
      key: "name",
      className: "!pl-8",
      width: "20%",

      render: (_, record) => (
        <div className="flex items-center">
          <span>{record.name}</span>
        </div>
      ),
    },
    {
      title: "Description",
      dataIndex: "description",
      key: "description",
      width: "40%",
      render: (text: string) => <p className=" line-clamp-1 text-ellipsis">{text}</p>,
    },
    {
      title: "Products",
      dataIndex: "totalProducts",
      key: "totalProducts",
      align: "center",
      width: "20%",
      render: (text: number) => text.toLocaleString(),
    },
    {
      title: "Status",
      dataIndex: "status",
      key: "status",
      width: "10%",
      render: (status: string) => <AppTag value={status} />,
    },

    {
      key: "id",
      align: "right",
      dataIndex: "id",
      className: "!pr-8",
      width: "10%",
      render: (id, tag) => <ActionDropdown status={tag.status} onActivate={() => onActivate(id)} onDeactivate={() => onDeactivate(id)} openEditModal={() => openEditModal(tag)} onDelete={() => onDelete(id)} />,
    },
  ];

  return (
    <>
      <AppTable columns={columns} dataSource={tags ? tags : []} className="custom-table" rowClassName="hover:bg-gray-50" />
    </>
  );
}
