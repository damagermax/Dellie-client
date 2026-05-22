import { FormInstance, Form, Switch } from "antd";

export function ProductVisibility({ form, onChange }: { form: FormInstance; onChange: (value: any) => void }) {
  return (
    <Form form={form} layout="vertical" onValuesChange={onChange}>
      <div className="rounded-sm -border border-gray-200 -bg-white ">
        <h2 className=" font-semibold text-lg mb-5 text-gray-700">Visibility</h2>

        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="font-medium">Online Store</p>
              <p className="text-sm text-gray-500">Display this product in your storefront</p>
            </div>

            <Form.Item name="showInStorefront" valuePropName="checked" className="!m-0">
              <Switch />
            </Form.Item>
          </div>

          <div className="flex items-center justify-between">
            <div>
              <p className="font-medium">Point of Sale</p>
              <p className="text-sm text-gray-500">Make available during in-store sales</p>
            </div>

            <Form.Item name="showInPOS" valuePropName="checked" className="!m-0">
              <Switch />
            </Form.Item>
          </div>

          <div className="flex items-center justify-between">
            <div>
              <p className="font-medium">Sales</p>
              <p className="text-sm text-gray-500">Allow this product in sales transactions</p>
            </div>

            <Form.Item name="showInSales" valuePropName="checked" className="!m-0">
              <Switch />
            </Form.Item>
          </div>

          <div className="flex items-center justify-between">
            <div>
              <p className="font-medium">Purchases</p>
              <p className="text-sm text-gray-500">Allow this product in purchase orders</p>
            </div>

            <Form.Item name="showInPurchases" valuePropName="checked" className="!m-0">
              <Switch />
            </Form.Item>
          </div>
        </div>
      </div>
    </Form>
  );
}
