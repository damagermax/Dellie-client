"use client";

import { Button, DatePicker, Form, Input, InputNumber, Select, message } from "antd";
import dayjs from "dayjs";
import { useEffect, useMemo, useState } from "react";
import { useSelector } from "react-redux";

import { AppModal } from "@/components/ui/AppModal";
import PreviewImage from "@/components/ui/PreviewImage";
import { BatchContextCard } from "@/components/products/product-detail/shared";
import { ITEM_TYPE } from "@/components/products/ProductFormModal";
import { useAdjustBatchMutation, useDisassembleBatchByBatchIdMutation, useGetLocationsQuery, useRestockProductMutation, useTransferBatchByBatchIdMutation } from "@/lib/redux/services";
import { RootState } from "@/lib/store";
import { getProductTypeLabel, hasBundleComponents } from "@/lib/products/type-label";

import type { AdjustBatchInput, DisassembleBatchInput, Location, RestockProductInput, TransferBatchInput } from "../../../types";
import type { InventoryBatch, ProductDetail } from "./types";
import { formatDate, formatMoney, formatQuantity, getMutationErrorMessage, isFormValidationError } from "./utils";

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

type ProductionComponentRow = {
  productId: string;
  productName: string;
  sku?: string;
  imageUrl?: string | null;
  quantityRequired: number;
  quantity: number;
  availableByLocation?: Record<string, number>;
};

export function RestockProductModal({ open, toggle, product, onSaved }: { open: boolean; toggle: () => void; product: ProductDetail; onSaved: () => void }) {
  const [form] = Form.useForm<RestockProductFormValues>();
  const [restockProduct, { isLoading }] = useRestockProductMutation();
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [componentRows, setComponentRows] = useState<ProductionComponentRow[]>([]);
  const { data: locations = [], isLoading: locationsLoading } = useGetLocationsQuery({}, { skip: !open });
  const isProduction = product.type === ITEM_TYPE.STOCK && hasBundleComponents(product);
  const expiryEnabled = useSelector((state: RootState) => state.currentUser.storeSettings.features?.expiryEnabled !== false);
  const selectedLocationId = Form.useWatch("locationId", form);
  const finishedQuantity = Number(Form.useWatch("quantity", form) || 0);

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
    setComponentRows([]);
    setSubmitError(null);
  }, [form, open, product.costPrice]);

  useEffect(() => {
    if (!open || !isProduction) return;

    const nextRows = (product.productionComponents || [])
      .map((component) => ({
        productId: component.productId || "",
        productName: component.productName || "Component",
        sku: component.sku,
        imageUrl: component.imageUrl,
        quantityRequired: Number(component.quantityRequired || 0),
        quantity: Number(component.quantityRequired || 0) * finishedQuantity,
        availableByLocation: component.availableByLocation || {},
      }))
      .filter((component) => component.productId);

    setComponentRows(nextRows);
  }, [finishedQuantity, isProduction, open, product.productionComponents]);

  const componentStatuses = useMemo(
    () =>
      componentRows.map((component) => {
        const available = Number((selectedLocationId && component.availableByLocation?.[selectedLocationId]) || 0);
        const shortage = Math.max(Number(component.quantity || 0) - available, 0);

        return {
          ...component,
          available,
          shortage,
        };
      }),
    [componentRows, selectedLocationId],
  );

  const componentShortages = componentStatuses.filter((component) => component.shortage > 0);

  const updateComponentQuantity = (productId: string, quantity?: number | null) => {
    setComponentRows((prev) =>
      prev.map((component) =>
        component.productId === productId
          ? {
              ...component,
              quantity: Number(quantity || 0),
            }
          : component,
      ),
    );
  };

  const handleSubmit = async () => {
    try {
      setSubmitError(null);
      const values = await form.validateFields();
      const normalizedComponents = componentRows
        .map((component) => ({
          productId: component.productId,
          quantity: Number(component.quantity || 0),
        }))
        .filter((component) => component.productId);

      if (isProduction) {
        if (!normalizedComponents.length) {
          setSubmitError("This bundle does not have any stock-tracked components to produce from.");
          return;
        }

        if (normalizedComponents.some((component) => !Number.isFinite(component.quantity) || component.quantity <= 0)) {
          setSubmitError("Every production component quantity must be greater than zero.");
          return;
        }

        if (componentShortages.length) {
          setSubmitError("One or more components do not have enough stock at the selected location.");
          return;
        }
      }

      await restockProduct({
        productId: product.id,
        locationId: values.locationId,
        quantity: values.quantity,
        unitCost: isProduction ? undefined : Number(values.unitCost || 0),
        receivedDate: values.receivedDate.toISOString(),
        expiryDate: expiryEnabled ? values.expiryDate?.toISOString() : undefined,
        components: isProduction ? normalizedComponents : undefined,
      }).unwrap();
      message.success(isProduction ? "Production recorded." : "Product restocked.");
      toggle();
      onSaved();
    } catch (error) {
      if (isFormValidationError(error)) return;
      setSubmitError(getMutationErrorMessage(error, isProduction ? "Production could not be recorded." : "Product could not be restocked."));
    }
  };

  return (
    <AppModal
      open={open}
      toggle={toggle}
      title={<p className="line-clamp-1 pr-5">{isProduction ? "Production" : "Restock"} {product.name}</p>}
      onOk={handleSubmit}
      loading={isLoading}
      okText={isProduction ? "Save production" : "Restock"}
      width={700}
      height="75vh"
      footer={
        <div className="flex justify-end gap-2">
          <Button onClick={toggle} disabled={isLoading}>
            Cancel
          </Button>
          <Button type="primary" onClick={handleSubmit} loading={isLoading}>
            {isProduction ? "Save production" : "Restock"}
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
          {isProduction ? <div className="mb-4 rounded-sm border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-900">This stock bundle will be produced from component inventory at the selected location.</div> : null}

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
                isProduction
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
              <InputNumber className="!w-full" min={0} disabled={isProduction} />
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

          {isProduction ? (
            <div className="border-t border-gray-200 py-5">
              <div className="mb-3">
                <p className="text-sm font-medium text-gray-900">Production Components</p>
                <p className="text-xs text-gray-500">Adjust actual component quantities used for this production run.</p>
              </div>

              <div className="space-y-3">
                {componentStatuses.map((component) => (
                  <div key={component.productId} className="flex items-center gap-3 rounded-sm border border-gray-200 px-3 py-3">
                    <PreviewImage width={40} height={40} src={component.imageUrl} alt={component.productName} />
                    <div className="min-w-0 flex-1">
                      <p className="truncate text-sm font-medium text-gray-900">{component.productName}</p>
                      <p className="mt-1 text-xs text-gray-500">
                        {component.sku || "No SKU"} · Default {formatQuantity(component.quantityRequired * finishedQuantity)}
                      </p>
                      <p className={`mt-1 text-xs ${component.shortage > 0 ? "text-red-600" : "text-gray-500"}`}>
                        Available at this location: {selectedLocationId ? formatQuantity(component.available) : "-"}
                      </p>
                    </div>
                    <div className="w-[118px] shrink-0">
                      <InputNumber className="!w-full" min={0.000001} value={component.quantity} onChange={(value) => updateComponentQuantity(component.productId, value)} />
                    </div>
                  </div>
                ))}
              </div>

              {componentShortages.length ? (
                <div className="mt-3 rounded-sm border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
                  {componentShortages.map((component) => `${component.productName}: short ${formatQuantity(component.shortage)}`).join(" · ")}
                </div>
              ) : null}
            </div>
          ) : null}
        </div>
      </Form>
    </AppModal>
  );
}

