import type { TableProps } from "antd/es/table";
import Link from "next/link";

import { IoCopyOutline } from "react-icons/io5";
import { ImEnlarge } from "react-icons/im";

import AppTable from "@/components/ui/AppTable";
import { Contact } from "@/types/contact";
import { ContactViewItemAction } from "./ContactsView";
import { ActionDropdown } from "@/components/ui/ActionDropdown";
import AppTag from "@/components/ui/AppTag";
import { PhoneDisplay } from "@/components/ui/DisplayPhoneNumber";
import { formatContactRole, getContactColor, getContactInitials } from "../contactUtils";
import { Tag } from "antd";

interface ContactTableProp extends ContactViewItemAction {
  contacts: Contact[];
  pagination?: TableProps<Contact>["pagination"];
}

export default function ContactsTable({ contacts, onDelete, openEditModal, onActivate, onDeactivate, pagination }: ContactTableProp) {
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
              backgroundColor: getContactColor(name || contact.displayName),
            }}
          >
            {getContactInitials(name || contact.displayName)}
          </div>
          <div>
            <Link href={`/contacts/${contact.id}`} className="capitalize text-sm text-gray-900 hover:text-black hover:underline">
              {name || contact.displayName}
            </Link>
            <div className="mt-1 flex flex-wrap items-center gap-2">
              <p className="text-xs capitalize">{contact.roles?.length ? contact.roles.map((role) => formatContactRole(role)).join(", ") : "No roles assigned"}</p>
              {contact.userId && <Tag className="!m-0 !rounded-full !px-2 text-[10px]" color="purple">Login enabled</Tag>}
            </div>
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
      render: (_, contact) => (
        <Link href={`/contacts/${contact.id}`} className="flex items-center gap-x-2 text-gray-700 hover:text-black">
          2026, May 20
          <ImEnlarge className=" text-[12px] text-gray-400/60 font-light " />
        </Link>
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
      <AppTable columns={columns} dataSource={contacts || []} className="custom-table" rowKey="id" pagination={pagination} />
    </>
  );
}
