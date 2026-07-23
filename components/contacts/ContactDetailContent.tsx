"use client";

import Link from "next/link";
import React from "react";
import type { TableProps } from "antd/es/table";
import { Button, Divider, Dropdown, Empty, MenuProps, Segmented, Tag } from "antd";
import { Building2, FileText, Mail, MapPinned, MoreHorizontal, PackageCheck, Pencil, Phone, ShieldCheck, Smartphone, Trash2, UserRound, Users } from "lucide-react";
import { GoBack } from "@/components/ui/GoBack";
import { PhoneDisplay } from "@/components/ui/DisplayPhoneNumber";
import { formatDate } from "@/lib/dateUtils";
import { Contact, ContactRole, ContactStatus } from "@/types/contact";
import { formatContactAddress, formatContactRole } from "./contactUtils";
import { Transaction } from "@/types/transaction";
import AppPaginationFooter from "../ui/AppPaginationFooter";
import AppTable from "../ui/AppTable";
import { PaginationMeta } from "@/types/shared";
import { usePermissions } from "@/hooks/usePermissions";
import { StorePermission } from "@/types/store-access";
import { ContactAssignmentModal } from "./ContactAssignmentModal";

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
  receivables: Transaction[];
  receivablesLoading: boolean;
  receivablesError: boolean;
  receivablesMeta?: PaginationMeta;
  onReceivablesPageChange: (page: number, limit: number) => void;
  payables: Transaction[];
  payablesLoading: boolean;
  payablesError: boolean;
  payablesMeta?: PaginationMeta;
  onPayablesPageChange: (page: number, limit: number) => void;
  onContactUpdated?: () => void;
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
  receivables,
  receivablesLoading,
  receivablesError,
  receivablesMeta,
  onReceivablesPageChange,
  payables,
  payablesLoading,
  payablesError,
  payablesMeta,
  onPayablesPageChange,
  onContactUpdated,
}: ContactDetailContentProps) {
  const [view, setView] = React.useState<"overview" | "receivables" | "payables" | "transactions">("overview");
  const [assignmentMode, setAssignmentMode] = React.useState<"employee" | "customer" | null>(null);
  const { hasPermission } = usePermissions();
  const title = contact.name;
  const primaryAddress = formatContactAddress(contact.addresses?.[0]);
  const currencyCode = typeof contact.currencyId === "string" ? undefined : contact.currencyId?.code;
  const statusTone = contact.status === ContactStatus.ACTIVE ? "green" : "default";
  const canManageContacts = hasPermission(StorePermission.CONTACTS_MANAGE);
  const roles = contact.roles || [];
  const isEmployee = roles.includes(ContactRole.EMPLOYEE);
  const isCustomer = roles.includes(ContactRole.CUSTOMER);
  const transactionSummary = contact.transactionSummary;
  const summaryCards = [
    { key: "sales", title: "Sales", item: transactionSummary?.sales, tone: "emerald" as const },
    { key: "purchases", title: "Purchases", item: transactionSummary?.purchases, tone: "sky" as const },
    { key: "expenses", title: "Expenses", item: transactionSummary?.expenses, tone: "amber" as const },
    { key: "landedCosts", title: "Landed Costs", item: transactionSummary?.landedCosts, tone: "violet" as const },
  ].filter((card) => (card.item?.count || 0) > 0);

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

  const tableOptions = React.useMemo(
    () =>
      [
        { label: <SegmentLabel icon={<FileText size={15} />} text="Overview" />, value: "overview" },
        ...(receivablesMeta?.total ? [{ label: <SegmentLabel icon={<FileText size={15} />} text="Receivables" />, value: "receivables" as const }] : []),
        ...(payablesMeta?.total ? [{ label: <SegmentLabel icon={<FileText size={15} />} text="Payables" />, value: "payables" as const }] : []),
        { label: <SegmentLabel icon={<PackageCheck size={15} />} text="Transactions" />, value: "transactions" },
      ] as { label: React.ReactNode; value: "overview" | "receivables" | "payables" | "transactions" }[],
    [payablesMeta?.total, receivablesMeta?.total],
  );
  React.useEffect(() => {
    if (!tableOptions.some((option) => option.value === view)) {
      setView("overview");
    }
  }, [tableOptions, view]);

  const transactionColumns: TableProps<Transaction>["columns"] = [
    {
      title: "Reference",
      key: "reference",
      className: "!pl-8",
      width: "20%",
      render: (_, transaction) => {
        const value = transactionReference(transaction);
        const secondary =
          transaction.type === "expense"
            ? transaction.typeLabel || transaction.type?.replaceAll("_", " ")
            : transaction.type === "purchase_landed_cost"
              ? transaction.linkedDocumentSnapshot?.number
                ? `Purchase: ${transaction.linkedDocumentSnapshot.number}`
                : transaction.typeLabel || transaction.type?.replaceAll("_", " ")
              : transaction.type === "sale" || transaction.type === "purchase"
                ? transaction.typeLabel || transaction.type?.replaceAll("_", " ")
                : undefined;

        const content = (
          <div className="min-w-0">
            <p className="truncate font-medium text-gray-700">{value}</p>
            {secondary ? <p className="mt-0.5 truncate text-xs text-gray-500">{secondary}</p> : null}
          </div>
        );

        return transaction.detailPath ? (
          <Link href={transaction.detailPath} className="block hover:text-indigo-600">
            {content}
          </Link>
        ) : (
          content
        );
      },
    },
    { title: "Date", key: "date", render: (_, transaction) => (transaction.date ? formatDate(transaction.date) : "-") },
    {
      title: "Status",
      key: "status",
      render: (_, transaction) => (
        <div className="flex flex-wrap gap-1.5">
          {transaction.statusLabel ? <StatusPill tone={statusToneClass(transaction.statusLabel)}>{transaction.statusLabel}</StatusPill> : null}
          {transaction.fulfillmentStatusLabel ? <StatusPill tone={statusToneClass(transaction.fulfillmentStatusLabel)}>{transaction.fulfillmentStatusLabel}</StatusPill> : null}
          {transaction.paymentStatusLabel ? <StatusPill tone={statusToneClass(transaction.paymentStatusLabel)}>{transaction.paymentStatusLabel}</StatusPill> : null}
        </div>
      ),
    },
    { title: "Total Amount", key: "amount", render: (_, transaction) => transaction.formattedTotal || "-" },
    { title: "Balance", key: "balance", render: (_, transaction) => transaction.formattedBalance || "-" },
  ];
  const visibleTransactions = view === "transactions" ? transactions : view === "receivables" ? receivables : payables;
  const outstandingTotal = React.useMemo(
    () => visibleTransactions.reduce((sum, transaction) => sum + Number(transaction.balance || 0), 0),
    [visibleTransactions],
  );
  const formattedOutstandingTotal = formatContactMoney(outstandingTotal, currencyCode);

  return (
    <section className="min-w-0 flex-1 border-r border-gray-200 bg-white lg:w-[70%] lg:flex-none">
      <div className="border-b border-gray-200 bg-gradient-to-b from-white to-gray-50/70 px-4  py-5 md:px-8">
        <div className="flex flex-wrap items-start justify-between gap-5">
          <div className="flex w-full items-start gap-x-4 md:w-fit">
            <GoBack />
            <div className="flex min-w-0 items-start gap-4">
              <div className="min-w-0">
                <div className="flex flex-wrap items-center gap-2">
                  <h1 className="break-words text-xl font-semibold tracking-normal text-gray-950 md:text-2xl">{title}</h1>
                  <Tag className="!m-0 !rounded-full !px-2 capitalize" color={statusTone}>
                    {contact.status}
                  </Tag>
                  {roles.map((role) => (
                    <Tag key={role} className="!m-0 !rounded-full !px-2 capitalize" color="blue">
                      {formatContactRole(role)}
                    </Tag>
                  ))}
                </div>
              </div>
            </div>
          </div>
          <div className="flex w-full flex-wrap items-center justify-end gap-2 md:w-auto">
            <Button type="primary" className="!border-2 !border-[#f7c855] !bg-white !font-semibold !text-black !shadow-none" icon={<Pencil size={15} />} onClick={onEdit}>
              Edit
            </Button>
            <Dropdown menu={{ items: moreItems }} placement="bottomRight">
              <Button type="text" className="!bg-gray-200/80" icon={<MoreHorizontal size={15} />} />
            </Dropdown>
          </div>
        </div>
      </div>
      <div id="contact-overview" className="scroll-mt-14 pt-5 w-full md:pt-7">
        <div className="px-4 md:px-8">
          <div className="grid gap-4 sm:grid-cols-2">
            <IdentityPanel label="Name" title={title} icon={<UserRound size={18} />} />
            <IdentityPanel label="Primary Address" title="Address" description={primaryAddress} icon={<MapPinned size={18} />} />
          </div>

          <Divider className="!mt-6" />
          <div className="mt-5 grid grid-cols-1 gap-y-5 sm:grid-cols-3 sm:gap-y-0">
            <Detail className="border-b border-gray-200 pb-5 sm:border-b-0 sm:border-r sm:pr-5 sm:pb-0" icon={<Phone size={17} />} label="Work Phone" value={contact.phone ? <PhoneDisplay phone={contact.phone} /> : "-"} />
            <Detail className="border-b border-gray-200 pb-5 sm:border-b-0 sm:border-r sm:px-5 sm:pb-0" icon={<Smartphone size={17} />} label="Mobile" value={contact.mobile ? <PhoneDisplay phone={contact.mobile} /> : "-"} />
            <Detail className="sm:pl-5" icon={<Mail size={17} />} label="Email" value={contact.email || "-"} />
          </div>
          <Divider className="!my-5" />
        </div>

        <div id="contact-records" className="scroll-mt-14 flex justify-start overflow-x-auto px-4 md:justify-center md:px-0 w-full">
          <Segmented
            shape="round"
            options={tableOptions}
            value={view}
            onChange={(value) => setView(value as "overview" | "receivables" | "payables" | "transactions")}
            className="[&_.ant-segmented-item-selected]:!bg-[#2d837d] [&_.ant-segmented-item-selected]:!text-white"
            style={{ backgroundColor: "#ebebeb", padding: "5px" }}
          />
        </div>

        {view === "overview" ? (
          <div className="">
            <div className="grid mt-8  ">
              {!isEmployee ? (
                <section className="border-y border-gray-200 bg-white px-8 py-4">
                  <div className="flex items-start justify-between gap-4">
                    <div>
                      <p className="text-xs font-medium uppercase tracking-[0.16em] text-gray-400">Transaction Summary</p>
                    </div>
                  </div>

                  {summaryCards.length ? (
                    <div className="mt-4 grid gap-3 md:grid-cols-2 xl:grid-cols-4">
                      {summaryCards.map((card) => (
                        <SummaryCard key={card.key} title={card.title} amount={card.item?.formattedTotal || "0.00"} count={card.item?.count || 0} tone={card.tone} />
                      ))}
                    </div>
                  ) : (
                    <div className="mt-5 rounded-lg border border-dashed border-gray-200 bg-gray-50 px-4 py-6 text-sm text-gray-500">No transactions recorded for this contact yet.</div>
                  )}
                </section>
              ) : null}

              <section className="border-b border-gray-200 bg-white py-5 px-8">
                <div className="flex items-start justify-between gap-4">
                  <div>
                    <p className="text-xs font-medium uppercase tracking-[0.16em] text-gray-400">Other Details</p>
                    <h2 className="mt-2 text-lg font-semibold text-gray-900">Role-specific details</h2>
                    <p className="mt-1 text-sm text-gray-500">Customer and employee information tied to this contact.</p>
                  </div>
                </div>

                <div className="mt-5 space-y-5">
                  {isEmployee ? (
                    <DetailSection icon={<ShieldCheck size={16} />} title="Employee Access">
                      <CompactDetail label="Role" value={contact.employeeAccess?.role || "-"} />
                      <CompactDetail
                        label="Permissions"
                        value={
                          contact.employeeAccess?.permissions?.length ? (
                            <div className="flex flex-wrap gap-2">
                              {contact.employeeAccess.permissions.map((permission) => (
                                <span key={permission} className="rounded-full border border-gray-200 bg-gray-50 px-2.5 py-1 text-xs font-medium text-gray-600">
                                  {permission.replaceAll(".", " ")}
                                </span>
                              ))}
                            </div>
                          ) : (
                            "-"
                          )
                        }
                      />
                    </DetailSection>
                  ) : null}

                  {isEmployee ? (
                    <DetailSection
                      icon={<Users size={16} />}
                      title="Assigned Customers"
                      action={
                        canManageContacts ? (
                          <Button type="default" size="small" icon={<Pencil size={14} />} onClick={() => setAssignmentMode("employee")}>
                            Manage
                          </Button>
                        ) : undefined
                      }
                    >
                      {contact.assignedCustomers?.length ? (
                        <div className="space-y-3">
                          {contact.assignedCustomers.map((assignedCustomer) => (
                            <div key={assignedCustomer.id} className="flex items-start justify-between gap-3 rounded-md border border-gray-200 px-3 py-2">
                              <div className="min-w-0">
                                <p className="truncate text-sm font-medium text-gray-900">{assignedCustomer.name}</p>
                                <p className="truncate text-xs text-gray-500">{assignedCustomer.email || assignedCustomer.phone || "No email or phone"}</p>
                              </div>
                              <Link href={`/contacts/${assignedCustomer.id}`} className="text-xs font-medium text-[#2d837d]">
                                View
                              </Link>
                            </div>
                          ))}
                        </div>
                      ) : (
                        <p className="text-sm text-gray-500">No customers are assigned to this employee yet.</p>
                      )}
                    </DetailSection>
                  ) : null}

                  {isCustomer ? (
                    <DetailSection
                      icon={<Building2 size={16} />}
                      title="Assigned Employee"
                      action={
                        canManageContacts ? (
                          <Button type="default" size="small" icon={<Pencil size={14} />} onClick={() => setAssignmentMode("customer")}>
                            Edit
                          </Button>
                        ) : undefined
                      }
                    >
                      {contact.assignedEmployee ? (
                        <div className="rounded-md border border-gray-200 px-3 py-3">
                          <p className="text-sm font-medium text-gray-900">{contact.assignedEmployee.name}</p>
                          <p className="mt-1 text-xs text-gray-500">{contact.assignedEmployee.email || contact.assignedEmployee.phone || "No email or phone"}</p>
                          <Link href={`/contacts/${contact.assignedEmployee.id}`} className="mt-2 inline-flex text-xs font-medium text-[#2d837d]">
                            View employee
                          </Link>
                        </div>
                      ) : (
                        <p className="text-sm text-gray-500">No employee is assigned to this customer yet.</p>
                      )}
                    </DetailSection>
                  ) : null}

                  {contact.note ? (
                    <DetailSection icon={<FileText size={16} />} title="Note">
                      <p className="text-sm leading-6 text-gray-700">{contact.note}</p>
                    </DetailSection>
                  ) : null}
                </div>
              </section>
            </div>
          </div>
        ) : (
          <div className="mt-8 pb-8  ">
            {(view === "transactions" ? transactionsLoading : view === "receivables" ? receivablesLoading : payablesLoading) ? (
              <div className="space-y-3">
                {Array.from({ length: 3 }).map((_, index) => (
                  <div key={index} className="border-b border-gray-100 py-4">
                    <div className="h-4 w-40 animate-pulse rounded bg-gray-200" />
                    <div className="mt-2 h-3 w-28 animate-pulse rounded bg-gray-100" />
                  </div>
                ))}
              </div>
            ) : (view === "transactions" ? transactionsError : view === "receivables" ? receivablesError : payablesError) ? (
              <p className="py-6 text-sm text-red-600">Transactions could not be loaded.</p>
            ) : (view === "transactions" ? transactions : view === "receivables" ? receivables : payables).length ? (
              <>
                <div className="divide-y divide-gray-200 border-y border-gray-200 md:hidden">
                  {visibleTransactions.map((transaction) => {
                    const content = <div className="px-4 py-4"><div className="flex items-start justify-between gap-3"><div className="min-w-0"><p className="truncate font-medium text-gray-950">{transactionReference(transaction)}</p><p className="mt-1 text-sm capitalize text-gray-500">{transaction.typeLabel || transaction.type?.replaceAll("_", " ") || "Transaction"}</p></div><p className="shrink-0 font-semibold text-gray-950">{transaction.formattedTotal || "-"}</p></div><div className="mt-3 flex items-end justify-between gap-3"><div className="flex flex-wrap gap-1.5">{transaction.statusLabel ? <StatusPill tone={statusToneClass(transaction.statusLabel)}>{transaction.statusLabel}</StatusPill> : null}{transaction.paymentStatusLabel ? <StatusPill tone={statusToneClass(transaction.paymentStatusLabel)}>{transaction.paymentStatusLabel}</StatusPill> : null}</div><div className="text-right"><p className="text-xs text-gray-400">{transaction.date ? formatDate(transaction.date) : "-"}</p><p className="mt-1 text-xs text-gray-500">Balance {transaction.formattedBalance || "-"}</p></div></div></div>;
                    return transaction.detailPath ? <Link key={transaction.id} href={transaction.detailPath} className="block active:bg-gray-50">{content}</Link> : <div key={transaction.id}>{content}</div>;
                  })}
                </div>
                <div className="hidden md:block"><AppTable<Transaction> columns={transactionColumns} dataSource={visibleTransactions} rowKey={(transaction) => transaction.id || `${transaction.type || "transaction"}-${transaction.documentNumber || transaction.createdAt || transaction.updatedAt || "row"}`} pagination={false} /></div>
                {view === "receivables" || view === "payables" ? (
                  <div className="border-b border-gray-200 bg-gray-50 px-4 py-3 md:px-8">
                    <div className="flex items-center justify-between gap-3 text-sm">
                      <p className="font-medium text-gray-600">Total outstanding balance</p>
                      <p className="text-base font-semibold text-gray-950">{formattedOutstandingTotal}</p>
                    </div>
                  </div>
                ) : null}
                <AppPaginationFooter
                  entity={view === "transactions" ? "transactions" : view}
                  sticky={false}
                  dataLength={(view === "transactions" ? transactions : view === "receivables" ? receivables : payables).length}
                  meta={view === "transactions" ? transactionsMeta : view === "receivables" ? receivablesMeta : payablesMeta}
                  onChange={view === "transactions" ? onTransactionPageChange : view === "receivables" ? onReceivablesPageChange : onPayablesPageChange}
                />
              </>
            ) : (
              <div className="border-t border-gray-100 py-10">
                <Empty
                  image={Empty.PRESENTED_IMAGE_SIMPLE}
                  description={view === "receivables" ? "No unpaid sales recorded for this contact." : view === "payables" ? "No unpaid purchases or expenses recorded for this contact." : "No transactions recorded for this contact."}
                />
              </div>
            )}
          </div>
        )}
      </div>
      {assignmentMode ? <ContactAssignmentModal open={Boolean(assignmentMode)} toggle={() => setAssignmentMode(null)} contact={contact} mode={assignmentMode} onSaved={onContactUpdated} /> : null}
    </section>
  );
}

