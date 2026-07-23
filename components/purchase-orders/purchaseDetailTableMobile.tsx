"use client";

import { ActionDropdown } from "@/components/ui/ActionDropdown";
import { formatDate } from "@/lib/dateUtils";
import { canMutatePayment } from "@/lib/paymentMutationWindow";
import { canMutateStockEvent } from "@/lib/stockMutationWindow";
import { Payment, Purchase } from "@/types/index";

import {
  InlineSummaryRow,
  landedCostAmountLabel,
  landedCostCurrencyCode,
  MobileCard,
  MobileProductHeader,
  MobileStat,
  MobileTotal,
  money,
  productImage,
  productName,
  productSku,
  PurchaseTableSectionHandlers,
  PurchaseTableView,
} from "./purchaseDetailTableShared";

export function PurchaseItemsTotalsCard({
  currency,
  subTotal,
  discountAmount,
  discountedSubtotal,
  total,
  paid,
  refund,
  writeOff,
  showRefund,
  showWriteOff,
  balance,
  taxSummary,
  taxAmount,
  onViewCostBreakdown,
}: {
  currency: string;
  subTotal: number;
  discountAmount: number;
  discountedSubtotal: number;
  total: number;
  paid: number;
  refund: number;
  writeOff: number;
  showRefund: boolean;
  showWriteOff: boolean;
  balance: number;
  taxSummary: Array<{ name: string; amount: number }>;
  taxAmount: number;
  onViewCostBreakdown: () => void;
}) {
  return (
    <div className="px-4 pb-6 pt-5 md:px-8">
      <div className="ml-auto w-full md:w-[40%] md:min-w-[320px]">
        <div className="space-y-4">
          <InlineSummaryRow label="Items Total" value={money(currency, subTotal)} />
          <InlineSummaryRow label="Discount" value={`- ${money(currency, discountAmount)}`} />
          <InlineSummaryRow label="Subtotal" value={money(currency, discountedSubtotal)} />
          {taxSummary.length ? taxSummary.map((tax) => <InlineSummaryRow key={tax.name} label={tax.name} value={money(currency, tax.amount)} />) : taxAmount > 0 ? <InlineSummaryRow label="Taxes" value={money(currency, taxAmount)} /> : null}
          <div className="border-t border-gray-300 pt-4">
            <InlineSummaryRow label="Total" value={money(currency, total)} strong />
          </div>
          <InlineSummaryRow label="Paid" value={money(currency, paid)} />
          {showRefund ? <InlineSummaryRow label="Refund" value={money(currency, refund)} /> : null}
          {showWriteOff ? <InlineSummaryRow label="Write-off" value={money(currency, writeOff)} /> : null}
          <div className="border-t border-gray-300 pt-4">
            <InlineSummaryRow label="Balance" value={money(currency, balance)} strong />
          </div>
          <button type="button" onClick={onViewCostBreakdown} className="pt-2 text-sm font-medium text-[#2d837d] transition hover:opacity-80">
            View Cost Breakdown
          </button>
        </div>
      </div>
    </div>
  );
}

type MobilePurchaseListProps = PurchaseTableSectionHandlers & {
  view: PurchaseTableView;
  purchase: Purchase;
  currency: string;
  baseCurrency: string;
  hasReturnedItems: boolean;
  hasTaxedItems: boolean;
  canMutate: boolean;
  isStaffUser: boolean;
};

