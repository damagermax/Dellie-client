import useDebouncedValue from "@/hooks/useDebouncedValue";
import { useGetContactsQuery } from "@/lib/redux/services";
import { ContactQueryParams } from "@/types/contact";
import { Select, Spin } from "antd";
import { useState } from "react";
import { IoPersonCircleOutline } from "react-icons/io5";

interface SearchableContactSelectProps {
  value?: string | string[];
  onChange?: (value: string | string[]) => void;
  onAddContact?: () => void;
  mode?: "multiple" | undefined;
  includeAllOption?: boolean;
  allLabel?: string;
}

const ALL_OPTION_VALUE = "__all__";

export function SearchableContactSelect({ value, onChange, mode, onAddContact, includeAllOption = false, allLabel = "All" }: SearchableContactSelectProps) {
  const [contactsQuery, setContactsQuery] = useState<ContactQueryParams>({});

  const debounceContactsQuery = useDebouncedValue(contactsQuery);

  const { data: contacts, isLoading } = useGetContactsQuery(debounceContactsQuery);
  const options = [
    ...(includeAllOption
      ? [
          {
            value: ALL_OPTION_VALUE,
            label: allLabel,
          },
        ]
      : []),
    ...(contacts?.data?.map((contact) => ({
      value: contact.id,
      label: (
        <div className=" flex items-center gap-x-1">
          <IoPersonCircleOutline size={18} />
          <p>{contact.name}</p>
        </div>
      ),
    })) || []),
  ];

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
          {onAddContact ? (
            <div
              className="px-3 py-2 cursor-pointer hover:bg-gray-100 text-blue-500"
              onMouseDown={(e) => e.preventDefault()}
              onClick={() => {
                onAddContact();
              }}
            >
              + Add Contact
            </div>
          ) : null}

          {menu}
        </>
      )}
      options={options}
      onSelect={(selected) => {
        if (selected === ALL_OPTION_VALUE) {
          onChange?.("" as string);
        }
      }}
    />
  );
}
