"use client";

import { ActionDropdown } from "@/components/ui/ActionDropdown";
import { ResolvedProductName } from "@/components/products/ResolvedProductName";
import { formatDate } from "@/lib/dateUtils";
import { canMutatePayment } from "@/lib/paymentMutationWindow";
import { canMutateStockEvent } from "@/lib/stockMutationWindow";
import { Payment, Sale } from "@/types/index";

import {
  InlineSummaryRow,
  MobileEvent,
  MobileMetric,
  money,
  ProductCell,
  productImage,
  productName,
  productSku,
  SaleReturnRestockIndicator,
  SaleTableSectionHandlers,
  SaleTableView,
} from "./saleDetailTableShared";

export function SaleItemsTotalsCard({
  currency,
  subTotal,
  discountAmount,
  discountedSubtotal,
  deliveryFee,
  showDeliveryFee,
  total,
  paid,
  refund,
  writeOff,
  showRefund,
  showWriteOff,
  balance,
  taxSummary,
  taxAmount,
}: {
  currency: string;
  subTotal: number;
  discountAmount: number;
  discountedSubtotal: number;
  deliveryFee: number;
  showDeliveryFee: boolean;
  total: number;
  paid: number;
  refund: number;
  writeOff: number;
  showRefund: boolean;
  showWriteOff: boolean;
  balance: number;
  taxSummary: Array<{ name: string; amount: number }>;
  taxAmount: number;
}) {
  return (
    <div className="px-4 pb-6 pt-5 md:px-8">
      <div className="ml-auto w-full md:w-[40%] md:min-w-[320px]">
        <div className="space-y-4">
          <InlineSummaryRow label="Items Total" value={money(currency, subTotal)} />
          <InlineSummaryRow label="Discount" value={`- ${money(currency, discountAmount)}`} />
          <InlineSummaryRow label="Subtotal" value={money(currency, discountedSubtotal)} />
          {taxSummary.length ? taxSummary.map((tax) => <InlineSummaryRow key={tax.name} label={tax.name} value={money(currency, tax.amount)} />) : taxAmount > 0 ? <InlineSummaryRow label="Taxes" value={money(currency, taxAmount)} /> : null}
          {showDeliveryFee && deliveryFee > 0 ? <InlineSummaryRow label="Delivery Fee" value={money(currency, deliveryFee)} /> : null}
          <div className="border-t border-gray-300 pt-4">
            <InlineSummaryRow label="Total" value={money(currency, total)} strong />
          </div>
          <InlineSummaryRow label="Paid" value={money(currency, paid)} />
          {showRefund ? <InlineSummaryRow label="Refund" value={money(currency, refund)} /> : null}
          {showWriteOff ? <InlineSummaryRow label="Write-off" value={money(currency, writeOff)} /> : null}
          <div className="border-t border-gray-300 pt-4">
            <InlineSummaryRow label="Balance" value={money(currency, balance)} strong />
          </div>
        </div>
      </div>
    </div>
  );
}

type MobileSaleListProps = SaleTableSectionHandlers & {
  view: SaleTableView;
  sale: Sale;
  currency: string;
  canMutate: boolean;
  isStaffUser: boolean;
  hasReturnedItems: boolean;
  hasTaxedItems: boolean;
};

