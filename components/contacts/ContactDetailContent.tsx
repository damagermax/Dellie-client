"use client";

import { Button, Divider, Dropdown, MenuProps, Tag } from "antd";
import { Building2, CalendarDays, Mail, MapPinned, MoreHorizontal, Pencil, Phone, Smartphone, Trash2, UserRound, WalletCards } from "lucide-react";
import { GoBack } from "@/components/ui/GoBack";
import { PhoneDisplay } from "@/components/ui/DisplayPhoneNumber";
import { formatDate } from "@/lib/dateUtils";
import { Contact, ContactStatus } from "@/types/contact";
import { formatContactAddress, getContactColor, getContactInitials } from "./contactUtils";

interface ContactDetailContentProps {
  contact: Contact;
  isDeleting: boolean;
  onEdit: () => void;
  onDelete: () => void;
}

export default function ContactDetailContent({ contact, isDeleting, onEdit, onDelete }: ContactDetailContentProps) {
  const title = contact.displayName || contact.name;
  const legalName = contact.name && contact.name !== title ? contact.name : "Same as display name";
  const primaryAddress = formatContactAddress(contact.addresses?.[0]) || "No address provided";
  const currency = typeof contact.currencyId === "string" ? "-" : contact.currencyId?.code || "-";
  const statusTone = contact.status === ContactStatus.ACTIVE ? "green" : "default";

  const moreItems: MenuProps["items"] = [
    {
      key: "edit",
      icon: <Pencil size={15} />,
      label: "Edit Contact",
      onClick: onEdit,
    },
    {
      type: "divider",
    },
    {
      key: "delete",
      icon: <Trash2 size={15} />,
      danger: true,
      disabled: isDeleting,
      label: "Delete Contact",
      onClick: onDelete,
    },
  ];

  return (
    <section className="min-w-0 flex-1 border-r border-gray-200 bg-white lg:w-[70%] lg:flex-none">
      <div className="border-b border-gray-200 bg-gradient-to-b from-white to-gray-50/70 px-4  py-5 md:px-8">
        <div className="flex flex-wrap items-start justify-center gap-5 md:justify-between">
          <div className="flex w-full items-start gap-x-4 md:w-fit">
            <GoBack />
            <div className="flex min-w-0 items-start gap-4">
              <div className="min-w-0">
                <div className="flex flex-wrap items-center gap-2">
                  <h1 className="break-words text-2xl font-semibold tracking-normal text-gray-950">{title}</h1>
                  <Tag className="!m-0 !rounded-full !px-2 capitalize" color={statusTone}>
                    {contact.status}
                  </Tag>
                </div>
                <p className="mt-2 max-w-xl text-sm text-gray-500">
                  Created {formatDate(contact.createdAt)} by {contact.createdBy?.name || "-"}
                </p>
              </div>
            </div>
          </div>
          <div className="flex flex-wrap items-center justify-center gap-2 md:justify-end">
            <Button type="primary" className="!border-2 !border-[#f7c855] !bg-white !font-semibold !text-black !shadow-none" icon={<Pencil size={15} />} onClick={onEdit}>
              Edit
            </Button>
            <Dropdown menu={{ items: moreItems }} placement="bottomRight">
              <Button type="text" className="!bg-gray-200/80" icon={<MoreHorizontal size={15} />} />
            </Dropdown>
          </div>
        </div>
      </div>

      <div className="pt-7">
        <div className="px-4 md:px-8">
          <div className="grid gap-4 sm:grid-cols-2">
            <IdentityPanel label="Display Name" title={title} description={legalName} icon={<UserRound size={18} />} />
            <IdentityPanel label="Primary Address" title="Address" description={primaryAddress} icon={<MapPinned size={18} />} />
          </div>

          <Divider className="!mt-6" />
          <div className="mt-5 grid grid-cols-2 sm:grid-cols-4">
            <Detail className="border-b border-r border-gray-200 pb-5 pr-5 sm:border-b-0 sm:pb-0" icon={<Phone size={17} />} label="Work Phone" value={contact.phone ? <PhoneDisplay phone={contact.phone} /> : "-"} />
            <Detail className="border-b border-gray-200 pb-5 pl-5 sm:border-b-0 sm:border-r sm:pr-5 sm:pb-0" icon={<Smartphone size={17} />} label="Mobile" value={contact.mobile ? <PhoneDisplay phone={contact.mobile} /> : "-"} />
            <Detail className="border-r border-gray-200 pr-5 pt-5 sm:pl-5 sm:pt-0" icon={<Mail size={17} />} label="Email" value={contact.email || "-"} />
            <Detail className="pl-5 pt-5 sm:pt-0" icon={<WalletCards size={17} />} label="Currency" value={currency} />
          </div>
          <Divider className="!my-5" />
        </div>

        <div className="px-4 hidden pb-8 md:px-8">
          <div className="grid gap-6 lg:grid-cols-2">
            <section>
              <p className="mb-3 text-xs font-medium uppercase tracking-[0.14em] text-gray-400">Addresses</p>
              {contact.addresses?.length ? (
                <div className="space-y-3">
                  {contact.addresses.map((address, index) => (
                    <div key={`${address.street || "address"}-${index}`} className="border-b border-gray-100 pb-3 last:border-b-0">
                      <p className="text-sm font-medium text-gray-900">Address {index + 1}</p>
                      <p className="mt-1 text-sm leading-6 text-gray-600">{formatContactAddress(address) || "-"}</p>
                    </div>
                  ))}
                </div>
              ) : (
                <EmptyLine icon={<Building2 size={17} />} text="No addresses saved for this contact." />
              )}
            </section>

            <section>
              <p className="mb-3 text-xs font-medium uppercase tracking-[0.14em] text-gray-400">Terms</p>
              <div className="grid grid-cols-2 border-y border-gray-100 py-4">
                <Detail icon={<CalendarDays size={17} />} label="Last Updated" value={formatDate(contact.updatedAt)} />
                <Detail icon={<WalletCards size={17} />} label="Payment Terms" value={contact.paymentTerms || "-"} />
              </div>
            </section>
          </div>

          {contact.userId && (
            <div className="mt-6 rounded-2xl border border-gray-200 bg-gray-50 p-4">
              <div className="flex items-center justify-between gap-4">
                <div>
                  <p className="text-xs font-medium uppercase tracking-[0.14em] text-gray-400">Employee Access</p>
                  <p className="mt-1 text-sm text-gray-600">{contact.userId ? "Login access is enabled for this contact." : "This contact does not have login access."}</p>
                  {contact.employeeAccess?.permissions?.length ? <p className="mt-2 text-xs text-gray-500">Permissions: {contact.employeeAccess.permissions.join(", ")}</p> : null}
                </div>
                {contact.userId ? (
                  <Tag className="!m-0 !rounded-full !px-3" color="purple">
                    Enabled
                  </Tag>
                ) : (
                  <Tag className="!m-0 !rounded-full !px-3" color="default">
                    Disabled
                  </Tag>
                )}
              </div>
            </div>
          )}

          {contact.note && (
            <div className="mt-8">
              <p className="mb-1 text-xs font-medium uppercase tracking-[0.14em] text-amber-700">Note</p>
              <p className="text-sm leading-6 text-gray-700">{contact.note}</p>
            </div>
          )}
        </div>
      </div>
    </section>
  );
}

