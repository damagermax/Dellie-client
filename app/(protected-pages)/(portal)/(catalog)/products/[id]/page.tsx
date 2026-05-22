"use client";
import { BaseButton } from "@/components/ui/AppButtons";
import { Button, Form, Segmented } from "antd";

import { FaBox } from "react-icons/fa";
import { TbPackages } from "react-icons/tb";
import { IoPersonSharp } from "react-icons/io5";
import { GrHistory } from "react-icons/gr";
import { ImBoxRemove } from "react-icons/im";

import { useGetProductQuery, useUpdateProductMutation } from "@/lib/redux/services";
import React, { useEffect, useState } from "react";
import { ProductAddons, ProductBasicInfo, ProductInventory, ProductMedia, ProductPerformance, ProductVariantsTable, ProductVisibility } from "@/components/products";

import dayjs from "dayjs";
import relativeTime from "dayjs/plugin/relativeTime";
import { GoBack } from "@/components/ui/GoBack";
dayjs.extend(relativeTime);

const options = [
  {
    label: (
      <div className="flex items-center gap-x-2">
        <FaBox />
        <span>Overview</span>
      </div>
    ),
    value: "Overview",
  },
  // {
  //   label: (
  //     <div className="flex items-center gap-x-2">
  //       <TbPackages />
  //       <span>Packaging</span>
  //     </div>
  //   ),
  //   value: "Packaging",
  // },
  // {
  //   label: (
  //     <div className="flex items-center gap-x-2">
  //       <IoPersonSharp />
  //       <span>Product Vendors</span>
  //     </div>
  //   ),
  //   value: " Vendors",
  // },
  {
    label: (
      <div className="flex items-center gap-x-2">
        <GrHistory />
        <span>Order History</span>
      </div>
    ),
    value: "Order History",
  },
  {
    label: (
      <div className="flex items-center gap-x-2">
        <ImBoxRemove />
        <span>Movement History</span>
      </div>
    ),
    value: "Movement History",
  },
];

