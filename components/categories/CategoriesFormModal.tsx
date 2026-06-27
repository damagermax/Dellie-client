"use client";

import { Checkbox, Form, Switch } from "antd";
import { UploadFile } from "antd/es/upload";
import { useEffect, useMemo, useState } from "react";
import { AppModal, ModalProps } from "../ui/AppModal";
import { InputFormItem, TextAreaFormItem } from "../ui/AppFormItems";
import { Category, CategoryCreateInput, CategoryStatus, CategoryType } from "@/types/category";
import { useCreateCategoryMutation, useUpdateCategoryMutation } from "@/lib/redux/services";
import AppSingleImagePicker from "../ui/AppSingleImagePicker";

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
  const [imageFiles, setImageFiles] = useState<UploadFile[]>([]);

  const [createCategory, { isLoading: isCreating }] = useCreateCategoryMutation();
  const [updateCategory, { isLoading: isUpdating }] = useUpdateCategoryMutation();

  const handleSubmit = async (values: CategoryFormValues) => {
    const payload = new FormData();
    const nextStatus = values.status ? CategoryStatus.ACTIVE : CategoryStatus.INACTIVE;
    const hasExistingImage = Boolean(initialValues?.imageUrl);
    const selectedImage = imageFiles[0];
    const hasNewImage = Boolean(selectedImage?.originFileObj);

    payload.append("name", values.name);
    payload.append("type", categoryType);
    payload.append("status", nextStatus);
    payload.append("description", values.description || "");
    payload.append("showInStorefront", String(categoryType === CategoryType.PRODUCT ? Boolean(values.showInStorefront) : false));
    payload.append("showInPOS", String(categoryType === CategoryType.PRODUCT ? Boolean(values.showInPOS) : false));

    if (hasNewImage) {
      payload.append("image", selectedImage.originFileObj as File);
    } else if (hasExistingImage && imageFiles.length === 0) {
      payload.append("removeImage", "true");
    }

    if (initialValues?.id) {
      await updateCategory({ id: initialValues.id, data: payload }).unwrap();
    } else {
      await createCategory(payload).unwrap();
    }

    categoryForm.resetFields();
    setImageFiles([]);
    toggle();
  };

  useEffect(() => {
    if (open && initialValues) {
      setImageFiles(
        initialValues.imageUrl
          ? [
              {
                uid: initialValues.id,
                name: initialValues.name,
                status: "done",
                url: initialValues.imageUrl,
              },
            ]
          : [],
      );
      categoryForm.setFieldsValue({
        ...initialValues,
        status: initialValues.status === CategoryStatus.ACTIVE,
        showInStorefront: Boolean(initialValues.showInStorefront),
        showInPOS: Boolean(initialValues.showInPOS),
      });
      return;
    }

    if (open && !initialValues?.id) {
      setImageFiles([]);
      categoryForm.setFieldsValue({
        type: categoryType,
        status: true,
        showInStorefront: false,
        showInPOS: false,
      });
    }
  }, [categoryForm, categoryType, initialValues, open]);

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
          {categoryType === CategoryType.PRODUCT ? (
            <div className="flex items-start gap-4">
              <AppSingleImagePicker value={imageFiles} onChange={setImageFiles} size={72} />
              <div className="min-w-0">
                <p className="text-sm font-medium text-gray-900">Category image</p>
                <p className="mt-1 text-xs leading-5 text-gray-500">Optional image used to represent this category visually.</p>
              </div>
            </div>
          ) : null}

          <div className="grid ">
            <InputFormItem label="Name" name="name" placeholder="Enter category name" rules={[{ message: "Enter category name", required: true }]} />
          </div>

          {categoryType === CategoryType.EXPENSE ? <TextAreaFormItem label="Description" name="description" placeholder="Add a short description" /> : null}

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

          {categoryType === CategoryType.PRODUCT ? (
            <div className="">
              <p className="text-sm font-medium text-gray-900">Visibility</p>
              <div className="mt-3 space-y-3">
                <Form.Item name="showInStorefront" valuePropName="checked" className="!mb-0">
                  <Checkbox>Storefront</Checkbox>
                </Form.Item>
                <Form.Item name="showInPOS" valuePropName="checked" className="!mb-0">
                  <Checkbox>POS</Checkbox>
                </Form.Item>
              </div>
            </div>
          ) : null}
        </div>
      </Form>
    </AppModal>
  );
}