function IdentityPanel({
  label,
  title,
  description,
  icon,
}: {
  label: string;
  title: string;
  description?: string;
  icon: React.ReactNode;
}) {
  return (
    <div className="flex w-full items-start gap-3">
      <div className="mt-1 text-gray-400">{icon}</div>
      <div className="min-w-0 flex-1">
        <p className="text-xs font-medium uppercase tracking-[0.16em] text-gray-400">{label}</p>
        <p className="mt-1 truncate text-lg font-medium text-gray-800">{title}</p>
        {description ? <p className="mt-1 text-sm text-gray-500">{description}</p> : null}
      </div>
    </div>
  );
}

function SummaryCard({ title, amount, count, tone }: { title: string; amount: string; count: number; tone: "emerald" | "sky" | "amber" | "violet" }) {
  const toneClass = tone === "emerald" ? "border-emerald-200 bg-emerald-50" : tone === "sky" ? "border-sky-200 bg-sky-50" : tone === "amber" ? "border-amber-200 bg-amber-50" : "border-violet-200 bg-violet-50";

  return (
    <div className={`rounded-md border px-3 py-3 ${toneClass}`}>
      <p className="text-[11px] font-medium uppercase tracking-[0.14em] text-gray-500">{title}</p>
      <p className="mt-1.5 text-lg font-semibold leading-tight text-gray-950">{amount}</p>
      <p className="mt-1 text-xs text-gray-600">
        {count} transaction{count === 1 ? "" : "s"}
      </p>
    </div>
  );
}