function IdentityPanel({ label, title, description, icon }: { label: string; title: string; description: string; icon: React.ReactNode }) {
  return (
    <div className="flex items-start gap-3">
      <div className="mt-1 text-gray-400">{icon}</div>
      <div className="min-w-0">
        <p className="text-xs font-medium uppercase tracking-[0.16em] text-gray-400">{label}</p>
        <p className="mt-1 truncate text-lg font-medium text-gray-800">{title}</p>
        <p className="mt-1 text-sm text-gray-500">{description}</p>
      </div>
    </div>
  );
}

function Detail({ icon, label, value, className = "" }: { icon: React.ReactNode; label: string; value: React.ReactNode; className?: string }) {
  return (
    <div className={`min-w-0 ${className}`}>
      <div className="mb-1 flex items-center gap-2 text-xs font-medium uppercase tracking-[0.12em] text-gray-400">
        {icon}
        <span>{label}</span>
      </div>
      <div className="text-sm font-medium text-gray-900">{value}</div>
    </div>
  );
}

function EmptyLine({ icon, text }: { icon: React.ReactNode; text: string }) {
  return (
    <div className="flex items-center gap-2 border-y border-gray-100 py-4 text-sm text-gray-500">
      <span className="text-gray-400">{icon}</span>
      <span>{text}</span>
    </div>
  );
}
