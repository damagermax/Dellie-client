"use client";
import { Form } from "antd";

import { InputFormItem, TextAreaFormItem } from "../ui/AppFormItems";
import { AppModal, ModalProps } from "../ui/AppModal";

export default function StoreTeamFormModal({ open, toggle }: ModalProps) {
  const [categoryForm] = Form.useForm();

  return (
    <AppModal title="New Member" width={600} open={open} toggle={toggle}>
      <Form size="small" form={categoryForm} layout={"vertical"}>
        <div className=" p-5 px-8  gap-x-12 ">
          <InputFormItem label="Username" name="firstName" placeholder="Enter  fist name" />
          <InputFormItem label="Email" name="email" placeholder="Enter  email" />
          <InputFormItem label="Phone" name="phone" placeholder="Enter  phone" />
        </div>
      </Form>
    </AppModal>
  );
}