export default function ProductDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = React.use(params);
  const [productForm] = Form.useForm();

  const [size, setSize] = useState("Overview");

  const [updatedProduct, setUpdatedProduct] = useState<Record<string, any>>({});

  const {
    data: product,
    error,
    isLoading,
    isSuccess,
  } = useGetProductQuery(id, {
    skip: !id,
  });

  const [updateProduct, { isLoading: updatingProduct }] = useUpdateProductMutation();

  useEffect(() => {
    if (product) {
      const profit = product?.sellingPrice - product?.costPrice || 0;
      const profitMargin = `${((profit / product.sellingPrice) * 100).toFixed() || 0}%`;

      productForm.setFieldsValue({ ...product, profit, profitMargin });
    }
  }, [isSuccess, product]);

  const handleFormValueChange = (changedValues: Record<string, unknown>) => {
    const key = Object.keys(changedValues)[0];

    // Check if the changed value is different from the original product value and update changed fields
    if (changedValues[key] != product[key]) {
      setUpdatedProduct((values) => ({ ...values, ...changedValues }));
    } else {
      setUpdatedProduct((values) => {
        const updated: any = { ...values };
        delete updated[key];

        return updated;
      });
    }

    // Recalculate profit and profit margin if relevant fields changed
    if (key === "costPrice" || key === "sellingPrice") {
      recalculateProfit();
    }
  };

  const recalculateProfit = () => {
    const costPrice = productForm.getFieldValue("costPrice") ?? 0;
    const sellingPrice = productForm.getFieldValue("sellingPrice") ?? 0;

    const profit = sellingPrice - costPrice;
    const profitMargin = sellingPrice ? `${((profit / sellingPrice) * 100).toFixed()}%` : "0%";

    productForm.setFieldsValue({ profit, profitMargin });
  };

  const handleUpdate = async () => {
    await updateProduct({ ...updatedProduct, id });
  };

  return (
    <div className="  min-h-screen">
      <div className="  bg-amber-100 border-gray-200  lg:flex  -lg:gap-x-6">
        <div className="lg:w-[70%] border  min-h-screen bg-white border-l-0  border-y-0 border-gray-200 ">
          <div className=" border-b pb-5  border-gray-200">
            <div className=" flex items-center justify-between px-8">
              <div className="flex gap-x-3 items-center">
                <GoBack />
                <h1 className="pageTittle">Apple iPhone 14 Pro Max</h1>
              </div>

              <div className=" flex gap-x-4">
                <Button type="default">Edit</Button>
              </div>
            </div>

            <AuditFooter createdBy="Admin User" createdAt="2026-05-01" updatedBy="Kofi Asante" updatedAt="2026-05-14" />
          </div>

          <div className=" flex gap-8 p-8">
            <img className=" w-68 h-68  -bg-gray-50 rounded-sm p-2" src="https://gh.jumia.is/unsafe/fit-in/300x300/filters:fill(white)/product/49/408001/1.jpg?3705" alt="" />

            <div>
              <h1 className=" hidden font-semibold text-2xl mb-1 text-gray-700">Apple iPhone 14 Pro Max</h1>

              <div className="mt-2 grid grid-cols-2 gap-x-12 gap-y-5 md:grid-cols-3">
                <div>
                  <p className="text-sm text-gray-500">SKU</p>
                  <p className="font-medium text-gray-900">IP14PROMAX</p>
                </div>

                <div>
                  <p className="text-sm text-gray-500">Category</p>
                  <p className="font-medium text-gray-900">Uncategorized</p>
                </div>

                <div>
                  <p className="text-sm text-gray-500">Barcode</p>
                  <p className="font-medium text-gray-900">0487080001293</p>
                </div>

                <div>
                  <p className="text-sm text-gray-500">Brand</p>
                  <p className="font-medium text-gray-900">Jasmine</p>
                </div>

                <div>
                  <p className="text-sm text-gray-500">Weight</p>
                  <p className="font-medium text-gray-900">0.5 kg</p>
                </div>

                <div>
                  <p className="text-sm text-gray-500">UOM</p>
                  <p className="font-medium text-gray-900">Bottles</p>
                </div>
              </div>

              {/* <p className=" font-medium mt-7">Tags</p>
              <div className=" flex gap-x-2 mt-3">
                <p className=" text-gray-600 px-2 py-0.5 text-[11px] rounded-full bg-gray-100">Mobile</p>
                <p className=" text-gray-600 px-2 py-0.5 text-[11px] rounded-full bg-gray-100">Smartphone</p>
                <p className=" text-gray-600 px-2 py-0.5 text-[11px] rounded-full bg-gray-100">iOS</p>
              </div> */}

              <p className=" text-gray-500  mt-5">Description</p>
              <p className="mt-1 text-gray-900 line-clamp-5">
                Frytol Vegetable Oil is a general purpose oil often used for the preparation of dressings for salads and raw vegetables, marinades, mayonnaise and diet-margarine. It can also be used for shallow frying, pastry making and baking. Frytol offers
                vegetable oil, the world’s most widely used edible oil (more commonly known as vegetable oil). Vegetable oil is low in saturated fat and high in poly and monounsaturated fats, while it provides a source of omega-3 fatty acids, which lower
                cholesterol levels. With little flavor, the product does not interfere with the taste of food and is a preferred option by chefs, bakers and snack food manufacturers.
              </p>
            </div>

            {/* <ProductBasicInfo form={productForm} onChange={handleFormValueChange} /> */}
          </div>

          <div className=" w-full flex items-center justify-center mt-5">
            <Segmented
              shape="round"
              options={options}
              value={size}
              onChange={setSize}
              style={{
                backgroundColor: "#ebebeb",
                //color: "#000",
                padding: "5px",
              }}
              className="[&_.ant-segmented-item-selected]:!bg-yellow-600 [&_.ant-segmented-item-selected]:!text-white -text-black"
            />
          </div>

          <section className=" grid grid-cols-2 gap-5 mt-8 px-8">
            <div className="bg-gray-100 rounded-sm">
              <div className="text-base px-5 pt-5">Quantity on hand for all Locations</div>
              <p className="mt-1 px-5">
                <span className="text-xl font-medium">300</span> <span>Carton</span>
              </p>

              <div className="bg-white  border mt-4 border-gray-100 divide-y divide-gray-100">
                <div className="flex items-center justify-between p-4">
                  <span className="text-gray-600">Madina Accra Ghana</span>
                  <span className="font-semibold text-gray-900">100 Units</span>
                </div>

                <div className="flex items-center justify-between p-4">
                  <span className="text-gray-600">Spintex</span>
                  <span className="font-semibold text-gray-900">10 Units</span>
                </div>
              </div>
            </div>

            <div className=" rounded-sm ">
              <div className="bg-gray-100 rounded-sm p-3">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="p-2 ">
                    <div className="text-sm text-gray-500 mb-1">Selling Price</div>
                    <div className="text-lg font-bold text-gray-900">$24.99</div>
                  </div>

                  <div className="  p-2 ">
                    <div className="text-sm text-gray-500 mb-1">Cost Price</div>
                    <div className="text-lg font-bold text-gray-900">$18.50</div>
                  </div>
                </div>
              </div>

              {/* MOQ + Cost Details */}
              <div className="bg-white rounded-md border border-gray-100 divide-y divide-gray-100">
                <div className="flex items-center justify-between p-4">
                  <span className="text-gray-600">Minimum Order Quantity (MOQ)</span>
                  <span className="font-semibold text-gray-900">100 Units</span>
                </div>

                <div className="flex items-center justify-between p-4">
                  <span className="text-gray-600">Estimated Profit Margin</span>
                  <span className="font-semibold text-green-600">32%</span>
                </div>
              </div>
            </div>
          </section>

          {/* <ProductMedia media={product?.media} productId={product?.id} /> */}

          {/* <ProductAddons /> */}
          {/* {!product?.hasVariants && <ProductInventory form={productForm} onChange={handleFormValueChange} inventory={product?.inventoryLevels} />}
          {product?.hasVariants ? <ProductVariantsTable variants={product?.variants} /> : null} */}
        </div>

        <div className=" bg-gray-50 pl-6 pt-4  lg:w-[30%] mt-5 pr-8 lg:mt-0 flex flex-col  gap-5">
          <ProductVisibility form={productForm} onChange={handleFormValueChange} />
          {/* <ProductPerformance /> */}
        </div>
      </div>
    </div>
  );
}

const AuditFooter = ({ createdBy = "System", createdAt = `${dayjs()}`, updatedBy = "System", updatedAt = `${dayjs()}` }: { createdBy?: string; createdAt?: string; updatedBy?: string; updatedAt?: string }) => {
  return (
    <div className="flex px-18 text-gray-500 items-center gap-x-2 text-sm">
      <p>
        Created by <span className="font-medium">{createdBy}</span> on <span className="font-medium">{dayjs(createdAt).format("DD MMM, YYYY")}</span>
      </p>

      <span>•</span>

      <p>
        Last updated by <span className="font-medium">{updatedBy}</span> on <span className="font-medium">{dayjs(updatedAt).format("DD MMM, YYYY")}</span> (<span>{dayjs(updatedAt).fromNow()}</span>)
      </p>
    </div>
  );
};
