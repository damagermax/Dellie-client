"use client";

import { Button, Tag } from "antd";
import { Pencil, Trash2 } from "lucide-react";
import { GoBack } from "@/components/ui/GoBack";
import { formatDate } from "@/lib/dateUtils";
import { Sale } from "@/types/index";
import SaleDetailTables from "./SaleDetailTables";

interface SaleDetailContentProps {
  sale: Sale;
  currency: string;
  canEdit: boolean;
  isDeleting: boolean;
  onEdit: () => void;
  onDelete: () => void;
}

export default function SaleDetailContent({ sale, currency, canEdit, isDeleting, onEdit, onDelete }: SaleDetailContentProps) {
  const fulfillmentStatus = sale.receiptStatus || "pending";

  return (
    <section className="min-w-0 flex-1 border-r border-gray-200 bg-white lg:w-[70%] lg:flex-none">
      <div className="border-b border-gray-200 pb-5">
        <div className="flex flex-wrap items-center justify-between gap-4 px-8">
          <div className="flex items-center gap-x-3">
            <GoBack />
            <div>
              <div className="flex items-center gap-x-3">
                <h1 className="pageTittle">{sale.saleNumber}</h1>
                <Tag color={fulfillmentStatus === "received" ? "green" : "blue"}>{fulfillmentStatus.replaceAll("_", " ")}</Tag>
              </div>
              <p className="mt-1 text-sm text-gray-500">{sale.contactId?.name || sale.contactId?.displayName || "Customer not set"}</p>
            </div>
          </div>
          <div className="flex gap-x-3">
            <Button icon={<Pencil size={15} />} disabled={!canEdit} onClick={onEdit}>
              Edit
            </Button>
            <Button icon={<Trash2 size={15} />} danger loading={isDeleting} onClick={onDelete}>
              Delete
            </Button>
          </div>
        </div>
        <p className="ml-18 mt-3 text-sm text-gray-500">
          Created {formatDate(sale.createdAt)} by {sale.createdBy?.name || "-"} | Updated {formatDate(sale.updatedAt)}
        </p>
      </div>

      <div className="py-7">
        <div className="mb-9 grid grid-cols-2 gap-x-10 gap-y-6 px-5 md:grid-cols-4">
          <Detail label="Sale Date" value={formatDate(sale.date)} />
          <Detail label="Expected Delivery" value={formatDate(sale.deliveryDate)} />
          <Detail label="Location" value={sale.locationId?.name || "-"} />
          <Detail label="Payment Terms" value={sale.paymentTerms || "-"} />
          <Detail label="Due Date" value={formatDate(sale.dueDate)} />
          <Detail label="Currency" value={sale.currencyId?.name || currency || "-"} />
        </div>
        {sale.note && (
          <div className="mb-8 border-t border-gray-100 pt-5">
            <p className="mb-1 text-xs text-gray-500">Notes</p>
            <p className="text-sm text-gray-700">{sale.note}</p>
          </div>
        )}
        <SaleDetailTables sale={sale} currency={currency} />
      </div>
    </section>
  );
}

function Detail({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <p className="text-xs text-gray-500">{label}</p>
      <p className="mt-1 text-sm text-gray-700">{value}</p>
    </div>
  );
}
