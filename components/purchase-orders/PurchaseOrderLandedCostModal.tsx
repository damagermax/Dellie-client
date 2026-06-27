"use client";

import React from "react";
import { Alert, DatePicker, Form, Input, InputNumber, Select, Table, message } from "antd";
import type { TableProps } from "antd/es/table";
import { AppModal } from "@/components/ui/AppModal";
import { SearchableContactSelect } from "@/components/contacts/SeachableContactSelect";
import { SearchablePaymentMethodSelect } from "@/components/paymentMethods/SearchablePaymentMethodSelect";
import { SearchableCurrenciesSelect } from "@/components/system/SearchableCurrencySelect";
import { ExchangeRateFormItem } from "@/components/system/ExchangeRateFormItem";
import { useAddPurchaseLandedCostMutation, useUpdatePurchaseLandedCostMutation } from "@/lib/redux/services";
import { useGetCurrencyQuery } from "@/lib/redux/services";
import { Purchase, PurchaseLandedCost, PurchaseLandedCostAllocation, PurchaseLandedCostScope, PurchaseLineItem } from "@/types/index";
import { purchaseApiError } from "./purchaseDetailUtils";
import dayjs from "dayjs";

interface PurchaseOrderLandedCostModalProps {
  open: boolean;
  toggle: () => void;
  purchase: Purchase;
  onSaved: () => void;
  initialValues?: PurchaseLandedCost;
}

