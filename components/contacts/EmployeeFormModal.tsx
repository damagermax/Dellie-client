"use client";

import { Checkbox, Divider, Form, Select } from "antd";
import { useEffect, useMemo } from "react";

import { useCreateContactMutation, useDisableEmployeeAccessMutation, useEnableEmployeeAccessMutation, useGetContactQuery, useUpdateContactMutation } from "@/lib/redux/services";
import { Contact, ContactRole, ContactStatus, EmployeeAccessInput, EmployeeAccessResponse } from "@/types/contact";
import { StorePermission } from "@/types/store-access";
import {
  BaseContactFormModalProps,
  ContactAddressFields,
  ContactFormFrame,
  ContactFormValues,
  normalizeCurrencyId,
  useSeedContactFormDefaults,
} from "./contactFormShared";
import { InputFormItem, PhoneInputFormItem } from "../ui/AppFormItems";

const employeePermissionOptions = Object.values(StorePermission).map((permission) => ({
  value: permission,
  label: permission.replaceAll(".", " ").replace(/\b\w/g, (value) => value.toUpperCase()),
}));

const STORE_PERMISSION_VALUES = Object.values(StorePermission) as StorePermission[];

function normalizePermissions(permissions?: string[] | StorePermission[] | null): StorePermission[] {
  return (permissions || []).filter((permission): permission is StorePermission => STORE_PERMISSION_VALUES.includes(permission as StorePermission));
}

function hasEmployeeAccess(contact?: Contact | null) {
  if (!contact) return false;
  return Boolean(contact.employeeAccess?.status && contact.employeeAccess.status !== "disabled");
}

type EmployeeFormValues = ContactFormValues & {
  enableEmployeeAccess?: boolean;
  employeeRole?: string;
  employeePermissions?: StorePermission[];
};

