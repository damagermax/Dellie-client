"use client";

import { Button, DatePicker, Form, Input, InputNumber, Select, message } from "antd";
import dayjs from "dayjs";
import { useEffect, useMemo, useState } from "react";
import { useSelector } from "react-redux";

import { AppModal } from "@/components/ui/AppModal";
import { BatchContextCard } from "@/components/products/product-detail/shared";
import { ITEM_TYPE } from "@/components/products/ProductFormModal";
import { useAdjustBatchMutation, useDisassembleBatchByBatchIdMutation, useGetLocationsQuery, useRestockProductMutation, useTransferBatchByBatchIdMutation } from "@/lib/redux/services";
import { RootState } from "@/lib/store";
import { getProductTypeLabel, hasBundleComponents } from "@/lib/products/type-label";

import type { AdjustBatchInput, DisassembleBatchInput, Location, RestockProductInput, TransferBatchInput } from "../../../types";
import type { InventoryBatch, ProductDetail } from "./types";
import { formatQuantity, getMutationErrorMessage, isFormValidationError } from "./utils";

type RestockProductFormValues = Omit<RestockProductInput, "productId" | "receivedDate" | "expiryDate"> & {
  receivedDate: dayjs.Dayjs;
  expiryDate?: dayjs.Dayjs;
};

type AdjustBatchFormValues = Omit<AdjustBatchInput, "id" | "effectiveDate"> & {
  effectiveDate: dayjs.Dayjs;
};

type TransferBatchFormValues = Omit<TransferBatchInput, "id" | "effectiveDate"> & {
  effectiveDate: dayjs.Dayjs;
};

type DisassembleBatchFormValues = Omit<DisassembleBatchInput, "id" | "effectiveDate"> & {
  effectiveDate?: dayjs.Dayjs;
};

