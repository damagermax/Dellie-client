"use client";

import { Tag } from "antd";
import Link from "next/link";
import { Contact } from "@/types/contact";
import { formatContactRole, getContactColor, getContactInitials } from "./contactUtils";

interface ContactsMobileListProps {
  contacts: Contact[];
}

export default function ContactsMobileList({ contacts }: ContactsMobileListProps) {
  return (
    <div className="md:hidden">
      {contacts.map((contact) => {
        const name = contact.displayName || contact.name;
        const contactLine = contact.phone || contact.email || "No phone or email";

        return (
          <div key={contact.id} className=" border-b border-gray-100 px-4 py-4">
            <Link href={`/contacts/${contact.id}`} className="flex min-w-0 flex-1  gap-3">
              <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full text-sm font-semibold text-white" style={{ backgroundColor: getContactColor(name) }}>
                {getContactInitials(name)}
              </div>
              <div className="min-w-0 flex-1">
                <div className="flex items-start justify-between gap-3">
                  <p className="truncate text-[15px] font-semibold capitalize text-gray-900">{name}</p>
                  <Tag className="!m-0 !rounded-full !px-2 capitalize" color={contact.status === "active" ? "green" : "default"}>
                    {contact.status}
                  </Tag>
                </div>
                <p className=" truncate text-sm text-gray-500">{contactLine}</p>
              </div>
            </Link>

            <div className=" pl-10  flex justify-between items-center">
              <p className="line-clamp-1 text-xs capitalize text-gray-500">{contact.roles?.length ? contact.roles.map((role) => formatContactRole(role)).join(", ") : "No roles assigned"}</p>
            </div>
          </div>
        );
      })}
    </div>
  );
}
