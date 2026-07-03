"use client";

import React from "react";
import { Empty, Segmented, Tabs } from "antd";
import { useSelector } from "react-redux";
import AppTable from "@/components/ui/AppTable";
import { CostBreakdownModal } from "./PurchaseOrderSummary";
import { useGetCurrencyQuery, useGetStoreSettingsQuery } from "@/lib/redux/services";
import { RootState } from "@/lib/store";
import { Payment, Purchase, PurchaseLandedCost, PurchaseReturnEvent, PurchaseStockEvent } from "@/types/index";
import { buildPurchaseMobileTabItems, buildPurchaseTables, LandedCostBreakdownTable, MobilePurchaseList, PurchaseItemsTotalsCard, PurchaseTableView, purchaseTableOptions } from "./purchaseDetailTableSections";

interface PurchaseOrderDetailTablesProps {
  purchase: Purchase;
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
  onEditLandedCost: (landedCost: PurchaseLandedCost) => void;
  onDeleteLandedCost: (landedCost: PurchaseLandedCost) => void;
}

export default function PurchaseOrderDetailTables({
  purchase,
  currency,
  canManage = false,
  isCancelled,
  isReadOnly = false,
  onEditFulfillment,
  onDeleteFulfillment,
  onEditReturn,
  onDeleteReturn,
  onEditPayment,
  onDeletePayment,
  onEditLandedCost,
  onDeleteLandedCost,
}: PurchaseOrderDetailTablesProps) {
  const [view, setView] = React.useState<PurchaseTableView>("items");
  const [costOpen, setCostOpen] = React.useState(false);
  const activeStoreId = useSelector((state: RootState) => state.currentUser.activeStoreId || state.currentUser.store?.id || null);
  const activeStoreRole = useSelector((state: RootState) => state.currentUser.stores.find((store) => store.id === activeStoreId)?.role);
  const canMutate = canManage && !isCancelled && !isReadOnly;
  const isStaffUser = activeStoreRole === "staff";
  const user = typeof window !== "undefined" ? JSON.parse(localStorage.getItem("user") || "{}") : {};
  const { data: storeSettings } = useGetStoreSettingsQuery();
  const fallbackStoreCurrencyId = user?.store?.currencyId;
  const baseCurrencyId = storeSettings?.businessProfile?.currencyId || fallbackStoreCurrencyId;
  const { data: baseCurrencyRecord } = useGetCurrencyQuery(baseCurrencyId, { skip: !baseCurrencyId });
  const baseCurrency = baseCurrencyRecord?.code || user?.store?.currency?.code || user?.store?.currencyCode || user?.store?.settings?.currency || "";
  const availableOptions = React.useMemo(
    () =>
      purchaseTableOptions.filter(
        (option) =>
          (option.value !== "returns" || Boolean(purchase.returnedItems?.length)) &&
          (option.value !== "landedCosts" || Boolean(purchase.landedCosts?.length)),
      ),
    [purchase.landedCosts?.length, purchase.returnedItems?.length],
  );
  React.useEffect(() => {
    if (!availableOptions.some((option) => option.value === view)) {
      setView(availableOptions[0]?.value as PurchaseTableView);
    }
  }, [availableOptions, view]);
  const mobileTabItems = buildPurchaseMobileTabItems(availableOptions);
  const hasReturnedItems = purchase.lineItems.some((line) => Number(line.returnedQuantity || 0) > 0);
  const hasTaxedItems = purchase.lineItems.some((line) => Boolean(line.taxDescription) || Number(line.taxAmount || 0) > 0);
  const tables = buildPurchaseTables({
    purchase,
    currency,
    baseCurrency,
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
    onEditLandedCost,
    onDeleteLandedCost,
  });
  const current = tables[view];
  const discountedSubtotal = Math.max(Number(purchase.subTotal) - Number(purchase.discountAmount || 0), 0);
  const paidAmount = Number(purchase.amount) - Number(purchase.balance);
  const taxSummary = Object.entries(
    (purchase.taxes || []).reduce<Record<string, number>>((summary, tax) => {
      const name = purchase.taxId ? `${tax.name} @${tax.value}%` : tax.name;
      summary[name] = (summary[name] || 0) + Number(tax.amount || 0);
      return summary;
    }, {}),
  ).map(([name, amount]) => ({ name, amount }));

  return (
    <>
      <div className="mb-6 hidden overflow-x-auto pb-1 md:block">
        <div className="flex w-max min-w-full justify-center">
          <Segmented
            shape="round"
            options={availableOptions}
            value={view}
            onChange={(value) => setView(value as PurchaseTableView)}
            className="[&_.ant-segmented-item-selected]:!bg-[#2d837d] [&_.ant-segmented-item-selected]:!text-white"
            style={{ backgroundColor: "#ebebeb", padding: "5px" }}
          />
        </div>
      </div>
      <div className=" border-y border-gray-200 bg-white px-2 md:hidden">
        <Tabs
          activeKey={view}
          items={mobileTabItems}
          onChange={(value) => setView(value as PurchaseTableView)}
          tabBarGutter={18}
          className="purchase-mobile-tabs !mb-0 [&_.ant-tabs-nav]:!mb-0 [&_.ant-tabs-nav:before]:!border-0 [&_.ant-tabs-tab]:!py-4 [&_.ant-tabs-tab-btn]:!text-gray-500 [&_.ant-tabs-tab-active_.ant-tabs-tab-btn]:!text-[#2d837d] [&_.ant-tabs-ink-bar]:!bg-[#2d837d]"
        />
      </div>
      <div>
        <div className="mb-3 hidden items-center justify-between px-8">
          <h2 className=" text-base font-medium text-gray-900">{current.title}</h2>
        </div>
        {current.data.length ? (
          <>
            <div className="md:hidden">
              <MobilePurchaseList
                view={view}
                purchase={purchase}
                currency={currency}
                baseCurrency={baseCurrency}
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
                onEditLandedCost={onEditLandedCost}
                onDeleteLandedCost={onDeleteLandedCost}
              />
            </div>
            <div className="hidden md:block">
              <AppTable
                columns={current.columns}
                dataSource={current.data}
                rowKey="id"
                pagination={false}
                scrollX={900}
                expandable={
                  view === "landedCosts"
                    ? {
                        rowExpandable: (cost) => Boolean((cost as { allocations?: unknown[] }).allocations?.length),
                        expandedRowRender: (cost) => <LandedCostBreakdownTable cost={cost as PurchaseLandedCost} />,
                      }
                    : undefined
                }
              />
            </div>
            {view === "items" ? (
              <PurchaseItemsTotalsCard
                currency={currency}
                subTotal={Number(purchase.subTotal || 0)}
                discountAmount={Number(purchase.discountAmount || 0)}
                discountedSubtotal={discountedSubtotal}
                total={Number(purchase.amount || 0)}
                paid={paidAmount}
                balance={Number(purchase.balance || 0)}
                taxSummary={taxSummary}
                taxAmount={Number(purchase.taxAmount || 0)}
                onViewCostBreakdown={() => setCostOpen(true)}
              />
            ) : null}
          </>
        ) : (
          <div className="border-t border-gray-200 py-12">
            <Empty image={Empty.PRESENTED_IMAGE_SIMPLE} description={`No ${current.title.toLowerCase()} recorded`} />
          </div>
        )}
      </div>
      <CostBreakdownModal open={costOpen} onClose={() => setCostOpen(false)} purchase={purchase} currency={baseCurrency || currency} />
    </>
  );
}
