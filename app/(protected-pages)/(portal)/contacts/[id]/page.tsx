"use client";

import React from "react";
import { Modal, message } from "antd";
import { useRouter } from "next/navigation";
import ContactDetailContent from "@/components/contacts/ContactDetailContent";
import ContactsFormModal from "@/components/contacts/ContactsFormModal";
import ContactSummary from "@/components/contacts/ContactSummary";
import { AppViewLoader } from "@/components/ui/AppViewLoader";
import useToggle from "@/hooks/UseToggle";
import { useDeleteContactMutation, useGetContactQuery } from "@/lib/redux/services";

export default function ContactDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = React.use(params);
  const router = useRouter();
  const [editOpen, toggleEdit] = useToggle();
  const { data: contact, isLoading, isError, refetch } = useGetContactQuery(id, { refetchOnMountOrArgChange: true });
  const [deleteContact, { isLoading: isDeleting }] = useDeleteContactMutation();

  const confirmDelete = () => {
    if (!contact || isDeleting) return;

    Modal.confirm({
      title: `Delete ${contact.displayName || contact.name}?`,
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

  if (isLoading) return <AppViewLoader loading />;
  if (isError || !contact) return <p className="px-8 py-10 text-sm text-red-600">This contact could not be loaded.</p>;

  return (
    <div className="min-h-screen">
      <div className="flex min-h-screen flex-col bg-gray-50 lg:flex-row">
        <ContactDetailContent contact={contact} isDeleting={isDeleting} onEdit={toggleEdit} onDelete={confirmDelete} />
        <ContactSummary contact={contact} />
      </div>

      {editOpen && <ContactsFormModal open={editOpen} toggle={toggleEdit} initialValues={contact} onSaved={refetch} />}
    </div>
  );
}
