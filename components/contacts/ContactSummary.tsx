"use client";

import { Tag } from "antd";
import { Contact, ContactRole } from "@/types/contact";
import { formatContactRole } from "./contactUtils";

interface ContactSummaryProps {
  contact: Contact;
}

export default function ContactSummary({ contact }: ContactSummaryProps) {
  const roles = contact.roles?.length ? contact.roles : [];

  return (
    <aside id="contact-summary" className="w-full scroll-mt-14 border-t border-gray-200 bg-gray-50 px-5 pb-8 pt-6 lg:w-[30%] lg:border-l lg:border-t-0 lg:px-7">
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
