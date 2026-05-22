"use client";

import { useState, useMemo, useCallback } from "react";
import { AppModal, ModalProps } from "../ui/AppModal";
import { Button, Divider, Form, Checkbox, Input, InputNumber, Select, MenuProps, Dropdown } from "antd";
import { InputFormItem, DatePickerFormItem, SelectFormItem } from "../ui/AppFormItems";
import { SearchableContactSelect } from "../contacts/SeachableContactSelect";
import { useGetInventoryQuery } from "@/lib/redux/services";
import { RiSearchLine } from "react-icons/ri";

import { ChevronDown, Trash2 } from "lucide-react";

import { SearchableCurrenciesSelect } from "../system/SearchableCurrencySelect";

import AppTable from "../ui/AppTable";
import PreviewImage from "../ui/PreviewImage";
import { SearchableLocationSelect } from "../location/SearchableLocationSelect";
import dayjs from "dayjs";

interface ProductLineItem {
  id: string;
  productImageUrl?: string;
  productName: string;
  quantity: number;
  unitPrice: number;
  discountValue?: number;
  discountType?: "fixed" | "percent";
}

export function PurchaseOrderFormModal({ open, toggle }: ModalProps) {
  const [form] = Form.useForm();

  const { data: inventoryData } = useGetInventoryQuery({});

  const [lineItems, setLineItems] = useState<ProductLineItem[]>([]);
  const [searchValue, setSearchValue] = useState("");
  const [discount, setDiscount] = useState({ discountValue: 0, discountType: "percent" });

  const rate = Form.useWatch("rate", form) || 1;
  const currency = Form.useWatch("Currency", form) || "";

  const items: MenuProps["items"] = [
    {
      key: "percent",
      label: "%",
    },
    {
      key: "fixed",
      label: "$",
    },
  ];

  const updateLineItem = useCallback((id: string, patch: Partial<ProductLineItem>) => {
    setLineItems((prev) => prev.map((li) => (li.id === id ? { ...li, ...patch } : li)));
  }, []);

  const calculateLineTotal = (item: ProductLineItem) => {
    const subtotal = item.quantity * item.unitPrice;

    let discount = 0;

    if (item.discountType === "fixed") {
      discount = item.discountValue || 0;
    } else {
      discount = (subtotal * (item.discountValue || 0)) / 100;
    }

    const total = Math.max(subtotal - discount, 0);

    return {
      subtotal,
      discount,
      total,
      baseTotal: total * rate,
    };
  };

  const addLineItem = (productId: number) => {
    const item = inventoryData?.data?.find((p: any) => p.id === productId);

    if (!item) return;

    setLineItems((prev: any[]) => {
      const existingItem = prev.find((p) => p.id === item.id);

      // If product already exists, increase quantity
      if (existingItem) {
        return prev.map((p) =>
          p.id === item.id
            ? {
                ...p,
                quantity: p.quantity + 1,
              }
            : p,
        );
      }

      // Add new product
      return [
        ...prev,
        {
          id: item.id,
          productName: `${item?.productName}${item?.variantName ? ` - ${item.variantName}` : ""}`,
          productImageUrl: item?.imageUrl,
          quantity: 1,
          discountType: "percent",
          unitPrice: 0,
        },
      ];
    });

    setSearchValue("");
  };

  const removeLineItem = (productId: number) => {
    setLineItems((prev: any[]) => prev.filter((item) => item.id !== productId));
  };

  const handleSubmit = async () => {
    const values = await form.validateFields().catch(() => null);
    if (!values) return;
    const payload = {
      ...values,
      items: lineItems,
    };

    console.log("PO payload", payload);
    toggle();
  };

  const productColumns = useMemo(
    () => [
      {
        title: "Product",
        dataIndex: "productName",
        key: "productName",
        className: "!pl-8",
        width: "30%",
        render: (_: any, record: ProductLineItem) => (
          <div className="flex items-center gap-x-2">
            <PreviewImage width={28} height={28} src={record.productImageUrl} />
            <span>{record.productName}</span>
          </div>
        ),
      },

      {
        title: "Qty",
        dataIndex: "quantity",
        key: "quantity",
        render: (_: any, record: ProductLineItem) => <InputNumber variant="underlined" controls={false} min={1} value={record.quantity} onChange={(v) => updateLineItem(record.id, { quantity: Number(v || 1) })} suffix="unites" />,
      },

      {
        title: "Cost",
        dataIndex: "unitPrice",
        key: "unitPrice",
        render: (_: any, record: ProductLineItem) => <InputNumber prefix="$" variant="underlined" controls={false} min={0} value={record.unitPrice} onChange={(v) => updateLineItem(record.id, { unitPrice: Number(v || 0) })} />,
      },

      {
        title: "Discount",
        dataIndex: "discountValue",
        key: "discountValue",
        render: (_: any, record: ProductLineItem) => {
          console.log({ record });

          return (
            <div className="relative inline-flex  items-center gap">
              <Dropdown
                menu={{
                  items,
                  onClick: ({ key }) => {
                    updateLineItem(record.id, {
                      discountType: key as any,
                    });
                    console.log(`Click on item ${key}`);
                  },
                }}
              >
                <p className="  cursor-pointer"> {record?.discountType == "percent" ? "%" : "$"} </p>
              </Dropdown>
              <InputNumber
                min={0}
                controls={false}
                className=" !w-[60px]"
                variant="underlined"
                value={record.discountValue}
                onChange={(v) =>
                  updateLineItem(record.id, {
                    discountValue: Number(v || 0),
                  })
                }
              />
            </div>
          );
        },
      },

      {
        title: "Tax",
        dataIndex: "tax",
        key: "tax",
        render: (_: any, record: ProductLineItem) => {
          console.log({ record });

          return (
            <div className="relative inline-flex  items-center gap">
              <InputNumber
                min={0}
                suffix="%"
                controls={false}
                className=" !w-[60px]"
                variant="underlined"
                value={record.discountValue}
                onChange={(v) =>
                  updateLineItem(record.id, {
                    discountValue: Number(v || 0),
                  })
                }
              />
            </div>
          );
        },
      },

      {
        title: "Total ",
        dataIndex: "__total",
        key: "__total",

        align: "end",
        render: (_: any, record: ProductLineItem) => {
          // const qtyTotal = record.quantity * record.unitPrice;
          // const lineTotal = qtyTotal;
          // const baseTotal = lineTotal * rate;

          const { subtotal, discount, total } = calculateLineTotal(record);

          return (
            <div>
              <p>
                {currency || "$"} {total.toLocaleString()}
              </p>
            </div>
          );
        },
      },

      {
        title: "",
        dataIndex: "id",
        key: "id",
        align: "end",
        // className: "!pr-5",
        render: (id) => (
          <div className="pl-5  text-gray-500 cursor-pointer hover:text-red-400 " onClick={() => removeLineItem(id)}>
            <Trash2 size={15} className=" cursor-pointer " />
          </div>
        ),
      },
    ],
    [rate, currency, updateLineItem],
  );

  const summary = useMemo(() => {
    // Line items subtotal after item discounts
    const itemsSubTotal = lineItems.reduce((sum, item) => {
      const itemTotal = item.quantity * item.unitPrice;

      let itemDiscount = 0;

      if (item.discountValue) {
        itemDiscount = item.discountType === "percent" ? (itemTotal * item.discountValue) / 100 : item.discountValue;
      }

      return sum + (itemTotal - itemDiscount);
    }, 0);

    // Global discount
    let globalDiscount = 0;

    if (discount.discountValue) {
      globalDiscount = discount.discountType === "percent" ? (itemsSubTotal * discount.discountValue) / 100 : discount.discountValue;
    }

    const subTotal = itemsSubTotal - globalDiscount;

    const tax = 0;

    const total = subTotal + tax;

    const baseTotal = total * rate;

    return {
      itemsSubTotal,
      globalDiscount,
      subTotal,
      tax,
      total,
      baseTotal,
    };
  }, [lineItems, discount, rate]);

  const paymentTerms = [
    { label: "Due on Receipt", value: "due_on_receipt" },
    { label: "Net 7 Days", value: "net_7" },
    { label: "Net 15 Days", value: "net_15" },
    { label: "Net 30 Days", value: "net_30" },
    { label: "Net 45 Days", value: "net_45" },
    { label: "Net 60 Days", value: "net_60" },
    { label: "End of Month (EOM)", value: "eom" },
    { label: "50% Upfront, 50% on Completion", value: "milestone_50_50" },
    { label: "100% Upfront", value: "full_advance" },
    { label: "Installments", value: "installments" },
  ];

  const searchProduct = (
    <>
      <div className=" px-5 bg-gray-100  ">
        <div className="  sticky inset-0 z-50  py-4">
          <Input prefix={<RiSearchLine />} placeholder="Search for product " className="  rounded-full!" value={searchValue} onChange={({ target: { value } }) => setSearchValue(value)} />
        </div>
        <div className=" shadow-xl bg-white  ">
          {inventoryData?.data?.map((item: any) => {
            if (searchValue)
              return (
                <div key={item.id} className="   cursor-pointer   flex items-center justify-between border-t border-gray-200 px-5 py-2" onClick={() => addLineItem(item.id)}>
                  <div className=" flex gap-x-2 items-center">
                    <PreviewImage width={28} height={28} src={item?.imageUrl} />
                    <div>
                      <p className="  ">
                        {item?.productName} {item?.variantName && <span>- {item?.variantName}</span>}
                      </p>
                      {item?.sku != "undefined" && <p className="   text-gray-500"> {item?.sku}</p>}
                    </div>
                  </div>
                </div>
              );
          })}
        </div>
      </div>
    </>
  );

  return (
    <AppModal open={open} toggle={toggle} title="New Purchase" onOk={handleSubmit} width={1000} loading={false} okText={"Save"}>
      <Form form={form} layout="vertical" initialValues={{ date: dayjs(), dueDate: dayjs() }}>
        <div className=" grid grid-cols-4 p-5 gap-x-5 pb-12">
          <Form.Item name="contactId" label="Contact" rules={[{ required: true, message: "Select contact" }]}>
            <SearchableContactSelect onAddContact={() => {}} />
          </Form.Item>

          <DatePickerFormItem label="Date" name="date" placeholder="date" className="" />

          <DatePickerFormItem label="Expected Delivery Date" name="deliveryDate" placeholder="Delivery Date" className="" />

          <Form.Item name="location" label="Location">
            <SearchableLocationSelect />
          </Form.Item>

          <Form.Item label="Currency" name="currencyId">
            <SearchableCurrenciesSelect onChange={(currency) => console.log(currency)} />
          </Form.Item>

          <Form.Item label="Exchange Rate" className="w-full" name="rate">
            <InputNumber className=" !w-full" prefix={"1 USD ="} defaultValue={1} placeholder="1" suffix={"GHS"} type="number" controls={false} />
          </Form.Item>

          <Form.Item name="paymentTerm" label="Payment Term">
            <Select options={paymentTerms} placeholder="Payment Term" />
          </Form.Item>
          <DatePickerFormItem label="Due Date" name="dueDate" placeholder="Due Date" className="" />
        </div>

        <AppTable columns={productColumns} dataSource={lineItems || []} rowKey={(r: ProductLineItem) => r.id} />

        {searchProduct}

        {lineItems.length > 0 && (
          <div className="px-5 pb-4  w-full mt-8 grid grid-cols-3">
            <div></div>
            <div></div>
            <div className=" text-right space-y-2">
              <div className=" space-y-2">
                <div className="flex justify-between gap-6">
                  <span>Subtotal</span>
                  <span>
                    {currency} {summary.subTotal.toFixed(2)}
                  </span>
                </div>
                <div className="flex justify-between items-center gap-6">
                  <div className="relative inline-flex    items-center gap">
                    <span className=" inline-block mr-4">Discount </span>

                    <InputNumber
                      min={0}
                      controls={false}
                      className=" !w-[60px]"
                      variant="underlined"
                      value={discount.discountValue}
                      onChange={(v) =>
                        setDiscount((prev: any) => ({
                          ...prev,
                          discountValue: Number(v || 0),
                        }))
                      }
                    />

                    <Dropdown
                      menu={{
                        items,
                        onClick: ({ key }) => {
                          setDiscount((prev: any) => ({
                            ...prev,
                            discountType: key,
                          }));

                          console.log(`Click on item ${key}`);
                        },
                      }}
                    >
                      <p className="  cursor-pointer"> {discount.discountType == "percent" ? "%" : "$"} </p>
                    </Dropdown>
                  </div>
                  <p>
                    {currency} {summary.subTotal.toFixed(2)}
                  </p>
                </div>
                <div className="flex justify-between gap-6">
                  <span>Tax</span>
                  <span>
                    {currency} {summary.tax.toFixed(2)}
                  </span>
                </div>
                <div className="flex justify-between gap-6 font-medium">
                  <span>Total</span>
                  <span>
                    {currency} {summary.total.toFixed(2)}
                  </span>
                </div>
                {rate !== 1 && (
                  <div className="flex justify-between gap-6 text-xs text-gray-500">
                    <span>Base Total</span>
                    <span>{summary.baseTotal.toFixed(2)}</span>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}
      </Form>
    </AppModal>
  );
}