export function ProductionBatchDetailModal({ batch, open, toggle }: { batch: InventoryBatch; open: boolean; toggle: () => void }) {
  const components = useMemo(
    () => (batch.assemblyComponents || []).filter((component) => Number(component.quantity || 0) > 0),
    [batch.assemblyComponents],
  );

  return (
    <AppModal open={open} toggle={toggle} title={`Production ${batch.batchNumber || "batch"}`} footer={null} width={640} height="70vh">
      <div className="px-5 pb-5">
        <BatchContextCard
          items={[
            { label: "Batch", value: batch.batchNumber || "-" },
            { label: "Location", value: batch.locationName || "-" },
            { label: "Produced", value: formatQuantity(batch.quantity) },
            { label: "Remaining", value: formatQuantity(batch.remainingQuantity) },
            { label: "Date", value: formatDate(batch.sourceDate) },
            { label: "Unit Cost", value: formatMoney(batch.unitCost) },
          ]}
        />

        <div>
          <p className="mb-3 text-sm font-medium text-gray-900">Components used</p>
          {components.length ? (
            <div className="space-y-3">
              {components.map((component, index) => (
                <div key={`${component.productId || component.productName}-${index}`} className="flex items-center gap-3 rounded-sm border border-gray-200 px-3 py-3">
                  <PreviewImage width={40} height={40} src={component.imageUrl} alt={component.productName} />
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-sm font-medium text-gray-900">{component.productName || "Component"}</p>
                    <p className="mt-1 text-xs text-gray-500">{component.sku || "No SKU"}</p>
                  </div>
                  <div className="text-right text-sm">
                    <p className="font-medium text-gray-900">{formatQuantity(component.quantity)}</p>
                    <p className="mt-1 text-xs text-gray-500">{formatMoney(component.totalCost)}</p>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="rounded-sm border border-gray-200 bg-gray-50 px-4 py-4 text-sm text-gray-500">No component trace is available for this production batch.</div>
          )}
        </div>
      </div>
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

  const componentSummary = useMemo(() => {
    const sourceComponents =
      (batch.assemblyComponents || []).filter((component) => Number(component.quantity || 0) > 0) ||
      [];

    if (sourceComponents.length) {
      return sourceComponents.map((component) => `${formatQuantity(component.quantity)} × ${component.productName || "Component"}`).join(" · ");
    }

    return (product.bundleItems || [])
      .map((item) => {
        const productRef = typeof item.productId === "string" ? undefined : item.productId;
        const quantity = Number(item.quantity || 0);
        if (!productRef?.name || quantity <= 0) return null;
        return `${formatQuantity(quantity)} × ${productRef.name}`;
      })
      .filter(Boolean)
      .join(" · ");
  }, [batch.assemblyComponents, product.bundleItems]);

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
