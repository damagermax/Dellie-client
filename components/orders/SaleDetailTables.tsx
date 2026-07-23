"use client";

import React from "react";
import { Empty, Segmented } from "antd";
import { useSelector } from "react-redux";
import AppTable from "@/components/ui/AppTable";
import { RootState } from "@/lib/store";
import { Sale, Payment, PurchaseReturnEvent, PurchaseStockEvent } from "@/types/index";
import { buildDocumentSettlementSummary } from "@/components/payment/documentSettlementSummary";
import { buildSaleTables, MobileSaleList, SaleItemsTotalsCard, SaleTableView, saleTableOptions } from "./saleDetailTableSections";

interface SaleDetailTablesProps {
  sale: Sale;
  currency: string;
  canManage?: boolean;
  isCancelled: boolean;
  isReadOnly?: boolean;
  onEditFulfillment: (event: PurchaseStockEvent) => void;
  onDeleteFulfillment: (event: PurchaseStockEvent) => void;
  onEditReturn: (event: PurchaseReturnEvent) => void;
  onDeleteReturn: (event: PurchaseReturnEvent) => void;
  onEditPayment: (payment: Payment) => void;
  onDeletePayment: (payment: Payment) => void;
}

export default function SaleDetailTables({ sale, currency, canManage = false, isCancelled, isReadOnly = false, onEditFulfillment, onDeleteFulfillment, onEditReturn, onDeleteReturn, onEditPayment, onDeletePayment }: SaleDetailTablesProps) {
  const [view, setView] = React.useState<SaleTableView>("items");
  const activeStoreId = useSelector((state: RootState) => state.currentUser.activeStoreId || state.currentUser.store?.id || null);
  const activeStoreRole = useSelector((state: RootState) => state.currentUser.stores.find((store) => store.id === activeStoreId)?.role);
  const canMutate = canManage && !isCancelled && !isReadOnly;
  const isStaffUser = activeStoreRole === "staff";
  const availableOptions = React.useMemo(() => saleTableOptions.filter((option) => option.value !== "returns" || Boolean(sale.returnedItems?.length)), [sale.returnedItems?.length]);
  React.useEffect(() => {
    if (!availableOptions.some((option) => option.value === view)) {
      setView("items");
    }
  }, [availableOptions, view]);
  const hasReturnedItems = sale.lineItems.some((line) => Number(line.returnedQuantity || 0) > 0);
  const hasTaxedItems = sale.lineItems.some((line) => Boolean(line.taxDescription) || Number(line.taxAmount || 0) > 0);
  const tables = buildSaleTables({
    sale,
    currency,
    canMutate,
    isStaffUser,
    hasReturnedItems,
    hasTaxedItems,
    onEditFulfillment,
    onDeleteFulfillment,
    onEditReturn,
    onDeleteReturn,
    onEditPayment,
    onDeletePayment,
  });
  const current = tables[view];
  const discountedSubtotal = Math.max(Number(sale.subTotal) - Number(sale.discountAmount || 0), 0);
  const settlement = buildDocumentSettlementSummary(sale);
  const taxSummary = Object.entries(
    (sale.taxes || []).reduce<Record<string, number>>((summary, tax) => {
      const name = sale.taxId ? `${tax.name} @${tax.value}%` : tax.name;
      summary[name] = (summary[name] || 0) + Number(tax.amount || 0);
      return summary;
    }, {}),
  ).map(([name, amount]) => ({ name, amount }));

  return (
    <>
      <div className="mb-8 overflow-x-auto pb-1">
        <div className="flex w-max min-w-full justify-center">
          <Segmented
            shape="round"
            options={availableOptions}
            value={view}
            onChange={(value) => setView(value as SaleTableView)}
            className="[&_.ant-segmented-item-selected]:!bg-[#2d837d] [&_.ant-segmented-item-selected]:!text-white"
            style={{ backgroundColor: "#ebebeb", padding: "5px" }}
          />
        </div>
      </div>
      <div>
        {current.data.length ? (
          <>
            <div className="md:hidden">
              <MobileSaleList
                view={view}
                sale={sale}
                currency={currency}
                hasReturnedItems={hasReturnedItems}
                hasTaxedItems={hasTaxedItems}
                canMutate={canMutate}
                isStaffUser={isStaffUser}
                onEditFulfillment={onEditFulfillment}
                onDeleteFulfillment={onDeleteFulfillment}
                onEditReturn={onEditReturn}
                onDeleteReturn={onDeleteReturn}
                onEditPayment={onEditPayment}
                onDeletePayment={onDeletePayment}
              />
            </div>
            <div className="hidden md:block">
              <AppTable
                columns={current.columns}
                dataSource={current.data}
                rowKey="id"
                pagination={false}
                scrollX={860}
              />
            </div>
            {view === "items" ? (
              <SaleItemsTotalsCard
                currency={currency}
                subTotal={Number(sale.subTotal || 0)}
                discountAmount={Number(sale.discountAmount || 0)}
                discountedSubtotal={discountedSubtotal}
                deliveryFee={Number(sale.deliveryFee || 0)}
                showDeliveryFee={sale.fulfillmentMethod !== "pickup"}
                total={Number(sale.amount || 0)}
                paid={settlement.paidAmount}
                refund={settlement.refundAmount}
                writeOff={settlement.writeOffAmount}
                showRefund={settlement.hasRefundAmount}
                showWriteOff={settlement.hasWriteOffAmount}
                balance={Number(sale.balance || 0)}
                taxSummary={taxSummary}
                taxAmount={Number(sale.taxAmount || 0)}
              />
            ) : null}
          </>
        ) : (
          <div className="border-t border-gray-200 py-12">
            <Empty image={Empty.PRESENTED_IMAGE_SIMPLE} description={`No ${current.title.toLowerCase()} recorded`} />
          </div>
        )}
      </div>
    </>
  );
}
