"use client";

import { useEffect } from "react";
import { Form, Switch } from "antd";
import { InputFormItem } from "@/components/ui/AppFormItems";
import AppDrawer from "@/components/ui/AppDrawer";
import { BaseButton } from "@/components/ui/AppButtons";
import { useCreatePricingGroupMutation, useGetPricingGroupQuery, useUpdatePricingGroupMutation } from "@/lib/redux/services";
import { CreatePricingGroupInput, PricingGroup, UpdatePricingGroupInput } from "@/types/pricing-group";

interface PricingGroupsFormProps {
  open: boolean;
  toggle: () => void;
  initialValues?: PricingGroup;
  onSaveSuccess?: () => void;
}

export default function PricingGroupsForm({ open, toggle, initialValues, onSaveSuccess }: PricingGroupsFormProps) {
  const [form] = Form.useForm();
  const { data: pricingGroupData } = useGetPricingGroupQuery(initialValues?.id || "", { skip: !initialValues?.id });
  const [createPricingGroup, { isLoading: isCreating }] = useCreatePricingGroupMutation();
  const [updatePricingGroup, { isLoading: isUpdating }] = useUpdatePricingGroupMutation();

  useEffect(() => {
    if (!open) return;

    if (pricingGroupData || initialValues) {
      form.setFieldsValue(pricingGroupData || initialValues);
      return;
    }

    form.resetFields();
    form.setFieldsValue({ isDefault: false });
  }, [form, initialValues, open, pricingGroupData]);

  const handleSubmit = async (values: CreatePricingGroupInput) => {
    if (isCreating || isUpdating) return;

    if (initialValues?.id) {
      await updatePricingGroup({ id: initialValues.id, ...values } as UpdatePricingGroupInput).unwrap();
    } else {
      await createPricingGroup(values).unwrap();
      form.resetFields();
    }

    onSaveSuccess?.();
    toggle();
  };

  return (
    <AppDrawer title={initialValues ? "Edit Pricing Group" : "Pricing Group"} open={open} toggle={toggle}>
      <Form disabled={isCreating || isUpdating} form={form} layout="vertical" onFinish={handleSubmit} className="mt-6">
        <div className="space-y-5 px-6">
          <InputFormItem label="Group name" name="name" placeholder="Wholesale" rules={[{ required: true, message: "Enter a pricing group name" }]} help="Use simple names like Retail, Wholesale, VIP, or Staff." />

          <Form.Item label="Default group" name="isDefault" valuePropName="checked">
            <Switch />
          </Form.Item>
        </div>

        <div className="flex justify-end gap-x-3 px-6 pb-6 pt-2">
          <BaseButton label="Cancel" type="default" size="middle" onClick={toggle} />
          <BaseButton label={isCreating || isUpdating ? "Saving..." : "Save"} type="primary" size="middle" onClick={form.submit} />
        </div>
      </Form>
    </AppDrawer>
  );
}
