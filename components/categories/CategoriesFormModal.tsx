"use client";
import { Form, Radio, Segmented, Switch } from "antd";

import { InputFormItem, SelectFormItem, TextAreaFormItem } from "../ui/AppFormItems";
import { AppModal, ModalProps } from "../ui/AppModal";
import MultiImageUploader from "../ui/MultiImageUploader";
import { Category, CategoryCreateInput, CategoryUpdateInput, CategoryType } from "@/types/category";

import { useEffect, useState } from "react";

import { useCreateCategoryMutation, useGetSelectableExpenseAccountsQuery, useUpdateCategoryMutation, useGetCategoryQuery } from "@/lib/redux/services";
import { BannerImageUpload } from "../ui/BannerImageUpload";

interface CategoriesFormModalProp extends ModalProps {
  initialValues?: Category;
  categoryOptions?: { value: string; label: string }[];
  type?: CategoryType;
}

type CategoryFormValues = CategoryCreateInput | CategoryUpdateInput;

export default function CategoriesFormModal({ open, toggle, initialValues, categoryOptions, type }: CategoriesFormModalProp) {
  const [categoryForm] = Form.useForm();
  const [categoryType, setCategoryType] = useState(initialValues?.type || type);

  const { data: categoryData, isSuccess } = useGetCategoryQuery(initialValues?.id || "", { skip: !initialValues?.id, refetchOnMountOrArgChange: true });

  const [createCategory, { isLoading: isCreating, isSuccess: createSuccess }] = useCreateCategoryMutation();
  const [updateCategory, { isLoading: isUpdating, isSuccess: updateSuccess }] = useUpdateCategoryMutation();

  const handleSubmit = async (values: CategoryFormValues) => {
    console.log("values", values);

    if (initialValues?.id) {
      await updateCategory({ id: initialValues?.id, ...values });
    } else {
      await createCategory({ ...values, type: categoryType!! } as CategoryCreateInput);
    }
  };

  useEffect(() => {
    if (categoryData && isSuccess) {
      categoryForm.setFieldsValue({ ...categoryData, expenseAccountId: categoryData.expenseAccountId });
    }
  }, [categoryData, isSuccess]);

  useEffect(() => {
    if (updateSuccess || createSuccess) {
      categoryForm.resetFields();
      toggle();
    }
  }, [updateSuccess, createSuccess]);

  return (
    <AppModal title={initialValues ? "Edit Category" : "Create Category"} width={500} open={open} toggle={toggle} onOk={() => categoryForm.submit()} okText={isCreating || isUpdating ? "Saving..." : "Save"}>
      <Form size="small" form={categoryForm} layout="vertical" onFinish={handleSubmit} initialValues={{ ...initialValues, expenseAccountId: initialValues?.expenseAccountId }}>
        <div className="space-y-4 p-5 px-6 gap-x-12">
          {categoryType == CategoryType.PRODUCT && (
            <div className=" flex gap-x-5 items-end">
              <Form.Item name="image" noStyle getValueFromEvent={(values) => values?.[0]?.originFileObj}>
                <MultiImageUploader maxCount={1} />
              </Form.Item>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Category Image (optional)</label>
                <p className="text-xs text-gray-500 mb-3 w-[70%]">Upload a representative image for this category (Max 1 image)</p>
              </div>
            </div>
          )}

          <div className={!categoryOptions ? "col-span-1" : "grid grid-cols-2 gap-x-5"}>
            <InputFormItem label="Name" name="name" placeholder="Enter category name" rules={[{ message: "Enter category name", required: true }]} />

            {categoryOptions && (
              <SelectFormItem
                placeholder="Select related category"
                name="parentId"
                label="Related to"
                options={[
                  {
                    label: "Electronics",
                    value: "2",
                  },
                  {
                    label: "Fashion",
                    value: "3",
                  },
                ]}
              />
            )}
          </div>

          <TextAreaFormItem label="Description (optional)" name="description" />
        </div>
      </Form>
    </AppModal>
  );
}
