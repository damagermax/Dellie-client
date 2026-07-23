"use client";

import { Button, Dropdown, type MenuProps } from "antd";
import { CreditCard, FileText, Lock, MoreHorizontal, PackageCheck, Pencil, Receipt, ReceiptText, RotateCcw, Trash2, Undo2, Unlock } from "lucide-react";

import type { Sale } from "@/types/index";

type MenuItems = NonNullable<MenuProps["items"]>;

export type SaleDetailHeaderMenuContext = {
  sale: Sale;
  canManage: boolean;
  canEdit: boolean;
  canFulfill: boolean;
  canReturn: boolean;
  canRecordPayment: boolean;
  canRefundPayment: boolean;
  canWriteOffPayment: boolean;
  returnsEnabled: boolean;
  refundPaymentsEnabled: boolean;
  writeOffPaymentsEnabled: boolean;
  isFullyFulfilled: boolean;
  isQuote: boolean;
  isCancelling: boolean;
  isConverting: boolean;
  isCancelled: boolean;
  isClosed: boolean;
  onEdit: () => void;
  onDelete: () => void;
  onReopen: () => void;
  onClose: () => void;
  onConvert: () => void;
  onFulfill: () => void;
  onReturn: () => void;
  onRecordPayment: () => void;
  onRefund: () => void;
  onWriteOff: () => void;
  onShare: (type: "invoice" | "receipt") => void;
};

export function saleDetailHeaderReadOnlyItems(context: Pick<SaleDetailHeaderMenuContext, "sale">): MenuItems {
  const total = Number(context.sale.amount || 0);
  const balance = Number(context.sale.balance || 0);
  const paidAmount = Math.max(total - balance, 0);
  const canShareInvoice = balance > 0;
  const canShareReceipt = paidAmount > 0;

  return [
    ...(canShareInvoice ? [{ key: "invoice", icon: <FileText size={15} />, label: "Share Invoice" }] : []),
    ...(canShareReceipt ? [{ key: "receipt", icon: <ReceiptText size={15} />, label: "Share Receipt" }] : []),
  ];
}

export function buildSaleDetailHeaderMoreItems(context: SaleDetailHeaderMenuContext): MenuItems {
  const readOnlyItems = saleDetailHeaderReadOnlyItems(context);

  if (context.isClosed) {
    return readOnlyItems;
  }

  if (context.isQuote) {
    return [
      ...(context.canManage ? [{ key: "edit", disabled: !context.canEdit, icon: <Pencil size={15} />, label: "Edit Quote" }] : []),
      ...readOnlyItems,
      ...(context.canManage ? [{ type: "divider" as const }, { key: "delete", icon: <Trash2 size={15} />, danger: true, disabled: context.isCancelling, label: "Cancel Quote" }] : []),
    ];
  }

  return [
    ...(context.canManage
      ? [
          { key: "edit", disabled: !context.canEdit, icon: <Pencil size={15} />, label: "Edit Sale" },
          ...(context.refundPaymentsEnabled && context.canRefundPayment ? [{ key: "refund", icon: <RotateCcw size={15} />, label: "Refund Payment" }] : []),
          ...(context.returnsEnabled && context.canReturn ? [{ key: "return", icon: <Undo2 size={15} />, label: "Return Items" }] : []),
          ...(context.writeOffPaymentsEnabled ? [{ key: "write_off", icon: <Receipt size={15} />, label: "Write Off Balance", disabled: !context.canWriteOffPayment }] : []),
          { key: "close", icon: <Lock size={15} />, label: "Close Sale" },
        ]
      : []),
    ...readOnlyItems,
    ...(context.canManage ? [{ type: "divider" as const }, { key: "delete", icon: <Trash2 size={15} />, danger: true, disabled: context.isCancelling, label: "Cancel Sale" }] : []),
  ];
}

export function handleSaleDetailHeaderMenuClick(key: string, context: SaleDetailHeaderMenuContext) {
  if (key === "invoice" || key === "receipt") {
    context.onShare(key);
    return;
  }

  if (key === "edit") {
    context.onEdit();
    return;
  }

  if (key === "delete") {
    context.onDelete();
    return;
  }

  if (key === "refund" && !context.isClosed && !context.isQuote) {
    context.onRefund();
    return;
  }

  if (key === "return" && !context.isClosed && !context.isQuote) {
    context.onReturn();
    return;
  }

  if (key === "write_off" && !context.isClosed && !context.isQuote) {
    context.onWriteOff();
    return;
  }

  if (key === "close" && !context.isClosed && !context.isQuote) {
    context.onClose();
  }
}

