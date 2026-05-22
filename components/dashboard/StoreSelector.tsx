import { Select, Space, Button } from "antd";
import { PlusOutlined } from "@ant-design/icons";

const stores = [
  { value: "all", label: "All Locations" },
  { value: "accra", label: "Accra Mall" },
  { value: "east-legon", label: "East Legon" },
  { value: "kumasi", label: "Kumasi Central" },
  { value: "tema", label: "Tema Community 25" },
];

export function StoreSelector() {
  return (
    <div className="flex items-center gap-4">
      <Select defaultValue="all" style={{ width: 200 }} options={stores} />
    </div>
  );
}
