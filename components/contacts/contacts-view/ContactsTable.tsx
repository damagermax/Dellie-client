import type { TableProps } from "antd/es/table";

import { IoCopyOutline } from "react-icons/io5";
import { ImEnlarge } from "react-icons/im";

import AppTable from "@/components/ui/AppTable";
import { Contact } from "@/types/contact";
import { ContactViewItemAction } from "./ContactsView";
import { ActionDropdown } from "@/components/ui/ActionDropdown";
import AppTag from "@/components/ui/AppTag";
import { PhoneDisplay } from "@/components/ui/DisplayPhoneNumber";

interface ContactTableProp extends ContactViewItemAction {
  contacts: Contact[];
}

export function getInitials(name: string) {
  if (!name) return "";

  // Split the name by spaces
  const words = name.trim().split(/\s+/);

  // Take the first character of the first two words
  const initials = words
    .slice(0, 2) // only first two words
    .map((word) => word[0].toUpperCase())
    .join("");

  return initials;
}

const getRandomColor = (text: string) => {
  const colors = ["#F44336", "#E91E63", "#9C27B0", "#673AB7", "#3F51B5", "#2196F3", "#03A9F4", "#009688", "#4CAF50", "#8BC34A", "#FF9800", "#FF5722"];

  let hash = 0;

  for (let i = 0; i < text.length; i++) {
    hash = text.charCodeAt(i) + ((hash << 5) - hash);
  }

  return colors[Math.abs(hash) % colors.length];
};

export default function ContactsTable({ contacts, onDelete, openEditModal, onActivate, onDeactivate }: ContactTableProp) {
  const columns: TableProps<Contact>["columns"] = [
    {
      title: "Name",
      key: "name",
      dataIndex: "name",
      className: "!pl-8",
      width: "25%",
      render: (name, contact) => (
        <div className=" flex items-center gap-x-3">
          <div
            className="w-[30px] rounded-full h-[30px] flex items-center justify-center text-white font-medium"
            style={{
              backgroundColor: getRandomColor(name || contact.displayName),
            }}
          >
            {getInitials(name || contact.displayName)}
          </div>
          <div>
            <div className=" capitalize text-sm text-gray-900">{name || contact.displayName}</div>
            <p className=" text-xs">Customer, Vendor</p>
          </div>
        </div>
      ),
    },

    {
      title: "Phone",
      key: "phone",
      dataIndex: "phone",
      width: "15%",
      render: (value) => <PhoneDisplay phone={value} />,
    },

    {
      title: "Email",
      key: "email",
      width: "18%",

      dataIndex: "email",

      render: (email) => (
        <p className=" flex items-center gap-x-1">
          {email}
          {email && <IoCopyOutline className=" text-gray-400 cursor-copy" />}
        </p>
      ),
    },

    {
      title: "Last Activity",
      key: "lastActivity",
      dataIndex: "lastActivity",
      width: "15%",
      render: (value) => (
        <p className=" flex items-center gap-x-2 cursor-pointer">
          2026, May 20
          <ImEnlarge className=" text-[12px] text-gray-400/60 font-light " />
        </p>
      ),
    },

    {
      title: "Status",
      key: "status",
      width: "10%",
      dataIndex: "status",
      render: (status) => <AppTag value={status} />,
    },
    {
      dataIndex: "id",
      key: "id",
      className: "!pr-8",
      width: "10%",

      render: (id, contact) => <ActionDropdown status={contact.status} onDeactivate={() => onDeactivate(id)} onActivate={() => onActivate(id)} onDelete={() => onDelete(id)} openEditModal={() => openEditModal(contact)} />,
    },
  ];

  return (
    <>
      <AppTable columns={columns} dataSource={contacts || []} className="custom-table" />
    </>
  );
}
