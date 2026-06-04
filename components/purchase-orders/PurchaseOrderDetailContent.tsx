"use client";

import { Button, Divider, Dropdown, MenuProps, Tag } from "antd";
import { CalendarDays, Clock3, CreditCard, MoreHorizontal, PackageCheck, Pencil, Receipt, RotateCcw, Trash2, Truck, WalletCards } from "lucide-react";
import { GoBack } from "@/components/ui/GoBack";
import { formatDate } from "@/lib/dateUtils";
import { Purchase } from "@/types/index";
import PurchaseOrderDetailTables from "./PurchaseOrderDetailTables";

interface PurchaseOrderDetailContentProps {
  purchase: Purchase;
  currency: string;
  canEdit: boolean;
  canReceive: boolean;
  canReturn: boolean;
  isDeleting: boolean;
  onEdit: () => void;
  onDelete: () => void;
  onReceive: () => void;
  onReturn: () => void;
  onAddLandedCost: () => void;
  onRecordPayment: () => void;
  onEditFulfillment: (event: any) => void;
  onDeleteFulfillment: (event: any) => void;
  onEditReturn: (event: any) => void;
  onDeleteReturn: (event: any) => void;
}

export default function PurchaseOrderDetailContent({
  purchase,
  currency,
  canEdit,
  canReceive,
  canReturn,
  isDeleting,
  onEdit,
  onDelete,
  onReceive,
  onReturn,
  onAddLandedCost,
  onRecordPayment,
  onEditFulfillment,
  onDeleteFulfillment,
  onEditReturn,
  onDeleteReturn,
}: PurchaseOrderDetailContentProps) {
  const moreItems: MenuProps["items"] = [
    {
      key: "edit",
      disabled: !canEdit,
      icon: <Pencil size={15} />,
      label: "Edit Purchase",
      onClick: onEdit,
    },
    {
      key: "return",
      disabled: !canReturn,
      icon: <RotateCcw size={15} />,
      label: "Return Items",
      onClick: onReturn,
    },

    {
      key: "landed_cost",
      disabled: Boolean(purchase.locked),
      icon: <Truck size={15} />,
      label: "Add Landed Cost",
      onClick: onAddLandedCost,
    },
    {
      type: "divider",
    },
    {
      key: "refund",
      icon: <RotateCcw size={15} />,
      label: "Refund Payment",
    },
    {
      key: "issue_credit",
      icon: <RotateCcw size={15} />,
      label: "Issue Credit",
    },
    {
      key: "write_off",
      icon: <Receipt size={15} />,
      label: "Write Off Balance",
    },
    {
      type: "divider",
    },
    {
      key: "delete",
      icon: <Trash2 size={15} />,
      danger: true,
      label: "Delete Purchase",
      onClick: onDelete,
    },
  ];

  const supplierName = purchase.contactId?.name || purchase.contactId?.displayName || "Supplier not set";
  const supplierMeta = [purchase.contactId?.email, purchase.contactId?.phone].filter(Boolean).join(" · ") || "No contact details provided";
  const locationName = purchase.locationId?.name || "Location not set";
  const locationMeta = purchase.locationId?.address || "No address provided";
  const receiptTone = purchase.receiptStatus === "received" ? "green" : purchase.receiptStatus === "partially_received" ? "gold" : "blue";

  return (
    <section className="min-w-0 flex-1 border-r border-gray-200 bg-white lg:w-[70%] lg:flex-none">
      <div className="border-b border-gray-200 bg-gradient-to-b from-white to-gray-50/70 px-4 md:px-8 pb-7 pt-5">
        <div className="flex flex-wrap justify-center items-start md:justify-between gap-5">
          <div className="flex w-full md:w-fit items-start gap-x-4">
            <GoBack />
            <div className="min-w-0">
              <div className="flex items-center gap-2">
                <h1 className="text-2xl font-semibold tracking-normal text-gray-950">{purchase.purchaseNumber}</h1>

                <Tag className="!m-0 !rounded-full !px-2 capitalize" color={receiptTone}>
                  {purchase.receiptStatus.replaceAll("_", " ")}
                </Tag>
              </div>
              <p className="mt-2 max-w-xl text-sm text-gray-500">
                Created {formatDate(purchase.createdAt)} by {purchase.createdBy?.name || "-"}
              </p>
            </div>
          </div>
          <div className="flex flex-wrap items-center justify-center md:justify-end gap-2">
            <Button type="primary" className="!shadow-none  !border-2 !bg-white !border-[#f7c855] !text-black !font-semibold" icon={<PackageCheck size={15} />} disabled={!canReceive} onClick={onReceive}>
              Fulfill
            </Button>
            <Button type="primary" className="!shadow-none  !bg-[#f7c855] !text-black !font-semibold" icon={<CreditCard size={15} />} disabled={Boolean(purchase.locked)} onClick={onRecordPayment}>
              Record Payment
            </Button>

            <Dropdown menu={{ items: moreItems }} placement="bottomRight">
              <Button type="text" className="!bg-gray-200/80 " icon={<MoreHorizontal size={15} />} />
            </Dropdown>
          </div>
        </div>
      </div>

      <div className="pt-7">
        <div className=" px-4 md:px-8">
          <div className="grid gap-4 sm:grid-cols-2">
            <IdentityPanel label="Supplier" title={supplierName} description={supplierMeta} />
            <IdentityPanel label="Destination" title={locationName} description={locationMeta} />
          </div>

          <Divider className="!mt-6 " />
          <div className="mt-5 grid grid-cols-2  sm:grid-cols-4">
            <Detail className="border-r border-b pb-5 sm:pb-0 sm:border-b-0 border-gray-200 pr-5" icon={<CalendarDays size={17} />} label="Ordered" value={formatDate(purchase.date)} />
            <Detail className="pl-5 sm:border-r border-b pb-5 sm:pb-0 sm:border-b-0  border-gray-200 sm:pr-5" icon={<Truck size={17} />} label="Deliver by" value={formatDate(purchase.deliveryDate)} />
            <Detail className="border-r pt-5 sm:pt-0 border-gray-200 pr-5 sm:pl-5" icon={<Clock3 size={17} />} label="Payment Due" value={formatDate(purchase.dueDate)} />
            <Detail className="pl-5 pt-5 sm:pt-0" icon={<WalletCards size={17} />} label="Terms" value={purchase.paymentTerms || "-"} />
          </div>
          <Divider className="!my-5 " />
        </div>

        {purchase.note && (
          <div className="mx-4 sm:mx-8 mb-8   ">
            <p className="mb-1 text-xs font-medium uppercase tracking-[0.14em] text-amber-700">Note</p>
            <p className="text-sm leading-6 text-gray-700">{purchase.note}</p>
          </div>
        )}

        <PurchaseOrderDetailTables
          purchase={purchase}
          currency={currency}
          onEditFulfillment={onEditFulfillment}
          onDeleteFulfillment={onDeleteFulfillment}
          onEditReturn={onEditReturn}
          onDeleteReturn={onDeleteReturn}
        />
      </div>
    </section>
  );
}

function IdentityPanel({ label, title, description }: { label: string; title: string; description: string }) {
  return (
    <div className={``}>
      <div className="flex items-start gap-3">
        <div className="min-w-0">
          <p className="text-xs font-medium uppercase tracking-[0.16em] text-gray-400">{label}</p>
          <p className="mt-1 truncate text-lg font-medium text-gray-800">{title}</p>
          <p className="mt-1 text-sm text-gray-500">{description}</p>
        </div>
      </div>
    </div>
  );
}

function Detail({ icon, label, value, className = "" }: { icon: React.ReactNode; label: string; value: string; className?: string }) {
  return (
    <div className={`min-w-0 ${className}`}>
      <p className="text-xs font-medium uppercase tracking-[0.12em] text-gray-400 ">{label}</p>
      <p className="mt-1 text-sm font-medium text-gray-900">{value}</p>
    </div>
  );
}
