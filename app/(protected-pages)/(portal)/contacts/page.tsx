"use client";

import ContactsFormModal from "@/components/contacts/ContactsFormModal";
import ContactsView from "@/components/contacts/contacts-view/ContactsView";
import { AddButton, ImportExportButton } from "@/components/ui/AppButtons";
import { AppSearch } from "@/components/ui/AppSearchInput";
import useToggle from "@/hooks/UseToggle";
import { ContactQueryParams } from "@/types/contact";

import { useState } from "react";

import type { MenuProps } from "antd";
import AppViewSegments from "@/components/ui/AppViewSegments";
import { ContactsFilter } from "@/components/contacts/ContactsFilter";

export default function ContactsPage() {
  const [openCustomerForm, toggleCustomerForm] = useToggle();
  const [contactsQuery, setContactQuery] = useState<ContactQueryParams>({});

  const onClick: MenuProps["onClick"] = (type) => {
    setContactQuery((prev) => ({ ...prev }));
  };

  const handleFilterChange = (values: Partial<ContactQueryParams>) => {
    setContactQuery((prev) => ({ ...prev, ...values }));
  };

  const handleFilterRest = () => {
    setContactQuery({});
  };

  return (
    <div>
      <div>
        <div className="">
          <h3 className=" px-8 pageTittle ">Contacts</h3>

          <hr className=" border-gray-200/80" />
        </div>
      </div>

      <div className="py-8   px-8 flex justify-between w-full">
        <div className=" w-[30%] ">
          <AppSearch menu={{ items: ContactsFilter({ onChange: handleFilterChange, filters: contactsQuery }) }} onReset={handleFilterRest} onSearchChange={handleFilterChange} />
        </div>
        <div className=" flex gap-x-2 ">
          <ImportExportButton />
          <AppViewSegments onChange={() => {}} />
          <AddButton onClick={toggleCustomerForm} label={"New Contact"} />
        </div>
      </div>

      <ContactsView query={contactsQuery} />

      <ContactsFormModal open={openCustomerForm} toggle={toggleCustomerForm} />
    </div>
  );
}
