"use client";

import { Divider, Form } from "antd";
import { useEffect, useMemo } from "react";
import { FiShoppingBag, FiUser } from "react-icons/fi";

import { Contact, ContactRole, ContactStatus, CreateContactInput, UpdateContactInput } from "@/types/contact";
import { AppModal, ModalProps } from "../ui/AppModal";
import { InputFormItem, PhoneInputFormItem } from "../ui/AppFormItems";

export interface BaseContactFormModalProps extends ModalProps {
  initialValues?: Contact;
  onSaved?: () => void;
}

export type ContactFormValues = CreateContactInput &
  UpdateContactInput & {
    roles?: ContactRole[];
  };

const contactRoleCards = [
  {
    value: ContactRole.CUSTOMER,
    title: "Customer",
    description: "People who buy products or services from you.",
    icon: FiUser,
  },
  {
    value: ContactRole.SUPPLIER,
    title: "Supplier",
    description: "People or businesses that provide stock and services.",
    icon: FiShoppingBag,
  },
] as const;

export function useStoreCurrencyId() {
  return useMemo(
    () => (typeof window !== "undefined" ? JSON.parse(localStorage.getItem("user") || "{}")?.store?.currencyId : undefined),
    [],
  );
}

export function normalizeCurrencyId(value: Contact["currencyId"] | string | undefined) {
  return typeof value === "string" ? value : value?.id;
}

export function useSeedContactFormDefaults({
  form,
  open,
  initialValues,
  contactData,
  fallbackRoles,
}: {
  form: ReturnType<typeof Form.useForm<ContactFormValues>>[0];
  open: boolean;
  initialValues?: Contact;
  contactData?: Contact;
  fallbackRoles: ContactRole[];
}) {
  const storeCurrencyId = useStoreCurrencyId();

  useEffect(() => {
    if (!open) return;

    if (contactData || initialValues) {
      const source = contactData || initialValues;
      form.setFieldsValue({
        ...source,
        currencyId: normalizeCurrencyId(source?.currencyId),
        roles: (source?.roles || fallbackRoles).filter((role) => Object.values(ContactRole).includes(role) && role !== ContactRole.EMPLOYEE),
      });
      return;
    }

    form.resetFields();
    form.setFieldsValue({
      currencyId: storeCurrencyId,
      roles: fallbackRoles,
      status: ContactStatus.ACTIVE,
    });
  }, [contactData, fallbackRoles, form, initialValues, open, storeCurrencyId]);
}

export function ContactCoreFields() {
  return (
    <>
      <InputFormItem className="col-span-2 sm:col-span-1" label="Name" name="name" placeholder="Enter name" rules={[{ required: true, message: "Please enter name" }]} />
      <PhoneInputFormItem className="col-span-2 sm:col-span-1" label="Work Phone" name="phone" placeholder="Work Phone" rules={[{ required: true, message: "Enter work phone" }]} />
      <PhoneInputFormItem className="col-span-2 sm:col-span-1" label="Mobile" name="mobile" placeholder="Mobile" />
      <InputFormItem className="col-span-2 sm:col-span-1" label="Email" name="email" placeholder="Enter email" />
    </>
  );
}

export function ContactAddressFields() {
  return (
    <>
      <Divider className="!my-0 col-span-2" />
      <div className="col-span-2">
        <p className="text-sm font-semibold text-gray-900">Primary Address</p>
        <p className="mt-1 text-xs text-gray-500">Add the main delivery or billing address for this contact.</p>
      </div>
      <InputFormItem className="col-span-2" label="Address" name={["addresses", 0, "street"]} placeholder="Address" />
    </>
  );
}

export function ContactFormFrame({
  title,
  open,
  toggle,
  saving,
  form,
  onSubmit,
  children,
}: {
  title: string;
  open: boolean;
  toggle: () => void;
  saving: boolean;
  form: ReturnType<typeof Form.useForm<ContactFormValues>>[0];
  onSubmit: (values: ContactFormValues) => Promise<void>;
  children: React.ReactNode;
}) {
  return (
    <AppModal title={title} onOk={form.submit} okText={saving ? "Saving..." : "Save"} width={760} open={open} toggle={toggle}>
      <Form size="small" disabled={saving} onFinish={onSubmit} form={form} layout="vertical">
        <div className="grid gap-x-4 p-5">
          <div className="grid grid-cols-2 gap-x-5 gap-y-4">{children}</div>
          <Divider className="!my-6" />
        </div>
      </Form>
    </AppModal>
  );
}

export function ContactRolePicker({ value = [], onChange }: { value?: ContactRole[]; onChange?: (roles: ContactRole[]) => void }) {
  const toggleRole = (role: ContactRole) => {
    const nextRoles = value.includes(role) ? value.filter((item) => item !== role) : [...value, role];
    onChange?.(nextRoles);
  };

  return (
    <div className="grid gap-3 sm:grid-cols-2">
      {contactRoleCards.map(({ value: role, title, description, icon: Icon }) => {
        const selected = value.includes(role);

        return (
          <button
            key={role}
            type="button"
            onClick={() => toggleRole(role)}
            className={["group rounded-md border px-2 py-3 text-left transition-all duration-200", selected ? "border-purple-500 bg-purple-50 shadow-sm ring-1 ring-purple-100" : "border-gray-200 bg-white hover:border-gray-300 hover:bg-gray-50"].join(" ")}
          >
            <div className="flex items-start gap-3">
              <div className={["flex items-center justify-center rounded-xl transition-colors", selected ? "bg-purple-600 text-white" : "bg-gray-100 text-gray-500"].join(" ")}>
                <Icon size={18} />
              </div>
              <div className="min-w-0 flex-1">
                <div className="flex items-center justify-between gap-2">
                  <p className={["text-sm font-semibold", selected ? "text-purple-900" : "text-gray-900"].join(" ")}>{title}</p>
                  <span className={["inline-flex h-2.5 w-2.5 rounded-full transition-colors", selected ? "bg-purple-500" : "bg-gray-200"].join(" ")} />
                </div>
                <p className={["text-xs", selected ? "text-purple-700" : "text-gray-500"].join(" ")}>{description}</p>
              </div>
            </div>
          </button>
        );
      })}
    </div>
  );
}
