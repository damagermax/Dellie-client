import { BaseButton } from "../ui/AppButtons";
import AppTable from "../ui/AppTable";

interface ProductLineItem {
  id: string;
  productName: string;
  productImage?: string;
  quantityOrdered: number;
  quantityReceived: number;
  quantityReturned: number;
  cost: number;
  total: number;
}

const PurchaseOrderProductsOverview = () => {
  const lineItems: ProductLineItem[] = [
    {
      id: "1",
      productName: "Samsung 420L Refrigerator",
      productImage: "",
      quantityOrdered: 10,
      quantityReceived: 8,
      quantityReturned: 0,
      cost: 2000,
      total: 20000,
    },
    {
      id: "2",
      productName: "LG 55-inch Smart TV",
      productImage: "",
      quantityOrdered: 6,
      quantityReceived: 6,
      quantityReturned: 1,
      cost: 3500,
      total: 21000,
    },
    {
      id: "3",
      productName: "Panasonic Microwave Oven",
      productImage: "",
      quantityOrdered: 15,
      quantityReceived: 12,
      quantityReturned: 0,
      cost: 600,
      total: 9000,
    },
    {
      id: "4",
      productName: "Philips Electric Kettle",
      productImage: "",
      quantityOrdered: 25,
      quantityReceived: 25,
      quantityReturned: 2,
      cost: 150,
      total: 3750,
    },
    {
      id: "5",
      productName: "Hisense Air Conditioner 1.5HP",
      productImage: "",
      quantityOrdered: 8,
      quantityReceived: 5,
      quantityReturned: 0,
      cost: 2800,
      total: 22400,
    },
  ];

  const productColumns = [
    {
      title: "Name",
      dataIndex: "productName",
      key: "productName",
      className: "!pl-8",
      width: "55%",
    },
    {
      title: "Quantity",
      dataIndex: "quantityOrdered",
      key: "quantityOrdered",
      width: "25%",

      render: (quantityOrdered: string, item: ProductLineItem) => {
        return (
          <div className=" flex  items-center gap-2">
            <p className=" text-gray-900">100</p>
            <div className=" mt-1 hidden flex gap-1">
              <p className="bg-gray-100 px-2 rounded-full text-sm  text-green-600">Rec: 3</p>
              <p className="bg-gray-100 px-2 rounded-full text-sm  text-gray-600">Ret: 1</p>
            </div>
          </div>
        );
      },
    },

    {
      title: "Unit Rate",
      dataIndex: "cost",
      key: "cost",
    },
    {
      title: "Total",
      dataIndex: "total",
      key: "total",
      className: "!pr-8",
    },
  ];

  return (
    <div>
      <AppTable columns={productColumns} dataSource={lineItems} rowKey={(r: ProductLineItem) => r.id} />

      <div className=" my-5 grid grid-cols-2 px-8">
        <div>
          <h2 className=" text-lg mb-5">Note</h2>
        </div>

        <div className=" pl-[12%] text-base grid gap-y-2">
          <div className=" text-gray-600 flex justify-between">
            <p>Subtotal</p>
            <p>USD 2,000</p>
          </div>
          <div className="  flex justify-between">
            <p>Discount</p>
            <p>2%</p>
          </div>
          <div className=" flex justify-between">
            <p>Taxes</p>
            <p>3%</p>
          </div>
          <div className=" flex justify-between">
            <p>Total</p>
            <p>USD 1,700</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PurchaseOrderProductsOverview;
