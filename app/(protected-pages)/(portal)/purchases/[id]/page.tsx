"use client";

import { BaseButton } from "@/components/ui/AppButtons";
import { Button, Divider, Form, Tabs } from "antd";
import type { TabsProps } from "antd";

import { GoChevronLeft } from "react-icons/go";
import PurchaseOrderProductsOverview from "@/components/purchase-orders/PurchaseOrderProductsOverview";

import { useGetProductQuery, useUpdateProductMutation } from "@/lib/redux/services";
import React, { useEffect, useState } from "react";
import { ProductAddons, ProductBasicInfo, ProductInventory, ProductMedia, ProductPerformance, ProductVariantsTable, ProductVisibility } from "@/components/products";
import { LuPlus, LuSettings } from "react-icons/lu";

import dayjs from "dayjs";
import relativeTime from "dayjs/plugin/relativeTime";
import { GoBack } from "@/components/ui/GoBack";
import PurchaseOrderExpenses from "@/components/purchase-orders/PurchaseOrderExpenses";
dayjs.extend(relativeTime);

export default function PurchaseDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = React.use(params);
  const [productForm] = Form.useForm();

  const onChange = (key: string) => {
    console.log(key);
  };

  return (
    <div className="pb-5  min-h-screen">
      <div className="  lg:flex  -lg:gap-x-6">
        <div className="lg:w-[70%] border min-h-screen  bg-white border-l-0  border-y-0 border-gray-200 ">
          <div className=" border-b pb-5  border-gray-200">
            <div className=" flex items-center justify-between px-8">
              <div className="flex gap-x-3 items-center">
                <GoBack />
                <h1 className="pageTittle">{"PO-0001"}</h1>
              </div>

              <div className=" flex gap-x-4">
                <Button type="text">Edit</Button>

                <BaseButton size="middle" label="Add Update" classNames="!py-1" onClick={() => {}} />
                {/* <Button className=" shadow-none border-0" type="primary" shape="circle">
                  <LuPlus />
                </Button> */}
              </div>
            </div>

            <div className=" flex px-18  text-gray-500 items-center gap-x-2">
              <p>
                Created <span>{dayjs().format("DD MMM, YYYY")}</span>
              </p>
              .
              <p>
                Last Updated <span>{dayjs().fromNow()}</span>
              </p>
            </div>
          </div>

          <div className=" py-6  px-8">
            <div className=" grid grid-cols-3 gap-5">
              <div className="grid gap-y-1">
                <p className="  text-xs text-gray-500">Ordered On</p>
                <p>2nd March, 2026</p>
              </div>

              <div className="grid gap-y-1">
                <p className="  text-xs text-gray-500">Vendor</p>
                <p>Maxwell Supply LTD.</p>
              </div>

              <div className="grid gap-y-1">
                <p className="  text-xs text-gray-500">Estimated Arrival</p>
                <p>2nd March, 2026</p>
              </div>

              <div className="grid gap-y-1">
                <p className=" text-xs text-gray-500"> Payment Terms</p>
                <p>None</p>
              </div>

              <div className="grid gap-y-1">
                <p className="  text-xs text-gray-500">Payment Due On</p>
                <p>2nd March, 2026</p>
              </div>

              <div className="grid gap-y-1">
                <p className=" text-xs text-gray-500"> Shipping Carrier</p>
                <p>Bolt (90-93-3344)</p>
              </div>
            </div>
          </div>
          {/* <Divider className=" m-0! p-0!" />
          <div className=" py-5 px-8">
            <h2 className=" text-lg mb-5">Shipment Details</h2>

           
          </div> */}

          <div className="-border-b border-gray-200 mt-8">
            <div className="flex px-8 gap-1">
              {["Items", "Fulfillment", "Expenses", "Payments"].map((tab) => (
                <button
                  key={tab}
                  className={`py-2 rounded-tl-xl rounded-tr-xl cursor-pointer px-5  text-sm font-medium border-x-1  border-t-1 transition hover:border-gray-200  hover:bg-[#FAFAFA]! ${tab === "Items" ? "border-gray-200  border-b-2! border-b-[#FAFAFA]!  bg-[#FAFAFA]   font-semibold! text-gray-900" : "border-transparent text-gray-500 hover:text-gray-700  "}`}
                >
                  {tab}
                </button>
              ))}
            </div>
          </div>

          <PurchaseOrderProductsOverview />
        </div>

        <div></div>

        <div className=" bg-gray-50 pl-5 -pt-5  lg:w-[30%] -mt-5 pr-8 lg:mt-0 flex flex-col  gap-2">
          <div className=" -bg-white p-5 -border rounded-sm -border-gray-200 mb-5">
            <p className=" text-lg mb-5">Payment Summary</p>
            <div className="  gap-3 grid border-solid justify-between">
              <div className="">
                <p>Purchase Total</p>
                <p className=" text-base">
                  GHS 20,000<span className=" text-gray-500 text-base"> (USD 2,000)</span>
                </p>
              </div>

              <div>
                <p>Paid Amount</p>
                <p className=" text-base">
                  GHS 23,000<span className=" text-gray-500 text-base"> (USD 1,000)</span>
                </p>
              </div>

              <div>
                <p>Balance</p>
                <p className=" text-base">
                  GHS 0<span className=" text-gray-500 text-base"> (USD 0)</span>
                </p>
              </div>
            </div>
          </div>

          {/* <div className=" bg-white px-5 py-3 border rounded-sm border-gray-200 cursor-pointer">Payments</div>
          <div className=" bg-white px-5 py-3 border rounded-sm border-gray-200 cursor-pointer">Refunds</div>
          <div className=" bg-white px-5 py-3 border rounded-sm border-gray-200  cursor-pointer">Good Received</div>
          <div className=" bg-white px-5 py-3 border rounded-sm border-gray-200 cursor-pointer ">Good Returned</div>
          <div className=" bg-white px-5 py-3 border rounded-sm border-gray-200 cursor-pointer ">Extra Cost</div> */}
        </div>
      </div>
    </div>
  );
}
