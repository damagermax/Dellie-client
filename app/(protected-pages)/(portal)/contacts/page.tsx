"use client";

import ContactsFormModal from "@/components/contacts/ContactsFormModal";
import EmployeeFormModal from "@/components/contacts/EmployeeFormModal";
import ContactsView from "@/components/contacts/contacts-view/ContactsView";
import { AddButton, FloatingAddButton, ImportExportButton } from "@/components/ui/AppButtons";
import { AppSearch } from "@/components/ui/AppSearchInput";
import useToggle from "@/hooks/UseToggle";
import { ContactQueryParams, ContactRole } from "@/types/contact";

import { useEffect, useMemo, useState } from "react";
import { ContactsFilterDrawer } from "@/components/contacts/ContactsFilterDrawer";
import { AccessDeniedView } from "@/components/ui/AccessDeniedView";
import { AppViewLoader } from "@/components/ui/AppViewLoader";
import { usePermissions } from "@/hooks/usePermissions";
import { StorePermission } from "@/types/store-access";
import { DesktopQuickFilterSegment } from "@/components/ui/DesktopQuickFilterSegment";
import { useSearchParams } from "next/navigation";

type ContactsQuickFilter = "all" | "customers" | "suppliers" | "employees";

export default function ContactsPage() {
  const { ready, hasPermission } = usePermissions();
  const searchParams = useSearchParams();
  const initialRole = useMemo(() => {
    const role = searchParams.get("role");
    if (role === "customers") return ContactRole.CUSTOMER;
    if (role === "suppliers") return ContactRole.SUPPLIER;
    if (role === "employees") return ContactRole.EMPLOYEE;
    return undefined;
  }, [searchParams]);
  const [openCustomerForm, toggleCustomerForm] = useToggle();
  const [openEmployeeForm, toggleEmployeeForm] = useToggle();
  const [filterOpen, setFilterOpen] = useState(false);
  const [contactsQuery, setContactQuery] = useState<ContactQueryParams>({
    page: 1,
    limit: 20,
    role: initialRole,
    excludeRole: initialRole === ContactRole.EMPLOYEE ? undefined : ContactRole.EMPLOYEE,
  });
  const [draftFilters, setDraftFilters] = useState<ContactQueryParams>({});
  const filterCount = Number(Boolean(contactsQuery.status));
  const contactsQuickFilter: ContactsQuickFilter | undefined =
    contactsQuery.role === ContactRole.CUSTOMER
      ? "customers"
      : contactsQuery.role === ContactRole.SUPPLIER
        ? "suppliers"
        : contactsQuery.role === ContactRole.EMPLOYEE
          ? "employees"
          : !contactsQuery.role
            ? "all"
            : undefined;

  useEffect(() => {
    setContactQuery((prev) => ({
      ...prev,
      page: 1,
      role: initialRole,
      excludeRole: initialRole === ContactRole.EMPLOYEE ? undefined : ContactRole.EMPLOYEE,
    }));
  }, [initialRole]);

  const handleFilterChange = (values: Partial<ContactQueryParams>) => {
    setContactQuery((prev) => ({ ...prev, ...values, page: 1 }));
  };

  const openFilters = () => {
    setDraftFilters({ status: contactsQuery.status });
    setFilterOpen(true);
  };

  const handleApplyFilters = () => {
    setContactQuery((prev) => ({ ...prev, status: draftFilters.status, page: 1 }));
    setFilterOpen(false);
  };

  const handleFilterReset = () => {
    setDraftFilters({});
    setContactQuery((prev) => ({
      ...prev,
      status: undefined,
      role: initialRole,
      excludeRole: initialRole === ContactRole.EMPLOYEE ? undefined : ContactRole.EMPLOYEE,
      page: 1,
    }));
  };

  if (!ready) return <AppViewLoader loading />;
  if (!hasPermission(StorePermission.CONTACTS_VIEW)) {
    return <AccessDeniedView title="Contacts" description="You do not have permission to view the contacts module." />;
  }

  return (
    <div>
      <div>
        <div className="">
          <h3 className="pageTittle px-4 md:px-8">{contactsQuickFilter === "employees" ? "Employees" : "Contacts"}</h3>

          <hr className=" border-gray-200/80" />
        </div>
      </div>

      <div className="flex w-full flex-col gap-4 px-4 py-5 md:flex-row md:items-center md:justify-between md:px-8 md:py-8">
        <div className="flex w-full items-center gap-3 md:w-auto">
          <div className="w-full md:w-[320px]">
            <AppSearch onReset={() => setContactQuery((prev) => ({ ...prev, search: undefined, page: 1 }))} onSearchChange={handleFilterChange} onFilterClick={openFilters} filterCount={filterCount} />
          </div>
          {contactsQuickFilter !== "employees" ? (
            <DesktopQuickFilterSegment<ContactsQuickFilter>
              value={contactsQuickFilter}
              options={[
                { label: "All", value: "all" },
                { label: "Customers", value: "customers" },
                { label: "Suppliers", value: "suppliers" },
              ]}
              onChange={(value) =>
                setContactQuery((prev) => ({
                  ...prev,
                  page: 1,
                  role:
                    value === "customers"
                      ? ContactRole.CUSTOMER
                      : value === "suppliers"
                        ? ContactRole.SUPPLIER
                        : undefined,
                  excludeRole: ContactRole.EMPLOYEE,
                }))
              }
            />
          ) : null}
        </div>
        <div className="flex gap-x-2">
          <ImportExportButton />
          <div className="hidden md:block">
            <AddButton onClick={contactsQuickFilter === "employees" ? toggleEmployeeForm : toggleCustomerForm} label={contactsQuickFilter === "employees" ? "New Employee" : "New Contact"} />
          </div>
        </div>
      </div>

      <ContactsView query={contactsQuery} onQueryChange={setContactQuery} />
      <ContactsFilterDrawer open={filterOpen} filters={draftFilters} onChange={(values) => setDraftFilters((prev) => ({ ...prev, ...values }))} onClose={() => setFilterOpen(false)} onApply={handleApplyFilters} onClear={handleFilterReset} />

      <ContactsFormModal
        open={openCustomerForm}
        toggle={toggleCustomerForm}
        defaultRoles={
          contactsQuickFilter === "customers"
            ? [ContactRole.CUSTOMER]
            : contactsQuickFilter === "suppliers"
              ? [ContactRole.SUPPLIER]
              : undefined
        }
      />
      <EmployeeFormModal open={openEmployeeForm} toggle={toggleEmployeeForm} />
      <FloatingAddButton onClick={contactsQuickFilter === "employees" ? toggleEmployeeForm : toggleCustomerForm} label={contactsQuickFilter === "employees" ? "New Employee" : "New Contact"} />
    </div>
  );
}
