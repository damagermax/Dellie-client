"use client";

import { Tag } from "antd";
import Link from "next/link";
import { ActionDropdown } from "@/components/ui/ActionDropdown";
import { Contact } from "@/types/contact";
import { formatContactRole, getContactColor, getContactInitials } from "./contactUtils";

interface ContactsMobileListProps {
  contacts: Contact[];
  onDelete: (id: string) => void;
  onActivate: (id: string) => void;
  onDeactivate: (id: string) => void;
  openEditModal: (contact: Contact) => void;
}

export default function ContactsMobileList({ contacts, onDelete, onActivate, onDeactivate, openEditModal }: ContactsMobileListProps) {
  return (
    <div className="md:hidden">
      {contacts.map((contact) => {
        const name = contact.displayName || contact.name;
        const contactLine = contact.phone || contact.email || "No phone or email";

        return (
          <div key={contact.id} className="flex items-start gap-3 border-b border-gray-100 px-4 py-4">
            <Link href={`/contacts/${contact.id}`} className="flex min-w-0 flex-1 items-start gap-3">
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full text-sm font-semibold text-white" style={{ backgroundColor: getContactColor(name) }}>
                {getContactInitials(name)}
              </div>
              <div className="min-w-0 flex-1">
                <div className="flex items-start justify-between gap-3">
                  <p className="truncate text-[15px] font-semibold capitalize text-gray-900">{name}</p>
                  <Tag className="!m-0 !rounded-full !px-2 capitalize" color={contact.status === "active" ? "green" : "default"}>
                    {contact.status}
                  </Tag>
                </div>
                <p className="mt-1 truncate text-sm text-gray-500">{contactLine}</p>
                <p className="mt-2 line-clamp-1 text-xs capitalize text-gray-500">{contact.roles?.length ? contact.roles.map((role) => formatContactRole(role)).join(", ") : "No roles assigned"}</p>
              </div>
            </Link>
            <ActionDropdown status={contact.status} onDeactivate={() => onDeactivate(contact.id)} onActivate={() => onActivate(contact.id)} onDelete={() => onDelete(contact.id)} openEditModal={() => openEditModal(contact)} />
          </div>
        );
      })}
    </div>
  );
}
