"use client";
import { Form } from "antd";
import { ColorFormItem, InputFormItem, SelectFormItem, TextAreaFormItem } from "../ui/AppFormItems";
import { AppModal, ModalProps } from "../ui/AppModal";
import { Tag, TagCreateInput } from "../../types/tag";
import { useEffect } from "react";

import { useUpdateTagMutation, useCreateTagMutation, useGetTagQuery } from "@/lib/redux/services";

interface TagsFormModalProps extends ModalProps {
  initialValues?: Tag;
}

type TagsFormValues = Omit<Partial<Tag>, "id">;

export default function TagsFormModal({ open, toggle, initialValues }: TagsFormModalProps) {
  const [tagsForm] = Form.useForm();

  const { data: tagData, isSuccess } = useGetTagQuery(initialValues?.id || "", { skip: !initialValues?.id, refetchOnMountOrArgChange: true });
  const [createTag, { isLoading: isCreating, isSuccess: createSuccess }] = useCreateTagMutation();
  const [updateTag, { isLoading: isUpdating, isSuccess: updateSuccess }] = useUpdateTagMutation();

  useEffect(() => {
    if (tagData && isSuccess) {
      tagsForm.setFieldsValue(tagData);
    }
  }, [tagData, isSuccess]);

  useEffect(() => {
    if (updateSuccess || createSuccess) {
      tagsForm.resetFields();
      toggle();
    }
  }, [updateSuccess, createSuccess]);

  const handleSubmit = async (values: TagsFormValues) => {
    if (initialValues?.id) {
      await updateTag({ id: initialValues?.id, ...values });
    } else {
      await createTag(values as TagCreateInput);
    }
  };

  return (
    <AppModal title={initialValues ? "Edit Tag" : "Create Tag"} onOk={tagsForm.submit} width={500} okText={isCreating || isUpdating ? "Saving.." : "Save"} open={open} toggle={toggle}>
      <Form size="small" disabled={isCreating || isUpdating} onFinish={handleSubmit} form={tagsForm} initialValues={initialValues} layout={"vertical"}>
        <div className="p-5 px-8 gap-x-12">
          <div className="space-y-4">
            <InputFormItem label="Name" name="name" placeholder="Enter tag name" rules={[{ required: true, message: "Please enter a tag name" }] as any} />
            <TextAreaFormItem label="Description (Optional)" name="description" placeholder="Enter tag description" />
            <div className="grid grid-cols-2 gap-4">
              <ColorFormItem label="Color" name="color" />
              <SelectFormItem
                label="Status"
                name="status"
                placeholder="Select tag status"
                rules={[{ required: true, message: "Please select a tag status" }] as any}
                options={[
                  { value: "active", label: "Active" },
                  { value: "inactive", label: "Inactive" },
                ]}
              />
            </div>
          </div>
        </div>
      </Form>
    </AppModal>
  );
}
