"use client";

import { useState, useMemo, useCallback, useEffect } from "react";
import { AppModal, ModalProps } from "../ui/AppModal";
import { Form, Input, InputNumber, Select, MenuProps, Dropdown, message } from "antd";
import { DatePickerFormItem } from "../ui/AppFormItems";
import { SearchableContactSelect } from "../contacts/SeachableContactSelect";
import { useCreatePurchaseMutation, useGetProductsQuery, useGetTaxesQuery, useUpdatePurchaseMutation } from "@/lib/redux/services";
import { ProductListItem, Purchase, PurchaseDiscountType, Tax } from "@/types/index";
import { RiSearchLine } from "react-icons/ri";
import { Trash2 } from "lucide-react";
import { SearchableCurrenciesSelect } from "../system/SearchableCurrencySelect";
import AppTable from "../ui/AppTable";
import PreviewImage from "../ui/PreviewImage";
import { SearchableLocationSelect } from "../location/SearchableLocationSelect";
import dayjs from "dayjs";

import { TaxSelector } from "../settings/TaxSelector";
import useToggle from "@/hooks/UseToggle";

interface PurchaseOrderFormModalProps extends ModalProps {
  purchase?: Purchase;
  onSaved?: () => void;
}

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

interface ProductLineItem {
  id: string;
  productImageUrl?: string;
  productName: string;
  quantity: number;
  unitPrice: number;
  tax?: Tax;
}

function getErrorMessage(error: any) {
  return error?.data?.message || "The purchase could not be saved. Please check the details and try again.";
}

