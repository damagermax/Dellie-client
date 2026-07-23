"use client";

import { useEffect } from "react";
import { Form, InputNumber } from "antd";
import { InputFormItem } from "@/components/ui/AppFormItems";
import AppDrawer from "@/components/ui/AppDrawer";
import { BaseButton } from "@/components/ui/AppButtons";
import { useCreatePaymentTermMutation, useGetPaymentTermQuery, useUpdatePaymentTermMutation } from "@/lib/redux/services";
import { CreatePaymentTermInput, PaymentTerm, UpdatePaymentTermInput } from "@/types/payment-term";

interface PaymentTermsFormProps {
  open: boolean;
  toggle: () => void;
  initialValues?: PaymentTerm;
  onSaveSuccess?: () => void;
}

export default function PaymentTermsForm({ open, toggle, initialValues, onSaveSuccess }: PaymentTermsFormProps) {
  const [form] = Form.useForm();
  const { data: paymentTermData } = useGetPaymentTermQuery(initialValues?.id || "", { skip: !initialValues?.id });
  const [createPaymentTerm, { isLoading: isCreating }] = useCreatePaymentTermMutation();
  const [updatePaymentTerm, { isLoading: isUpdating }] = useUpdatePaymentTermMutation();

  useEffect(() => {
    if (!open) return;

    if (paymentTermData || initialValues) {
      form.setFieldsValue(paymentTermData || initialValues);
      return;
    }

    form.resetFields();
  }, [form, initialValues, open, paymentTermData]);

  const handleSubmit = async (values: CreatePaymentTermInput) => {
    if (isCreating || isUpdating) return;

    if (initialValues?.id) {
      await updatePaymentTerm({ id: initialValues.id, ...values } as UpdatePaymentTermInput).unwrap();
    } else {
      await createPaymentTerm(values).unwrap();
      form.resetFields();
    }

    onSaveSuccess?.();
    toggle();
  };

  return (
    <AppDrawer title={initialValues ? "Edit Payment Term" : "Payment Term"} open={open} toggle={toggle}>
      <Form disabled={isCreating || isUpdating} form={form} layout="vertical" onFinish={handleSubmit} className="mt-6">
        <div className="space-y-5 px-6">
          <InputFormItem label="Term name" name="name" placeholder="Net 30" rules={[{ required: true, message: "Enter a payment term name" }]} />

          <Form.Item label="Days" name="days" rules={[{ required: true, message: "Enter number of days" }]}>
            <InputNumber min={0} controls={false} className="!w-full" placeholder="30" />
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
