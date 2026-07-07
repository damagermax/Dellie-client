"use client";

import { ITEM_TYPE } from "@/components/products/ProductFormModal";
import { AppModal, ModalProps } from "@/components/ui/AppModal";
import { useStoreCurrencyCode } from "@/hooks/useStoreCurrencyCode";
import { useUpdateProductVariantMutation } from "@/lib/redux/services";
import { NORMAL_PRICE_TIER_NAME, ProductPriceTier, TRADE_PRICE_TIER_NAME, getEditablePriceTiers, getNormalPrice, normalizePriceTierValues } from "@/lib/products/pricing";
import { Form, Input, InputNumber, message } from "antd";
import { useSelector } from "react-redux";
import { RootState } from "@/lib/store";

type EditableVariant = {
  id: string;
  productId?: string;
  name: string;
  type?: ITEM_TYPE;
  sku?: string;
  barcode?: string;
  costPrice?: number;
  weight?: number;
  priceTiers?: ProductPriceTier[];
};

const NUMBER_INPUT_CLASS = "!w-full";

export function ProductVariantEditModal({ product, onSaved, ...modalProps }: ModalProps & { product: EditableVariant; onSaved?: () => void }) {
  const [form] = Form.useForm();
  const currencyCode = useStoreCurrencyCode();
  const [updateVariant, { isLoading }] = useUpdateProductVariantMutation();
  const enableTradePrice = Boolean(useSelector((state: RootState) => state.currentUser.storeSettings.pricing?.enableTradePrice));
  const isStockVariant = product.type === ITEM_TYPE.STOCK;

  const submit = async () => {
    const validated = await form.validateFields().catch(() => null);
    if (!validated) return;
    const values = form.getFieldsValue(true) as EditableVariant & { priceTiers?: ProductPriceTier[] };
    const data = new FormData();
    const currentPriceTiers = (
      form
        .getFieldValue("priceTiers")
        ?.filter?.((tier: ProductPriceTier | undefined) => Boolean(tier)) ??
      values.priceTiers ??
      getEditablePriceTiers(product, enableTradePrice)
    ) as ProductPriceTier[] | undefined;
    const fallbackPrice = getNormalPrice(product);
    const normalSellingPrice = Number(currentPriceTiers?.[0]?.price ?? fallbackPrice ?? 0);
    for (const key of ["sku", "barcode", "weight"] as const) {
      if (values[key] !== undefined && values[key] !== null) data.append(key, String(values[key]));
    }
    if (!isStockVariant && values.costPrice !== undefined && values.costPrice !== null) {
      data.append("costPrice", String(values.costPrice));
    }
    data.append("sellingPrice", String(normalSellingPrice));
    data.append("priceTiers", JSON.stringify(normalizePriceTierValues(currentPriceTiers, fallbackPrice, enableTradePrice)));

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
    <AppModal {...modalProps} width={660} title={`Edit ${product.name}`} loading={isLoading} onOk={submit}>
      <Form form={form} layout="vertical" className="" initialValues={{ ...product, priceTiers: getEditablePriceTiers(product, enableTradePrice) }}>
        <div className="grid gap-4 px-4 sm:grid-cols-2">
          <Form.Item label="SKU" name="sku">
            <Input />
          </Form.Item>
          <Form.Item label="Barcode" name="barcode">
            <Input />
          </Form.Item>
          <Form.Item label="Cost Price" name="costPrice" rules={isStockVariant ? undefined : [{ required: true, message: "Enter cost price" }]}>
            <InputNumber className="!w-full" min={0} prefix={currencyCode || undefined} disabled={isStockVariant} />
          </Form.Item>
          <Form.Item label="Weight" name="weight">
            <InputNumber className="!w-full" min={0} suffix="kg" />
          </Form.Item>
        </div>
        <PriceTiersEditor enableTradePrice={enableTradePrice} currencyCode={currencyCode} />
      </Form>
    </AppModal>
  );
}

function PriceTiersEditor({ enableTradePrice, currencyCode }: { enableTradePrice: boolean; currencyCode: string }) {
  return (
    <div>
      <Form.List name="priceTiers">
        {(fields) => (
          <div className="space-y-3 ">
            {fields.slice(0, enableTradePrice ? 2 : 1).map((field, index) => (
              <article key={field.key} className="border border-gray-200 bg-white p-4">
                <Form.Item {...field} name={[field.name, "name"]} hidden>
                  <Input />
                </Form.Item>

                <div className="mb-3">
                  <h3 className="text-sm font-semibold text-gray-900">{index === 0 ? NORMAL_PRICE_TIER_NAME : TRADE_PRICE_TIER_NAME}</h3>
                  <p className="mt-0.5 text-xs text-gray-500">{tierDescription(index === 0 ? NORMAL_PRICE_TIER_NAME : TRADE_PRICE_TIER_NAME, index === 0)}</p>
                </div>

                <div className="grid grid-cols-4 gap-3 md:grid-cols-3">
                  <Form.Item {...field} label="Price" name={[field.name, "price"]} className="!mb-0 col-span-2 md:col-span-1" rules={[{ required: true, message: "Enter price" }]}>
                    <InputNumber className={NUMBER_INPUT_CLASS} min={0} controls={false} prefix={currencyCode || undefined} placeholder="0.00" />
                  </Form.Item>
                  <Form.Item {...field} label="MOQ" name={[field.name, "moq"]} className="!mb-0" rules={[{ required: true, message: "Enter MOQ" }]}>
                    <InputNumber className={NUMBER_INPUT_CLASS} min={1} controls={false} placeholder="1" />
                  </Form.Item>
                  <Form.Item {...field} label="Discount" name={[field.name, "discountPercent"]} className="!mb-0" rules={[{ required: true, message: "Enter discount" }]}>
                    <InputNumber className={NUMBER_INPUT_CLASS} min={0} suffix="%" controls={false} placeholder="0" />
                  </Form.Item>
                </div>
              </article>
            ))}
          </div>
        )}
      </Form.List>
    </div>
  );
}

function tierDescription(name?: string, isNormal?: boolean) {
  if (isNormal) return "Default customer-facing price";
  if (name === TRADE_PRICE_TIER_NAME) return "Trade and bulk customer price";
  return "Custom product price";
}
