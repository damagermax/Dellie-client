"use client";

import { Button, Drawer } from "antd";
import type { MenuProps } from "antd";
import { ShoppingCart, UserPlus } from "lucide-react";
import { ResolvedProductName } from "@/components/products/ResolvedProductName";
import ResponsiveActionMenu from "@/components/ui/ResponsiveActionMenu";
import CompactQuantityControl from "./CompactQuantityControl";
import type { PosCartItem } from "./types";
import PosSummaryRow from "./PosSummaryRow";
import { formatMoney } from "./utils";

type PosMobileCartDrawerProps = {
  open: boolean;
  onClose: () => void;
  selectedContactName: string | null;
  cartActionItems: NonNullable<MenuProps["items"]>;
  onCartActionClick: Required<MenuProps>["onClick"];
  cart: PosCartItem[];
  stockIssues: PosCartItem[];
  cartProductNames: Record<string, string>;
  selectedCurrencyCode: string;
  subtotal: number;
  discounts: number;
  taxableSubtotal: number;
  taxAmount: number;
  grandTotal: number;
  onOpenCustomer: () => void;
  onEditCartItem: (cartItemId: string) => void;
  onDecreaseQuantity: (cartItemId: string) => void;
  onIncreaseQuantity: (cartItemId: string) => void;
  onOpenCheckout: () => void;
};

export default function PosMobileCartDrawer({
  open,
  onClose,
  selectedContactName,
  cartActionItems,
  onCartActionClick,
  cart,
  stockIssues,
  cartProductNames,
  selectedCurrencyCode,
  subtotal,
  discounts,
  taxableSubtotal,
  taxAmount,
  grandTotal,
  onOpenCustomer,
  onEditCartItem,
  onDecreaseQuantity,
  onIncreaseQuantity,
  onOpenCheckout,
}: PosMobileCartDrawerProps) {
  return (
    <Drawer
      open={open}
      onClose={onClose}
      placement="right"
      width="100vw"
      title={<p className="text-lg font-semibold text-stone-950">Cart</p>}
      className="lg:!hidden"
      styles={{ body: { padding: 0 }, header: { borderRadius: 0, padding: "max(14px, env(safe-area-inset-top)) 16px 14px" }, content: { borderRadius: 0 } }}
    >
      <div className="flex h-full flex-col bg-white">
        <div className="flex items-center justify-between border-b border-gray-200 px-4 py-3">
          <button
            type="button"
            onClick={onOpenCustomer}
            className="flex min-w-0 items-center gap-2 border border-gray-200 bg-white px-3 py-2 text-sm font-medium text-stone-700 transition-colors hover:bg-gray-50"
          >
            <UserPlus size={15} strokeWidth={1.75} />
            <span className="truncate">{selectedContactName || "Add customer"}</span>
          </button>
          <ResponsiveActionMenu items={cartActionItems} onClick={onCartActionClick} title="Cart actions" />
        </div>

        {stockIssues.length ? <div className="mx-4 mt-3 border border-red-200 bg-red-50 px-3 py-2 text-xs text-red-700">Some cart items exceed stock for this location. Reduce them before checkout.</div> : null}

        <div className="flex-1 overflow-y-auto">
          {cart.length ? (
            cart.map((item) => (
              <button
                key={item.id}
                type="button"
                onClick={() => onEditCartItem(item.id)}
                className={`block w-full overflow-hidden border-b px-4 py-3 text-left ${stockIssues.some((issue) => issue.id === item.id) ? "border-red-200 bg-red-50/60" : "border-gray-200 bg-white"}`}
              >
                <div className="min-w-0 overflow-hidden">
                  <div className="flex min-w-0 items-start justify-between gap-3 overflow-hidden">
                    <ResolvedProductName name={cartProductNames[item.productId] || item.name} productId={item.productId} className="block min-w-0 flex-1 truncate overflow-hidden text-sm font-medium text-gray-950" />
                    <p className="shrink-0 truncate text-sm font-semibold text-green-900">{formatMoney(selectedCurrencyCode, item.quantity * item.unitPrice)}</p>
                  </div>
                  <div className="mt-3 flex min-w-0 items-center justify-between gap-3 overflow-hidden">
                    <p className="min-w-0 truncate text-xs text-gray-600">
                      {formatMoney(selectedCurrencyCode, item.unitPrice)} x {item.quantity}
                    </p>
                    <div
                      className="w-[92px] shrink-0"
                      onClick={(event) => event.stopPropagation()}
                      onPointerDown={(event) => event.stopPropagation()}
                    >
                      <CompactQuantityControl
                        value={item.quantity}
                        onDecrease={() => onDecreaseQuantity(item.id)}
                        onIncrease={() => onIncreaseQuantity(item.id)}
                        decreaseDisabled={item.quantity <= 1}
                      />
                    </div>
                  </div>
                  {stockIssues.some((issue) => issue.id === item.id) ? <p className="mt-1 text-xs font-medium text-red-600">Only {Number(item.availableStock || 0)} available at this location.</p> : null}
                </div>
              </button>
            ))
          ) : (
            <div className="px-6 py-14 text-center">
              <ShoppingCart className="mx-auto text-gray-300" size={44} />
              <p className="mt-3 text-sm font-medium text-gray-700">Your cart is empty</p>
              <p className="mt-1 text-xs text-gray-500">Use the product grid to build the order.</p>
            </div>
          )}
        </div>

        <div className="border-t border-gray-200 bg-white px-4 pb-[max(20px,env(safe-area-inset-bottom))] pt-4">
          <div className="space-y-3 border-b border-gray-200 pb-4">
            <PosSummaryRow label="Items Total" value={formatMoney(selectedCurrencyCode, subtotal)} />
            {discounts > 0 ? <PosSummaryRow label="Discount" value={`- ${formatMoney(selectedCurrencyCode, discounts)}`} /> : null}
            <PosSummaryRow label="Subtotal" value={formatMoney(selectedCurrencyCode, taxableSubtotal)} />
            {taxAmount > 0 ? <PosSummaryRow label="Tax" value={formatMoney(selectedCurrencyCode, taxAmount)} /> : null}
            <PosSummaryRow label="Total" value={formatMoney(selectedCurrencyCode, grandTotal)} strong />
          </div>

          <div className="mt-4 grid grid-cols-2 gap-3">
            <Button size="large" onClick={onClose} className="!h-11 !border-gray-300 !font-medium !shadow-none">
              Continue
            </Button>
            <Button size="large" type="primary" onClick={onOpenCheckout} disabled={!cart.length || stockIssues.length > 0} className="!h-11 !border-0 !bg-[#2d837d] !font-medium !shadow-none hover:!bg-[#256b66] disabled:!bg-gray-300">
              Checkout
            </Button>
          </div>
        </div>
      </div>
    </Drawer>
  );
}
