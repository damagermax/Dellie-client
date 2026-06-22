"use client";

import { Checkbox, Divider, Form, Select } from "antd";
import { useEffect, useMemo } from "react";
import { FiShoppingBag, FiUser, FiUserCheck } from "react-icons/fi";

import { useCreateContactMutation, useDisableEmployeeAccessMutation, useEnableEmployeeAccessMutation, useGetContactQuery, useUpdateContactMutation } from "@/lib/redux/services";
import { Contact, ContactRole, ContactStatus, CreateContactInput, EmployeeAccessInput, EmployeeAccessResponse, UpdateContactInput } from "@/types/contact";
import { StorePermission } from "@/types/store-access";
import { AppModal, ModalProps } from "../ui/AppModal";
import { InputFormItem, PhoneInputFormItem, TextAreaFormItem } from "../ui/AppFormItems";
import { SearchableCurrenciesSelect } from "../system/SearchableCurrencySelect";

interface ContactsFormModalProps extends ModalProps {
  initialValues?: Contact;
  onSaved?: () => void;
}

type ContactsFormValues = CreateContactInput &
  UpdateContactInput & {
    roles?: ContactRole[];
    enableEmployeeAccess?: boolean;
    employeeRole?: string;
    employeePermissions?: StorePermission[];
  };

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
  {
    value: ContactRole.EMPLOYEE,
    title: "Employee",
    description: "Team members who can log in and work in the store.",
    icon: FiUserCheck,
  },
] as const;

export default function ContactsFormModal({ open, toggle, initialValues, onSaved }: ContactsFormModalProps) {
  const storeCurrencyId = typeof window !== "undefined" ? JSON.parse(localStorage.getItem("user") || "{}")?.store?.currencyId : undefined;
  const [contactsForm] = Form.useForm<ContactsFormValues>();

  const { data: contactData, isSuccess } = useGetContactQuery(initialValues?.id || "", { skip: !initialValues?.id, refetchOnMountOrArgChange: true });
  const [createContact, { isLoading: isCreating }] = useCreateContactMutation();
  const [updateContact, { isLoading: isUpdating }] = useUpdateContactMutation();
  const [enableEmployeeAccess, { isLoading: isEnablingEmployeeAccess }] = useEnableEmployeeAccessMutation();
  const [disableEmployeeAccess, { isLoading: isDisablingEmployeeAccess }] = useDisableEmployeeAccessMutation();

  const watchedRoles = Form.useWatch("roles", contactsForm);
  const selectedRoles = useMemo(() => watchedRoles || [], [watchedRoles]);
  const employeeAccessEnabled = Form.useWatch("enableEmployeeAccess", contactsForm);

  const defaultEmployeePermissions = useMemo(() => [StorePermission.CONTACTS_VIEW, StorePermission.SALES_VIEW], []);

  useEffect(() => {
    if (!initialValues) {
      contactsForm.setFieldsValue({
        currencyId: storeCurrencyId,
        roles: [],
        enableEmployeeAccess: false,
        employeePermissions: defaultEmployeePermissions,
        employeeRole: "staff",
      });
    }
  }, [contactsForm, defaultEmployeePermissions, initialValues, storeCurrencyId]);

  useEffect(() => {
    if (initialValues && !contactData) {
      const normalizedCurrencyId = typeof initialValues.currencyId === "string" ? initialValues.currencyId : initialValues.currencyId?.id;
      contactsForm.setFieldsValue({
        ...initialValues,
        currencyId: normalizedCurrencyId,
        roles: (initialValues.roles || []).filter((role) => Object.values(ContactRole).includes(role)),
        enableEmployeeAccess: hasEmployeeAccess(initialValues),
        employeePermissions: normalizePermissions(initialValues.employeeAccess?.permissions).length ? normalizePermissions(initialValues.employeeAccess?.permissions) : defaultEmployeePermissions,
        employeeRole: initialValues.employeeAccess?.role || "staff",
      });
    }
  }, [contactData, contactsForm, defaultEmployeePermissions, initialValues]);

  useEffect(() => {
    if (contactData && isSuccess) {
      const normalizedPermissions = normalizePermissions(contactData.employeeAccess?.permissions);
      const normalizedCurrencyId = typeof contactData.currencyId === "string" ? contactData.currencyId : contactData.currencyId?.id;
      const employeeAccessIsEnabled = hasEmployeeAccess(contactData);

      contactsForm.setFieldsValue({
        ...contactData,
        currencyId: normalizedCurrencyId,
        roles: (contactData.roles || []).filter((role) => Object.values(ContactRole).includes(role)),
        enableEmployeeAccess: employeeAccessIsEnabled,
        employeePermissions: normalizedPermissions.length ? normalizedPermissions : defaultEmployeePermissions,
        employeeRole: contactData.employeeAccess?.role || "staff",
      });
    }
  }, [contactData, contactsForm, defaultEmployeePermissions, isSuccess]);

  useEffect(() => {
    if (selectedRoles.length > 0 && !selectedRoles.includes(ContactRole.EMPLOYEE)) {
      contactsForm.setFieldsValue({
        enableEmployeeAccess: false,
      });
    }
  }, [contactsForm, selectedRoles]);

  const closeAndReset = () => {
    contactsForm.resetFields();
    onSaved?.();
    toggle();
  };

  const handleSubmit = async (values: ContactsFormValues) => {
    if (isCreating || isUpdating || isEnablingEmployeeAccess || isDisablingEmployeeAccess) return;

    const normalizedCurrencyId = typeof values.currencyId === "string" ? values.currencyId : values.currencyId?.id;
    const payload: CreateContactInput | UpdateContactInput = {
      ...values,
      currencyId: normalizedCurrencyId,
      roles: (values.roles || []).filter((role) => Object.values(ContactRole).includes(role)),
      status: values.status || initialValues?.status || ContactStatus.ACTIVE,
    } as CreateContactInput | UpdateContactInput;

    const response = initialValues?.id ? await updateContact({ id: initialValues.id, ...payload }).unwrap() : await createContact(payload as CreateContactInput).unwrap();
    const savedContact = (response as EmployeeAccessResponse)?.contact || (response as Contact);
    const wantsEmployeeAccess = values.enableEmployeeAccess && values.roles?.includes(ContactRole.EMPLOYEE);

    if (savedContact?.id && wantsEmployeeAccess) {
      await enableEmployeeAccess({
        id: savedContact.id,
        body: {
          role: values.employeeRole,
          permissions: values.employeePermissions,
        } as EmployeeAccessInput,
      }).unwrap();
    }

    if (hasEmployeeAccess(contactData || initialValues) && !wantsEmployeeAccess) {
      await disableEmployeeAccess(savedContact.id).unwrap();
    }

    closeAndReset();
  };

  const saving = isCreating || isUpdating || isEnablingEmployeeAccess || isDisablingEmployeeAccess;

  return (
    <AppModal title={initialValues ? "Edit Contact" : "New Contact"} onOk={contactsForm.submit} okText={saving ? "Saving..." : "Save"} width={760} open={open} toggle={toggle}>
      <Form size="small" disabled={saving} onFinish={handleSubmit} form={contactsForm} layout="vertical">
        <div className="grid gap-x-4 p-5">
          <div className="grid grid-cols-2 gap-x-5 gap-y-4">
            <InputFormItem label="Name" name="name" placeholder="Enter name" rules={[{ required: true, message: "Please enter name" }]} />
            <InputFormItem label="Display Name" name="displayName" placeholder="Enter display name" />
            <Form.Item label="Currency" name="currencyId" rules={[{ required: true, message: "Select contact currency" }]}>
              <SearchableCurrenciesSelect />
            </Form.Item>
            <InputFormItem label="Email" name="email" placeholder="Enter email" />
            <PhoneInputFormItem label="Work Phone" name="phone" placeholder="Work Phone" rules={[{ required: true, message: "Enter work phone" }]} />
            <PhoneInputFormItem label="Mobile" name="mobile" placeholder="Mobile" />

            <Divider className="!my-0 col-span-2" />

            <Form.Item className="col-span-2" label="Contact Roles" name="roles" help="">
              <RolePicker />
            </Form.Item>
          </div>

          {selectedRoles.includes(ContactRole.EMPLOYEE) && (
            <section className="rounded-md border border-gray-200 bg-gray-50 p-4">
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
                <div className=" grid -grid-cols-2 mb-4 gap-4">
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
          )}

          <Divider className="!my-6" />

          <Divider className="!my-0" />

          {initialValues && <TextAreaFormItem label="Note" name="note" />}
        </div>
      </Form>
    </AppModal>
  );
}

