"use client";

import { Button, Divider, Dropdown, MenuProps, Tag } from "antd";
import { CalendarDays, Clock3, Copy, CreditCard, Link as LinkIcon, MoreHorizontal, PackageCheck, Pencil, Receipt, RotateCcw, Trash2, Truck, WalletCards } from "lucide-react";
import { GoBack } from "@/components/ui/GoBack";
import { formatDate } from "@/lib/dateUtils";
import { useGetPaymentTermsQuery } from "@/lib/redux/services";
import { getPaymentTermLabel } from "@/lib/payment-terms";
import { Purchase } from "@/types/index";
import PurchaseOrderDetailTables from "./PurchaseOrderDetailTables";
import { Payment } from "@/types/transaction";
import { PurchaseLandedCost } from "@/types/purchase";
import { PurchaseStockEvent } from "@/types/purchase";

interface PurchaseOrderDetailContentProps {
  purchase: Purchase;
  currency: string;
  canManage?: boolean;
  canEdit: boolean;
  canReceive: boolean;
  isCancelling: boolean;
  isCancelled: boolean;
  onEdit: () => void;
  onDelete: () => void;
  onReopen: () => void;
  onReceive: () => void;
  onAddLandedCost: () => void;
  onRecordPayment: () => void;
  onRefund: () => void;
  onIssueCredit: () => void;
  onWriteOff: () => void;
  onEditFulfillment: (event: PurchaseStockEvent) => void;
  onDeleteFulfillment: (event: PurchaseStockEvent) => void;
  onEditPayment: (payment: Payment) => void;
  onDeletePayment: (payment: Payment) => void;
  onEditLandedCost: (landedCost: PurchaseLandedCost) => void;
  onDeleteLandedCost: (landedCost: PurchaseLandedCost) => void;
}

