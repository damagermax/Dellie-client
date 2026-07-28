"use client";

import { useMemo, useState } from "react";
import { Button, Drawer, Segmented, Tag } from "antd";
import { paymentStatusLabel } from "@/components/shared/paymentStatusLabel";
import type { Sale } from "@/types/index";
import type { SavedPosCart } from "./types";
import { POS_MODAL_OVERLAY_STYLE, formatHistoryTime, formatMoney, getSavedCartItemCount, getSavedCartTotal } from "./utils";

const receiptStatusLabels: Record<string, string> = {
  pending: "Pending",
  partially_received: "Partial",
  received: "Fulfilled",
};

const fulfillmentMethodLabels: Record<string, string> = {
  now: "Fulfill now",
  pickup: "Pickup",
  delivery: "Delivery",
  dine_in: "Dine in",
};

type PosHistoryDrawerProps = {
  open: boolean;
  savedCarts: SavedPosCart[];
  activeSavedCartId: string | null;
  selectedCurrencyCode: string;
  todaysCompletedSales: Sale[];
  salesHistoryLoading: boolean;
  onClose: () => void;
  onRestoreSavedCart: (savedCart: SavedPosCart) => void;
  onRemoveSavedCart: (savedCartId: string) => void;
};

type HistoryTab = "completed" | "saved";

export default function PosHistoryDrawer({
  open,
  savedCarts,
  activeSavedCartId,
  selectedCurrencyCode,
  todaysCompletedSales,
  salesHistoryLoading,
  onClose,
  onRestoreSavedCart,
  onRemoveSavedCart,
}: PosHistoryDrawerProps) {
  const [activeTab, setActiveTab] = useState<HistoryTab>("completed");

  const tabOptions = useMemo(
    () => [
      { label: `Completed sales (${todaysCompletedSales.length})`, value: "completed" },
      { label: `Saved carts (${savedCarts.length})`, value: "saved" },
    ] satisfies { label: string; value: HistoryTab }[],
    [savedCarts.length, todaysCompletedSales.length],
  );

  return (
    <Drawer title="History" open={open} onClose={onClose} width={520} styles={{ mask: POS_MODAL_OVERLAY_STYLE }}>
      <div className="space-y-4 pb-4">
        <Segmented
          block
          value={activeTab}
          onChange={(value) => setActiveTab(value as HistoryTab)}
          options={tabOptions}
          className="!bg-stone-100"
        />

        {activeTab === "saved" ? (
          savedCarts.length ? (
            <div className="bg-white">
              {savedCarts.map((savedCart, index) => {
                const savedCartTotal = getSavedCartTotal(savedCart);
                const itemCount = getSavedCartItemCount(savedCart);
                const isActive = activeSavedCartId === savedCart.id;
                const customerName = savedCart.selectedContact?.name?.trim() || "Walk-in Customer";

                return (
                  <div key={savedCart.id} className={`bg-white px-4 py-4 ${index !== savedCarts.length - 1 ? "border-b border-stone-200" : ""}`}>
                    <div className="flex items-start justify-between gap-3">
                      <div className="min-w-0 flex-1">
                        <p className="truncate text-sm font-semibold text-stone-950">{customerName}</p>
                        <p className="mt-1 text-xs text-stone-500">Saved cart</p>
                      </div>
                      <div className="flex flex-col items-end gap-1">
                        <p className="text-sm font-semibold text-stone-950">{formatMoney(selectedCurrencyCode, savedCartTotal)}</p>
                        {isActive ? (
                          <Tag color="green" className="!mr-0 !rounded-full">
                            Active
                          </Tag>
                        ) : null}
                      </div>
                    </div>
                    <div className="mt-2 flex items-center justify-between gap-3 text-xs text-stone-500">
                      <span>{formatHistoryTime(savedCart.savedAt)}</span>
                      <span className="truncate">
                        {itemCount} item{itemCount === 1 ? "" : "s"}
                      </span>
                    </div>
                    <div className="mt-3 flex items-center gap-2">
                      <Button type="primary" className="!rounded-full !border-0 !shadow-none" style={{ backgroundColor: "#2d837d" }} onClick={() => onRestoreSavedCart(savedCart)}>
                        Continue
                      </Button>
                      <Button className="!rounded-full" onClick={() => onRemoveSavedCart(savedCart.id)}>
                        Remove
                      </Button>
                    </div>
                  </div>
                );
              })}
            </div>
          ) : (
            <div className="rounded-2xl bg-stone-50 px-4 py-6 text-sm text-stone-500">No saved carts for today.</div>
          )
        ) : salesHistoryLoading ? (
          <div className="rounded-2xl bg-stone-50 px-4 py-6 text-sm text-stone-500">Loading sales...</div>
        ) : todaysCompletedSales.length ? (
          <div className="bg-white">
            {todaysCompletedSales.map((sale, index) => {
              const customerName = sale.contactId?.name?.trim() || "Walk-in Customer";
              const fulfillmentStatus = receiptStatusLabels[sale.receiptStatus] ?? sale.receiptStatus ?? "Pending";
              const fulfillmentMethod = sale.fulfillmentMethod && sale.fulfillmentMethod !== "now"
                ? fulfillmentMethodLabels[sale.fulfillmentMethod] ?? sale.fulfillmentMethod
                : null;

              return (
                <div key={sale.id} className={`bg-white px-4 py-4 ${index !== todaysCompletedSales.length - 1 ? "border-b border-stone-200" : ""}`}>
                  <div className="flex items-start justify-between gap-3">
                    <div className="min-w-0 flex-1">
                      <p className="truncate text-sm font-semibold text-stone-950">{customerName}</p>
                      <p className="mt-1 text-xs text-stone-500">{sale.saleNumber || sale.documentNumber || "Sale"}</p>
                    </div>
                    <div className="flex flex-col items-end gap-1">
                      <p className="text-sm font-semibold text-stone-950">{formatMoney(selectedCurrencyCode, Number(sale.amount || 0))}</p>
                      <Tag color={sale.paymentStatus === "paid" ? "green" : sale.paymentStatus === "partial" ? "orange" : "default"} className="!mr-0 !rounded-full">
                        {paymentStatusLabel(sale.paymentStatus)}
                      </Tag>
                    </div>
                  </div>
                  <div className="mt-2 flex items-center justify-between gap-3 text-xs text-stone-500">
                    <span>{formatHistoryTime(sale.date)}</span>
                    <span className="truncate">
                      {fulfillmentStatus}
                      {fulfillmentMethod ? ` · ${fulfillmentMethod}` : ""}
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        ) : (
          <div className="rounded-2xl bg-stone-50 px-4 py-6 text-sm text-stone-500">No completed sales for today.</div>
        )}
      </div>
    </Drawer>
  );
}
