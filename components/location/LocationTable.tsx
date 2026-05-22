import React from "react";
import AppTable from "../ui/AppTable";
import type { TableProps } from "antd/es/table";
import { Location } from "@/types/location";
import { LocationViewTypeProps } from "./LocationView";
import AppTag from "../ui/AppTag";

const LocationTable = ({ locations }: LocationViewTypeProps) => {
  const columns: TableProps<Location>["columns"] = [
    {
      title: "Name",
      dataIndex: "name",
      key: "name",
      width: 200,
      className: "!pl-8",
    },
    {
      title: "status",
      dataIndex: "status",
      key: "status",
      width: 50,
      render: (status) => <AppTag value={status} />,
    },

    // {
    //   key: "id",
    //   align: "right",
    //   dataIndex: "id",
    //   className: "!pr-8",
    //   width: 120,
    //   render: (id, expense) => <ActionDropdown openEditModal={() => openEditModal(expense)} onDelete={() => onDelete(id)} />,
    //},
  ];

  return <AppTable columns={columns} dataSource={locations || []} scrollX={250} className="custom-table" rowClassName="hover:bg-gray-50" />;
};

export default LocationTable;
