"use client";

import ContactsFormModal from "@/components/contacts/ContactsFormModal";
import ContactsView from "@/components/contacts/contacts-view/ContactsView";
import { AddButton, ImportExportButton } from "@/components/ui/AppButtons";
import { AppSearch } from "@/components/ui/AppSearchInput";
import useToggle from "@/hooks/UseToggle";
import { ContactQueryParams } from "@/types/contact";

import { useState } from "react";

import { ContactsFilter } from "@/components/contacts/ContactsFilter";
import { AccessDeniedView } from "@/components/ui/AccessDeniedView";
import { AppViewLoader } from "@/components/ui/AppViewLoader";
import { usePermissions } from "@/hooks/usePermissions";
import { StorePermission } from "@/types/store-access";

export default function ContactsPage() {
  const { ready, hasPermission } = usePermissions();
  const [openCustomerForm, toggleCustomerForm] = useToggle();
  const [contactsQuery, setContactQuery] = useState<ContactQueryParams>({ page: 1, limit: 20 });

  const handleFilterChange = (values: Partial<ContactQueryParams>) => {
    setContactQuery((prev) => ({ ...prev, ...values, page: 1 }));
  };

  const handleFilterRest = () => {
    setContactQuery({ page: 1, limit: 20 });
  };

  if (!ready) return <AppViewLoader loading />;
  if (!hasPermission(StorePermission.CONTACTS_VIEW)) {
    return <AccessDeniedView title="Contacts" description="You do not have permission to view the contacts module." />;
  }

  return (
    <div>
      <div>
        <div className="">
          <h3 className="pageTittle px-4 md:px-8">Contacts</h3>

          <hr className=" border-gray-200/80" />
        </div>
      </div>

      <div className="flex w-full flex-col gap-4 px-4 py-5 md:flex-row md:justify-between md:px-8 md:py-8">
        <div className="w-full md:w-[30%]">
          <AppSearch menu={{ items: ContactsFilter({ onChange: handleFilterChange, filters: contactsQuery }) }} onReset={handleFilterRest} onSearchChange={handleFilterChange} />
        </div>
        <div className="flex gap-x-2">
          <ImportExportButton />
          <AddButton onClick={toggleCustomerForm} label={"New Contact"} />
        </div>
      </div>

      <ContactsView query={contactsQuery} onQueryChange={setContactQuery} />

      <ContactsFormModal open={openCustomerForm} toggle={toggleCustomerForm} />
    </div>
  );
}