function RolePicker({ value = [], onChange }: { value?: ContactRole[]; onChange?: (roles: ContactRole[]) => void }) {
  const toggleRole = (role: ContactRole) => {
    const nextRoles = value.includes(role) ? value.filter((item) => item !== role) : [...value, role];
    onChange?.(nextRoles);
  };

  return (
    <div className="grid gap-3 sm:grid-cols-3">
      {contactRoleCards.map(({ value: role, title, description, icon: Icon }) => {
        const selected = value.includes(role);

        return (
          <button
            key={role}
            type="button"
            onClick={() => toggleRole(role)}
            className={["group  rounded-md border px-2 py-3 text-left transition-all duration-200", selected ? "border-purple-500 bg-purple-50 shadow-sm ring-1 ring-purple-100" : "border-gray-200 bg-white hover:border-gray-300 hover:bg-gray-50"].join(" ")}
          >
            <div className="flex items-start gap-3">
              <div className={["flex  items-center justify-center rounded-xl transition-colors", selected ? "bg-purple-600 text-white" : "bg-gray-100 text-gray-500"].join(" ")}>
                <Icon size={18} />
              </div>
              <div className="min-w-0 flex-1">
                <div className="flex items-center justify-between gap-2">
                  <p className={["text-sm font-semibold", selected ? "text-purple-900" : "text-gray-900"].join(" ")}>{title}</p>
                  <span className={["inline-flex h-2.5 w-2.5 rounded-full transition-colors", selected ? "bg-purple-500" : "bg-gray-200"].join(" ")} />
                </div>
                <p className={[" text-xs ", selected ? "text-purple-700" : "text-gray-500"].join(" ")}>{description}</p>
              </div>
            </div>
          </button>
        );
      })}
    </div>
  );
}