export function RestockProductModal({ open, toggle, product, onSaved }: { open: boolean; toggle: () => void; product: ProductDetail; onSaved: () => void }) {
  const [form] = Form.useForm<RestockProductFormValues>();
  const [restockProduct, { isLoading }] = useRestockProductMutation();
  const [submitError, setSubmitError] = useState<string | null>(null);
  const { data: locations = [], isLoading: locationsLoading } = useGetLocationsQuery({}, { skip: !open });
  const isAssemblyRestock = product.type === ITEM_TYPE.STOCK && hasBundleComponents(product);
  const expiryEnabled = useSelector((state: RootState) => state.currentUser.storeSettings.features?.expiryEnabled !== false);

  const locationOptions = locations
    .filter((location: Location) => location.status === "active")
    .map((location: Location) => ({
      label: location.name,
      value: location.id,
    }));

  useEffect(() => {
    if (!open) return;
    form.setFieldsValue({
      locationId: undefined,
      quantity: undefined,
      unitCost: product.costPrice,
      receivedDate: dayjs(),
      expiryDate: undefined,
    });
    setSubmitError(null);
  }, [form, open, product.costPrice]);

  const handleSubmit = async () => {
    try {
      setSubmitError(null);
      const values = await form.validateFields();
      await restockProduct({
        productId: product.id,
        locationId: values.locationId,
        quantity: values.quantity,
        unitCost: Number(values.unitCost || 0),
        receivedDate: values.receivedDate.toISOString(),
        expiryDate: expiryEnabled ? values.expiryDate?.toISOString() : undefined,
      }).unwrap();
      message.success(isAssemblyRestock ? "Bundle assembled." : "Product restocked.");
      toggle();
      onSaved();
    } catch (error) {
      if (isFormValidationError(error)) return;
      setSubmitError(getMutationErrorMessage(error, "Product could not be restocked."));
    }
  };

  return (
    <AppModal
      open={open}
      toggle={toggle}
      title={<p className="line-clamp-1 pr-5">{isAssemblyRestock ? "Assemble" : "Restock"} {product.name}`</p>}
      onOk={handleSubmit}
      loading={isLoading}
      okText={isAssemblyRestock ? "Assemble" : "Restock"}
      width={560}
      height="auto"
      footer={
        <div className="flex justify-end gap-2">
          <Button onClick={toggle} disabled={isLoading}>
            Cancel
          </Button>
          <Button type="primary" onClick={handleSubmit} loading={isLoading}>
            {isAssemblyRestock ? "Assemble" : "Restock"}
          </Button>
        </div>
      }
    >
      <Form form={form} layout="vertical">
        <BatchContextCard
          items={[
            { label: "SKU", value: product.sku || "-" },
            { label: "Type", value: getProductTypeLabel(product) },
          ]}
        />

        <div className="px-5">
          {submitError && <p className="mb-4 text-sm text-red-600">{submitError}</p>}
          {isAssemblyRestock ? <div className="mb-4 rounded-sm border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-900">This stock bundle will be assembled from its component inventory at the selected location.</div> : null}
          <Form.Item label="Location" name="locationId" rules={[{ required: true, message: "Select a location" }]}>
            <Select placeholder="Select location" loading={locationsLoading} options={locationOptions} />
          </Form.Item>

          <div className="grid gap-x-5 md:grid-cols-2">
            <Form.Item
              label="Quantity"
              name="quantity"
              rules={[
                { required: true, message: "Enter quantity" },
                {
                  validator: (_, value) => {
                    if (value === undefined || value === null) return Promise.resolve();
                    if (Number(value) <= 0) return Promise.reject(new Error("Quantity must be greater than zero"));
                    return Promise.resolve();
                  },
                },
              ]}
            >
              <InputNumber className="!w-full" min={0.000001} />
            </Form.Item>
            <Form.Item
              label="Unit cost"
              name="unitCost"
              rules={
                isAssemblyRestock
                  ? undefined
                  : [
                      { required: true, message: "Enter unit cost" },
                      {
                        validator: (_, value) => {
                          if (value === undefined || value === null) return Promise.resolve();
                          if (Number(value) < 0) return Promise.reject(new Error("Unit cost cannot be negative"));
                          return Promise.resolve();
                        },
                      },
                    ]
              }
            >
              <InputNumber className="!w-full" min={0} disabled={isAssemblyRestock} />
            </Form.Item>
            <Form.Item label="Received date" name="receivedDate" rules={[{ required: true, message: "Select received date" }]}>
              <DatePicker className="!w-full" />
            </Form.Item>
            {expiryEnabled ? (
              <Form.Item label="Expiry date" name="expiryDate">
                <DatePicker className="!w-full" />
              </Form.Item>
            ) : null}
          </div>
        </div>
      </Form>
    </AppModal>
  );
}

export function BatchAdjustmentModal({ batch, open, toggle, onSaved }: { batch: InventoryBatch; open: boolean; toggle: () => void; onSaved: () => void }) {
  const [form] = Form.useForm<AdjustBatchFormValues>();
  const [adjustBatch, { isLoading }] = useAdjustBatchMutation();
  const [submitError, setSubmitError] = useState<string | null>(null);

  useEffect(() => {
    if (!open) return;
    form.setFieldsValue({
      quantityDelta: undefined,
      effectiveDate: dayjs(),
      reason: "",
    });
    setSubmitError(null);
  }, [form, open, batch.id]);

  const handleSubmit = async () => {
    try {
      setSubmitError(null);
      const values = await form.validateFields();
      await adjustBatch({
        id: batch.id || "",
        quantityDelta: values.quantityDelta,
        reason: values.reason?.trim() || undefined,
        effectiveDate: values.effectiveDate?.toISOString(),
      }).unwrap();
      message.success("Batch adjusted.");
      toggle();
      onSaved();
    } catch (error) {
      if (isFormValidationError(error)) return;
      setSubmitError(getMutationErrorMessage(error, "Batch could not be adjusted."));
    }
  };

  return (
    <AppModal
      open={open}
      toggle={toggle}
      title={`Adjust ${batch.batchNumber || "batch"}`}
      onOk={handleSubmit}
      loading={isLoading}
      okText="Save adjustment"
      width={560}
      height="auto"
      footer={
        <div className="grid grid-cols-2 gap-2 pb-2">
          <Button onClick={toggle} disabled={isLoading}>
            Cancel
          </Button>
          <Button type="primary" className="!border-none !shadow-none" onClick={handleSubmit} loading={isLoading}>
            Save adjustment
          </Button>
        </div>
      }
    >
      <Form form={form} layout="vertical">
        <BatchContextCard
          items={[
            { label: "Location", value: batch.locationName || "-" },
            { label: "Remaining", value: formatQuantity(batch.remainingQuantity) },
          ]}
        />
        {submitError && <p className="mb-4 px-5 text-sm text-red-600">{submitError}</p>}

        <div className="px-5">
          <div className="grid gap-x-5 md:grid-cols-2">
            <Form.Item
              label="Quantity delta (-/+)"
              name="quantityDelta"
              rules={[
                { required: true, message: "Enter the quantity change" },
                {
                  validator: (_, value) => {
                    if (value === undefined || value === null) return Promise.resolve();
                    if (Number(value) === 0) return Promise.reject(new Error("Quantity delta cannot be zero"));
                    return Promise.resolve();
                  },
                },
              ]}
            >
              <InputNumber className="!w-full" placeholder="Use -5 / 5 to change stock." />
            </Form.Item>
            <Form.Item label="Effective date" name="effectiveDate" rules={[{ required: true, message: "Select the effective date" }]}>
              <DatePicker className="!w-full" />
            </Form.Item>
          </div>

          <Form.Item label="Reason" name="reason" rules={[{ required: true, message: "Reason for this adjustment " }]}>
            <Input.TextArea rows={3} placeholder="Optional note for this adjustment" />
          </Form.Item>
        </div>
      </Form>
    </AppModal>
  );
}

export function BatchTransferModal({ batch, open, toggle, onSaved }: { batch: InventoryBatch; open: boolean; toggle: () => void; onSaved: () => void }) {
  const [form] = Form.useForm<TransferBatchFormValues>();
  const [transferBatch, { isLoading }] = useTransferBatchByBatchIdMutation();
  const [submitError, setSubmitError] = useState<string | null>(null);
  const { data: locations = [], isLoading: locationsLoading } = useGetLocationsQuery({}, { skip: !open });

  const locationOptions = useMemo(
    () =>
      locations
        .filter((location: Location) => location.status === "active" && location.id !== batch.locationId)
        .map((location: Location) => ({
          label: location.name,
          value: location.id,
        })),
    [batch.locationId, locations],
  );

  useEffect(() => {
    if (!open) return;
    form.setFieldsValue({
      toLocationId: undefined,
      quantity: undefined,
      effectiveDate: dayjs(),
      reason: "",
    });
    setSubmitError(null);
  }, [form, open, batch.id]);

  const handleSubmit = async () => {
    try {
      setSubmitError(null);
      const values = await form.validateFields();
      await transferBatch({
        id: batch.id || "",
        toLocationId: values.toLocationId,
        quantity: values.quantity,
        reason: values.reason?.trim() || undefined,
        effectiveDate: values.effectiveDate?.toISOString(),
      }).unwrap();
      message.success("Batch transferred.");
      toggle();
      onSaved();
    } catch (error) {
      if (isFormValidationError(error)) return;
      setSubmitError(getMutationErrorMessage(error, "Batch could not be transferred."));
    }
  };

  return (
    <AppModal
      open={open}
      toggle={toggle}
      title={`Transfer ${batch.batchNumber || "batch"}`}
      onOk={handleSubmit}
      loading={isLoading}
      okText="Transfer batch"
      width={560}
      height="auto"
      footer={
        <div className="flex justify-end gap-2">
          <Button onClick={toggle} disabled={isLoading}>
            Cancel
          </Button>
          <Button type="primary" onClick={handleSubmit} loading={isLoading}>
            Transfer batch
          </Button>
        </div>
      }
    >
      <Form form={form} layout="vertical">
        <BatchContextCard
          items={[
            { label: "From", value: batch.locationName || "-" },
            { label: "Available", value: formatQuantity(batch.remainingQuantity) },
          ]}
        />
        {submitError && <p className="mb-4 px-5 text-sm text-red-600">{submitError}</p>}

        <div className="px-5">
          <Form.Item label="Destination location" name="toLocationId" rules={[{ required: true, message: "Select a destination location" }]}>
            <Select placeholder="Select location" loading={locationsLoading} options={locationOptions} />
          </Form.Item>

          <div className="grid gap-x-5 md:grid-cols-2">
            <Form.Item
              label={
                <div className="flex w-full items-center justify-between gap-2">
                  <span>Quantity</span>
                  <Button type="link" className="!h-auto !px-0 !py-0 text-xs" onClick={() => form.setFieldValue("quantity", Number(batch.remainingQuantity || 0))}>
                    Move all
                  </Button>
                </div>
              }
              name="quantity"
              rules={[
                { required: true, message: "Enter a quantity" },
                {
                  validator: (_, value) => {
                    if (value === undefined || value === null) return Promise.resolve();
                    if (Number(value) <= 0) return Promise.reject(new Error("Quantity must be greater than zero"));
                    if (Number(value) > Number(batch.remainingQuantity || 0)) return Promise.reject(new Error("Quantity exceeds remaining stock in this batch"));
                    return Promise.resolve();
                  },
                },
              ]}
            >
              <InputNumber className="!w-full" min={0.000001} max={Number(batch.remainingQuantity || 0)} />
            </Form.Item>
            <Form.Item label="Effective date" name="effectiveDate" rules={[{ required: true, message: "Select the effective date" }]}>
              <DatePicker className="!w-full" />
            </Form.Item>
          </div>

          <Form.Item label="Reason" name="reason">
            <Input.TextArea rows={3} placeholder="Optional note for this transfer" />
          </Form.Item>
        </div>
      </Form>
    </AppModal>
  );
}

export function BatchDisassembleModal({ batch, product, open, toggle, onSaved }: { batch: InventoryBatch; product: ProductDetail; open: boolean; toggle: () => void; onSaved: () => void }) {
  const [form] = Form.useForm<DisassembleBatchFormValues>();
  const [disassembleBatch, { isLoading }] = useDisassembleBatchByBatchIdMutation();
  const [submitError, setSubmitError] = useState<string | null>(null);

  const componentSummary = useMemo(
    () =>
      (product.bundleItems || [])
        .map((item) => {
          const productRef = typeof item.productId === "string" ? undefined : item.productId;
          const quantity = Number(item.quantity || 0);
          if (!productRef?.name || quantity <= 0) return null;
          return `${formatQuantity(quantity)} × ${productRef.name}`;
        })
        .filter(Boolean)
        .join(" · "),
    [product.bundleItems],
  );

  useEffect(() => {
    if (!open) return;
    form.setFieldsValue({
      quantity: undefined,
      effectiveDate: dayjs(),
      reason: "",
    });
    setSubmitError(null);
  }, [form, open, batch.id]);

  const handleSubmit = async () => {
    try {
      setSubmitError(null);
      const values = await form.validateFields();
      await disassembleBatch({
        id: batch.id || "",
        quantity: values.quantity,
        reason: values.reason?.trim() || undefined,
        effectiveDate: values.effectiveDate?.toISOString(),
      }).unwrap();
      message.success("Batch disassembled.");
      toggle();
      onSaved();
    } catch (error) {
      if (isFormValidationError(error)) return;
      setSubmitError(getMutationErrorMessage(error, "Batch could not be disassembled."));
    }
  };

  return (
    <AppModal
      open={open}
      toggle={toggle}
      title={`Disassemble ${batch.batchNumber || "batch"}`}
      onOk={handleSubmit}
      loading={isLoading}
      okText="Disassemble batch"
      width={560}
      height="auto"
      footer={
        <div className="flex justify-end gap-2">
          <Button onClick={toggle} disabled={isLoading}>
            Cancel
          </Button>
          <Button type="primary" onClick={handleSubmit} loading={isLoading}>
            Disassemble batch
          </Button>
        </div>
      }
    >
      <Form form={form} layout="vertical">
        <BatchContextCard
          items={[
            { label: "Batch", value: batch.batchNumber || "-" },
            { label: "Location", value: batch.locationName || "-" },
            { label: "Remaining", value: formatQuantity(batch.remainingQuantity) },
          ]}
        />
        {submitError && <p className="mb-4 px-5 text-sm text-red-600">{submitError}</p>}

        <div className="px-5">
          <div className="mb-4 rounded-sm border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-900">This will remove finished bundle stock from this batch and restore its component quantities back into the same location.</div>

          {componentSummary ? <p className="mb-4 text-sm text-gray-500">Per bundle: {componentSummary}</p> : null}

          <div className="grid grid-cols-2 gap-x-5">
            <Form.Item
              label="Quantity"
              name="quantity"
              rules={[
                { required: true, message: "Enter the quantity to disassemble" },
                {
                  validator: (_, value) => {
                    if (value === undefined || value === null) return Promise.resolve();
                    if (Number(value) <= 0) return Promise.reject(new Error("Quantity must be greater than zero"));
                    if (Number(value) > Number(batch.remainingQuantity || 0)) {
                      return Promise.reject(new Error("Quantity exceeds the remaining batch quantity"));
                    }
                    return Promise.resolve();
                  },
                },
              ]}
            >
              <InputNumber className="!w-full" min={0.000001} max={Number(batch.remainingQuantity || 0)} />
            </Form.Item>
            <Form.Item label="Effective date" name="effectiveDate" rules={[{ required: true, message: "Select the effective date" }]}>
              <DatePicker className="!w-full" />
            </Form.Item>
          </div>

          <Form.Item label="Reason" name="reason" rules={[{ required: true, message: "Reason for the disassemble" }]}>
            <Input.TextArea rows={3} placeholder="Optional note for this disassembly" />
          </Form.Item>
        </div>
      </Form>
    </AppModal>
  );
}
