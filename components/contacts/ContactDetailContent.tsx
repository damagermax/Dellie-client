"use client";

import Link from "next/link";
import React from "react";
import { Button, Divider, Dropdown, Empty, MenuProps, Segmented, Tag } from "antd";
import { ArrowUpRight, FileText, Mail, MapPinned, MoreHorizontal, PackageCheck, Pencil, Phone, Receipt, Smartphone, Trash2, Truck, UserRound, WalletCards } from "lucide-react";
import { GoBack } from "@/components/ui/GoBack";
import { PhoneDisplay } from "@/components/ui/DisplayPhoneNumber";
import { formatDate } from "@/lib/dateUtils";
import { Contact, ContactStatus } from "@/types/contact";
import { formatContactAddress } from "./contactUtils";
import { Transaction } from "@/types/transaction";
import AppPaginationFooter from "../ui/AppPaginationFooter";
import { PaginationMeta } from "@/types/shared";

interface ContactDetailContentProps {
  contact: Contact;
  isDeleting: boolean;
  onEdit: () => void;
  onDelete: () => void;
  transactions: Transaction[];
  transactionsLoading: boolean;
  transactionsError: boolean;
  transactionsMeta?: PaginationMeta;
  onTransactionPageChange: (page: number, limit: number) => void;
}

