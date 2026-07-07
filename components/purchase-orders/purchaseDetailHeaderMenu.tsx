"use client";

import { Button, Dropdown, type MenuProps } from "antd";
import { Copy, CreditCard, Link as LinkIcon, Lock, MoreHorizontal, PackageCheck, Pencil, Receipt, RotateCcw, Trash2, Truck, Undo2, Unlock } from "lucide-react";

import type { Purchase } from "@/types/index";

type MenuItems = NonNullable<MenuProps["items"]>;

export type PurchaseDetailHeaderMenuContext = {
  purchase: Purchase;
  canManage: boolean;
  canEdit: boolean;
  canReceive: boolean;
  canReturn: boolean;
  canRecordPayment: boolean;
  canRefundPayment: boolean;
  canWriteOffPayment: boolean;
  returnsEnabled: boolean;
  refundPaymentsEnabled: boolean;
  writeOffPaymentsEnabled: boolean;
  isFullyReceived: boolean;
  isCancelling: boolean;
  isCancelled: boolean;
  isClosed: boolean;
  onEdit: () => void;
  onDelete: () => void;
  onReopen: () => void;
  onClose: () => void;
  onReceive: () => void;
  onReturn: () => void;
  onAddLandedCost: () => void;
  onRecordPayment: () => void;
  onRefund: () => void;
  onWriteOff: () => void;
};

export function buildPurchaseDetailHeaderReadOnlyItems(): MenuItems {
  return [
    { key: "copy_number", icon: <Copy size={15} />, label: "Copy Purchase Number" },
    { key: "copy_link", icon: <LinkIcon size={15} />, label: "Copy Page Link" },
  ];
}

export function buildPurchaseDetailHeaderMoreItems(context: PurchaseDetailHeaderMenuContext): MenuItems {
  if (!context.canManage || context.isClosed) {
    return [];
  }

  return [
    { key: "edit", disabled: !context.canEdit, icon: <Pencil size={15} />, label: "Edit Purchase" },
    { key: "landed_cost", disabled: Boolean(context.purchase.locked), icon: <Truck size={15} />, label: "Add Landed Cost" },
    ...(context.returnsEnabled && context.canReturn ? [{ key: "return", icon: <Undo2 size={15} />, label: "Return Items" }] : []),
    ...(context.refundPaymentsEnabled || context.writeOffPaymentsEnabled ? [{ type: "divider" as const }] : []),
    ...(context.refundPaymentsEnabled ? [{ key: "refund", icon: <RotateCcw size={15} />, label: "Refund Payment", disabled: !context.canRefundPayment }] : []),
    ...(context.writeOffPaymentsEnabled ? [{ key: "write_off", icon: <Receipt size={15} />, label: "Write Off Balance", disabled: !context.canWriteOffPayment }] : []),
    { key: "close", icon: <Lock size={15} />, label: "Close Purchase" },
    { type: "divider" as const },
    { key: "delete", icon: <Trash2 size={15} />, danger: true, disabled: context.isCancelling, label: "Cancel Purchase" },
  ];
}

export async function handlePurchaseDetailHeaderReadOnlyClick(key: string, purchase: Purchase) {
  if (key === "copy_number") {
    await navigator.clipboard.writeText(purchase.purchaseNumber);
    return;
  }

  if (key === "copy_link") {
    await navigator.clipboard.writeText(window.location.href);
  }
}

export function handlePurchaseDetailHeaderMenuClick(key: string, context: PurchaseDetailHeaderMenuContext) {
  if (key === "edit") {
    context.onEdit();
    return;
  }

  if (key === "landed_cost") {
    context.onAddLandedCost();
    return;
  }

  if (key === "return") {
    context.onReturn();
    return;
  }

  if (key === "refund") {
    context.onRefund();
    return;
  }

  if (key === "write_off") {
    context.onWriteOff();
    return;
  }

  if (key === "close") {
    context.onClose();
    return;
  }

  if (key === "delete") {
    context.onDelete();
  }
}

