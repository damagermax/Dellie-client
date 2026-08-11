"use client";

import React from "react";
import { DatePicker } from "antd";
import { AppModal } from "@/components/ui/AppModal";
import { Purchase } from "@/types/index";
import { PurchaseReceiptLineList } from "./purchaseStockOperationSections";
import { usePurchaseStockOperationController } from "./usePurchaseStockOperationController";

interface PurchaseOrderStockOperationModalProps {
  open: boolean;
  toggle: () => void;
  purchase: Purchase;
  onSaved: () => void;
}

export default function PurchaseOrderStockOperationModal({ open, toggle, purchase, onSaved }: PurchaseOrderStockOperationModalProps) {
  const controller = usePurchaseStockOperationController({ open, purchase, onSaved, toggle });

  return (
    <AppModal
      open={open}
      toggle={toggle}
      title="Receive Items"
      subtitle={`Record received quantities into ${purchase.locationId?.name || "the purchase location"}.`}
      onOk={controller.submit}
      width={840}
      loading={controller.fulfilling}
      okText="Receive"
    >
      <div className="pb-4">
        <PurchaseReceiptLineList lines={controller.lines} quantities={controller.quantities} onQuantityChange={controller.setQuantity} />
        <div className="px-5 pt-5">
          <label className="mb-2 block text-sm font-medium text-gray-700">Received at</label>
          <DatePicker className="!w-full" value={controller.date} onChange={(value) => value && controller.setDate(value)} />
        </div>
      </div>
    </AppModal>
  );
}
