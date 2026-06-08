"use client";
import { Divider, Form } from "antd";

import { InputNumber, Switch } from "antd";
import { AppSearch } from "../ui/AppSearchInput";
import AppTable from "../ui/AppTable";

import useToggle from "@/hooks/UseToggle";
import { ChevronDown, CircleX } from "lucide-react";
import { DatePickerFormItem, InputFormItem, SelectFormItem, TextAreaFormItem } from "../ui/AppFormItems";
import { AppModal, ModalProps } from "../ui/AppModal";

interface Product {
  id: string;
  name: string;
  price: number;
  quantity: number;
  image: string;
  category: string;
}

const initialProducts: Product[] = [
  {
    id: "1",
    name: "Premium Wireless Earbuds",
    price: 129.99,
    quantity: 1,
    image: "/images/placeholder.png",
    category: "Electronics",
  },
  {
    id: "2",
    name: "Organic Cotton T-Shirt",
    price: 29.99,
    quantity: 1,
    image: "/images/placeholder.png",
    category: "Fashion",
  },
  {
    id: "3",
    name: "Stainless Steel Water Bottle",
    price: 24.99,
    quantity: 1,
    image: "/images/placeholder.png",
    category: "Home & Kitchen",
  },
  {
    id: "4",
    name: "Bluetooth Speaker",
    price: 79.99,
    quantity: 1,
    image: "/images/placeholder.png",
    category: "Electronics",
  },
  {
    id: "5",
    name: "Yoga Mat",
    price: 34.99,
    quantity: 1,
    image: "/images/placeholder.png",
    category: "Fitness",
  },
];

export default function OrderFormModal({ open, toggle }: ModalProps) {
  const [orderForm] = Form.useForm();
  const [paid, togglePaid] = useToggle(false);
  const [more, toggleMore] = useToggle(false);

  const columns = [
    {
      title: "Product",
      dataIndex: "name",
      key: "name",
      className: "!pl-8",
      width: "45%",
      render: (text: string, record: Product) => (
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-md overflow-hidden bg-gray-100 flex-shrink-0">
            <img
              src={record.image}
              alt={record.name}
              className="w-full h-full object-cover"
              onError={(e) => {
                const target = e.target as HTMLImageElement;
                target.src = "/images/placeholder.png";
              }}
            />
          </div>
          <div>
            <div className="font-medium text-gray-900">{text}</div>
            <div className="text-xs text-gray-500">{record.category}</div>
          </div>
        </div>
      ),
    },
    {
      title: "Price",
      dataIndex: "price",
      key: "price",
      render: (price: number) => `GHS ${price.toFixed(2)}`,
    },
    {
      title: "Quantity",
      dataIndex: "quantity",
      key: "quantity",
      render: (quantity: number) => <InputNumber size="middle" className="w-[120px] !rounded-xl " addonAfter="+" addonBefore="-" defaultValue={1} min={1} value={quantity} />,
    },
    {
      title: "Total",
      key: "total",

      render: (_: any, record: Product) => `GHS ${(record.price * record.quantity).toFixed(2)}`,
      className: " font-medium",
    },

    {
      key: "id",
      className: "!pr-8",
      width: "8%",
      align: "center",
      render: (_: any, record: Product) => <CircleX className=" cursor-pointer text-red-300" />,
    },
  ];

  return (
    <AppModal title="Create Order" width={900} open={open} toggle={toggle}>
      <Form size="small" form={orderForm} layout={"vertical"}>
        <div className="  px-8  gap-x-12 ">
          <div className=" grid  grid-cols-2 gap-x-5">
            <InputFormItem className="w-full" label="Name" name="name" placeholder="Enter  name" />

            <DatePickerFormItem label="Date" name="orderDate" />

            <SelectFormItem
              label="Location"
              name="location"
              placeholder="Select Location"
              options={[
                { value: "Main Store", label: "Main Store" },
                { value: "Warehouse", label: "Warehouse" },
              ]}
            />

            <SelectFormItem label="Sales Channel" name="salesChannel" placeholder="Select Channel" options={[{ value: "Website", label: "Website" }]} />
          </div>
        </div>

        {/* Order Status and Shipping Status */}

        <div className="px-8 mb-8">
          <p className="  font-medium text-base text-blue-600 flex justify-end cursor-pointer" onClick={toggleMore}>
            <ChevronDown /> More
          </p>

          {more && (
            <div className=" grid grid-cols-2 gap-x-5">
              <SelectFormItem
                label="Order Status"
                name="orderStatus"
                placeholder="Select Status"
                options={[
                  { value: "pending", label: "Pending" },
                  { value: "confirmed", label: "Confirmed" },
                  { value: "processing", label: "Processing" },
                  { value: "completed", label: "Completed" },
                  { value: "cancelled", label: "Cancelled" },
                  { value: "refunded", label: "Refunded" },
                ]}
              />

              <SelectFormItem
                label="Shipping Status"
                name="shippingStatus"
                placeholder="Select Status"
                options={[
                  { value: "not_shipped", label: "Not Shipped" },
                  { value: "shipped", label: "Shipped" },
                  { value: "in_transit", label: "In Transit" },
                  { value: "out_for_delivery", label: "Out for Delivery" },
                  { value: "delivered", label: "Delivered" },
                  { value: "returned", label: "Returned" },
                ]}
              />
            </div>
          )}
        </div>

        {/* Products section */}
        <Divider></Divider>
        <div className="px-8  grid grid-cols-2">
          <h3 className=" font-medium text-lg">Products</h3>
          <AppSearch placeholder="Search product" className="w-full" />
        </div>
        <Divider></Divider>

        <div className="  relative top-[-12]">
          <AppTable pagination={false} columns={columns} dataSource={initialProducts} />

          <div className="">
            <div className="  space-y-3 bg-white border-t-0  -border border-gray-100 p-6 px-8 ">
              <div className="flex justify-between text-gray-600">
                <span>Subtotal</span>
                <span className="font-medium">GHS 299.95</span>
              </div>
              <div className="flex justify-between text-gray-600">
                <span>Tax (12.5%)</span>
                <span className="font-medium">GHS 37.49</span>
              </div>
              <div className="h-px w-full bg-gray-100 mt-2"></div>
              <div className="flex  justify-between text-lg font-semibold">
                <span>Total</span>
                <span className="text-primary">GHS 337.44</span>
              </div>
            </div>
          </div>
        </div>

        {/* Collect Payment section */}
        <Divider></Divider>
        <div className="px-8  flex items-center justify-between">
          <h3 className=" font-medium text-lg">Mark as paid</h3>
          <Switch size="default" checked={paid} onChange={togglePaid} />
        </div>
        <Divider></Divider>

        {paid && (
          <div className="px-8 bg-slate-100 relative top-[-12] pt-3 grid grid-cols-3 gap-x-5">
            <SelectFormItem
              label="Payment Channel"
              name="paymentChannel"
              placeholder="Select Payment Channel"
              options={[
                { value: "Cash", label: "Cash" },
                { value: "Card", label: "Card" },
              ]}
            />

            <InputFormItem className="w-full" label="Amount " name="amount" placeholder="Enter Amount" />
            <InputFormItem className="w-full" label="Reference " name="reference" placeholder="Enter Reference" />
          </div>
        )}

        <div className=" px-8 col-span-2 mt-8">
          <TextAreaFormItem label="Note (Optional)" name="note" placeholder="Type here..." />
        </div>
      </Form>
    </AppModal>
  );
}