type PurchaseDetailHeaderDropdownButtonProps = {
  items: MenuProps["items"];
  onClick: MenuProps["onClick"];
};

export function PurchaseDetailHeaderDropdownButton({ items, onClick }: PurchaseDetailHeaderDropdownButtonProps) {
  return (
    <Dropdown menu={{ items, onClick }} placement="bottomRight">
      <Button type="text" className="!bg-gray-200/80 " icon={<MoreHorizontal size={15} />} />
    </Dropdown>
  );
}

export function buildPurchaseDetailHeaderActions(context: PurchaseDetailHeaderMenuContext) {
  const readOnlyItems = buildPurchaseDetailHeaderReadOnlyItems();
  const moreItems = buildPurchaseDetailHeaderMoreItems(context);
  const handleReadOnlyClick: MenuProps["onClick"] = ({ key }) => void handlePurchaseDetailHeaderReadOnlyClick(String(key), context.purchase);
  const dropdownButton = <PurchaseDetailHeaderDropdownButton items={readOnlyItems} onClick={handleReadOnlyClick} />;
  const combinedMenuItems = [...readOnlyItems, ...(moreItems.length ? [{ type: "divider" as const }, ...moreItems] : [])];
  const handleCombinedClick: MenuProps["onClick"] = ({ key }) => {
    const keyValue = String(key);
    if (keyValue === "copy_number" || keyValue === "copy_link") {
      void handlePurchaseDetailHeaderReadOnlyClick(keyValue, context.purchase);
      return;
    }

    handlePurchaseDetailHeaderMenuClick(keyValue, context);
  };

  return {
    dropdownButton,
    actionButtons: (
      <div className="hidden flex-wrap items-center justify-center gap-2 md:flex md:justify-end">
        {context.isCancelled ? (
          <Button type="primary" className="!bg-[#f7c855] !font-semibold !text-black !shadow-none" onClick={context.onReopen}>
            Reopen Purchase
          </Button>
        ) : context.isClosed ? (
          <>
            {context.canManage ? (
              <Button type="primary" className="!bg-[#f7c855] !font-semibold !text-black !shadow-none" icon={<Unlock size={15} />} onClick={context.onReopen}>
                Reopen Purchase
              </Button>
            ) : null}
            <PurchaseDetailHeaderDropdownButton items={readOnlyItems} onClick={handleReadOnlyClick} />
          </>
        ) : context.canManage ? (
          <>
            {context.canReceive || !context.isFullyReceived ? (
              <Button type="primary" className="!shadow-none  !border-2 !bg-white !border-[#f7c855] !text-black !font-semibold" icon={<PackageCheck size={15} />} disabled={!context.canReceive} onClick={context.onReceive}>
                Fulfill
              </Button>
            ) : context.returnsEnabled && context.canReturn ? (
              <Button type="primary" className="!shadow-none  !border-2 !bg-white !border-[#f7c855] !text-black !font-semibold" icon={<Undo2 size={15} />} onClick={context.onReturn}>
                Return
              </Button>
            ) : null}
            {context.canRefundPayment && context.refundPaymentsEnabled ? (
              <Button type="primary" className="!shadow-none  !bg-[#f7c855] !text-black !font-semibold" icon={context.canRefundPayment ? <RotateCcw size={15} /> : <CreditCard size={15} />} disabled={Boolean(context.purchase.locked)} onClick={context.canRefundPayment ? context.onRefund : context.onRecordPayment}>
                {context.canRefundPayment ? "Refund Payment" : "Record Payment"}
              </Button>
            ) : context.canRecordPayment ? (
              <Button type="primary" className="!shadow-none  !bg-[#f7c855] !text-black !font-semibold" icon={<CreditCard size={15} />} disabled={Boolean(context.purchase.locked)} onClick={context.onRecordPayment}>
                Record Payment
              </Button>
            ) : null}
            <PurchaseDetailHeaderDropdownButton items={combinedMenuItems} onClick={handleCombinedClick} />
          </>
        ) : (
          dropdownButton
        )}
      </div>
    ),
  };
}
