"use client";

import { Divider } from "antd";
import { CalendarDays, Clock3, Truck, WalletCards } from "lucide-react";

import { Detail, IdentityPanel } from "@/components/shared/DetailPrimitives";
import { formatDate } from "@/lib/dateUtils";
import { getPaymentTermLabel } from "@/lib/payment-terms";
import type { Purchase } from "@/types/index";
import type { PaymentTerm } from "@/types/payment-term";

type PurchaseOverviewSectionProps = {
  purchase: Purchase;
  isCancelled: boolean;
  isClosed: boolean;
  paymentTerms: PaymentTerm[] | undefined;
};

export function PurchaseOverviewSection({ purchase, isCancelled, isClosed, paymentTerms }: PurchaseOverviewSectionProps) {
  const supplierName = purchase.contactId?.name || purchase.contactId?.displayName || "Supplier not set";
  const supplierMeta = [purchase.contactId?.email, purchase.contactId?.phone].filter(Boolean).join(" · ") || "No contact details provided";
  const locationName = purchase.locationId?.name || "Location not set";
  const locationMeta = purchase.locationId?.address || "No address provided";

  return (
    <div id="purchase-overview" className="scroll-mt-14 pt-5 md:pt-7">
      <div className="md:px-8">
        {isCancelled ? <div className="mb-5 border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-800">This purchase has been cancelled and is currently view-only. Reopen it to make changes.</div> : null}
        {isClosed ? <div className="mb-5 border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-900">This purchase is closed and read-only. Reopen it to make changes.</div> : null}
        <div className="grid gap-4 px-3 sm:grid-cols-2 md:px-0">
          <IdentityPanel label="Supplier" title={supplierName} description={supplierMeta} />
          <IdentityPanel label="Destination" title={locationName} description={locationMeta} />
        </div>
        <Divider className="!mt-6 " />
        <div className="mt-5 grid grid-cols-2 sm:grid-cols-4">
          <Detail className="border-r border-b border-gray-200 pl-3 pb-5 pr-5 md:pl-0 sm:border-b-0 sm:pb-0" icon={<CalendarDays size={17} />} label="Ordered" value={formatDate(purchase.date)} />
          <Detail className="border-b border-gray-200 pl-5 pb-5 sm:border-r sm:border-b-0 sm:pb-0 sm:pr-5" icon={<Truck size={17} />} label="Deliver by" value={formatDate(purchase.deliveryDate)} />
          <Detail className="border-r border-gray-200 pl-3 pr-5 pt-5 sm:pl-5 sm:pt-0 md:pl-0" icon={<Clock3 size={17} />} label="Payment Due" value={formatDate(purchase.dueDate)} />
          <Detail className="pl-5 pt-5 sm:pt-0" icon={<WalletCards size={17} />} label="Terms" value={getPaymentTermLabel(purchase.paymentTerms, paymentTerms || [])} />
        </div>
        <Divider className="!my-5 " />
      </div>
      {purchase.note ? (
        <div className="mx-4 mb-8 sm:mx-8">
          <p className="mb-1 text-xs font-medium uppercase tracking-[0.14em] text-amber-700">Note</p>
          <p className="text-sm leading-6 text-gray-700">{purchase.note}</p>
        </div>
      ) : null}
    </div>
  );
}
