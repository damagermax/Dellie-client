"use client";

import { useEffect, useMemo } from "react";
import { Form, InputNumber } from "antd";
import { InputFormItem, TextAreaFormItem } from "@/components/ui/AppFormItems";
import { AppModal } from "@/components/ui/AppModal";
import { BaseButton } from "@/components/ui/AppButtons";
import { useCreateDeliveryZoneMutation, useGetDeliveryZoneQuery, useUpdateDeliveryZoneMutation } from "@/lib/redux/services";
import { useGetCurrencyQuery } from "@/lib/redux/services";
import { useGetStoreSettingsQuery } from "@/lib/redux/services/storeSettingsApi";
import { CreateDeliveryZoneInput, DeliveryZone, UpdateDeliveryZoneInput } from "@/types/delivery-zone";

interface DeliveryZonesFormProps {
  open: boolean;
  toggle: () => void;
  initialValues?: DeliveryZone;
  onSaveSuccess?: () => void;
}

export default function DeliveryZonesForm({ open, toggle, initialValues, onSaveSuccess }: DeliveryZonesFormProps) {
  const [form] = Form.useForm();
  const { data: zoneData } = useGetDeliveryZoneQuery(initialValues?.id || "", { skip: !initialValues?.id });
  const { data: storeSettings } = useGetStoreSettingsQuery();
  const { data: currency } = useGetCurrencyQuery(storeSettings?.businessProfile?.currencyId || "", { skip: !storeSettings?.businessProfile?.currencyId });
  const [createDeliveryZone, { isLoading: isCreating }] = useCreateDeliveryZoneMutation();
  const [updateDeliveryZone, { isLoading: isUpdating }] = useUpdateDeliveryZoneMutation();

  const currencyCode = useMemo(() => {
    if (!currency?.code) return "$";
    return currency.code;
  }, [currency]);

  useEffect(() => {
    if (!open) return;

    if (zoneData || initialValues) {
      form.setFieldsValue(zoneData || initialValues);
      return;
    }

    form.resetFields();
  }, [form, initialValues, open, zoneData]);

  const handleSubmit = async (values: CreateDeliveryZoneInput) => {
    if (isCreating || isUpdating) return;

    if (initialValues?.id) {
      await updateDeliveryZone({ id: initialValues.id, ...values } as UpdateDeliveryZoneInput).unwrap();
    } else {
      await createDeliveryZone(values).unwrap();
      form.resetFields();
    }

    onSaveSuccess?.();
    toggle();
  };

  return (
    <AppModal footer={null} width={560} title={initialValues ? "Edit Delivery Zone" : "Delivery Zone"} open={open} toggle={toggle}>
      <Form disabled={isCreating || isUpdating} form={form} layout="vertical" onFinish={handleSubmit} className="mt-6">
        <div className="space-y-5 px-6">
          <InputFormItem
            label="Zone name"
            name="name"
            placeholder="e.g. Downtown"
            rules={[{ required: true, message: "Enter a zone name" }]}
          />
          <Form.Item
            label="Delivery fee"
            name="fee"
            rules={[{ required: true, message: "Enter a delivery fee" }]}
            className="!mb-4"
          >
            <InputNumber
              min={0}
              precision={2}
              prefix={currencyCode}
              placeholder="0.00"
              className="!w-full"
            />
          </Form.Item>
          <TextAreaFormItem
            label="Coverage areas"
            name="areas"
            placeholder="e.g. Main Street, Market Road"
            rules={[]}
          />
        </div>

        <div className="flex justify-end gap-x-3 px-6 pb-6 pt-2">
          <BaseButton label="Cancel" type="default" size="middle" onClick={toggle} />
          <BaseButton label={isCreating || isUpdating ? "Saving..." : "Save"} type="primary" size="middle" onClick={form.submit} />
        </div>
      </Form>
    </AppModal>
  );
}
