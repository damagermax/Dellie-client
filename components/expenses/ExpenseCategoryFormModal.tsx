"use client";

import { Form } from "antd";
import { ColorFormItem, InputFormItem, SelectFormItem, TextAreaFormItem } from "../ui/AppFormItems";
import { AppModal, ModalProps } from "../ui/AppModal";
import { ExpenseCategory, CreateExpenseCategoryInput, UpdateExpenseCategoryInput } from "../../types/transaction";
import { useEffect } from "react";

import { useCreateExpenseCategoryMutation, useUpdateExpenseCategoryMutation, useGetExpenseCategoryQuery } from "@/lib/redux/services";

interface ExpenseCategoryFormModalProps extends ModalProps {
  initialValues?: ExpenseCategory;
}

type ExpenseCategoryFormValues = CreateExpenseCategoryInput | UpdateExpenseCategoryInput;

export default function ExpenseCategoryFormModal({ open, toggle, initialValues }: ExpenseCategoryFormModalProps) {
  const [expenseCategoryForm] = Form.useForm();

  const { data: expenseCategoryData, isSuccess } = useGetExpenseCategoryQuery(initialValues?.id || "", { skip: !initialValues?.id, refetchOnMountOrArgChange: true });
  const [createExpenseCategory, { isLoading: isCreating, isSuccess: createSuccess }] = useCreateExpenseCategoryMutation();
  const [updateExpenseCategory, { isLoading: isUpdating, isSuccess: updateSuccess }] = useUpdateExpenseCategoryMutation();

  useEffect(() => {
    if (expenseCategoryData && isSuccess) {
      expenseCategoryForm.setFieldsValue(expenseCategoryData);
    }
  }, [expenseCategoryData, isSuccess]);

  useEffect(() => {
    if (updateSuccess || createSuccess) {
      expenseCategoryForm.resetFields();
      toggle();
    }
  }, [updateSuccess, createSuccess]);

  const handleSubmit = async (values: ExpenseCategoryFormValues) => {
    if (initialValues?.id) {
      await updateExpenseCategory({ id: initialValues?.id, ...values });
    } else {
      await createExpenseCategory(values);
    }
  };

  return (
    <AppModal title={initialValues ? "Edit  Category" : "Create  Category"} onOk={expenseCategoryForm.submit} width={500} okText={isCreating || isUpdating ? "Saving.." : "Save"} open={open} toggle={toggle}>
      <Form size="small" disabled={isCreating || isUpdating} onFinish={handleSubmit} form={expenseCategoryForm} initialValues={initialValues} layout={"vertical"}>
        <div className="p-5 px-8 gap-x-12">
          <div className="space-y-4">
            <InputFormItem label="Name" name="name" placeholder="Name " rules={[{ required: true, message: "Please enter a expense category name" }] as any} />
            <TextAreaFormItem label="Description (Optional)" name="description" placeholder="Description" />
            {initialValues?.id && (
              <SelectFormItem
                label="Status"
                name="isLocked"
                placeholder="Select expense category status"
                rules={[{ required: true, message: "Please select a expense category status" }] as any}
                options={[
                  { value: true, label: "Locked" },
                  { value: false, label: "Opened" },
                ]}
              />
            )}
          </div>
        </div>
      </Form>
    </AppModal>
  );
}
