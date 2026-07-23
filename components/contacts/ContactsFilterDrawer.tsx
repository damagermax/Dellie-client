"use client";

import { Select } from "antd";
import { ContactQueryParams, ContactStatus } from "@/types/contact";
import { AppFilterDrawer } from "@/components/ui/AppFilterDrawer";
import { FilterField } from "@/components/ui/FilterField";

interface ContactsFilterDrawerProps {
  open: boolean;
  filters: ContactQueryParams;
  onChange: (value: Partial<ContactQueryParams>) => void;
  onClose: () => void;
  onApply: () => void;
  onClear: () => void;
}

const contactStatusOptions = Object.values(ContactStatus).map((value) => ({
  value,
  label: value.charAt(0).toUpperCase() + value.slice(1),
}));

export function ContactsFilterDrawer({ open, filters, onChange, onClose, onApply, onClear }: ContactsFilterDrawerProps) {
  return (
    <AppFilterDrawer title="Filter contacts" open={open} onClose={onClose} onApply={onApply} onClear={onClear}>
      <FilterField label="Status">
        <Select allowClear options={[{ value: "", label: "All" }, ...contactStatusOptions]} value={filters.status || ""} onChange={(status) => onChange({ status: (status as ContactStatus) || undefined })} className="w-full" placeholder="Select status" />
      </FilterField>
    </AppFilterDrawer>
  );
}
