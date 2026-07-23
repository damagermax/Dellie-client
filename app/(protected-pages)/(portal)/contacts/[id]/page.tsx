"use client";

import React from "react";
import { Modal, message } from "antd";
import { useRouter } from "next/navigation";
import ContactDetailContent from "@/components/contacts/ContactDetailContent";
import ContactsFormModal from "@/components/contacts/ContactsFormModal";
import EmployeeFormModal from "@/components/contacts/EmployeeFormModal";
import ContactSummary from "@/components/contacts/ContactSummary";
import { AppViewLoader } from "@/components/ui/AppViewLoader";
import { AccessDeniedView } from "@/components/ui/AccessDeniedView";
import useToggle from "@/hooks/UseToggle";
import { useDeleteContactMutation, useGetContactQuery, useGetContactTransactionsQuery } from "@/lib/redux/services";
import { usePermissions } from "@/hooks/usePermissions";
import { StorePermission } from "@/types/store-access";
import { useState } from "react";
import { ContactRole } from "@/types/contact";

export default function ContactDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = React.use(params);
  const router = useRouter();
  const [transactionQuery, setTransactionQuery] = useState({ page: 1, limit: 10, bucket: "all" as const });
  const [receivablesQuery, setReceivablesQuery] = useState({ page: 1, limit: 10, bucket: "receivables" as const });
  const [payablesQuery, setPayablesQuery] = useState({ page: 1, limit: 10, bucket: "payables" as const });
  const { ready, hasAnyPermission } = usePermissions();
  const [editOpen, toggleEdit] = useToggle();
  const canViewContact = hasAnyPermission([StorePermission.CONTACTS_VIEW, StorePermission.CONTACTS_MANAGE]);
  const { data: contact, isLoading, isError, refetch } = useGetContactQuery(id, { refetchOnMountOrArgChange: true, skip: !ready || !canViewContact });
  const { data: contactTransactions, isLoading: isTransactionsLoading, isError: isTransactionsError } = useGetContactTransactionsQuery({ id, params: transactionQuery }, { skip: !ready || !canViewContact || !id });
  const { data: receivablesTransactions, isLoading: isReceivablesLoading, isError: isReceivablesError } = useGetContactTransactionsQuery({ id, params: receivablesQuery }, { skip: !ready || !canViewContact || !id });
  const { data: payablesTransactions, isLoading: isPayablesLoading, isError: isPayablesError } = useGetContactTransactionsQuery({ id, params: payablesQuery }, { skip: !ready || !canViewContact || !id });
  const [deleteContact, { isLoading: isDeleting }] = useDeleteContactMutation();

  const confirmDelete = () => {
    if (!contact || isDeleting) return;

    Modal.confirm({
      title: `Delete ${contact.name}?`,
      content: "This contact will be removed from your contacts list. This action cannot be undone.",
      okText: "Delete",
      okType: "danger",
      onOk: async () => {
        try {
          await deleteContact(contact.id).unwrap();
          message.success("Contact deleted.");
          router.replace("/contacts");
        } catch (error) {
          message.error("Contact could not be deleted.");
          throw error;
        }
      },
    });
  };

  if (!ready || (canViewContact && isLoading)) return <AppViewLoader loading />;
  if (!canViewContact) return <AccessDeniedView title="Contacts" description="You do not have permission to view this contact." />;
  if (isError || !contact) return <p className="px-8 py-10 text-sm text-red-600">This contact could not be loaded.</p>;

  return (
    <div className="min-h-screen">
      <div className="flex min-h-screen flex-col bg-gray-50 lg:flex-row">
        <ContactDetailContent
          contact={contact}
          isDeleting={isDeleting}
          onEdit={toggleEdit}
          onDelete={confirmDelete}
          transactions={contactTransactions?.data || []}
          transactionsLoading={isTransactionsLoading}
          transactionsError={isTransactionsError}
          transactionsMeta={contactTransactions?.meta}
          onTransactionPageChange={(page, limit) => setTransactionQuery((current) => ({ ...current, page, limit }))}
          receivables={receivablesTransactions?.data || []}
          receivablesLoading={isReceivablesLoading}
          receivablesError={isReceivablesError}
          receivablesMeta={receivablesTransactions?.meta}
          onReceivablesPageChange={(page, limit) => setReceivablesQuery((current) => ({ ...current, page, limit }))}
          payables={payablesTransactions?.data || []}
          payablesLoading={isPayablesLoading}
          payablesError={isPayablesError}
          payablesMeta={payablesTransactions?.meta}
          onPayablesPageChange={(page, limit) => setPayablesQuery((current) => ({ ...current, page, limit }))}
          onContactUpdated={refetch}
        />
        <ContactSummary contact={contact} />
      </div>

      {editOpen &&
        (contact.roles?.includes(ContactRole.EMPLOYEE) ? (
          <EmployeeFormModal open={editOpen} toggle={toggleEdit} initialValues={contact} onSaved={refetch} />
        ) : (
          <ContactsFormModal open={editOpen} toggle={toggleEdit} initialValues={contact} onSaved={refetch} />
        ))}
    </div>
  );
}
