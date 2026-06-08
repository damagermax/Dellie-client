import ContactsTable from "./ContactsTable";
import { useGetContactsQuery, useDeleteContactMutation, useUpdateContactMutation } from "@/lib/redux/services";
import ContactsFormModal from "../ContactsFormModal";
import { Contact, ContactQueryParams, ContactStatus } from "@/types/contact";

import { useState } from "react";
import { AppViewLoader } from "@/components/ui/AppViewLoader";
import useToggle from "@/hooks/UseToggle";
import { AppNotFoundView } from "@/components/ui/AppNotFoundView";
import AppPaginationFooter from "@/components/ui/AppPaginationFooter";
import ContactsMobileList from "../ContactsMobileList";
import MobileInfiniteScrollFooter from "@/components/ui/MobileInfiniteScrollFooter";
import MobileListShimmer from "@/components/ui/MobileListShimmer";
import { useMobileInfiniteList } from "@/hooks/useMobileInfiniteList";

export interface ContactViewItemAction {
  openEditModal: (contact: Contact) => void;
  onDelete: (id: string) => void;
  onActivate: (id: string) => void;
  onDeactivate: (id: string) => void;
}

interface ContactsViewProps {
  query: ContactQueryParams;
  onQueryChange: (query: ContactQueryParams | ((current: ContactQueryParams) => ContactQueryParams)) => void;
}

export default function ContactsView({ query, onQueryChange }: ContactsViewProps) {
  const [openEditModal, toggleEditModal] = useToggle();
  const [selectedContact, setSelectedContact] = useState<Contact>();

  const { data: contactsData, isLoading: loadingContacts, isFetching } = useGetContactsQuery(query, { refetchOnMountOrArgChange: true });
  const meta = contactsData?.meta;
  const mobileList = useMobileInfiniteList({ query, response: contactsData, isFetching, setQuery: onQueryChange });

  const [deleteContact, { isLoading: isDeleting }] = useDeleteContactMutation();
  const [updateContact, { isLoading: isUpdating }] = useUpdateContactMutation();

  const openEditContactModal = (contact: Contact) => {
    setSelectedContact(contact);
    toggleEditModal();
  };

  const handleDeleteContact = async (contactId: string) => {
    if (!isDeleting) await deleteContact(contactId);
  };

  const handleActivateContact = async (contactId: string) => {
    if (!isUpdating) await updateContact({ id: contactId, status: ContactStatus.ACTIVE });
  };
  const handleDeactivateContact = async (contactId: string) => {
    if (!isUpdating) await updateContact({ id: contactId, status: ContactStatus.INACTIVE });
  };

  return (
    <>
      <div className="hidden md:block">
        <AppViewLoader loading={loadingContacts} />
      </div>
      <AppNotFoundView dataLength={contactsData?.data.length || 0} loading={loadingContacts} entity={"Contact"} query={query} />

      <div className="hidden md:block">
        <ContactsTable
          contacts={contactsData?.data || []}
          onDelete={handleDeleteContact}
          onActivate={handleActivateContact}
          onDeactivate={handleDeactivateContact}
          openEditModal={openEditContactModal}
          pagination={false}
        />
        <AppPaginationFooter entity="contacts" dataLength={contactsData?.data?.length || 0} meta={meta} page={contactsData?.page || query.page} limit={contactsData?.limit || query.limit} total={contactsData?.total} onChange={(page, limit) => onQueryChange((current) => ({ ...current, page, limit }))} />
      </div>
      {loadingContacts ? <MobileListShimmer /> : <ContactsMobileList contacts={mobileList.items} onDelete={handleDeleteContact} onActivate={handleActivateContact} onDeactivate={handleDeactivateContact} openEditModal={openEditContactModal} />}
      <MobileInfiniteScrollFooter entity="contacts" dataLength={mobileList.items.length} hasNextPage={mobileList.hasNextPage} isFetching={isFetching && !loadingContacts} sentinelRef={mobileList.sentinelRef} onLoadMore={mobileList.loadNextPage} />
      <ContactsFormModal open={openEditModal} toggle={toggleEditModal} initialValues={selectedContact} />
    </>
  );
}
