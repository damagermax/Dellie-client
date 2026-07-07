"use client";

import { useEffect } from "react";
import { Checkbox, Form } from "antd";
import { InputFormItem } from "@/components/ui/AppFormItems";
import { AppModal } from "@/components/ui/AppModal";
import { BaseButton } from "@/components/ui/AppButtons";
import { useCreatePaymentMethodMutation, useGetPaymentMethodQuery, useUpdatePaymentMethodMutation } from "@/lib/redux/services";
import { CreatePaymentMethodInput, PaymentMethod, UpdatePaymentMethodInput } from "@/types/payment-method";

interface PaymentMethodsFormProps {
  open: boolean;
  toggle: () => void;
  initialValues?: PaymentMethod;
  onSaveSuccess?: () => void;
}

function isProtectedCashMethod(paymentMethod?: PaymentMethod) {
  if (!paymentMethod) return false;
  return Boolean(paymentMethod.isSystem) || paymentMethod.name.trim().toLowerCase() === "cash";
}

export default function PaymentMethodsForm({ open, toggle, initialValues, onSaveSuccess }: PaymentMethodsFormProps) {
  const [form] = Form.useForm();
  const { data: paymentMethodData } = useGetPaymentMethodQuery(initialValues?.id || "", { skip: !initialValues?.id });
  const [createPaymentMethod, { isLoading: isCreating }] = useCreatePaymentMethodMutation();
  const [updatePaymentMethod, { isLoading: isUpdating }] = useUpdatePaymentMethodMutation();
  const isProtectedMethod = isProtectedCashMethod(paymentMethodData || initialValues);

  useEffect(() => {
    if (!open) return;

    if (paymentMethodData || initialValues) {
      form.setFieldsValue(paymentMethodData || initialValues);
      return;
    }

    form.resetFields();
    form.setFieldsValue({ showInPOS: true });
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
    <AppModal footer={null} width={560} title={initialValues ? "Edit Payment Method" : "Payment Method"} open={open} toggle={toggle}>
      <Form disabled={isCreating || isUpdating} form={form} layout="vertical" onFinish={handleSubmit} className="mt-6">
        <div className="space-y-5 px-6">
          <InputFormItem
            label="Method name"
            name="name"
            placeholder="Cash"
            rules={[{ required: true, message: "Enter a payment method name" }]}
            disable={isProtectedMethod}
            help={isProtectedMethod ? "Cash is a protected system payment method. Its name cannot be changed, but you can still update where it shows." : undefined}
          />
          <Form.Item name="showInPOS" valuePropName="checked" className="!mb-0">
            <Checkbox>Show in POS</Checkbox>
          </Form.Item>
        </div>

        <div className="flex justify-end gap-x-3 px-6 pb-6 pt-2">
          <BaseButton label="Cancel" type="default" size="middle" onClick={toggle} />
          <BaseButton label={isCreating || isUpdating ? "Saving..." : "Save"} type="primary" size="middle" onClick={form.submit} />
        </div>
      </Form>
    </AppModal>
  );
}
