"use client";

import { useCreateContactMutation, useUpdateContactMutation, useGetContactQuery } from "@/lib/redux/services";
import { Contact, CreateContactInput, ContactRole, UpdateContactInput } from "@/types/contact";
import { InputFormItem, PhoneInputFormItem, DatePickerFormItem, TextAreaFormItem } from "../ui/AppFormItems";
import { AppModal, ModalProps } from "../ui/AppModal";
import { useEffect, useState } from "react";
import { Form } from "antd";

import { SearchableCurrenciesSelect } from "../system/SearchableCurrencySelect";

interface ContactsFormModalProps extends ModalProps {
  initialValues?: Contact;
}

type ContactsFormValues = CreateContactInput | UpdateContactInput;

const roleKeys = Object.values(ContactRole);

export default function ContactsFormModal({ open, toggle, initialValues }: ContactsFormModalProps) {
  const storeCurrencyId = JSON.parse(localStorage.getItem("user")!)?.store?.currencyId;

  const [contactsForm] = Form.useForm();

  const { data: contactData, isSuccess } = useGetContactQuery(initialValues?.id || "", { skip: !initialValues?.id, refetchOnMountOrArgChange: true });

  const [createContact, { isLoading: isCreating, isSuccess: createSuccess }] = useCreateContactMutation();
  const [updateContact, { isLoading: isUpdating, isSuccess: updateSuccess }] = useUpdateContactMutation();

  const [selectedRoles, setSelectedRoles] = useState<ContactRole[]>([]);

  const toggleRole = (role: ContactRole) => {
    setSelectedRoles((prev) => (prev.includes(role) ? prev.filter((r) => r !== role) : [...prev, role]));
  };

  useEffect(() => {
    if (!initialValues) {
      contactsForm.setFieldsValue({ currencyId: storeCurrencyId });
    }
  }, [initialValues]);

  useEffect(() => {
    if (contactData && isSuccess) {
      contactsForm.setFieldsValue(contactData);
    }
  }, [contactData, isSuccess]);

  useEffect(() => {
    if (updateSuccess || createSuccess) {
      contactsForm.resetFields();
      toggle();
    }
  }, [updateSuccess, createSuccess]);

  const handleSubmit = async (values: ContactsFormValues) => {
    if (isCreating || isUpdating) return;

    const roles = selectedRoles;

    if (initialValues?.id) {
      await updateContact({ id: initialValues?.id, ...values });
    } else {
      await createContact({ ...values } as CreateContactInput);
    }
  };

  return (
    <AppModal title={initialValues ? "Edit Contact" : "New Contact"} onOk={contactsForm.submit} okText={isCreating || isUpdating ? "Saving..." : "Save"} width={600} open={open} toggle={toggle}>
      <Form size="small" disabled={isCreating || isUpdating} onFinish={handleSubmit} form={contactsForm} initialValues={initialValues} layout={"vertical"}>
        <div className=" p-5 px-5  gap-x-12 ">
          <div className=" grid grid-cols-2 gap-x-5">
            <InputFormItem label="Name" name="name" placeholder="Enter   name" rules={[{ required: true, message: "Please enter name" }]} />
            <InputFormItem label="Display Name" name="displayName" placeholder="Enter  display name" />
            <Form.Item label="Currency" name="currencyId" rules={[{ required: true, message: "Select contact currency" }]}>
              <SearchableCurrenciesSelect />
            </Form.Item>
            <InputFormItem label="Email" name="email" placeholder="Enter  email" />
            <PhoneInputFormItem label="Work Phone" name="phone" placeholder="Work Phone" rules={[{ required: true, message: "Enter work phone" }]} />
            <PhoneInputFormItem label="Mobile" name="mobile" placeholder="Mobil" />
          </div>
          {/* <p>Tags</p>
          <div className="flex gap-2  mt-2 flex-wrap">
            {roleKeys.map((role) => (
              <button
                type="button"
                key={role}
                onClick={() => toggleRole(role)}
                className={`px-3 py-1 cursor-pointer hover:text-white hover:bg-gray-700 rounded-full border  border-gray-200 ${selectedRoles.includes(role) ? "bg-gray-700 text-white" : "bg-gray-50 text-gray-700"}`}
              >
                {role.charAt(0).toUpperCase() + role.slice(1)}
              </button>
            ))}
          </div> */}
          {!initialValues && (
            <div className=" ">
              <p>Opening Balance</p>

              <div className=" grid grid-cols-3 gap-x-5 border border-solid border-gray-200 bg-gray-100 pt-4 px-4 mt-2 rounded-xl">
                <InputFormItem label="Amount" name="balanceAmount" type="number" placeholder="Amount" />
                <InputFormItem label="Exchange Rate" name="balanceRate" type="number" placeholder="Exchange Rate" />
                <DatePickerFormItem label="Balance As At" name="balanceAsAt" />
              </div>
            </div>
          )}

          {initialValues && <TextAreaFormItem label="Note" name="note" />}
        </div>
      </Form>
    </AppModal>
  );
}