export default function ContactDetailContent({
  contact,
  isDeleting,
  onEdit,
  onDelete,
  transactions,
  transactionsLoading,
  transactionsError,
  transactionsMeta,
  onTransactionPageChange,
}: ContactDetailContentProps) {
  const [view, setView] = React.useState<"overview" | "transactions">("overview");
  const title = contact.name || contact.displayName;
  const displayName = contact.displayName || contact.name;
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

  function SegmentLabel({ icon, text }: { icon: React.ReactNode; text: string }) {
    return (
      <span className="flex items-center gap-x-2 px-1">
        {icon}
        <span>{text}</span>
      </span>
    );
  }

  const tableOptions = [
    { label: <SegmentLabel icon={<FileText size={15} />} text="Overview" />, value: "overview" },
    { label: <SegmentLabel icon={<PackageCheck size={15} />} text="Transactions" />, value: "transactions" },
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

      <div className="pt-7 w-full">
        <div className="px-4 md:px-8">
          <div className="grid gap-4 sm:grid-cols-2">
            <IdentityPanel label="Display Name" title={displayName} description={legalName} icon={<UserRound size={18} />} />
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

        <div className=" flex  justify-center w-full">
          <Segmented
            shape="round"
            options={tableOptions}
            value={view}
            onChange={(value) => setView(value as "overview" | "transactions")}
            className="[&_.ant-segmented-item-selected]:!bg-[#2d837d] [&_.ant-segmented-item-selected]:!text-white"
            style={{ backgroundColor: "#ebebeb", padding: "5px" }}
          />
        </div>

        {view === "overview" ? (
          <div className="px-4 pb-8 pt-8 md:px-8">
            {contact.employeeAccess && contact.employeeAccess.status !== "disabled" && (
              <div className="mt-6 rounded-2xl border border-gray-200 bg-gray-50 p-4">
                <div className="flex items-center justify-between gap-4">
                  <div>
                    <p className="text-xs font-medium uppercase tracking-[0.14em] text-gray-400">Employee Access</p>
                    <p className="mt-1 text-sm text-gray-600">Login access is enabled for this contact.</p>
                    {contact.employeeAccess?.username ? <p className="mt-2 text-xs text-gray-500">Username: {contact.employeeAccess.username}</p> : null}
                    {contact.employeeAccess?.permissions?.length ? <p className="mt-2 text-xs text-gray-500">Permissions: {contact.employeeAccess.permissions.join(", ")}</p> : null}
                  </div>
                  <Tag className="!m-0 !rounded-full !px-3" color="purple">
                    Enabled
                  </Tag>
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
        ) : (
          <div className="mt-8 border-t border-gray-200 px-4 pb-8 pt-6 md:px-8">
            {transactionsLoading ? (
              <div className="space-y-3">
                {Array.from({ length: 3 }).map((_, index) => (
                  <div key={index} className="border-b border-gray-100 py-4">
                    <div className="h-4 w-40 animate-pulse rounded bg-gray-200" />
                    <div className="mt-2 h-3 w-28 animate-pulse rounded bg-gray-100" />
                  </div>
                ))}
              </div>
            ) : transactionsError ? (
              <p className="py-6 text-sm text-red-600">Transactions could not be loaded.</p>
            ) : transactions.length ? (
              <>
                <div className="space-y-4">
                  {transactions.map((transaction) => {
                    const transactionLabel = transaction.typeLabel || transaction.type?.replaceAll("_", " ");
                    const isSaleOrPurchase = transaction.type === "sale" || transaction.type === "purchase";
                    const linkedNumber = transaction.type === "purchase_landed_cost" ? transaction.linkedDocumentSnapshot?.number : undefined;
                    const preview = transactionPreviewConfig(transaction.type);
                    const content = (
                      <div className={`group relative overflow-hidden rounded-xl border border-gray-200 bg-white transition-colors hover:border-gray-300 hover:bg-gray-50/70 ${preview.accentClass}`}>
                        <div className="flex flex-col gap-4 px-4 py-4 sm:px-5 md:flex-row md:items-center md:justify-between">
                          <div className="flex min-w-0 flex-1 items-start gap-3">
                            <div className={`mt-0.5 flex h-10 w-10 shrink-0 items-center justify-center rounded-lg ${preview.iconWrapClass}`}>
                              <preview.icon size={18} className={preview.iconClass} />
                            </div>

                            <div className="min-w-0 flex-1">
                              <div className="flex min-w-0 flex-wrap items-center gap-2">
                                <span className={`rounded-md px-2 py-1 text-[11px] font-semibold uppercase tracking-[0.12em] ${preview.labelClass}`}>
                                  {transactionLabel}
                                </span>
                                {!isSaleOrPurchase && transaction.statusLabel ? <StatusPill tone={statusToneClass(transaction.statusLabel)}>{transaction.statusLabel}</StatusPill> : null}
                              </div>

                              <div className="mt-2 flex min-w-0 flex-wrap items-baseline gap-x-3 gap-y-1">
                                <p className="text-lg font-semibold text-gray-950">{transaction.documentNumber || "-"}</p>
                                <p className="text-sm text-gray-500">{transaction.date ? formatDate(transaction.date) : "-"}</p>
                              </div>

                              <div className="mt-2 flex flex-wrap items-center gap-x-3 gap-y-1 text-sm text-gray-500">
                                {linkedNumber ? <span>Parent purchase: {linkedNumber}</span> : null}
                                {transaction.note ? <span className="line-clamp-1 max-w-xl">{transaction.note}</span> : null}
                              </div>

                              {isSaleOrPurchase ? (
                                <div className="mt-3 flex flex-wrap items-center gap-2">
                                  {transaction.statusLabel ? <StatusPill tone={statusToneClass(transaction.statusLabel)}>Stage: {transaction.statusLabel}</StatusPill> : null}
                                  {transaction.fulfillmentStatusLabel ? <StatusPill tone={statusToneClass(transaction.fulfillmentStatusLabel)}>Fulfillment: {transaction.fulfillmentStatusLabel}</StatusPill> : null}
                                  {transaction.paymentStatusLabel ? <StatusPill tone={statusToneClass(transaction.paymentStatusLabel)}>Payment: {transaction.paymentStatusLabel}</StatusPill> : null}
                                </div>
                              ) : null}
                            </div>
                          </div>

                          <div className="flex shrink-0 items-center justify-between gap-4 border-t border-gray-100 pt-3 md:min-w-[240px] md:justify-end md:border-t-0 md:pt-0 md:text-right">
                            <div>
                              <p className="text-base font-semibold text-gray-950 md:text-lg">{transaction.formattedTotal || "-"}</p>
                              {isSaleOrPurchase ? <p className="mt-1 text-xs font-medium text-gray-500">Balance {transaction.formattedBalance || "-"}</p> : null}
                            </div>

                            {transaction.detailPath ? (
                              <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full border border-gray-200 bg-white text-gray-500 transition-colors group-hover:border-[#2d837d]/30 group-hover:text-[#2d837d]">
                                <ArrowUpRight size={16} />
                              </div>
                            ) : null}
                          </div>
                        </div>
                      </div>
                    );

                    return transaction.detailPath ? (
                      <Link key={transaction.id} href={transaction.detailPath} className="block">
                        {content}
                      </Link>
                    ) : (
                      <div key={transaction.id}>{content}</div>
                    );
                  })}
                </div>
                <AppPaginationFooter
                  entity="transactions"
                  sticky={false}
                  dataLength={transactions.length}
                  meta={transactionsMeta}
                  onChange={onTransactionPageChange}
                />
              </>
            ) : (
              <div className="border-t border-gray-100 py-10">
                <Empty image={Empty.PRESENTED_IMAGE_SIMPLE} description="No transactions recorded for this contact." />
              </div>
            )}
          </div>
        )}
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

function StatusPill({ children, tone = "default" }: { children: React.ReactNode; tone?: string }) {
  const toneClass =
    tone === "green"
      ? "border-emerald-200 bg-emerald-50 text-emerald-700"
      : tone === "amber"
        ? "border-amber-200 bg-amber-50 text-amber-700"
        : tone === "red"
          ? "border-red-200 bg-red-50 text-red-700"
          : tone === "blue"
            ? "border-sky-200 bg-sky-50 text-sky-700"
            : "border-gray-200 bg-gray-50 text-gray-600";

  return <span className={`rounded-full border px-2.5 py-1 text-xs font-medium ${toneClass}`}>{children}</span>;
}

function statusToneClass(label?: string) {
  const value = String(label || "").toLowerCase();

  if (value.includes("paid") && !value.includes("unpaid")) return "green";
  if (value.includes("received") || value.includes("fulfilled")) return "green";
  if (value.includes("partial")) return "amber";
  if (value.includes("pending") || value.includes("open")) return "blue";
  if (value.includes("cancel") || value.includes("void")) return "red";
  return "default";
}

function transactionPreviewConfig(type?: string) {
  if (type === "sale") {
    return {
      icon: Receipt,
      iconWrapClass: "bg-emerald-50",
      iconClass: "text-emerald-600",
      labelClass: "bg-emerald-50 text-emerald-700",
      accentClass: "before:absolute before:inset-y-0 before:left-0 before:w-1 before:bg-emerald-500",
    };
  }

  if (type === "purchase") {
    return {
      icon: PackageCheck,
      iconWrapClass: "bg-amber-50",
      iconClass: "text-amber-600",
      labelClass: "bg-amber-50 text-amber-700",
      accentClass: "before:absolute before:inset-y-0 before:left-0 before:w-1 before:bg-amber-500",
    };
  }

  if (type === "purchase_landed_cost") {
    return {
      icon: Truck,
      iconWrapClass: "bg-sky-50",
      iconClass: "text-sky-600",
      labelClass: "bg-sky-50 text-sky-700",
      accentClass: "before:absolute before:inset-y-0 before:left-0 before:w-1 before:bg-sky-500",
    };
  }

  return {
    icon: WalletCards,
    iconWrapClass: "bg-violet-50",
    iconClass: "text-violet-600",
    labelClass: "bg-violet-50 text-violet-700",
    accentClass: "before:absolute before:inset-y-0 before:left-0 before:w-1 before:bg-violet-500",
  };
}
