import { AppstoreAddOutlined, AppstoreOutlined, BarsOutlined, TableOutlined } from "@ant-design/icons";
import { Button, Dropdown, Segmented } from "antd";

import type { MenuProps } from "antd";

import { RiKanbanView2 } from "react-icons/ri";

export type ViewType = "card" | "list" | "table" | "kanban";

interface AppViewSegmentsProps {
  view?: ViewType;
  onChange: (view: ViewType) => void;
}

export default function AppViewSegments({ view, onChange }: AppViewSegmentsProps) {
  const items: MenuProps["items"] = [
    {
      key: "layout",
      label: "Layout Type",
      disabled: true,
    },
    {
      type: "divider",
    },
    {
      key: "kanban",
      icon: <RiKanbanView2 />,
      className: "flex items-center justify-center",
      label: "Kanban View",
    },
    {
      key: "table",
      icon: <TableOutlined />,
      className: "flex items-center justify-center",
      label: "Table View",
    },
    {
      key: "list",
      icon: <BarsOutlined />,
      className: "flex  items-center justify-center",
      label: "List View",
    },
    {
      key: "card",
      icon: <AppstoreAddOutlined />,
      className: "flex items-center justify-center",
      label: "Card View",
    },
  ];
  return (
    <>
      <Dropdown menu={{ items }} placement="bottomRight">
        <Button shape="circle">
          <TableOutlined className="!text-gray-600" />
        </Button>
      </Dropdown>
    </>
  );
}
