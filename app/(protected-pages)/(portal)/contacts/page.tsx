"use client";

import ContactsFormModal from "@/components/contacts/ContactsFormModal";
import ContactsView from "@/components/contacts/contacts-view/ContactsView";
import { AddButton, FloatingAddButton, ImportExportButton } from "@/components/ui/AppButtons";
import { AppSearch } from "@/components/ui/AppSearchInput";
import useToggle from "@/hooks/UseToggle";
import { ContactQueryParams } from "@/types/contact";

import { useState } from "react";
import { ContactsFilterDrawer } from "@/components/contacts/ContactsFilterDrawer";
import { AccessDeniedView } from "@/components/ui/AccessDeniedView";
import { AppViewLoader } from "@/components/ui/AppViewLoader";
import { usePermissions } from "@/hooks/usePermissions";
import { StorePermission } from "@/types/store-access";
import { DesktopQuickFilterSegment } from "@/components/ui/DesktopQuickFilterSegment";

type ContactsQuickFilter = "all" | "customers" | "suppliers" | "employees";

export default function ContactsPage() {
  const { ready, hasPermission } = usePermissions();
  const [openCustomerForm, toggleCustomerForm] = useToggle();
  const [filterOpen, setFilterOpen] = useState(false);
  const [contactsQuery, setContactQuery] = useState<ContactQueryParams>({ page: 1, limit: 20 });
  const [draftFilters, setDraftFilters] = useState<ContactQueryParams>({});
  const filterCount = Number(Boolean(contactsQuery.status)) + Number(Boolean(contactsQuery.role));
  const contactsQuickFilter: ContactsQuickFilter | undefined =
    contactsQuery.role === "customer"
      ? "customers"
      : contactsQuery.role === "supplier"
        ? "suppliers"
        : contactsQuery.role === "employee"
          ? "employees"
          : !contactsQuery.role
            ? "all"
            : undefined;

  const handleFilterChange = (values: Partial<ContactQueryParams>) => {
    setContactQuery((prev) => ({ ...prev, ...values, page: 1 }));
  };

  const openFilters = () => {
    setDraftFilters({ status: contactsQuery.status, role: contactsQuery.role });
    setFilterOpen(true);
  };

  const handleApplyFilters = () => {
    setContactQuery((prev) => ({ ...prev, status: draftFilters.status, role: draftFilters.role, page: 1 }));
    setFilterOpen(false);
  };

  const handleFilterReset = () => {
    setDraftFilters({});
    setContactQuery((prev) => ({ ...prev, status: undefined, role: undefined, page: 1 }));
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

      <div className="flex w-full flex-col gap-4 px-4 py-5 md:flex-row md:items-center md:justify-between md:px-8 md:py-8">
        <div className="flex w-full items-center gap-3 md:w-auto">
          <div className="w-full md:w-[320px]">
            <AppSearch onReset={() => setContactQuery((prev) => ({ ...prev, search: undefined, page: 1 }))} onSearchChange={handleFilterChange} onFilterClick={openFilters} filterCount={filterCount} />
          </div>
          <DesktopQuickFilterSegment<ContactsQuickFilter>
            value={contactsQuickFilter}
            options={[
              { label: "All", value: "all" },
              { label: "Customers", value: "customers" },
              { label: "Suppliers", value: "suppliers" },
              { label: "Employees", value: "employees" },
            ]}
            onChange={(value) =>
              setContactQuery((prev) => ({
                ...prev,
                page: 1,
                role: value === "customers" ? "customer" : value === "suppliers" ? "supplier" : value === "employees" ? "employee" : undefined,
              }))
            }
          />
        </div>
        <div className="flex gap-x-2">
          <ImportExportButton />
          <div className="hidden md:block">
            <AddButton onClick={toggleCustomerForm} label={"New Contact"} />
          </div>
        </div>
      </div>

      <ContactsView query={contactsQuery} onQueryChange={setContactQuery} />
      <ContactsFilterDrawer open={filterOpen} filters={draftFilters} onChange={(values) => setDraftFilters((prev) => ({ ...prev, ...values }))} onClose={() => setFilterOpen(false)} onApply={handleApplyFilters} onClear={handleFilterReset} />

      <ContactsFormModal open={openCustomerForm} toggle={toggleCustomerForm} />
      <FloatingAddButton onClick={toggleCustomerForm} label="New Contact" />
    </div>
  );
}
