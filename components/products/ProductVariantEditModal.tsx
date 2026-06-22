"use client";

import { AppModal, ModalProps } from "@/components/ui/AppModal";
import { useStoreCurrencyCode } from "@/hooks/useStoreCurrencyCode";
import { useUpdateProductVariantMutation } from "@/lib/redux/services";
import { ProductPriceTier, defaultPriceTiers } from "@/lib/products/pricing";
import { Form, Input, InputNumber, Switch, message } from "antd";

type EditableVariant = {
  id: string;
  productId?: string;
  name: string;
  sku?: string;
  barcode?: string;
  costPrice?: number;
  weight?: number;
  isAvailable?: boolean;
  priceTiers?: ProductPriceTier[];
};

export function ProductVariantEditModal({ product, onSaved, ...modalProps }: ModalProps & { product: EditableVariant; onSaved?: () => void }) {
  const [form] = Form.useForm();
  const currencyCode = useStoreCurrencyCode();
  const [updateVariant, { isLoading }] = useUpdateProductVariantMutation();

  const submit = async () => {
    const values = await form.validateFields().catch(() => null);
    if (!values) return;
    const data = new FormData();
    for (const key of ["sku", "barcode", "costPrice", "weight", "isAvailable"] as const) {
      if (values[key] !== undefined && values[key] !== null) data.append(key, String(values[key]));
    }
    data.append("priceTiers", JSON.stringify(values.priceTiers));

    try {
      await updateVariant({ id: product.id, productId: product.productId, data }).unwrap();
      message.success("Variant updated successfully.");
      onSaved?.();
      modalProps.toggle();
    } catch {
      message.error("The variant could not be updated.");
    }
  };

  return (
    <AppModal {...modalProps} title={`Edit ${product.name}`} loading={isLoading} onOk={submit}>
      <Form
        form={form}
        layout="vertical"
        className="px-5 py-4"
        initialValues={{ ...product, isAvailable: product.isAvailable ?? true, priceTiers: product.priceTiers?.length ? product.priceTiers : defaultPriceTiers(0) }}
      >
        <div className="grid gap-4 sm:grid-cols-2">
          <Form.Item label="SKU" name="sku"><Input /></Form.Item>
          <Form.Item label="Barcode" name="barcode"><Input /></Form.Item>
          <Form.Item label="Cost Price" name="costPrice" rules={[{ required: true, message: "Enter cost price" }]}><InputNumber className="!w-full" min={0} prefix={currencyCode || undefined} /></Form.Item>
          <Form.Item label="Weight" name="weight"><InputNumber className="!w-full" min={0} suffix="kg" /></Form.Item>
        </div>
        <Form.List name="priceTiers">
          {(fields) => fields.map((field, index) => (
            <div key={field.key} className="grid gap-3 sm:grid-cols-3">
              <Form.Item {...field} name={[field.name, "name"]} hidden><Input /></Form.Item>
              <Form.Item {...field} label={index === 0 ? "Normal Selling Price" : "Trade Price"} name={[field.name, "price"]} rules={[{ required: true }]}><InputNumber className="!w-full" min={0} prefix={currencyCode || undefined} /></Form.Item>
              <Form.Item {...field} label="MOQ" name={[field.name, "moq"]}><InputNumber className="!w-full" min={1} /></Form.Item>
              <Form.Item {...field} label="Discount %" name={[field.name, "discountPercent"]}><InputNumber className="!w-full" min={0} /></Form.Item>
            </div>
          ))}
        </Form.List>
        <div className="flex items-center justify-between rounded-md border border-gray-200 px-4 py-3">
          <span className="text-sm font-medium">Available for new transactions</span>
          <Form.Item name="isAvailable" valuePropName="checked" noStyle><Switch /></Form.Item>
        </div>
      </Form>
    </AppModal>
  );
}
