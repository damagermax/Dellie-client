import type { TableProps } from "antd/es/table";
import Link from "next/link";

import { IoCopyOutline } from "react-icons/io5";

import AppTable from "@/components/ui/AppTable";
import { Contact } from "@/types/contact";
import AppTag from "@/components/ui/AppTag";
import { PhoneDisplay } from "@/components/ui/DisplayPhoneNumber";
import { formatContactRole, getContactColor, getContactInitials } from "../contactUtils";
import { Tag } from "antd";

interface ContactTableProp {
  contacts: Contact[];
  pagination?: TableProps<Contact>["pagination"];
}

export default function ContactsTable({ contacts, pagination }: ContactTableProp) {
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
              backgroundColor: getContactColor(name),
            }}
          >
            {getContactInitials(name)}
          </div>
          <div>
            <Link href={`/contacts/${contact.id}`} className="capitalize text-sm text-gray-900 hover:text-black hover:underline">
              {name}
            </Link>
            {contact.employeeAccess?.status && contact.employeeAccess.status !== "disabled" && <Tag className="!mt-1 !rounded-full !px-2 text-[10px]" color="purple">Login enabled</Tag>}
          </div>
        </div>
      ),
    },
    {
      title: "Role",
      key: "roles",
      dataIndex: "roles",
      width: "16%",
      render: (_, contact) => <p className="text-sm capitalize">{contact.roles?.length ? contact.roles.map((role) => formatContactRole(role)).join(", ") : "No roles assigned"}</p>,
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
      title: "Last Transaction",
      key: "lastTransactionAt",
      dataIndex: "lastTransactionAtFormatted",
      width: "14%",
      render: (value) => <span className="text-sm text-gray-700">{value || "-"}</span>,
    },

    {
      title: "Status",
      key: "status",
      width: "10%",
      dataIndex: "status",
      render: (status) => <AppTag value={status} />,
    },
  ];

  return (
    <>
      <AppTable columns={columns} dataSource={contacts || []} className="custom-table" rowKey="id" pagination={pagination} />
    </>
  );
}
