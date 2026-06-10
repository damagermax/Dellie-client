"use client";

import React from "react";
import { DatePicker, Form, Input, InputNumber, Segmented, Select, Table, message } from "antd";
import type { TableProps } from "antd/es/table";
import { AppModal } from "@/components/ui/AppModal";
import { SearchableContactSelect } from "@/components/contacts/SeachableContactSelect";
import { SearchablePaymentMethodSelect } from "@/components/paymentMethods/SearchablePaymentMethodSelect";
import { SearchablePaymentAccountSelect } from "@/components/paymentAccounts/SearchabalePaymentAccountSelect";
import { useAddPurchaseLandedCostMutation, useUpdatePurchaseLandedCostMutation } from "@/lib/redux/services";
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
  const [selectedLineItemIds, setSelectedLineItemIds] = React.useState<React.Key[]>([]);
  const [productSearch, setProductSearch] = React.useState("");
  const [selectionError, setSelectionError] = React.useState(false);
  const filteredLineItems = purchase.lineItems.filter((line) => line.productName.toLowerCase().includes(productSearch.trim().toLowerCase()));
  const productColumns: TableProps<PurchaseLineItem>["columns"] = [
    { title: "Product", dataIndex: "productName", key: "productName" },
    { title: "Qty", dataIndex: "quantity", key: "quantity", width: 72 },
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
        allocationMethod: initialValues.allocationMethod,
        appliesTo: initialValues.appliesTo || "ALL_ITEMS",
      });
      setSelectedLineItemIds((initialValues.lineItemIds || []).map(String));
      setProductSearch("");
      setSelectionError(false);
      return;
    }

    form.resetFields();
    form.setFieldsValue({ allocationMethod: "BUY_VALUE", appliesTo: "ALL_ITEMS", date: dayjs(purchase.date) });
    setSelectedLineItemIds([]);
    setProductSearch("");
    setSelectionError(false);
  }, [initialValues, open, form, purchase.date]);

  const submit = async () => {
    const values = await form.validateFields().catch(() => null);
    if (!values || !purchase.currencyId?.id) return;
    if (values.appliesTo === "SELECTED_ITEMS" && !selectedLineItemIds.length) {
      setSelectionError(true);
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
        accountId: values.accountId,
        ...(values.appliesTo === "SELECTED_ITEMS" ? { lineItemIds: selectedLineItemIds.map(String) } : {}),
        currencyId: purchase.currencyId.id,
        exchangeRate: Number(purchase.rate || 1),
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
      width={560}
      loading={isLoading || isUpdating}
      okText={initialValues ? "Save Changes" : "Add Cost"}
    >
      <Form form={form} layout="vertical" className="!px-5 py-4" initialValues={{ allocationMethod: "BUY_VALUE", appliesTo: "ALL_ITEMS" }}>
        <Form.Item name="name" label="Cost Name" rules={[{ required: true, message: "Enter a cost name" }]}>
          <Input placeholder="Freight, customs, handling" />
        </Form.Item>

        <div className="grid gap-4 md:grid-cols-2">
          <Form.Item name="contactId" label="Paid To Contact" rules={[{ required: true, message: "Select the contact paid for this landed cost" }]}>
            <SearchableContactSelect onAddContact={() => {}} />
          </Form.Item>
          <Form.Item name="date" label="Payment Date" rules={[{ required: true, message: "Select the payment date" }]}>
            <DatePicker className="!w-full" format="DD MMM YYYY" />
          </Form.Item>
          <Form.Item name="amount" label={`Amount (${purchase.currencyId?.code || ""})`} rules={[{ required: true, message: "Enter an amount" }]}>
            <InputNumber className="!w-full" min={0.01} controls={false} />
          </Form.Item>
          <Form.Item name="allocationMethod" label="Allocate Cost By" rules={[{ required: true }]}>
            <Select
              options={[
                { value: "BUY_VALUE", label: "Product value" },
                { value: "QUANTITY", label: "Quantity" },
              ]}
            />
          </Form.Item>
          <Form.Item name="paymentMethodId" label="Payment Method">
            <SearchablePaymentMethodSelect allowClear />
          </Form.Item>
          <Form.Item name="accountId" label="Paid From Account">
            <SearchablePaymentAccountSelect allowClear />
          </Form.Item>
        </div>

        <Form.Item name="note" label="Note">
          <Input.TextArea rows={3} placeholder="Add a note for this landed cost" />
        </Form.Item>

        <Form.Item name="appliesTo" label="Apply Cost To" rules={[{ required: true }]}>
          <Segmented
            block
            onChange={(value) => {
              if (value === "ALL_ITEMS") {
                setSelectedLineItemIds([]);
                setProductSearch("");
                setSelectionError(false);
              }
            }}
            options={[
              { value: "ALL_ITEMS", label: "All products" },
              { value: "SELECTED_ITEMS", label: "Selected products" },
            ]}
          />
        </Form.Item>

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
              pagination={{ pageSize: 5, size: "small", showSizeChanger: false }}
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
      </Form>
    </AppModal>
  );
}
