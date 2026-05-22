import ContactsTable from "./ContactsTable";
import { useGetContactsQuery, useDeleteContactMutation, useUpdateContactMutation } from "@/lib/redux/services";
import ContactsFormModal from "../ContactsFormModal";
import { Contact, ContactQueryParams, ContactStatus } from "@/types/contact";

import { useState } from "react";
import { AppViewLoader } from "@/components/ui/AppViewLoader";
import useToggle from "@/hooks/UseToggle";
import { AppNotFoundView } from "@/components/ui/AppNotFoundView";

export interface ContactViewItemAction {
  openEditModal: (contact: Contact) => void;
  onDelete: (id: string) => void;
  onActivate: (id: string) => void;
  onDeactivate: (id: string) => void;
}

interface ContactsViewProps {
  query: ContactQueryParams;
}

export default function ContactsView({ query }: ContactsViewProps) {
  const [openEditModal, toggleEditModal] = useToggle();
  const [selectedContact, setSelectedContact] = useState<Contact>();

  const { data: contactsData, isLoading: loadingContacts, error: contactsError } = useGetContactsQuery(query, { refetchOnMountOrArgChange: true });

  const [deleteContact, { isLoading: isDeleting }] = useDeleteContactMutation();
  const [updateContact, { isLoading: isUpdating }] = useUpdateContactMutation();

  const openEditContactModal = (contact: Contact) => {
    setSelectedContact(contact);
    toggleEditModal();
  };

  const handleDeleteContact = async (contactId: string) => {
    !isDeleting && (await deleteContact(contactId));
  };

  const handleActivateContact = async (contactId: string) => {
    !isUpdating && (await updateContact({ id: contactId, status: ContactStatus.ACTIVE }));
  };
  const handleDeactivateContact = async (contactId: string) => {
    !isUpdating && (await updateContact({ id: contactId, status: ContactStatus.INACTIVE }));
  };

  return (
    <>
      <AppViewLoader loading={loadingContacts} />
      <AppNotFoundView dataLength={contactsData?.data.length || 0} loading={loadingContacts} entity={"Contact"} query={query} />

      <ContactsTable contacts={contactsData?.data || []} onDelete={handleDeleteContact} onActivate={handleActivateContact} onDeactivate={handleDeactivateContact} openEditModal={openEditContactModal} />
      <ContactsFormModal open={openEditModal} toggle={toggleEditModal} initialValues={selectedContact} />
    </>
  );
}
