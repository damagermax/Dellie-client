import useDebouncedValue from "@/hooks/useDebouncedValue";
import { useGetContactsQuery } from "@/lib/redux/services";
import { ContactQueryParams } from "@/types/contact";
import { Select, Spin } from "antd";
import { useState } from "react";
import { IoPersonCircleOutline } from "react-icons/io5";

interface SearchableContactSelectProps {
  value?: string[];
  onChange?: (value: string[]) => void;
  onAddContact: () => void;
  mode?: "multiple" | undefined;
}

export function SearchableContactSelect({ value, onChange, mode, onAddContact }: SearchableContactSelectProps) {
  const [contactsQuery, setContactsQuery] = useState<ContactQueryParams>({});

  const debounceContactsQuery = useDebouncedValue(contactsQuery);

  const { data: contacts, isSuccess, isLoading } = useGetContactsQuery(debounceContactsQuery);

  return (
    <Select
      placeholder="Search and select contact"
      showSearch
      loading={isLoading}
      labelInValue={false}
      mode={mode}
      value={value}
      onChange={(newValues) => {
        onChange?.(newValues);
      }}
      className="w-full"
      filterOption={false}
      onSearch={(value) => setContactsQuery({ ...contactsQuery, search: value })}
      notFoundContent={isLoading ? <Spin size="small" /> : <span>No contacts found</span>}
      popupRender={(menu) => (
        <>
          <div
            className="px-3 py-2 cursor-pointer hover:bg-gray-100 text-blue-500"
            onMouseDown={(e) => e.preventDefault()}
            onClick={() => {
              onAddContact();
            }}
          >
            + Add Contact
          </div>

          {menu}
        </>
      )}
      options={contacts?.data?.map((contact) => ({
        value: contact.id,
        label: (
          <div className=" flex items-center gap-x-1">
            <IoPersonCircleOutline size={18} />
            <p>{contact.name || contact.displayName}</p>
          </div>
        ),
      }))}
    />
  );
}
