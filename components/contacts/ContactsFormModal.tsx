"use client";

import { Divider, Form } from "antd";

import { useCreateContactMutation, useGetContactQuery, useUpdateContactMutation } from "@/lib/redux/services";
import { ContactRole, ContactStatus, CreateContactInput, UpdateContactInput } from "@/types/contact";
import {
  BaseContactFormModalProps,
  ContactAddressFields,
  ContactCoreFields,
  ContactFormFrame,
  ContactFormValues,
  ContactRolePicker,
  useSeedContactFormDefaults,
} from "./contactFormShared";

interface ContactsFormModalProps extends BaseContactFormModalProps {
  hideRoles?: boolean;
  defaultRoles?: ContactRole[];
}

export default function ContactsFormModal({ open, toggle, initialValues, onSaved, hideRoles = false, defaultRoles }: ContactsFormModalProps) {
  const [contactsForm] = Form.useForm<ContactsFormValues>();
  const fallbackRoles = defaultRoles?.filter((role) => role !== ContactRole.EMPLOYEE).length ? defaultRoles.filter((role) => role !== ContactRole.EMPLOYEE) : [ContactRole.CUSTOMER];
  const { data: contactData } = useGetContactQuery(initialValues?.id || "", { skip: !initialValues?.id, refetchOnMountOrArgChange: true });
  const [createContact, { isLoading: isCreating }] = useCreateContactMutation();
  const [updateContact, { isLoading: isUpdating }] = useUpdateContactMutation();

  useSeedContactFormDefaults({
    form: contactsForm,
    open,
    initialValues,
    contactData,
    fallbackRoles,
  });

  const closeAndReset = () => {
    contactsForm.resetFields();
    onSaved?.();
    toggle();
  };

  const handleSubmit = async (values: ContactsFormValues) => {
    if (isCreating || isUpdating) return;

    const normalizedCurrencyId = typeof values.currencyId === "string" ? values.currencyId : values.currencyId?.id;
    const payload: CreateContactInput | UpdateContactInput = {
      ...values,
      currencyId: normalizedCurrencyId,
      roles: (hideRoles ? fallbackRoles : values.roles || fallbackRoles).filter((role) => role !== ContactRole.EMPLOYEE && Object.values(ContactRole).includes(role)),
      status: values.status || initialValues?.status || ContactStatus.ACTIVE,
    } as CreateContactInput | UpdateContactInput;

    if (initialValues?.id) {
      await updateContact({ id: initialValues.id, ...payload }).unwrap();
    } else {
      await createContact(payload as CreateContactInput).unwrap();
    }

    closeAndReset();
  };

  const saving = isCreating || isUpdating;

  return (
    <ContactFormFrame title={initialValues ? "Edit Contact" : "New Contact"} open={open} toggle={toggle} saving={saving} form={contactsForm} onSubmit={handleSubmit}>
      <ContactCoreFields />
      {!hideRoles ? (
        <>
          <Divider className="!my-0 col-span-2" />
          <Form.Item className="col-span-2" label="Contact Roles" name="roles">
            <ContactRolePicker />
          </Form.Item>
        </>
      ) : null}
      <ContactAddressFields />
    </ContactFormFrame>
  );
}
