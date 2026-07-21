"use client";

import { Button, Drawer, Tag } from "antd";
import type { Sale } from "@/types/index";
import type { SavedPosCart } from "./types";
import { POS_MODAL_OVERLAY_STYLE, formatHistoryTime, formatMoney, getSavedCartItemCount, getSavedCartTotal } from "./utils";

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
  return (
    <Drawer title="History" open={open} onClose={onClose} width={520} styles={{ mask: POS_MODAL_OVERLAY_STYLE }}>
      <div className="space-y-6 pb-4">
        <section>
          <div className="mb-3 flex items-center justify-between gap-3">
            <div>
              <p className="text-sm font-semibold text-stone-950">Saved carts</p>
              <p className="text-xs text-stone-500">Today&apos;s saved carts for your account.</p>
            </div>
            <Tag bordered={false} className="!mr-0 !rounded-full !bg-stone-100 !px-2.5 !py-1 !text-stone-600">
              {savedCarts.length}
            </Tag>
          </div>

          {savedCarts.length ? (
            <div className="space-y-3">
              {savedCarts.map((savedCart) => {
                const savedCartTotal = getSavedCartTotal(savedCart);
                const itemCount = getSavedCartItemCount(savedCart);
                const isActive = activeSavedCartId === savedCart.id;

                return (
                  <div key={savedCart.id} className="rounded-2xl border border-stone-200 bg-white p-4">
                    <div className="flex items-start justify-between gap-3">
                      <div>
                        <p className="text-sm font-semibold text-stone-950">{formatMoney(selectedCurrencyCode, savedCartTotal)}</p>
                        <p className="mt-1 text-xs text-stone-500">
                          {itemCount} item{itemCount === 1 ? "" : "s"} • Saved {formatHistoryTime(savedCart.savedAt)}
                        </p>
                        {savedCart.selectedContact?.name ? <p className="mt-1 text-xs text-stone-500">{savedCart.selectedContact.name}</p> : null}
                      </div>
                      {isActive ? (
                        <Tag color="green" className="!mr-0 !rounded-full">
                          Active
                        </Tag>
                      ) : null}
                    </div>

                    <div className="mt-4 flex items-center gap-2">
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
          )}
        </section>

        <section>
          <div className="mb-3 flex items-center justify-between gap-3">
            <div>
              <p className="text-sm font-semibold text-stone-950">Completed sales</p>
              <p className="text-xs text-stone-500">Today&apos;s POS sales created by you.</p>
            </div>
            <Tag bordered={false} className="!mr-0 !rounded-full !bg-stone-100 !px-2.5 !py-1 !text-stone-600">
              {todaysCompletedSales.length}
            </Tag>
          </div>

          {salesHistoryLoading ? (
            <div className="rounded-2xl bg-stone-50 px-4 py-6 text-sm text-stone-500">Loading sales...</div>
          ) : todaysCompletedSales.length ? (
            <div className="space-y-3">
              {todaysCompletedSales.map((sale) => (
                <div key={sale.id} className="rounded-2xl border border-stone-200 bg-white p-4">
                  <div className="flex items-start justify-between gap-3">
                    <div className="min-w-0">
                      <p className="truncate text-sm font-semibold text-stone-950">{sale.saleNumber || "Sale"}</p>
                      <p className="mt-1 text-xs text-stone-500">
                        {formatHistoryTime(sale.date)} • {sale.contactId?.name || "Walk-in customer"}
                      </p>
                    </div>
                    <Tag color={sale.paymentStatus === "paid" ? "green" : sale.paymentStatus === "partial" ? "orange" : "default"} className="!mr-0 !rounded-full">
                      {sale.paymentStatus || "unpaid"}
                    </Tag>
                  </div>
                  <div className="mt-3 flex items-center justify-between gap-3 text-sm">
                    <span className="text-stone-500">Total</span>
                    <span className="font-semibold text-stone-950">{formatMoney(selectedCurrencyCode, Number(sale.amount || 0))}</span>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="rounded-2xl bg-stone-50 px-4 py-6 text-sm text-stone-500">No completed sales for today.</div>
          )}
        </section>
      </div>
    </Drawer>
  );
}