type SaleDetailHeaderDropdownButtonProps = {
  items: MenuProps["items"];
  onClick: MenuProps["onClick"];
};

export function SaleDetailHeaderDropdownButton({ items, onClick }: SaleDetailHeaderDropdownButtonProps) {
  return (
    <Dropdown menu={{ items, onClick }} placement="bottomRight">
      <Button type="text" className="!bg-gray-200/80" icon={<MoreHorizontal size={15} />} />
    </Dropdown>
  );
}

export function SaleDetailHeaderActions(context: SaleDetailHeaderMenuContext) {
  const moreItems = buildSaleDetailHeaderMoreItems(context);
  const handleMoreClick: MenuProps["onClick"] = ({ key }) => handleSaleDetailHeaderMenuClick(String(key), context);
  const isPickup = context.sale.fulfillmentMethod === "pickup";
  const hasMoreItems = moreItems.length > 0;

  return {
    moreItems,
    handleMoreClick,
    dropdownButton: hasMoreItems ? <SaleDetailHeaderDropdownButton items={moreItems} onClick={handleMoreClick} /> : null,
    actionButtons: (
      <div className="flex w-full flex-wrap items-center justify-center gap-2 md:justify-end">
        {context.isCancelled ? (
          <Button type="primary" className="!bg-[#f7c855] !font-semibold !text-black !shadow-none" onClick={context.onReopen}>
            Reopen Sale
          </Button>
        ) : context.isClosed ? (
          <>
            {context.canManage ? (
              <Button type="primary" className="!bg-[#f7c855] !font-semibold !text-black !shadow-none" icon={<Unlock size={15} />} onClick={context.onReopen}>
                Reopen Sale
              </Button>
            ) : null}
            {hasMoreItems ? <SaleDetailHeaderDropdownButton items={moreItems} onClick={handleMoreClick} /> : null}
          </>
        ) : context.isQuote ? (
          <>
            {context.canManage ? (
              <Button type="primary" className="!bg-[#f7c855] !font-semibold !text-black !shadow-none" loading={context.isConverting} icon={<ReceiptText size={15} />} onClick={context.onConvert}>
                Convert to Sale
              </Button>
            ) : null}
            {hasMoreItems ? <SaleDetailHeaderDropdownButton items={moreItems} onClick={handleMoreClick} /> : null}
          </>
        ) : (
          <>
            {context.canManage ? (
              <>
                {context.canFulfill || !context.isFullyFulfilled ? (
                  <Button type="primary" className="!border-2 !border-[#f7c855] !bg-white !font-semibold !text-black !shadow-none" icon={<PackageCheck size={15} />} disabled={!context.canFulfill} onClick={context.onFulfill}>
                    {isPickup ? "Mark as Picked Up" : "Fulfill"}
                  </Button>
                ) : context.returnsEnabled && context.canReturn ? (
                  <Button type="primary" className="!border-2  !border-[#f7c855] !bg-white !font-semibold !text-black !shadow-none" icon={<Undo2 size={15} />} onClick={context.onReturn}>
                    Return
                  </Button>
                ) : null}
                {context.canRecordPayment ? (
                  <Button type="primary" className="!bg-[#f7c855] !font-semibold !text-black !shadow-none" icon={<CreditCard size={15} />} disabled={Boolean(context.sale.locked)} onClick={context.onRecordPayment}>
                    Record Payment
                  </Button>
                ) : null}
                {context.canRefundPayment && context.refundPaymentsEnabled && !context.canRecordPayment ? (
                  <Button type="primary" className="!bg-[#f7c855] !font-semibold !text-black !shadow-none" icon={<RotateCcw size={15} />} disabled={Boolean(context.sale.locked)} onClick={context.onRefund}>
                    Refund Payment
                  </Button>
                ) : null}
              </>
            ) : null}
            {hasMoreItems ? <SaleDetailHeaderDropdownButton items={moreItems} onClick={handleMoreClick} /> : null}
          </>
        )}
      </div>
    ),
  };
}
