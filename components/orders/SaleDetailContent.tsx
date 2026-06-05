"use client";

import { Button, Divider, Dropdown, MenuProps, Tag } from "antd";
import { CalendarDays, Clock3, CreditCard, FileText, MoreHorizontal, PackageCheck, Pencil, Receipt, ReceiptText, RotateCcw, Trash2, Truck, WalletCards } from "lucide-react";
import { GoBack } from "@/components/ui/GoBack";
import { formatDate } from "@/lib/dateUtils";
import { useGetPaymentTermsQuery } from "@/lib/redux/services";
import { getPaymentTermLabel } from "@/lib/payment-terms";
import { Sale } from "@/types/index";
import SaleDetailTables from "./SaleDetailTables";
import { SaleDocumentType } from "./SaleShareDocumentModal";
import { Payment } from "@/types/transaction";
import { saleDocumentNumber } from "./saleUtils";

interface SaleDetailContentProps {
  sale: Sale;
  currency: string;
  canEdit: boolean;
  canFulfill: boolean;
  isQuote: boolean;
  isCancelling: boolean;
  isConverting: boolean;
  isCancelled: boolean;
  onEdit: () => void;
  onDelete: () => void;
  onReopen: () => void;
  onConvert: () => void;
  onFulfill: () => void;
  onRecordPayment: () => void;
  onRefund: () => void;
  onIssueCredit: () => void;
  onWriteOff: () => void;
  onShare: (type: SaleDocumentType) => void;
  onEditFulfillment: (event: unknown) => void;
  onDeleteFulfillment: (event: unknown) => void;
  onEditPayment: (payment: Payment) => void;
  onDeletePayment: (payment: Payment) => void;
}

