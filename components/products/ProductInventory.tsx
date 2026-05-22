import { FormInstance, Form, Switch, Table, TableProps } from "antd";
import { InputFormItem } from "../ui/AppFormItems";
import { SimpleProductInventoryLevels } from "@/types/index";

type ProductInventoryProps = {
  form: FormInstance;
  onChange?: (value: any) => void;
  inventory: SimpleProductInventoryLevels[];
};

export function ProductInventory({ form, onChange, inventory }: ProductInventoryProps) {
  const columns: TableProps<SimpleProductInventoryLevels>["columns"] = [
    {
      title: "Location",
      dataIndex: "locationName",
      key: "locationName",
      className: "!pl-5",
    },
    {
      title: "Unavailable",
      dataIndex: "unavailable",
      key: "unavailable",
      align: "center",
    },
    {
      title: "Committed",
      dataIndex: "committed",
      key: "committed",
      align: "center",
    },
    {
      title: "Available",
      dataIndex: "available",
      key: "available",
      align: "center",
    },

    {
      title: "On hand",
      key: "onHand",
      dataIndex: "onHand",
      align: "center",
    },
  ];

  return (
    <section className=" p-5 bg-white border-gray-200  ">
      <Form form={form} layout="vertical" onValuesChange={onChange}>
        <h3>Inventory</h3>

        <>
          <div className="mt-5  flex justify-between  gap-3">
            <div>
              <p>Track inventory</p>
              <p className=" text-xs">You cannot enable/disable inventory tracking once you've created transactions for this item</p>
            </div>
            <Form.Item name="trackStock" className="!m-0 !p-0">
              <Switch size="default" />
            </Form.Item>
          </div>

          <div className="my-5 lg:my-8">
            <div className=" border border-gray-200   rounded-lg overflow-clip">
              <Table<SimpleProductInventoryLevels> columns={columns} dataSource={inventory} pagination={false} size="small" />
            </div>
          </div>
          <div className=" grid sm:grid-cols-2 gap-x-5 mt-3 lg:mt-8">
            <InputFormItem label="SKU (Stock Keeping Unit)" name="sku" placeholder="Enter SKU" />
            <InputFormItem label="Barcode (UPC, EAN, etc.)" name="barcode" placeholder="Enter Barcode" />
            <InputFormItem type="number" label="Low Stock Alert" name="lowStockThreshold" placeholder="Enter Low Stock Alert" />

            <InputFormItem type="number" label="MOQ (Minimum Order Quantity)" name="minOrderLevel" placeholder="Enter MOQ" />
          </div>

          <hr className=" mb-5 lg:my-5 border border-gray-100" />

          <div className=" flex justify-between items-center">
            <span className="ml-3">Continue selling when out of stock</span>
            <Form.Item name="allowOversell" className="!m-0 !p-0">
              <Switch size="default" />
            </Form.Item>
          </div>
        </>
      </Form>
    </section>
  );
}