export default function PurchaseOrderLandedCostModal({ open, toggle, purchase, onSaved, initialValues }: PurchaseOrderLandedCostModalProps) {
  const [form] = Form.useForm();
  const [addLandedCost, { isLoading }] = useAddPurchaseLandedCostMutation();
  const [updateLandedCost, { isLoading: isUpdating }] = useUpdatePurchaseLandedCostMutation();
  const appliesTo = Form.useWatch("appliesTo", form) as PurchaseLandedCostScope | undefined;
  const allocationMethod = Form.useWatch("allocationMethod", form) as PurchaseLandedCostAllocation | undefined;
  const selectedCurrencyId = Form.useWatch("currencyId", form) as string | undefined;
  const [selectedLineItemIds, setSelectedLineItemIds] = React.useState<React.Key[]>([]);
  const [productSearch, setProductSearch] = React.useState("");
  const [selectionError, setSelectionError] = React.useState(false);
  const storeCurrencyId = typeof window !== "undefined" ? JSON.parse(localStorage.getItem("user") || "{}")?.store?.currencyId : undefined;
  const { data: selectedCurrency } = useGetCurrencyQuery(selectedCurrencyId as string, { skip: !selectedCurrencyId });
  const filteredLineItems = purchase.lineItems.filter((line) => line.productName.toLowerCase().includes(productSearch.trim().toLowerCase()));
  const allocationLines = appliesTo === "SELECTED_ITEMS" ? purchase.lineItems.filter((line) => selectedLineItemIds.map(String).includes(line.id)) : purchase.lineItems;
  const hasInvalidWeight = allocationMethod === "WEIGHT" && allocationLines.some((line) => Number(line.weight || 0) <= 0);
  const amountCurrencyCode = selectedCurrency?.code || initialValues?.currencyCode || purchase.currencyId?.code || "";
  const updateLineWeight = (lineId: string, weight: number) => {
    purchase.lineItems = purchase.lineItems.map((line) => (line.id === lineId ? { ...line, weight } : line));
  };
  const productColumns: TableProps<PurchaseLineItem>["columns"] = [
    { title: "Product", dataIndex: "productName", key: "productName" },
    { title: "Qty", dataIndex: "quantity", key: "quantity", width: 72 },
    {
      title: "Weight",
      key: "weight",
      width: 120,
      render: (_, line) => <InputNumber className="!w-full" controls={false} min={0} suffix="kg" value={Number(line.weight || 0)} onChange={(value) => updateLineWeight(line.id, Number(value || 0))} />,
    },
    { title: "Value", key: "total", width: 115, render: (_, line) => `${purchase.currencyId?.code || ""} ${Number(line.total).toFixed(2)}` },
  ];

  React.useEffect(() => {
    if (!open) return;

    if (initialValues) {
      form.setFieldsValue({
        name: initialValues.name,
        contactId: initialValues.contactId,
        date: initialValues.date ? dayjs(initialValues.date) : dayjs(purchase.date),
        note: initialValues.note,
        amount: initialValues.amount,
        currencyId: typeof initialValues.currencyId === "string" ? initialValues.currencyId : initialValues.currencyId?.id,
        exchangeRate: Number(initialValues.exchangeRate || 1),
        allocationMethod: initialValues.allocationMethod,
        appliesTo: initialValues.appliesTo || "ALL_ITEMS",
      });
      setSelectedLineItemIds((initialValues.lineItemIds || []).map(String));
      setProductSearch("");
      setSelectionError(false);
      return;
    }

    form.resetFields();
    form.setFieldsValue({
      allocationMethod: "BUY_VALUE",
      appliesTo: "ALL_ITEMS",
      date: dayjs(purchase.date),
      currencyId: storeCurrencyId,
      exchangeRate: 1,
    });
    setSelectedLineItemIds([]);
    setProductSearch("");
    setSelectionError(false);
  }, [initialValues, open, form, purchase.date, storeCurrencyId]);

  const submit = async () => {
    const values = await form.validateFields().catch(() => null);
    if (!values) return;
    if (values.appliesTo === "SELECTED_ITEMS" && !selectedLineItemIds.length) {
      setSelectionError(true);
      return;
    }
    if (values.allocationMethod === "WEIGHT" && hasInvalidWeight) {
      message.error("Every product selected for weight allocation must have a weight greater than 0.");
      return;
    }

    try {
      const payload = {
        id: purchase.id,
        name: values.name,
        date: values.date.format("YYYY-MM-DD"),
        amount: Number(values.amount),
        allocationMethod: values.allocationMethod as PurchaseLandedCostAllocation,
        appliesTo: values.appliesTo as PurchaseLandedCostScope,
        contactId: values.contactId,
        note: values.note,
        paymentMethodId: values.paymentMethodId,
        ...(values.appliesTo === "SELECTED_ITEMS" ? { lineItemIds: selectedLineItemIds.map(String) } : {}),
        currencyId: values.currencyId,
        exchangeRate: Number(values.exchangeRate),
      };

      if (initialValues) {
        await updateLandedCost({ ...payload, landedCostId: initialValues.id }).unwrap();
        message.success("Landed cost updated.");
      } else {
        await addLandedCost(payload).unwrap();
        message.success("Landed cost added.");
      }
      onSaved();
      toggle();
    } catch (error) {
      message.error(purchaseApiError(error, initialValues ? "Landed cost could not be updated." : "Landed cost could not be added."));
    }
  };

  return (
    <AppModal
      open={open}
      toggle={toggle}
      title={initialValues ? "Edit Landed Cost" : "Add Landed Cost"}
      onOk={submit}
      width={760}
      loading={isLoading || isUpdating}
      okText={initialValues ? "Save Changes" : "Add Cost"}
    >
      <Form form={form} layout="vertical" className="!px-5 py-4" initialValues={{ allocationMethod: "BUY_VALUE", appliesTo: "ALL_ITEMS" }}>
        <Form.Item className="!mb-3" name="name" label="Cost Name" rules={[{ required: true, message: "Enter a cost name" }]}>
          <Input placeholder="Freight, customs, handling" />
        </Form.Item>

        <div className="grid gap-4 md:grid-cols-2">
          <Form.Item className="!mb-3" name="contactId" label="Contact" rules={[{ required: true, message: "Select the contact paid for this landed cost" }]}>
            <SearchableContactSelect onAddContact={() => {}} />
          </Form.Item>
          <Form.Item className="!mb-3" name="date" label="Payment Date" rules={[{ required: true, message: "Select the payment date" }]}>
            <DatePicker className="!w-full" format="DD MMM YYYY" />
          </Form.Item>
          <Form.Item className="!mb-3" name="currencyId" label="Currency" rules={[{ required: true, message: "Select a currency" }]}>
            <SearchableCurrenciesSelect />
          </Form.Item>
          <ExchangeRateFormItem
            name="exchangeRate"
            className="!mb-3"
            rules={[
              { required: true, message: "Enter an exchange rate" },
              { type: "number", min: 0.000001, message: "Exchange rate must be greater than 0" },
            ]}
          />
          <Form.Item className="!mb-3" name="amount" label={`Amount (${amountCurrencyCode})`} rules={[{ required: true, message: "Enter an amount" }]}>
            <InputNumber className="!w-full" min={0.01} controls={false} />
          </Form.Item>
          <Form.Item className="!mb-3" name="allocationMethod" label="Allocate Cost By" rules={[{ required: true }]}>
            <Select
              options={[
                { value: "BUY_VALUE", label: "Product value" },
                { value: "QUANTITY", label: "Quantity" },
                { value: "WEIGHT", label: "Weight" },
              ]}
            />
          </Form.Item>
          <Form.Item className="!mb-3" name="paymentMethodId" label="Payment Method">
            <SearchablePaymentMethodSelect allowClear />
          </Form.Item>
          <Form.Item className="!mb-3" name="appliesTo" label="Apply Cost To" rules={[{ required: true }]}>
            <Select
              options={[
                { value: "ALL_ITEMS", label: "All products" },
                { value: "SELECTED_ITEMS", label: "Selected products" },
              ]}
              onChange={(value) => {
                if (value === "ALL_ITEMS") {
                  setSelectedLineItemIds([]);
                  setProductSearch("");
                  setSelectionError(false);
                }
              }}
            />
          </Form.Item>
        </div>

        {appliesTo === "SELECTED_ITEMS" && (
          <div>
            <div className="mb-2 flex items-center justify-between">
              <p className="text-sm text-gray-700">Products</p>
              <p className="text-xs text-gray-500">{selectedLineItemIds.length} selected</p>
            </div>
            <Input.Search allowClear className="mb-3" placeholder="Search purchase products" value={productSearch} onChange={(event) => setProductSearch(event.target.value)} />
            <Table<PurchaseLineItem>
              columns={productColumns}
              dataSource={filteredLineItems}
              rowKey="id"
              size="small"
              locale={{ emptyText: "No matching products" }}
              pagination={false}
              rowSelection={{
                selectedRowKeys: selectedLineItemIds,
                preserveSelectedRowKeys: true,
                onChange: (keys) => {
                  setSelectedLineItemIds(keys);
                  setSelectionError(false);
                },
              }}
            />
            {selectionError && <p className="mt-2 text-xs text-red-600">Select at least one product.</p>}
          </div>
        )}
        {allocationMethod === "WEIGHT" && hasInvalidWeight && (
          <Alert
            className="mt-3"
            type="warning"
            showIcon
            message="Weight required"
            description="Every product included in this landed cost must have a weight greater than 0 before you can allocate by weight."
          />
        )}
      </Form>
    </AppModal>
  );
}