function DetailSection({ icon, title, children, action }: { icon: React.ReactNode; title: string; children: React.ReactNode; action?: React.ReactNode }) {
  return (
    <section>
      <div className="mb-3 flex items-center justify-between gap-3">
        <div className="flex items-center gap-2 text-sm font-semibold text-gray-900">
          <span className="text-gray-500">{icon}</span>
          <span>{title}</span>
        </div>
        {action}
      </div>
      <div className="space-y-3">{children}</div>
    </section>
  );
}

function CompactDetail({ label, value }: { label: string; value: React.ReactNode }) {
  return (
    <div className="rounded-md border border-gray-200 px-3 py-2">
      <p className="text-xs font-medium uppercase tracking-[0.14em] text-gray-400">{label}</p>
      <div className="mt-1 text-sm font-medium text-gray-900">{value}</div>
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

function transactionReference(transaction: Transaction) {
  if (transaction.type === "expense") {
    return transaction.note?.trim() || transaction.documentNumber || "-";
  }

  if (transaction.type === "purchase_landed_cost") {
    return transaction.note?.trim() || transaction.linkedDocumentSnapshot?.number || transaction.documentNumber || "-";
  }

  if (transaction.type === "sale" || transaction.type === "purchase") {
    return transaction.documentNumber || "-";
  }

  return transaction.documentNumber || transaction.note?.trim() || "-";
}

function formatContactMoney(amount: number, currencyCode?: string) {
  const formattedAmount = Number(amount || 0).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 });
  return currencyCode ? `${currencyCode} ${formattedAmount}` : formattedAmount;
}