export default function SaleDetailContent({
  sale,
  currency,
  canEdit,
  canFulfill,
  isQuote,
  isCancelling,
  isConverting,
  isCancelled,
  onEdit,
  onDelete,
  onReopen,
  onConvert,
  onFulfill,
  onRecordPayment,
  onRefund,
  onIssueCredit,
  onWriteOff,
  onShare,
  onEditFulfillment,
  onDeleteFulfillment,
  onEditPayment,
  onDeletePayment,
  }: SaleDetailContentProps) {
  const { data: paymentTerms } = useGetPaymentTermsQuery();
  const fulfillmentStatus = sale.receiptStatus || "pending";
  const statusTone = fulfillmentStatus === "received" ? "green" : fulfillmentStatus === "partially_received" ? "gold" : "blue";
  const sourceTone = sale.source === "POS" ? "green" : sale.source === "Online Store" ? "blue" : sale.source === "Sales Order" ? "gold" : "default";
  const customerName = sale.contactId?.name || sale.contactId?.displayName || "Walk-in Customer";
  const customerMeta = [sale.contactId?.email, sale.contactId?.phone].filter(Boolean).join(" · ") || "No contact details provided";
  const locationName = sale.locationId?.name || "Location not set";
  const locationMeta = sale.locationId?.address || "No address provided";

  const moreItems: MenuProps["items"] = isQuote
    ? [
        {
          key: "edit",
          disabled: !canEdit,
          icon: <Pencil size={15} />,
          label: "Edit Quote",
          onClick: onEdit,
        },
        {
          type: "divider",
        },
        {
          key: "delete",
          icon: <Trash2 size={15} />,
          danger: true,
          disabled: isCancelling,
          label: "Cancel Quote",
          onClick: onDelete,
        },
      ]
    : [
        {
          key: "edit",
          disabled: !canEdit,
          icon: <Pencil size={15} />,
          label: "Edit Sale",
          onClick: onEdit,
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
          key: "invoice",
          icon: <FileText size={15} />,
          label: "Share Invoice",
          onClick: () => onShare("invoice"),
        },
        {
          key: "receipt",
          icon: <ReceiptText size={15} />,
          label: "Share Receipt",
          onClick: () => onShare("receipt"),
        },
        {
          type: "divider",
        },
        {
          key: "delete",
          icon: <Trash2 size={15} />,
          danger: true,
          disabled: isCancelling,
          label: "Cancel Sale",
          onClick: onDelete,
        },
      ];

  const handleMoreClick: MenuProps["onClick"] = ({ key }) => {
    if (isQuote) return;
    if (key === "refund") {
      onRefund();
      return;
    }
    if (key === "issue_credit") {
      onIssueCredit();
      return;
    }
    if (key === "write_off") {
      onWriteOff();
      return;
    }
    if (key === "delete") {
      onDelete();
    }
  };

  return (
    <section className="min-w-0 flex-1 border-r border-gray-200 bg-white lg:w-[70%] lg:flex-none">
      <div className="border-b border-gray-200 bg-gradient-to-b from-white to-gray-50/70 px-4 pb-7 pt-5 md:px-8">
        <div className="flex flex-wrap items-start justify-center gap-5 md:justify-between">
          <div className="flex w-full items-start gap-x-4 md:w-fit">
            <GoBack />
            <div className="min-w-0">
              <div className="flex items-center gap-2">
                <h1 className="text-2xl font-semibold tracking-normal text-gray-950">{saleDocumentNumber(sale)}</h1>
                {!isCancelled && !isQuote && (
                  <Tag className="!m-0 !rounded-full !px-2 capitalize" color={statusTone}>
                    {fulfillmentStatus.replaceAll("_", " ")}
                  </Tag>
                )}
                {!isCancelled && isQuote && (
                  <Tag className="!m-0 !rounded-full !px-2" color="purple">
                    Estimate
                  </Tag>
                )}
                <Tag className="!m-0 !rounded-full !px-2" color={sourceTone}>
                  {sale.source || "Manual Sale"}
                </Tag>
                {isCancelled && (
                  <Tag className="!m-0 !rounded-full !px-2" color="red">
                    Cancelled
                  </Tag>
                )}
              </div>
              <p className="mt-2 max-w-xl text-sm text-gray-500">
                Created {formatDate(sale.createdAt)} by {sale.createdBy?.name || "-"}
              </p>
            </div>
          </div>
          <div className="flex flex-wrap items-center justify-center gap-2 md:justify-end">
            {isCancelled ? (
              <Button type="primary" className="!bg-[#f7c855] !font-semibold !text-black !shadow-none" onClick={onReopen}>
                Reopen Sale
              </Button>
            ) : isQuote ? (
              <>
                <Button type="primary" className="!bg-[#f7c855] !font-semibold !text-black !shadow-none" loading={isConverting} icon={<ReceiptText size={15} />} onClick={onConvert}>
                  Convert to Sale
                </Button>
                <Dropdown menu={{ items: moreItems, onClick: handleMoreClick }} placement="bottomRight">
                  <Button type="text" className="!bg-gray-200/80" icon={<MoreHorizontal size={15} />} />
                </Dropdown>
              </>
            ) : (
              <>
                <Button type="primary" className="!border-2 !border-[#f7c855] !bg-white !font-semibold !text-black !shadow-none" icon={<PackageCheck size={15} />} disabled={!canFulfill} onClick={onFulfill}>
                  Fulfill
                </Button>
                <Button type="primary" className="!bg-[#f7c855] !font-semibold !text-black !shadow-none" icon={<CreditCard size={15} />} disabled={Boolean(sale.locked)} onClick={onRecordPayment}>
                  Record Payment
                </Button>
                <Dropdown menu={{ items: moreItems, onClick: handleMoreClick }} placement="bottomRight">
                  <Button type="text" className="!bg-gray-200/80" icon={<MoreHorizontal size={15} />} />
                </Dropdown>
              </>
            )}
          </div>
        </div>
      </div>

      <div className="pt-7">
        <div className="px-4 md:px-8">
          {isCancelled && <div className="mb-5 border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-800">This sale has been cancelled and is currently view-only. Reopen it to make changes.</div>}
          <div className="grid gap-4 sm:grid-cols-2">
            <IdentityPanel label="Customer" title={customerName} description={customerMeta} />
            <IdentityPanel label="Location" title={locationName} description={locationMeta} />
          </div>

          <Divider className="!mt-6" />
          <div className="mt-5 grid grid-cols-2 sm:grid-cols-4">
            <Detail className="border-b border-r border-gray-200 pb-5 pr-5 sm:border-b-0 sm:pb-0" icon={<CalendarDays size={17} />} label="Sold" value={formatDate(sale.date)} />
            <Detail className="border-b border-gray-200 pb-5 pl-5 sm:border-b-0 sm:border-r sm:pr-5 sm:pb-0" icon={<Truck size={17} />} label="Deliver by" value={formatDate(sale.deliveryDate)} />
            <Detail className="border-r border-gray-200 pr-5 pt-5 sm:pl-5 sm:pt-0" icon={<Clock3 size={17} />} label="Payment Due" value={formatDate(sale.dueDate)} />
            <Detail className="pl-5 pt-5 sm:pt-0" icon={<WalletCards size={17} />} label="Terms" value={getPaymentTermLabel(sale.paymentTerms, paymentTerms || [])} />
          </div>
          <Divider className="!my-5" />
        </div>
        {sale.note && (
          <div className="mx-4 mb-8 sm:mx-8">
            <p className="mb-1 text-xs font-medium uppercase tracking-[0.14em] text-amber-700">Note</p>
            <p className="text-sm leading-6 text-gray-700">{sale.note}</p>
          </div>
        )}
        <SaleDetailTables sale={sale} currency={currency} isCancelled={isCancelled} onEditFulfillment={onEditFulfillment} onDeleteFulfillment={onDeleteFulfillment} onEditPayment={onEditPayment} onDeletePayment={onDeletePayment} />
      </div>
    </section>
  );
}

function IdentityPanel({ label, title, description }: { label: string; title: string; description: string }) {
  return (
    <div>
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
      <p className="text-xs font-medium uppercase tracking-[0.12em] text-gray-400">{label}</p>
      <div className="mt-1 flex items-center gap-2 text-sm font-medium text-gray-900">
        {icon}
        <span>{value}</span>
      </div>
    </div>
  );
}
