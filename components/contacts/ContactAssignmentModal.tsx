"use client";

import { AppModal, ModalProps } from "@/components/ui/AppModal";
import { useGetContactsQuery, useUpdateContactMutation } from "@/lib/redux/services";
import { Contact, ContactRole, UpdateContactInput } from "@/types/contact";
import { Form, Select, message } from "antd";
import { useMemo, useState } from "react";

interface ContactAssignmentModalProps extends ModalProps {
  contact: Contact;
  mode: "employee" | "customer";
  onSaved?: () => void;
}

type AssignmentFormValues = {
  assignedEmployeeContactId?: string;
  assignedCustomerIds?: string[];
};

export function ContactAssignmentModal({ open, toggle, contact, mode, onSaved }: ContactAssignmentModalProps) {
  const [form] = Form.useForm<AssignmentFormValues>();
  const [search, setSearch] = useState("");
  const [updateContact, { isLoading: isSaving }] = useUpdateContactMutation();

  const role = mode === "employee" ? ContactRole.CUSTOMER : ContactRole.EMPLOYEE;
  const { data, isLoading } = useGetContactsQuery(
    {
      role,
      search,
      page: 1,
      limit: 100,
      sortBy: "displayName",
      sortOrder: "asc",
    },
    {
      skip: !open,
      refetchOnMountOrArgChange: true,
    },
  );

  const options = useMemo(
    () =>
      (data?.data || [])
        .filter((item) => item.id !== contact.id)
        .map((item) => ({
          value: item.id,
          label: item.displayName || item.name,
        })),
    [contact.id, data?.data],
  );

  const initialValues = useMemo<AssignmentFormValues>(
    () => ({
      assignedEmployeeContactId: contact.assignedEmployeeContactId || undefined,
      assignedCustomerIds: contact.assignedCustomers?.map((item) => item.id) || [],
    }),
    [contact.assignedEmployeeContactId, contact.assignedCustomers],
  );

  const handleClose = () => {
    form.resetFields();
    setSearch("");
    toggle();
  };

  const handleSubmit = async (values: AssignmentFormValues) => {
    const payload: UpdateContactInput =
      mode === "employee"
        ? {
            id: contact.id,
            assignedCustomerIds: values.assignedCustomerIds || [],
          }
        : {
            id: contact.id,
            assignedEmployeeContactId: values.assignedEmployeeContactId || null,
          };

    try {
      await updateContact(payload).unwrap();
      message.success(mode === "employee" ? "Customer assignments updated." : "Assigned employee updated.");
      handleClose();
      onSaved?.();
    } catch (error: unknown) {
      const errorMessage =
        typeof error === "object" && error && "data" in error && typeof (error as { data?: { message?: string | string[] } }).data?.message !== "undefined"
          ? (error as { data?: { message?: string | string[] } }).data?.message
          : undefined;

      message.error(Array.isArray(errorMessage) ? errorMessage[0] : errorMessage || "Assignment could not be updated.");
    }
  };

  return (
    <AppModal
      open={open}
      toggle={handleClose}
      onOk={form.submit}
      okText={isSaving ? "Saving..." : "Save"}
      loading={isSaving}
      width={640}
      title={mode === "employee" ? "Assign Customers" : "Assign Employee"}
    >
      <Form
        form={form}
        layout="vertical"
        initialValues={initialValues}
        onFinish={handleSubmit}
        className="px-5 py-5"
      >
        {mode === "employee" ? (
          <Form.Item
            label="Assigned Customers"
            name="assignedCustomerIds"
            extra="Choose one or more customers this employee manages."
          >
            <Select
              mode="multiple"
              allowClear
              showSearch
              filterOption={false}
              onSearch={setSearch}
              placeholder="Search customers"
              loading={isLoading}
              options={options}
            />
          </Form.Item>
        ) : (
          <Form.Item
            label="Assigned Employee"
            name="assignedEmployeeContactId"
            extra="Choose the employee responsible for this customer."
          >
            <Select
              allowClear
              showSearch
              filterOption={false}
              onSearch={setSearch}
              placeholder="Search employees"
              loading={isLoading}
              options={options}
            />
          </Form.Item>
        )}
      </Form>
    </AppModal>
  );
}
