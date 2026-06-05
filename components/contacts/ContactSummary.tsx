"use client";

import { Divider, Tag } from "antd";
import { Contact, ContactRole, ContactStatus } from "@/types/contact";
import { formatDate } from "@/lib/dateUtils";
import { formatContactRole } from "./contactUtils";

interface ContactSummaryProps {
  contact: Contact;
}

export default function ContactSummary({ contact }: ContactSummaryProps) {
  const currency = typeof contact.currencyId === "string" ? "-" : contact.currencyId?.code || "-";
  const roles = contact.roles?.length ? contact.roles : [];

  return (
    <aside className="w-full bg-gray-50 px-7 pb-8 pt-6 lg:w-[30%]">
      <div className="border-b border-gray-200 pb-6">
        <div className="mb-5 flex items-center justify-between gap-3">
          <h2 className="text-base font-medium text-gray-900">Contact Summary</h2>
          <Tag className="!rounded-full px-3 capitalize" color={contact.status === ContactStatus.ACTIVE ? "green" : "default"}>
            {contact.status}
          </Tag>
        </div>

        <Summary label="Display Name" value={contact.displayName || contact.name || "-"} />
        <Summary label="Legal Name" value={contact.name || "-"} />
        <Summary label="Currency" value={currency} />
        <Summary label="Payment Terms" value={contact.paymentTerms || "-"} />
        <Divider className="my-3" />
        <Summary label="Created" value={formatDate(contact.createdAt)} />
        <Summary label="Updated" value={formatDate(contact.updatedAt)} />
      </div>

      <div className="pt-6">
        <h2 className="mb-4 text-base font-medium text-gray-900">Roles</h2>
        {roles.length ? (
          <div className="flex flex-wrap gap-2">
            {roles.map((role: ContactRole) => (
              <Tag key={role} className="!m-0 !rounded-full !px-3 capitalize" color="blue">
                {formatContactRole(role)}
              </Tag>
            ))}
          </div>
        ) : (
          <p className="text-sm text-gray-500">No roles assigned.</p>
        )}
      </div>
    </aside>
  );
}

function Summary({ label, value }: { label: string; value: string }) {
  return (
    <div className="mb-3 flex justify-between gap-5 text-sm">
      <span className="text-gray-600">{label}</span>
      <span className="text-right font-medium text-gray-900">{value}</span>
    </div>
  );
}