export function MobilePurchaseList({
  view,
  purchase,
  currency,
  baseCurrency,
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
  onEditLandedCost,
  onDeleteLandedCost,
}: MobilePurchaseListProps) {
  if (view === "items") {
    return (
      <div className="grid">
        {purchase.lineItems.map((line) => (
          <MobileCard key={line.id}>
            <MobileProductHeader name={line.productName} product={line.productId} sku={line.productSku || productSku(line.productId)} imageUrl={line.productUrl || productImage(line.productId)} />
            <div className="mt-3 grid grid-cols-2 gap-2 text-[13px]">
              <MobileStat label="Ordered" value={Number(line.quantity).toLocaleString()} />
              <MobileStat label="Fulfilled" value={Number(line.fulfilledQuantity || 0).toLocaleString()} />
              {hasReturnedItems ? <MobileStat label="Returned" value={Number(line.returnedQuantity || 0).toLocaleString()} /> : null}
              <MobileStat label="Remaining" value={Math.max(Number(line.quantity || 0) - Number(line.fulfilledQuantity || 0), 0).toLocaleString()} />
              {hasTaxedItems ? <MobileStat label="Tax" value={line.taxDescription ? `${line.taxRate || 0}%` : "-"} /> : null}
            </div>
            <div className="mt-3 flex items-center justify-between gap-3 text-[13px]">
              <span className="text-gray-500">Unit Cost {money(currency, Number(line.unitPrice || 0))}</span>
              <span className="font-semibold text-gray-900">{money(currency, Number(line.total || 0))}</span>
            </div>
          </MobileCard>
        ))}
      </div>
    );
  }

  if (view === "returns") {
    return (
      <div className="grid">
        {(purchase.returnedItems || []).map((event) => (
          <MobileCard key={event.id}>
            <div className="flex items-start justify-between gap-3">
              <MobileProductHeader name={productName(event.productId)} product={event.productId} sku={productSku(event.productId)} imageUrl={productImage(event.productId)} />
              {canMutate && (!isStaffUser || canMutateStockEvent(event)) ? <ActionDropdown openEditModal={() => onEditReturn(event)} onDelete={() => onDeleteReturn(event)} /> : null}
            </div>
            <div className="mt-2 flex items-center justify-between gap-3 text-[13px] text-gray-500">
              <span>Qty {Number(event.quantity).toLocaleString()}</span>
              <span>{formatDate(event.returnedAt)}</span>
            </div>
            {event.reason ? <MobileTotal label="Reason" value={event.reason} /> : null}
          </MobileCard>
        ))}
      </div>
    );
  }

  if (view === "fulfillments") {
    return (
      <div className="grid">
        {(purchase.fulfilledItems || []).map((event) => (
          <MobileCard key={event.id}>
            <div className="flex items-start justify-between gap-3">
              <MobileProductHeader name={productName(event.productId)} product={event.productId} sku={productSku(event.productId)} imageUrl={productImage(event.productId)} />
              {canMutate && (!isStaffUser || canMutateStockEvent(event)) ? <ActionDropdown openEditModal={() => onEditFulfillment(event)} onDelete={() => onDeleteFulfillment(event)} /> : null}
            </div>
            <div className="mt-2 flex items-center justify-between gap-3 text-[13px] text-gray-500">
              <span>Qty {Number(event.quantity).toLocaleString()}</span>
              <span>{formatDate(event.fulfilledAt)}</span>
            </div>
          </MobileCard>
        ))}
      </div>
    );
  }

  if (view === "landedCosts") {
    return (
      <div>
        {(purchase.landedCosts || []).map((cost) => (
          <MobileCard key={cost.id}>
            <div className="flex items-start justify-between gap-4">
              <p className="text-base font-medium text-gray-900">{cost.name}</p>
              {canMutate ? <ActionDropdown openEditModal={() => onEditLandedCost(cost)} onDelete={() => onDeleteLandedCost(cost)} /> : null}
            </div>
            <div className="mt-3 shrink-0 text-base font-semibold text-gray-900">{landedCostAmountLabel(cost, baseCurrency)}</div>
            <div className="mt-3 flex items-center justify-between gap-3 text-sm">
              <span className="text-gray-500">{cost.contactName || "No contact"}</span>
              <span className="text-gray-500">{cost.date ? formatDate(cost.date) : "-"}</span>
            </div>
            <div className="mt-3 flex items-center justify-between gap-3 text-sm">
              <span className="text-gray-500 capitalize">Allocation: {cost.allocationMethod.replaceAll("_", " ").toLowerCase()}</span>
              <span className="text-gray-500">{cost.appliesTo === "SELECTED_ITEMS" ? `${cost.lineItemIds.length} selected product${cost.lineItemIds.length === 1 ? "" : "s"}` : "All products"}</span>
            </div>
            {(cost.allocations || []).length ? (
              <div className="mt-3 grid gap-2">
                {(cost.allocations || []).map((allocation) => (
                  <div key={allocation.lineItemId} className="rounded-md bg-gray-50 px-3 py-2 text-xs">
                    <div className="flex items-center justify-between gap-2">
                      <span className="font-medium text-gray-800">{allocation.productName || "Product"}</span>
                      <span className="font-semibold text-gray-900">{money(allocation.currencyCode || landedCostCurrencyCode(cost), allocation.allocatedAmount)}</span>
                    </div>
                    <p className="mt-1 text-gray-500">
                      Qty {Number(allocation.quantity || 0).toLocaleString()} · {money(allocation.currencyCode || landedCostCurrencyCode(cost), allocation.allocatedPerUnit)} per unit
                      {baseCurrency ? ` · Base ${money(baseCurrency, allocation.baseAllocatedAmount)}` : ""}
                    </p>
                  </div>
                ))}
              </div>
            ) : null}
            {cost.note ? <MobileTotal label="Note" value={cost.note} /> : null}
          </MobileCard>
        ))}
      </div>
    );
  }

  return (
    <div className="grid gap-3 pb-6">
      {((purchase.payments || []) as Payment[]).map((payment, index) => (
        <MobileCard key={payment.id || index}>
          <div className="flex items-start justify-between gap-4">
            <div>
              <p className="text-base font-semibold capitalize text-gray-900">{payment.type?.replaceAll("_", " ") || "Payment"}</p>
              <p className="mt-1 text-xs text-gray-500">{formatDate(payment.date)}</p>
            </div>
            {canMutate && canMutatePayment(payment) ? <ActionDropdown openEditModal={() => onEditPayment(payment)} onDelete={() => onDeletePayment(payment)} /> : null}
          </div>
          <p className="mt-3 shrink-0 text-base font-semibold text-gray-900">
            {currency} {Number(payment.amount || 0).toFixed(2)}
          </p>
          <MobileTotal label="Payment Method" value={payment.paymentMethod?.name || "-"} />
          <MobileTotal label="Note" value={payment.note || "-"} />
        </MobileCard>
      ))}
    </div>
  );
}
