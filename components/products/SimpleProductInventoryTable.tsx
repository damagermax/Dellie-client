import { Table, TableProps } from "antd";

export default function SimpleProductInventoryTable() {
  const columns: TableProps["columns"] = [
    {
      title: "Locations",
      dataIndex: "name",
      key: "name",
      className: "!pl-8",
    },
    {
      title: "Unavailable",
      dataIndex: "description",
      key: "description",
      align: "center",
    },
    {
      title: "Committed",
      dataIndex: "totalProducts",
      key: "totalProducts",
      align: "center",
    },
    {
      title: "Available",
      dataIndex: "status",
      key: "status",
      align: "center",
    },

    {
      title: "On hand",
      key: "id",
      align: "center",
      dataIndex: "id",
    },
  ];

  return (
    <div className=" border border-gray-200   rounded-lg overflow-clip">
      <Table columns={columns} pagination={false} size="small" />
    </div>
  );
}
