import { MenuProps, Select } from "antd";
import { ContactQueryParams, ContactRole, ContactStatus } from "@/types/contact";

interface ContactsFilterPops {
  onChange: (value: Partial<ContactQueryParams>) => void;
  filters: ContactQueryParams;
}

export function ContactsFilter({ onChange, filters }: ContactsFilterPops): MenuProps["items"] {
  const contactStatusOptions = Object.values(ContactStatus).map((value) => ({
    value,
    label: value.charAt(0).toUpperCase() + value.slice(1), // Capitalize
  }));

  const contactRoleOptions = Object.values(ContactRole).map((value) => ({
    value,
    label: value.replaceAll("_", " ").replace(/\b\w/g, (letter) => letter.toUpperCase()),
  }));

  return [
    {
      key: "edit",
      label: (
        <>
          <label className="  inline-block mb-1">Status</label>
          <Select options={contactStatusOptions} value={filters?.status} onSelect={(value) => onChange({ status: value })} className="w-full h-8 " placeholder="Select status..." onClick={(e) => e.stopPropagation()} />
          <label className="mt-3 inline-block mb-1">Role</label>
          <Select options={contactRoleOptions} value={filters?.role} onSelect={(value) => onChange({ role: value })} className="w-full h-8 " placeholder="Select role..." onClick={(e) => e.stopPropagation()} />
        </>
      ),
    },
  ];
}
