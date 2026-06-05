"use client";

import { useEffect } from "react";
import { Form } from "antd";
import { InputFormItem } from "@/components/ui/AppFormItems";
import AppDrawer from "@/components/ui/AppDrawer";
import { BaseButton } from "@/components/ui/AppButtons";
import { useCreatePaymentMethodMutation, useGetPaymentMethodQuery, useUpdatePaymentMethodMutation } from "@/lib/redux/services";
import { CreatePaymentMethodInput, PaymentMethod, UpdatePaymentMethodInput } from "@/types/payment-method";

interface PaymentMethodsFormProps {
  open: boolean;
  toggle: () => void;
  initialValues?: PaymentMethod;
  onSaveSuccess?: () => void;
}

export default function PaymentMethodsForm({ open, toggle, initialValues, onSaveSuccess }: PaymentMethodsFormProps) {
  const [form] = Form.useForm();
  const { data: paymentMethodData } = useGetPaymentMethodQuery(initialValues?.id || "", { skip: !initialValues?.id });
  const [createPaymentMethod, { isLoading: isCreating }] = useCreatePaymentMethodMutation();
  const [updatePaymentMethod, { isLoading: isUpdating }] = useUpdatePaymentMethodMutation();

  useEffect(() => {
    if (!open) return;

    if (paymentMethodData || initialValues) {
      form.setFieldsValue(paymentMethodData || initialValues);
      return;
    }

    form.resetFields();
  }, [form, initialValues, open, paymentMethodData]);

  const handleSubmit = async (values: CreatePaymentMethodInput) => {
    if (isCreating || isUpdating) return;

    if (initialValues?.id) {
      await updatePaymentMethod({ id: initialValues.id, ...values } as UpdatePaymentMethodInput).unwrap();
    } else {
      await createPaymentMethod(values).unwrap();
      form.resetFields();
    }

    onSaveSuccess?.();
    toggle();
  };

  return (
    <AppDrawer title={initialValues ? "Edit Payment Method" : "Payment Method"} open={open} toggle={toggle}>
      <Form disabled={isCreating || isUpdating} form={form} layout="vertical" onFinish={handleSubmit} className="mt-6">
        <div className="space-y-5 px-6">
          <InputFormItem
            label="Method name"
            name="name"
            placeholder="Cash"
            rules={[{ required: true, message: "Enter a payment method name" }]}
            help="Use labels like Cash, Card, Bank Transfer, or Mobile Money."
          />
        </div>

        <div className="flex justify-end gap-x-3 px-6 pb-6 pt-2">
          <BaseButton label="Cancel" type="default" size="middle" onClick={toggle} />
          <BaseButton label={isCreating || isUpdating ? "Saving..." : "Save"} type="primary" size="middle" onClick={form.submit} />
        </div>
      </Form>
    </AppDrawer>
  );
}