export function MobileSaleList({
  view,
  sale,
  currency,
  hasReturnedItems,
  hasTaxedItems,
  canMutate,
  isStaffUser,
  onEditFulfillment,
  onDeleteFulfillment,
  onEditReturn,
  onDeleteReturn,
  onEditPayment,
  onDeletePayment,
}: MobileSaleListProps) {
  if (view === "items") {
    return (
      <div className="divide-y divide-gray-200 border-y border-gray-200">
        {sale.lineItems.map((line) => (
          <div key={line.id} className="px-4 py-4">
            <ProductCell name={line.productName} product={line.productId} sku={line.productSku || productSku(line.productId)} imageUrl={line.productUrl || productImage(line.productId)} />
            <div className="mt-3 grid grid-cols-3 gap-3 text-sm">
              <MobileMetric label="Ordered" value={Number(line.quantity || 0).toLocaleString()} />
              <MobileMetric label="Fulfilled" value={Number(line.fulfilledQuantity || 0).toLocaleString()} />
              {hasReturnedItems ? <MobileMetric label="Returned" value={Number(line.returnedQuantity || 0).toLocaleString()} /> : null}
              <MobileMetric label="Remaining" value={Math.max(Number(line.quantity || 0) - Number(line.fulfilledQuantity || 0), 0).toLocaleString()} />
              {hasTaxedItems ? <MobileMetric label="Tax" value={line.taxDescription ? `${line.taxRate || 0}%` : "-"} /> : null}
            </div>
            <div className="mt-3 flex items-center justify-between gap-3 border-t border-gray-100 pt-3 text-sm">
              <span className="text-gray-500">Unit price {money(currency, Number(line.unitPrice || 0))}</span>
              <span className="font-semibold text-gray-950">{money(currency, Number(line.total || 0))}</span>
            </div>
          </div>
        ))}
      </div>
    );
  }

  if (view === "payments") {
    return (
      <div className="divide-y divide-gray-200 border-y border-gray-200">
        {((sale.payments || []) as Payment[]).map((payment) => (
          <MobileEvent
            key={payment.id}
            title={payment.type?.replaceAll("_", " ") || "Payment"}
            date={formatDate(payment.date)}
            detail={payment.paymentMethod?.name || payment.note || "No payment method"}
            value={`${currency} ${Number(payment.amount || 0).toFixed(2)}`}
            action={canMutate && canMutatePayment(payment) ? <ActionDropdown openEditModal={() => onEditPayment(payment)} onDelete={() => onDeletePayment(payment)} /> : null}
          />
        ))}
      </div>
    );
  }

  if (view === "returns") {
    return (
      <div className="divide-y divide-gray-200 border-y border-gray-200">
        {(sale.returnedItems || []).map((event) => (
          <div key={event.id} className="px-4 py-4">
            <div className="flex items-start justify-between gap-3">
              <div className="min-w-0 flex-1">
                <p className="truncate font-medium capitalize text-gray-950">
                  <ResolvedProductName name={productName(event.productId)} product={event.productId} />
                </p>
                <p className="mt-1 truncate text-sm text-gray-500">{event.reason || "No reason provided"}</p>
              </div>
              <div className="flex items-start gap-2">
                <SaleReturnRestockIndicator restock={event.restock} />
                {canMutate && (!isStaffUser || canMutateStockEvent(event)) ? <ActionDropdown openEditModal={() => onEditReturn(event)} onDelete={() => onDeleteReturn(event)} /> : null}
              </div>
            </div>
            <div className="mt-2 flex items-center justify-between gap-3 text-[13px] text-gray-500">
              <span>{Number(event.quantity || 0).toLocaleString()} returned</span>
              <span>{formatDate(event.returnedAt)}</span>
            </div>
          </div>
        ))}
      </div>
    );
  }

  return (
    <div className="divide-y divide-gray-200 border-y border-gray-200">
      {(sale.fulfilledItems || []).map((event) => (
        <MobileEvent
          key={event.id}
          title={<ResolvedProductName name={productName(event.productId)} product={event.productId} />}
          date={formatDate(event.fulfilledAt)}
          detail={productSku(event.productId) ? `SKU: ${productSku(event.productId)}` : "Fulfillment"}
          value={`${Number(event.quantity || 0).toLocaleString()} fulfilled`}
          action={canMutate && (!isStaffUser || canMutateStockEvent(event)) ? <ActionDropdown openEditModal={() => onEditFulfillment(event)} onDelete={() => onDeleteFulfillment(event)} /> : null}
        />
      ))}
    </div>
  );
}
