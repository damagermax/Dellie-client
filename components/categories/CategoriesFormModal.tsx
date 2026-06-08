"use client";

import { Checkbox, Form, Switch } from "antd";
import { useEffect, useMemo } from "react";
import { AppModal, ModalProps } from "../ui/AppModal";
import { InputFormItem, TextAreaFormItem } from "../ui/AppFormItems";
import { Category, CategoryCreateInput, CategoryStatus, CategoryType } from "@/types/category";
import { useCreateCategoryMutation, useUpdateCategoryMutation } from "@/lib/redux/services";

interface CategoriesFormModalProp extends ModalProps {
  initialValues?: Category;
  type?: CategoryType;
}

type CategoryFormValues = Omit<CategoryCreateInput, "status"> & {
  status?: boolean;
};

export default function CategoriesFormModal({ open, toggle, initialValues, type }: CategoriesFormModalProp) {
  const [categoryForm] = Form.useForm();
  const categoryType = useMemo(() => initialValues?.type || type || CategoryType.PRODUCT, [initialValues?.type, type]);

  const [createCategory, { isLoading: isCreating, isSuccess: createSuccess }] = useCreateCategoryMutation();
  const [updateCategory, { isLoading: isUpdating, isSuccess: updateSuccess }] = useUpdateCategoryMutation();

  const handleSubmit = async (values: CategoryFormValues) => {
    const payload = {
      ...values,
      type: categoryType,
      status: values.status ? CategoryStatus.ACTIVE : CategoryStatus.INACTIVE,
      showInStorefront: categoryType === CategoryType.PRODUCT ? Boolean(values.showInStorefront) : false,
      showInPOS: categoryType === CategoryType.PRODUCT ? Boolean(values.showInPOS) : false,
    };

    if (initialValues?.id) {
      await updateCategory({ id: initialValues.id, ...payload });
      return;
    }

    await createCategory(payload);
  };

  useEffect(() => {
    if (open && initialValues) {
      categoryForm.setFieldsValue({
        ...initialValues,
        status: initialValues.status === CategoryStatus.ACTIVE,
        showInStorefront: Boolean(initialValues.showInStorefront),
        showInPOS: Boolean(initialValues.showInPOS),
      });
      return;
    }

    if (open && !initialValues?.id) {
      categoryForm.setFieldsValue({
        type: categoryType,
        status: CategoryStatus.ACTIVE,
        showInStorefront: false,
        showInPOS: false,
      });
    }
  }, [categoryForm, categoryType, initialValues, open]);

  useEffect(() => {
    if (updateSuccess || createSuccess) {
      categoryForm.resetFields();
      toggle();
    }
  }, [updateSuccess, createSuccess, categoryForm, toggle]);

  return (
    <AppModal
      title={initialValues ? "Edit Category" : `Create ${categoryType === CategoryType.PRODUCT ? "Product" : "Expense"} Category`}
      width={540}
      open={open}
      toggle={toggle}
      onOk={() => categoryForm.submit()}
      okText={isCreating || isUpdating ? "Saving..." : "Save"}
    >
      <Form
        // size="small"
        form={categoryForm}
        layout="vertical"
        onFinish={handleSubmit}
        initialValues={{
          ...initialValues,
          type: categoryType,
          status: initialValues?.status ? initialValues.status === CategoryStatus.ACTIVE : true,
          showInStorefront: Boolean(initialValues?.showInStorefront),
          showInPOS: Boolean(initialValues?.showInPOS),
        }}
      >
        <div className="space-y-5 p-5 px-6">
          <div className="grid ">
            <InputFormItem label="Name" name="name" placeholder="Enter category name" rules={[{ message: "Enter category name", required: true }]} />
          </div>

          <TextAreaFormItem label="Description" name="description" placeholder="Add a short description" />

          <div>
            <div className="flex w-full items-center justify-between    py-3">
              <div className="pr-4">
                <p className="text-sm font-medium text-gray-900">Keep category active</p>
                <p className="mt-1 text-xs text-gray-500">Active categories are visible and available for selection.</p>
              </div>
              <Form.Item name="status" valuePropName="checked" noStyle rules={[{ required: true, message: "Set the category status" }]}>
                <Switch checkedChildren="Active" unCheckedChildren="Inactive" className="shrink-0" />
              </Form.Item>
            </div>
          </div>

          {categoryType === CategoryType.PRODUCT && (
            <div className="rounded-lg border border-gray-200 bg-gray-50/60 p-4">
              <div className="mb-3">
                <p className="text-sm font-medium text-gray-900">Product Visibility</p>
                <p className="mt-1 text-xs text-gray-500">Choose where this category should appear.</p>
              </div>

              <div className="space-y-3">
                <Form.Item name="showInStorefront" valuePropName="checked" className="!mb-0">
                  <Checkbox>Show in Storefront</Checkbox>
                </Form.Item>
                <Form.Item name="showInPOS" valuePropName="checked" className="!mb-0">
                  <Checkbox>Show in POS</Checkbox>
                </Form.Item>
              </div>
            </div>
          )}
        </div>
      </Form>
    </AppModal>
  );
}