export default function PurchaseOrderDetailContent({
  purchase,
  currency,
  canManage = false,
  canEdit,
  canReceive,
  isCancelling,
  isCancelled,
  onEdit,
  onDelete,
  onReopen,
  onReceive,
  onAddLandedCost,
  onRecordPayment,
  onRefund,
  onIssueCredit,
  onWriteOff,
  onEditFulfillment,
  onDeleteFulfillment,
  onEditPayment,
  onDeletePayment,
  onEditLandedCost,
  onDeleteLandedCost,
}: PurchaseOrderDetailContentProps) {
  const { data: paymentTerms } = useGetPaymentTermsQuery();
  const moreItems: MenuProps["items"] = canManage
    ? [
        {
          key: "edit",
          disabled: !canEdit,
          icon: <Pencil size={15} />,
          label: "Edit Purchase",
          onClick: onEdit,
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
        // {
        //   key: "issue_credit",
        //   icon: <RotateCcw size={15} />,
        //   label: "Issue Credit",
        // },
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
          disabled: isCancelling,
          label: "Cancel Purchase",
          onClick: onDelete,
        },
      ]
    : [];

  const handleMoreClick: MenuProps["onClick"] = ({ key }) => {
    if (key === "refund") {
      onRefund();
      return;
    }
    // if (key === "issue_credit") {
    //   onIssueCredit();
    //   return;
    // }
    if (key === "write_off") {
      onWriteOff();
      return;
    }
    if (key === "delete") {
      onDelete();
    }
  };

  const supplierName = purchase.contactId?.name || purchase.contactId?.displayName || "Supplier not set";
  const supplierMeta = [purchase.contactId?.email, purchase.contactId?.phone].filter(Boolean).join(" · ") || "No contact details provided";
  const locationName = purchase.locationId?.name || "Location not set";
  const locationMeta = purchase.locationId?.address || "No address provided";
  const receiptTone = purchase.receiptStatus === "received" ? "green" : purchase.receiptStatus === "partially_received" ? "gold" : "blue";
  const readOnlyItems: MenuProps["items"] = [
    {
      key: "copy_number",
      icon: <Copy size={15} />,
      label: "Copy Purchase Number",
    },
    {
      key: "copy_link",
      icon: <LinkIcon size={15} />,
      label: "Copy Page Link",
    },
  ];
  const handleReadOnlyClick: MenuProps["onClick"] = async ({ key }) => {
    if (key === "copy_number") {
      await navigator.clipboard.writeText(purchase.purchaseNumber);
      return;
    }
    if (key === "copy_link") {
      await navigator.clipboard.writeText(window.location.href);
    }
  };

  return (
    <section className="min-w-0 flex-1 border-r border-gray-200 bg-white lg:w-[70%] lg:flex-none">
      <div className="border-b border-gray-200 bg-gradient-to-b from-white to-gray-50/70 px-4 md:px-8 pb-7 pt-5">
        <div className="flex flex-wrap justify-center items-start md:justify-between gap-5">
          <div className="flex w-full md:w-fit items-start gap-x-4">
            <GoBack />
            <div className="min-w-0">
              <div className="flex items-center gap-2">
                <h1 className="text-2xl font-semibold tracking-normal text-gray-950">{purchase.purchaseNumber}</h1>

                {!isCancelled && (
                  <Tag className="!m-0 !rounded-full !px-2 capitalize" color={receiptTone}>
                    {purchase.receiptStatus.replaceAll("_", " ")}
                  </Tag>
                )}
                {isCancelled && (
                  <Tag className="!m-0 !rounded-full !px-2" color="red">
                    Cancelled
                  </Tag>
                )}
              </div>
              <p className="mt-2 max-w-xl text-sm text-gray-500">
                Created {formatDate(purchase.createdAt)} by {purchase.createdBy?.name || "-"}
              </p>
            </div>
          </div>
          <div className="flex flex-wrap items-center justify-center md:justify-end gap-2">
            {isCancelled ? (
              <Button type="primary" className="!bg-[#f7c855] !font-semibold !text-black !shadow-none" onClick={onReopen}>
                Reopen Purchase
              </Button>
            ) : canManage ? (
              <>
                <Button type="primary" className="!shadow-none  !border-2 !bg-white !border-[#f7c855] !text-black !font-semibold" icon={<PackageCheck size={15} />} disabled={!canReceive} onClick={onReceive}>
                  Fulfill
                </Button>
                <Button type="primary" className="!shadow-none  !bg-[#f7c855] !text-black !font-semibold" icon={<CreditCard size={15} />} disabled={Boolean(purchase.locked)} onClick={onRecordPayment}>
                  Record Payment
                </Button>
                <Dropdown menu={{ items: [...readOnlyItems, { type: "divider" }, ...(moreItems || [])], onClick: (info) => (info.key === "copy_number" || info.key === "copy_link" ? handleReadOnlyClick(info) : handleMoreClick(info)) }} placement="bottomRight">
                  <Button type="text" className="!bg-gray-200/80 " icon={<MoreHorizontal size={15} />} />
                </Dropdown>
              </>
            ) : (
              <Dropdown menu={{ items: readOnlyItems, onClick: handleReadOnlyClick }} placement="bottomRight">
                <Button type="text" className="!bg-gray-200/80 " icon={<MoreHorizontal size={15} />} />
              </Dropdown>
            )}
          </div>
        </div>
      </div>

      <div className="pt-7">
        <div className=" px-4 md:px-8">
          {isCancelled && <div className="mb-5 border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-800">This purchase has been cancelled and is currently view-only. Reopen it to make changes.</div>}
          <div className="grid gap-4 sm:grid-cols-2">
            <IdentityPanel label="Supplier" title={supplierName} description={supplierMeta} />
            <IdentityPanel label="Destination" title={locationName} description={locationMeta} />
          </div>

          <Divider className="!mt-6 " />
          <div className="mt-5 grid grid-cols-2  sm:grid-cols-4">
            <Detail className="border-r border-b pb-5 sm:pb-0 sm:border-b-0 border-gray-200 pr-5" icon={<CalendarDays size={17} />} label="Ordered" value={formatDate(purchase.date)} />
            <Detail className="pl-5 sm:border-r border-b pb-5 sm:pb-0 sm:border-b-0  border-gray-200 sm:pr-5" icon={<Truck size={17} />} label="Deliver by" value={formatDate(purchase.deliveryDate)} />
            <Detail className="border-r pt-5 sm:pt-0 border-gray-200 pr-5 sm:pl-5" icon={<Clock3 size={17} />} label="Payment Due" value={formatDate(purchase.dueDate)} />
            <Detail className="pl-5 pt-5 sm:pt-0" icon={<WalletCards size={17} />} label="Terms" value={getPaymentTermLabel(purchase.paymentTerms, paymentTerms || [])} />
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
          canManage={canManage}
          isCancelled={isCancelled}
          onEditFulfillment={onEditFulfillment}
          onDeleteFulfillment={onDeleteFulfillment}
          onEditPayment={onEditPayment}
          onDeletePayment={onDeletePayment}
          onEditLandedCost={onEditLandedCost}
          onDeleteLandedCost={onDeleteLandedCost}
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
      <div className="mt-1 flex items-center gap-2 text-sm font-medium text-gray-900">
        {icon}
        <span>{value}</span>
      </div>
    </div>
  );
}
