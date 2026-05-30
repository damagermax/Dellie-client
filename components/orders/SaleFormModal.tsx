"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { Dropdown, Form, Input, InputNumber, MenuProps, Select, message } from "antd";
import dayjs from "dayjs";
import { Trash2 } from "lucide-react";
import { RiSearchLine } from "react-icons/ri";
import { SearchableContactSelect } from "@/components/contacts/SeachableContactSelect";
import { SearchableLocationSelect } from "@/components/location/SearchableLocationSelect";
import { TaxSelector } from "@/components/settings/TaxSelector";
import { SearchableCurrenciesSelect } from "@/components/system/SearchableCurrencySelect";
import { AppModal, ModalProps } from "@/components/ui/AppModal";
import { DatePickerFormItem } from "@/components/ui/AppFormItems";
import AppTable from "@/components/ui/AppTable";
import PreviewImage from "@/components/ui/PreviewImage";
import useToggle from "@/hooks/UseToggle";
import { useCreateSaleMutation, useGetProductsQuery, useGetTaxesQuery, useUpdateSaleMutation } from "@/lib/redux/services";
import { ProductListItem, PurchaseDiscountType, Sale, Tax } from "@/types/index";
import { saleApiError } from "./saleUtils";

interface SaleFormModalProps extends ModalProps {
  sale?: Sale;
  onSaved?: () => void;
}