export function PurchaseOrderFormModal({ open, toggle, purchase, onSaved }: PurchaseOrderFormModalProps) {
  const [form] = Form.useForm();
  const [lineItems, setLineItems] = useState<ProductLineItem[]>([]);
  const [selectedTax, setSelectedTax] = useState<Tax>();
  const [selectedTaxProductId, setSelectedTaxProductId] = useState<string>();
  const [searchValue, setSearchValue] = useState("");
  const [openTaxSelector, toggleTaxSelector] = useToggle();
  const [isDeferentProductTax, setIsDeferentProductTax] = useState(false);
  const toggleDeferentProductTax = useCallback(() => setIsDeferentProductTax((current) => !current), []);

  const [discount, setDiscount] = useState<{ discountValue: number; discountType: PurchaseDiscountType }>({ discountValue: 0, discountType: "percent" });

  const [createPurchase, { isLoading: creating }] = useCreatePurchaseMutation();
  const [updatePurchase, { isLoading: updating }] = useUpdatePurchaseMutation();
  const { data: productsData } = useGetProductsQuery({ search: searchValue, limit: 20, purchasable: true });
  const { data: taxes } = useGetTaxesQuery();

  const rate = Form.useWatch("rate", form) || 1;
  const currency = "";
  const loading = creating || updating;
  const cannotEdit = Boolean(purchase?.locked || purchase?.receiptStatus === "received");

  useEffect(() => {
    if (!open) return;
    const storeCurrencyId = typeof window !== "undefined" ? JSON.parse(localStorage.getItem("user") || "{}")?.store?.currencyId : undefined;

    if (purchase) {
      form.setFieldsValue({
        contactId: purchase.contactId?.id,
        date: dayjs(purchase.date),
        deliveryDate: purchase.deliveryDate ? dayjs(purchase.deliveryDate) : undefined,
        location: purchase.locationId?.id,
        currencyId: purchase.currencyId?.id,
        rate: purchase.rate || 1,
        paymentTerm: purchase.paymentTerms,
        dueDate: purchase.dueDate ? dayjs(purchase.dueDate) : undefined,
      });
      setDiscount({
        discountValue: Number(purchase.discountValue || 0),
        discountType: purchase.discountType || "fixed",
      });
      setLineItems(
        purchase.lineItems.map((item) => ({
          id: typeof item.productId === "string" ? item.productId : item.productId.id,
          productName: item.productName,
          productImageUrl: item.productUrl || (typeof item.productId === "string" ? undefined : item.productId.media?.[0]?.url),
          quantity: item.quantity,
          unitPrice: item.unitPrice,
        })),
      );
      return;
    }

    form.resetFields();
    form.setFieldsValue({ date: dayjs(), dueDate: dayjs(), currencyId: storeCurrencyId, rate: 1 });
    setDiscount({ discountValue: 0, discountType: "percent" });
    setSelectedTax(undefined);
    setIsDeferentProductTax(false);
    setLineItems([]);
  }, [form, open, purchase]);

  useEffect(() => {
    if (!open || !purchase || !taxes) return;
    const selectedDocumentTax = taxes.find((tax) => tax.id === purchase.taxId);
    const hasLineTax = purchase.lineItems.some((item) => Boolean(item.taxId));
    setSelectedTax(selectedDocumentTax);
    setIsDeferentProductTax(!selectedDocumentTax && hasLineTax);
    setLineItems((current) =>
      current.map((item) => ({
        ...item,
        tax: selectedDocumentTax ? undefined : taxes.find((tax) => tax.id === purchase.lineItems.find((line) => (typeof line.productId === "string" ? line.productId : line.productId.id) === item.id)?.taxId),
      })),
    );
  }, [open, purchase, taxes]);

  useEffect(() => {
    if (isDeferentProductTax) {
      setSelectedTax(undefined);
    } else {
      setLineItems((prev) =>
        prev.map((item) => ({
          ...item,
          tax: undefined,
        })),
      );
    }
  }, [isDeferentProductTax]);

  const items: MenuProps["items"] = [
    { key: "percent", label: "%" },
    { key: "fixed", label: "$" },
  ];

  const updateLineItem = useCallback((id: string, patch: Partial<ProductLineItem>) => {
    setLineItems((prev) => prev.map((lineItem) => (lineItem.id === id ? { ...lineItem, ...patch } : lineItem)));
  }, []);

  const calculateLineTotal = (item: ProductLineItem) => {
    const subtotal = item.quantity * item.unitPrice;

    // Sum all tax percentages
    const totalTaxRate = item.tax?.items?.reduce((sum, tax) => sum + tax.value, 0) || 0;

    // Calculate tax amount
    const tax = subtotal * (totalTaxRate / 100);
    const total = subtotal + tax;

    const taxItems =
      item.tax?.items.map((tax) => {
        const amount = (subtotal * tax.value) / 100;

        return {
          name: tax.name,
          rate: tax.value,
          amount,
        };
      }) ?? [];

    return { subtotal, tax, total, baseTotal: total * rate, taxItems };
  };

  const addLineItem = (product: ProductListItem) => {
    setLineItems((prev) => {
      const existingItem = prev.find((item) => item.id === product.id);
      if (existingItem) {
        return prev.map((item) => (item.id === product.id ? { ...item, quantity: item.quantity + 1 } : item));
      }

      return [
        ...prev,
        {
          id: product.id,
          productName: product.name,
          productImageUrl: product.imageUrl,
          quantity: 1,
          unitPrice: Number(product.costPrice || 0),
        },
      ];
    });
    setSearchValue("");
  };

  const removeLineItem = (productId: string) => {
    setLineItems((prev) => prev.filter((item) => item.id !== productId));
  };

  const handleTaxSelect = (tax: Tax | undefined) => {
    if (selectedTaxProductId) {
      updateLineItem(selectedTaxProductId, { tax: tax });
    } else {
      setSelectedTax(tax);
    }
    toggleTaxSelector();
  };

  const handleSubmit = async () => {
    const values = await form.validateFields().catch(() => null);
    if (!values) return;
    if (!lineItems.length) {
      message.error("Add at least one product to this purchase.");
      return;
    }

    const payload = {
      contactId: values.contactId,
      date: values.date.toISOString(),
      deliveryDate: values.deliveryDate?.toISOString(),
      locationId: values.location,
      currencyId: values.currencyId,
      rate: Number(values.rate || 1),
      paymentTerms: values.paymentTerm,
      dueDate: values.dueDate?.toISOString(),
      discountValue: discount.discountValue,
      discountType: discount.discountType,
      taxId: isDeferentProductTax ? undefined : selectedTax?.id,
      lineItems: lineItems.map((item) => ({
        productId: item.id,
        quantity: item.quantity,
        unitPrice: item.unitPrice,
        taxId: isDeferentProductTax ? item.tax?.id : undefined,
      })),
    };

    try {
      if (purchase) {
        await updatePurchase({ id: purchase.id, ...payload }).unwrap();
        message.success("Purchase updated.");
      } else {
        await createPurchase(payload).unwrap();
        message.success("Purchase created.");
      }
      onSaved?.();
      toggle();
    } catch (error) {
      message.error(getErrorMessage(error));
    }
  };

  const productColumns = useMemo(
    () => [
      {
        title: "Product",
        dataIndex: "productName",
        key: "productName",
        className: "!pl-8",
        width: isDeferentProductTax ? "50%" : "60%",
        render: (_: any, record: ProductLineItem) => (
          <div className="flex items-center gap-x-2">
            <div className=" ">
              <PreviewImage width={28} height={28} src={record.productImageUrl} />
            </div>
            <span className=" line-clamp-1">{record.productName}</span>
          </div>
        ),
      },
      {
        title: "Qty",
        dataIndex: "quantity",
        key: "quantity",
        width: "10%",
        render: (_: any, record: ProductLineItem) => <InputNumber variant="underlined" controls={false} min={1} value={record.quantity} onChange={(value) => updateLineItem(record.id, { quantity: Number(value || 1) })} />,
      },
      {
        title: "Cost",
        dataIndex: "unitPrice",
        key: "unitPrice",
        width: "10%",
        render: (_: any, record: ProductLineItem) => <InputNumber prefix="$" variant="underlined" controls={false} min={0} value={record.unitPrice} onChange={(value) => updateLineItem(record.id, { unitPrice: Number(value || 0) })} />,
      },

      ...(isDeferentProductTax
        ? [
            {
              title: "Tax",
              dataIndex: "tax",
              key: "tax",
              width: "10%",

              render: (_: any, record: ProductLineItem) => (
                <div
                  onClick={() => {
                    setSelectedTaxProductId(record.id);
                    toggleTaxSelector();
                  }}
                  className={`cursor-pointer ${record.tax ? "text-gray-800" : "text-blue-600 hover:underline"}`}
                >
                  {record?.tax ? (
                    <p>
                      {currency || "$"} {calculateLineTotal(record).tax.toLocaleString()}
                    </p>
                  ) : (
                    <p className=" text-blue-600   hover:block">Add Tax</p>
                  )}
                </div>
              ),
            },
          ]
        : []),
      {
        title: "Total ",
        dataIndex: "__total",
        key: "__total",
        align: "end",
        render: (_: any, record: ProductLineItem) => (
          <div>
            <p>
              {currency || "$"} {calculateLineTotal(record).total.toLocaleString()}
            </p>
          </div>
        ),
      },
      {
        title: "",
        dataIndex: "id",
        key: "id",
        align: "end",
        render: (id: string) => (
          <div className="pl-5 text-gray-500 cursor-pointer hover:text-red-400" onClick={() => removeLineItem(id)}>
            <Trash2 size={15} className="cursor-pointer" />
          </div>
        ),
      },
    ],
    [currency, rate, updateLineItem, isDeferentProductTax],
  );

  const summary = useMemo(() => {
    const lineTotals = lineItems.map(calculateLineTotal);

    const itemsSubTotal = lineTotals.reduce((sum, line) => sum + line.subtotal, 0);

    const globalDiscount = discount.discountType === "percent" ? (itemsSubTotal * discount.discountValue) / 100 : discount.discountValue;

    const subTotal = Math.max(itemsSubTotal - globalDiscount, 0);

    const taxItems = selectedTax
      ? selectedTax.items.map((tax) => ({
          name: `${tax.name} @${tax.value}%`,
          amount: (subTotal * tax.value) / 100,
        }))
      : lineTotals.flatMap((line) => line.taxItems);

    const taxSummary = Object.entries(
      taxItems.reduce<Record<string, number>>((acc, tax) => {
        acc[tax.name] = (acc[tax.name] ?? 0) + tax.amount;
        return acc;
      }, {}),
    ).map(([name, amount]) => ({ name, amount }));

    const tax = taxSummary.reduce((sum, item) => sum + item.amount, 0);

    const total = subTotal + tax;
    const baseTotal = total * rate;

    return {
      itemsSubTotal,
      globalDiscount,
      subTotal,
      tax,
      total,
      baseTotal,
      taxSummary,
    };
  }, [lineItems, discount, rate, selectedTax]);

  const searchProduct = (
    <div className="px-5 bg-gray-100">
      <div className="sticky inset-0 z-50 py-4">
        <Input prefix={<RiSearchLine />} placeholder="Search for product " className="rounded-full!" value={searchValue} onChange={({ target: { value } }) => setSearchValue(value)} />
      </div>
      <div className="shadow-xl bg-white">
        {searchValue &&
          (productsData?.data || []).map((item) => (
            <div key={item.id} className="cursor-pointer flex items-center justify-between border-t border-gray-200 px-5 py-2" onClick={() => addLineItem(item)}>
              <div className="flex gap-x-2 items-center">
                <PreviewImage width={28} height={28} src={item.imageUrl} />
                <div>
                  <p>{item.name}</p>
                  {item.sku !== "undefined" && <p className="text-gray-500">{item.sku}</p>}
                </div>
              </div>
            </div>
          ))}
      </div>
    </div>
  );

  return (
    <>
      <AppModal open={open} toggle={toggle} title={purchase ? "Edit Purchase" : "New Purchase"} onOk={handleSubmit} width={1000} loading={loading} okText={"Save"}>
        <Form form={form} disabled={cannotEdit || loading} layout="vertical" initialValues={{ date: dayjs(), dueDate: dayjs() }}>
          <div className="grid grid-cols-4 p-5 gap-x-5 pb-12">
            <Form.Item name="contactId" label="Contact" rules={[{ required: true, message: "Select contact" }]}>
              <SearchableContactSelect onAddContact={() => {}} />
            </Form.Item>
            <DatePickerFormItem label="Date" name="date" placeholder="date" className="" />
            <DatePickerFormItem label="Expected Delivery Date" name="deliveryDate" placeholder="Delivery Date" className="" />
            <Form.Item name="location" label="Location">
              <SearchableLocationSelect />
            </Form.Item>
            <Form.Item label="Currency" name="currencyId">
              <SearchableCurrenciesSelect />
            </Form.Item>
            <Form.Item label="Exchange Rate" className="w-full" name="rate">
              <InputNumber className="!w-full" prefix={"1 USD ="} defaultValue={1} placeholder="1" suffix={"GHS"} type="number" controls={false} />
            </Form.Item>
            <Form.Item name="paymentTerm" label="Payment Term">
              <Select options={paymentTerms} placeholder="Payment Term" />
            </Form.Item>
            <DatePickerFormItem label="Due Date" name="dueDate" placeholder="Due Date" className="" />
          </div>

          <AppTable columns={productColumns} dataSource={lineItems || []} rowKey={(record: ProductLineItem) => record.id} />
          {searchProduct}

          {lineItems.length > 0 && (
            <div className=" pb-4 px-5  w-full mt-8 grid grid-cols-3">
              <div></div>
              <div></div>
              <div className="text-right bg-gray-50 p-5 space-y-2">
                <div className="space-y-2">
                  <div className="flex justify-between gap-6">
                    <span>Items Total</span>
                    <span>
                      {currency} {summary.itemsSubTotal.toFixed(2)}
                    </span>
                  </div>

                  <div className="flex justify-between items-center gap-6">
                    <div className="relative inline-flex items-center gap">
                      <span className="inline-block mr-4">Discount </span>
                      <InputNumber min={0} controls={false} className="!w-[60px]" variant="underlined" value={discount.discountValue} onChange={(value) => setDiscount((current) => ({ ...current, discountValue: Number(value || 0) }))} />
                      <Dropdown menu={{ items, onClick: ({ key }) => setDiscount((current) => ({ ...current, discountType: key as PurchaseDiscountType })) }}>
                        <p className="cursor-pointer">{discount.discountType === "percent" ? "%" : "$"}</p>
                      </Dropdown>
                    </div>
                    <p>
                      {currency} {summary.globalDiscount.toFixed(2)}
                    </p>
                  </div>

                  <div className="flex  justify-between gap-6">
                    <span>Subtotal</span>
                    <span>
                      {currency} {summary.subTotal.toFixed(2)}
                    </span>
                  </div>

                  <div className="flex flex-col gap-2">
                    {!isDeferentProductTax && (
                      <div className="flex justify-between gap-6 ">
                        <span>Tax</span>
                        <span className="cursor-pointer text-blue-500 hover:underline" onClick={toggleTaxSelector}>
                          Add Tax
                        </span>
                      </div>
                    )}

                    {summary.taxSummary.map((tax) => (
                      <div key={tax.name} className="flex justify-between ">
                        <span>{tax.name}</span>

                        <span>
                          {currency} {tax.amount.toFixed(2)}
                        </span>
                      </div>
                    ))}
                  </div>
                  <div className="flex justify-between border-y py-2 border-gray-300 gap-6 font-medium">
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

      <TaxSelector handleTaxSelect={handleTaxSelect} isDeferentProductTax={isDeferentProductTax} toggleDeferentProductTax={toggleDeferentProductTax} open={openTaxSelector} toggle={() => (toggleTaxSelector(), setSelectedTaxProductId(undefined))} />
    </>
  );
}

export default PurchaseOrderFormModal;
