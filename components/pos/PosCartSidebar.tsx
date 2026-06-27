"use client";

import type { MenuProps } from "antd";
import { ShoppingCart, UserPlus } from "lucide-react";
import { ResolvedProductName } from "@/components/products/ResolvedProductName";
import ResponsiveActionMenu from "@/components/ui/ResponsiveActionMenu";
import type { PosCartItem } from "./types";
import PosSummaryRow from "./PosSummaryRow";
import { formatMoney } from "./utils";

type PosCartSidebarProps = {
  selectedContactName: string | null;
  cartActionItems: NonNullable<MenuProps["items"]>;
  onCartActionClick: Required<MenuProps>["onClick"];
  cart: PosCartItem[];
  cartProductNames: Record<string, string>;
  selectedCurrencyCode: string;
  subtotal: number;
  discounts: number;
  taxableSubtotal: number;
  taxAmount: number;
  grandTotal: number;
  onOpenCustomer: () => void;
  onEditCartItem: (cartItemId: string) => void;
  onOpenCheckout: () => void;
};

export default function PosCartSidebar({
  selectedContactName,
  cartActionItems,
  onCartActionClick,
  cart,
  cartProductNames,
  selectedCurrencyCode,
  subtotal,
  discounts,
  taxableSubtotal,
  taxAmount,
  grandTotal,
  onOpenCustomer,
  onEditCartItem,
  onOpenCheckout,
}: PosCartSidebarProps) {
  return (
    <div className=" lg:flex flex-col justify-between  hidden lg:h-full  lg:w-[30%]">
      <div>
        <div className="p-[15.5px] border-b border-gray-200  flex justify-between items-center">
          <p className="text-xl font-medium">Cart</p>
          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={onOpenCustomer}
              className="flex h-8 items-center gap-1.5 rounded-full bg-gray-100 px-2.5 py-1 text-xs font-medium text-stone-700 transition-all duration-200 hover:bg-gray-200 active:scale-[0.97]"
              aria-label="Select customer"
            >
              {selectedContactName ? (
                <>
                  <span className="truncate max-w-[120px]">{selectedContactName}</span>
                  <UserPlus size={14} strokeWidth={1.5} className="text-stone-400" />
                </>
              ) : (
                <UserPlus size={14} strokeWidth={1.5} />
              )}
            </button>
            <ResponsiveActionMenu items={cartActionItems} onClick={onCartActionClick} title="Cart actions" />
          </div>
        </div>
        <div className="">
          <div className=" max-h-[70vh] overflow-y-scroll">
            {cart.length ? (
              cart.map((item) => (
                <div key={item.id} className=" cursor-pointer border-b border-gray-200 bg-[linear-gradient(180deg,#ffffff_0%,#f9fafb_100%)] p-2 px-3 " onClick={() => onEditCartItem(item.id)}>
                  <div className="flex gap-3">
                    <div className="min-w-0 flex-1">
                      <div className="flex items-start justify-between gap-3">
                        <div className="min-w-0">
                          <ResolvedProductName name={cartProductNames[item.productId] || item.name} productId={item.productId} className="truncate text-sm  font-medium text-gray-950" />
                        </div>
                      </div>

                      <div className=" flex justify-between items-center w-full">
                        <p className="text-xs    font-normal text-gray-600">
                          {"("} GHS {item.unitPrice || "-"} <span className=" text-[10px]">x</span>
                          {item.quantity}
                          {")"}
                        </p>

                        <p className="text-green-900 font-semibold"> GHS {item.quantity * item.unitPrice || "-"}</p>
                      </div>
                    </div>
                  </div>
                </div>
              ))
            ) : (
              <div className=" bg-gradient-to-br from-gray-50 to-white px-4 py-10 text-center">
                <ShoppingCart className="mx-auto text-gray-300" size={44} />
                <p className="mt-3 text-sm font-medium text-gray-700">Your cart is empty</p>
                <p className="mt-1 text-xs text-gray-500">Use the product grid to build the order.</p>
              </div>
            )}
          </div>
        </div>
      </div>

      <div className="mx-4 mb-3 space-y-3">
        <div className="rounded-xl bg-gray-50 px-4 py-4">
          <div className="space-y-3">
            <PosSummaryRow label="Items Total" value={formatMoney(selectedCurrencyCode, subtotal)} />
            {discounts > 0 ? <PosSummaryRow label="Discount" value={`- ${formatMoney(selectedCurrencyCode, discounts)}`} /> : null}
            <PosSummaryRow label="Subtotal" value={formatMoney(selectedCurrencyCode, taxableSubtotal)} />
            {taxAmount > 0 ? <PosSummaryRow label="Tax" value={formatMoney(selectedCurrencyCode, taxAmount)} /> : null}
            <div className="border-t border-gray-200 pt-3">
              <PosSummaryRow label="Total" value={formatMoney(selectedCurrencyCode, grandTotal)} strong />
            </div>
          </div>
        </div>

        <div className=" flex border-2 rounded-lg overflow-clip border-[#2d837d]">
          <button onClick={onOpenCheckout} className="flex w-full items-center justify-between gap-3 bg-[#2d837d] px-4 py-3 text-white cursor-pointer font-medium text-base">
            <span>Checkout</span>
            <span>{formatMoney(selectedCurrencyCode, grandTotal)}</span>
          </button>
        </div>
      </div>
    </div>
  );
}