interface SaleFormLineItem {
  id: string;
  productImageUrl?: string;
  productName: string;
  productSku?: string;
  quantity: number;
  unitPrice: number;
  tax?: Tax;
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

export default function SaleFormModal({ open, toggle, sale, onSaved }: SaleFormModalProps) {
  const [form] = Form.useForm();
  const [lineItems, setLineItems] = useState<SaleFormLineItem[]>([]);
  const [selectedTax, setSelectedTax] = useState<Tax>();
  const [selectedTaxProductId, setSelectedTaxProductId] = useState<string>();
  const [searchValue, setSearchValue] = useState("");
  const [differentProductTax, setDifferentProductTax] = useState(false);
  const [openTaxSelector, toggleTaxSelector] = useToggle();
  const [discount, setDiscount] = useState<{ discountValue: number; discountType: PurchaseDiscountType }>({ discountValue: 0, discountType: "percent" });
  const [createSale, { isLoading: creating }] = useCreateSaleMutation();
  const [updateSale, { isLoading: updating }] = useUpdateSaleMutation();
  const { data: productsData } = useGetProductsQuery({ search: searchValue, limit: 20 });
  const { data: taxes } = useGetTaxesQuery();
  const rate = Form.useWatch("rate", form) || 1;
  const currency = "";
  const loading = creating || updating;

  useEffect(() => {
    if (!open) return;
    const storeCurrencyId = typeof window !== "undefined" ? JSON.parse(localStorage.getItem("user") || "{}")?.store?.currencyId : undefined;
    if (!sale) {
      form.resetFields();
      form.setFieldsValue({ date: dayjs(), dueDate: dayjs(), currencyId: storeCurrencyId, rate: 1 });
      setLineItems([]);
      setDiscount({ discountValue: 0, discountType: "percent" });
      setSelectedTax(undefined);
      setDifferentProductTax(false);
      return;
    }

    form.setFieldsValue({
      contactId: sale.contactId?.id,
      date: dayjs(sale.date),
      deliveryDate: sale.deliveryDate ? dayjs(sale.deliveryDate) : undefined,
      location: sale.locationId?.id,
      currencyId: sale.currencyId?.id,
      rate: sale.rate || 1,
      paymentTerm: sale.paymentTerms,
      dueDate: sale.dueDate ? dayjs(sale.dueDate) : undefined,
    });
    setDiscount({ discountValue: Number(sale.discountValue || 0), discountType: sale.discountType || "fixed" });
    setLineItems(
      sale.lineItems.map((item) => ({
        id: typeof item.productId === "string" ? item.productId : item.productId.id,
        productName: item.productName,
        productSku: item.productSku || (typeof item.productId === "string" ? undefined : item.productId.sku),
        productImageUrl:
          item.productUrl ||
          (typeof item.productId === "string" ? undefined : item.productId.media?.[0]?.url),
        quantity: item.quantity,
        unitPrice: item.unitPrice,
      })),
    );
  }, [form, open, sale]);

  useEffect(() => {
    if (!open || !sale || !taxes) return;
    const documentTax = taxes.find((tax) => tax.id === sale.taxId);
    const hasLineTax = sale.lineItems.some((line) => Boolean(line.taxId));
    setSelectedTax(documentTax);
    setDifferentProductTax(!documentTax && hasLineTax);
    setLineItems((current) =>
      current.map((item) => ({
        ...item,
        tax: documentTax
          ? undefined
          : taxes.find(
              (tax) =>
                tax.id ===
                sale.lineItems.find((line) => (typeof line.productId === "string" ? line.productId : line.productId.id) === item.id)?.taxId,
            ),
      })),
    );
  }, [open, sale, taxes]);

  useEffect(() => {
    if (differentProductTax) setSelectedTax(undefined);
    else setLineItems((current) => current.map((item) => ({ ...item, tax: undefined })));
  }, [differentProductTax]);

  const availableProducts = useMemo(() => productsData?.data || [], [productsData]);
  const discountOptions: MenuProps["items"] = [
    { key: "percent", label: "%" },
    { key: "fixed", label: "$" },
  ];
  const updateLineItem = useCallback((id: string, patch: Partial<SaleFormLineItem>) => {
    setLineItems((current) => current.map((item) => (item.id === id ? { ...item, ...patch } : item)));
  }, []);
  const lineTotal = (item: SaleFormLineItem) => {
    const subtotal = item.quantity * item.unitPrice;
    const taxItems =
      item.tax?.items.map((tax) => ({
        name: tax.name,
        amount: (subtotal * tax.value) / 100,
      })) || [];
    return { subtotal, tax: taxItems.reduce((sum, itemTax) => sum + itemTax.amount, 0), taxItems };
  };
  const addProduct = (product: ProductListItem) => {
    setLineItems((current) => {
      const existing = current.find((item) => item.id === product.id);
      if (existing) return current.map((item) => (item.id === product.id ? { ...item, quantity: item.quantity + 1 } : item));
      return [...current, { id: product.id, productName: product.name, productSku: product.sku, productImageUrl: product.imageUrl, quantity: 1, unitPrice: Number(product.sellingPrice || 0) }];
    });
    setSearchValue("");
  };
  const summary = useMemo(() => {
    const itemsTotal = lineItems.reduce((sum, item) => sum + lineTotal(item).subtotal, 0);
    const discountAmount = discount.discountType === "percent" ? (itemsTotal * discount.discountValue) / 100 : discount.discountValue;
    const subtotal = Math.max(itemsTotal - discountAmount, 0);
    const taxItems = selectedTax
      ? selectedTax.items.map((tax) => ({ name: `${tax.name} @${tax.value}%`, amount: (subtotal * tax.value) / 100 }))
      : lineItems.flatMap((item) => lineTotal(item).taxItems);
    const taxSummary = Object.entries(
      taxItems.reduce<Record<string, number>>((amounts, tax) => {
        amounts[tax.name] = (amounts[tax.name] || 0) + tax.amount;
        return amounts;
      }, {}),
    ).map(([name, amount]) => ({ name, amount }));
    const taxAmount = taxSummary.reduce((sum, tax) => sum + tax.amount, 0);
    return { itemsTotal, discountAmount, subtotal, taxSummary, total: subtotal + taxAmount, baseTotal: (subtotal + taxAmount) * rate };
  }, [discount, lineItems, rate, selectedTax]);

  const submit = async () => {
    const values = await form.validateFields().catch(() => null);
    if (!values) return;
    if (!lineItems.length) {
      message.error("Add at least one product to this sale.");
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
      taxId: differentProductTax ? undefined : selectedTax?.id,
      lineItems: lineItems.map((item) => ({
        productId: item.id,
        quantity: item.quantity,
        unitPrice: item.unitPrice,
        taxId: differentProductTax ? item.tax?.id : undefined,
      })),
    };

    try {
      if (sale) await updateSale({ id: sale.id, ...payload }).unwrap();
      else await createSale(payload).unwrap();
      message.success(sale ? "Sale updated." : "Sale created.");
      onSaved?.();
      toggle();
    } catch (error) {
      message.error(saleApiError(error, "The sale could not be saved. Please check stock and try again."));
    }
  };
  const columns = [
    {
      title: "Product",
      dataIndex: "productName",
      key: "productName",
      className: "!pl-8",
      width: differentProductTax ? "50%" : "60%",
      render: (_: string, item: SaleFormLineItem) => (
        <div className="flex items-center gap-x-2">
          <PreviewImage width={28} height={28} src={item.productImageUrl} />
          <div className="min-w-0">
            <p className="line-clamp-1">{item.productName}</p>
            {item.productSku && <p className="text-xs text-gray-500">SKU: {item.productSku}</p>}
          </div>
        </div>
      ),
    },
    { title: "Qty", key: "quantity", width: "10%", render: (_: unknown, item: SaleFormLineItem) => <InputNumber variant="underlined" controls={false} min={0.000001} value={item.quantity} onChange={(value) => updateLineItem(item.id, { quantity: Number(value || 1) })} /> },
    { title: "Price", key: "price", width: "10%", render: (_: unknown, item: SaleFormLineItem) => <InputNumber prefix="$" variant="underlined" controls={false} min={0} value={item.unitPrice} onChange={(value) => updateLineItem(item.id, { unitPrice: Number(value || 0) })} /> },
    ...(differentProductTax
      ? [
          {
            title: "Tax",
            key: "tax",
            render: (_: unknown, item: SaleFormLineItem) => (
              <button type="button" className="text-blue-600" onClick={() => (setSelectedTaxProductId(item.id), toggleTaxSelector())}>
                {item.tax ? `${currency} ${lineTotal(item).tax.toFixed(2)}` : "Add Tax"}
              </button>
            ),
          },
        ]
      : []),
    { title: "Total", key: "total", render: (_: unknown, item: SaleFormLineItem) => `${currency} ${(lineTotal(item).subtotal + lineTotal(item).tax).toFixed(2)}` },
    { title: "", key: "remove", className: "!pr-8", render: (_: unknown, item: SaleFormLineItem) => <Trash2 size={15} className="cursor-pointer text-gray-500 hover:text-red-500" onClick={() => setLineItems((current) => current.filter((line) => line.id !== item.id))} /> },
  ];

  return (
    <>
      <AppModal open={open} toggle={toggle} title={sale ? "Edit Sale" : "New Sale"} onOk={submit} width={1000} loading={loading} okText="Save">
        <Form form={form} disabled={loading || Boolean(sale?.locked || sale?.receiptStatus === "received" || sale?.returnedItems?.length)} layout="vertical" initialValues={{ date: dayjs(), dueDate: dayjs() }}>
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

          <AppTable columns={columns} dataSource={lineItems || []} rowKey="id" />
          <div className="px-5 bg-gray-100">
            <div className="sticky inset-0 z-50 py-4">
              <Input prefix={<RiSearchLine />} placeholder="Search for product " className="rounded-full!" value={searchValue} onChange={(event) => setSearchValue(event.target.value)} />
            </div>
            {searchValue && (
              <div className="shadow-xl bg-white">
                {availableProducts.map((product) => (
                  <div key={product.id} className="cursor-pointer flex items-center justify-between border-t border-gray-200 px-5 py-2" onClick={() => addProduct(product)}>
                    <div className="flex gap-x-2 items-center">
                      <PreviewImage width={28} height={28} src={product.imageUrl} />
                      <div>
                        <p>{product.name}</p>
                        {product.sku !== "undefined" && <p className="text-gray-500">{product.sku}</p>}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {lineItems.length > 0 && (
            <div className="mt-8 grid w-full grid-cols-3 px-5 pb-4">
              <div />
              <div />
              <div className="space-y-2 bg-gray-50 p-5 text-right">
                <SummaryLine label="Items Total" value={`${currency} ${summary.itemsTotal.toFixed(2)}`} />
                <div className="flex items-center justify-between gap-6">
                  <div className="inline-flex items-center">
                    <span className="mr-4">Discount</span>
                    <InputNumber min={0} controls={false} className="!w-[60px]" variant="underlined" value={discount.discountValue} onChange={(value) => setDiscount((current) => ({ ...current, discountValue: Number(value || 0) }))} />
                    <Dropdown menu={{ items: discountOptions, onClick: ({ key }) => setDiscount((current) => ({ ...current, discountType: key as PurchaseDiscountType })) }}>
                      <p className="cursor-pointer">{discount.discountType === "percent" ? "%" : "$"}</p>
                    </Dropdown>
                  </div>
                  <p>{currency} {summary.discountAmount.toFixed(2)}</p>
                </div>
                <SummaryLine label="Subtotal" value={`${currency} ${summary.subtotal.toFixed(2)}`} />
                {!differentProductTax && (
                  <div className="flex justify-between">
                    <span>Tax</span>
                    <button type="button" className="text-blue-500 hover:underline" onClick={toggleTaxSelector}>Add Tax</button>
                  </div>
                )}
                {summary.taxSummary.map((tax) => <SummaryLine key={tax.name} label={tax.name} value={`${currency} ${tax.amount.toFixed(2)}`} />)}
                <div className="flex justify-between border-y border-gray-300 py-2 font-medium">
                  <span>Total</span>
                  <span>{currency} {summary.total.toFixed(2)}</span>
                </div>
                {rate !== 1 && <SummaryLine label="Base Total" value={summary.baseTotal.toFixed(2)} />}
              </div>
            </div>
          )}
        </Form>
      </AppModal>
      <TaxSelector
        handleTaxSelect={(tax) => {
          if (selectedTaxProductId) setLineItems((current) => current.map((line) => (line.id === selectedTaxProductId ? { ...line, tax } : line)));
          else setSelectedTax(tax);
          setSelectedTaxProductId(undefined);
          toggleTaxSelector();
        }}
        isDeferentProductTax={differentProductTax}
        toggleDeferentProductTax={() => setDifferentProductTax((current) => !current)}
        open={openTaxSelector}
        toggle={() => (toggleTaxSelector(), setSelectedTaxProductId(undefined))}
      />
    </>
  );
}

function SummaryLine({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex justify-between gap-6">
      <span>{label}</span>
      <span>{value}</span>
    </div>
  );
}