export default function EmployeeFormModal({ open, toggle, initialValues, onSaved }: BaseContactFormModalProps) {
  const [form] = Form.useForm<EmployeeFormValues>();
  const { data: contactData, isSuccess } = useGetContactQuery(initialValues?.id || "", { skip: !initialValues?.id, refetchOnMountOrArgChange: true });
  const [createContact, { isLoading: isCreating }] = useCreateContactMutation();
  const [updateContact, { isLoading: isUpdating }] = useUpdateContactMutation();
  const [enableEmployeeAccess, { isLoading: isEnablingEmployeeAccess }] = useEnableEmployeeAccessMutation();
  const [disableEmployeeAccess, { isLoading: isDisablingEmployeeAccess }] = useDisableEmployeeAccessMutation();

  const defaultEmployeePermissions = useMemo(() => [StorePermission.CONTACTS_VIEW, StorePermission.SALES_VIEW], []);
  const employeeAccessEnabled = Form.useWatch("enableEmployeeAccess", form);

  useSeedContactFormDefaults({
    form: form as ReturnType<typeof Form.useForm<ContactFormValues>>[0],
    open,
    initialValues,
    contactData,
    fallbackRoles: [ContactRole.EMPLOYEE],
  });

  useEffect(() => {
    if (!open) return;

    const source = contactData || initialValues;
    if (!source) {
      form.setFieldsValue({
        employeeRole: "staff",
        employeePermissions: defaultEmployeePermissions,
        enableEmployeeAccess: false,
      });
      return;
    }

    const normalizedPermissions = normalizePermissions(source.employeeAccess?.permissions);
    form.setFieldsValue({
      ...source,
      currencyId: normalizeCurrencyId(source.currencyId),
      roles: [ContactRole.EMPLOYEE],
      enableEmployeeAccess: hasEmployeeAccess(source),
      employeePermissions: normalizedPermissions.length ? normalizedPermissions : defaultEmployeePermissions,
      employeeRole: source.employeeAccess?.role || "staff",
    });
  }, [contactData, defaultEmployeePermissions, form, initialValues, open]);

  const closeAndReset = () => {
    form.resetFields();
    onSaved?.();
    toggle();
  };

  const handleSubmit = async (values: EmployeeFormValues) => {
    if (isCreating || isUpdating || isEnablingEmployeeAccess || isDisablingEmployeeAccess) return;

    const normalizedCurrencyId = typeof values.currencyId === "string" ? values.currencyId : values.currencyId?.id;
    const payload = {
      ...values,
      currencyId: normalizedCurrencyId,
      roles: [ContactRole.EMPLOYEE],
      status: values.status || initialValues?.status || ContactStatus.ACTIVE,
    };

    const response = initialValues?.id ? await updateContact({ id: initialValues.id, ...payload }).unwrap() : await createContact(payload).unwrap();
    const savedContact = (response as EmployeeAccessResponse)?.contact || (response as Contact);

    if (savedContact?.id && values.enableEmployeeAccess) {
      await enableEmployeeAccess({
        id: savedContact.id,
        body: {
          role: values.employeeRole,
          permissions: values.employeePermissions,
        } as EmployeeAccessInput,
      }).unwrap();
    }

    if (hasEmployeeAccess(contactData || initialValues) && !values.enableEmployeeAccess) {
      await disableEmployeeAccess(savedContact.id).unwrap();
    }

    closeAndReset();
  };

  const saving = isCreating || isUpdating || isEnablingEmployeeAccess || isDisablingEmployeeAccess;

  return (
    <ContactFormFrame title={initialValues ? "Edit Employee" : "New Employee"} open={open} toggle={toggle} saving={saving} form={form as ReturnType<typeof Form.useForm<ContactFormValues>>[0]} onSubmit={handleSubmit as (values: ContactFormValues) => Promise<void>}>
      <InputFormItem className="col-span-2 sm:col-span-1" label="Name" name="name" placeholder="Enter name" rules={[{ required: true, message: "Please enter name" }]} />
      <PhoneInputFormItem className="col-span-2 sm:col-span-1" label="Work Phone" name="phone" placeholder="Work Phone" rules={[{ required: true, message: "Enter work phone" }]} />
      <PhoneInputFormItem className="col-span-2 sm:col-span-1" label="Mobile" name="mobile" placeholder="Mobile" />
      <InputFormItem
        className="col-span-2 sm:col-span-1"
        label="Email"
        name="email"
        placeholder="Enter email"
        rules={[
          { required: true, message: "Enter email" },
          { type: "email", message: "Enter a valid email address" },
        ]}
      />

      <Divider className="!my-0 col-span-2" />

      <section className="col-span-2 rounded-md border border-gray-200 bg-gray-50 p-4">
        <div className="flex items-center justify-between gap-4">
          <div>
            <p className="text-sm font-semibold text-gray-900">Employee Access</p>
            <p className="mt-1 text-xs text-gray-500">Create a store user and choose what this person can do inside the store.</p>
          </div>
          <Form.Item className="!mb-0" name="enableEmployeeAccess" valuePropName="checked">
            <Checkbox>Enable access</Checkbox>
          </Form.Item>
        </div>

        {employeeAccessEnabled && (
          <div className="mt-4 grid gap-4 md:grid-cols-2">
            <Form.Item label="Employee Role" name="employeeRole" rules={[{ required: true, message: "Select employee role" }]}>
              <Select
                options={[
                  { value: "staff", label: "Staff" },
                  { value: "manager", label: "Manager" },
                ]}
                placeholder="Select employee role"
              />
            </Form.Item>

            <Form.Item label="Permissions" name="employeePermissions" rules={[{ required: true, message: "Select at least one permission" }]}>
              <Select mode="multiple" allowClear options={employeePermissionOptions} placeholder="Select permissions" />
            </Form.Item>
          </div>
        )}
      </section>

      <ContactAddressFields />
    </ContactFormFrame>
  );
}
