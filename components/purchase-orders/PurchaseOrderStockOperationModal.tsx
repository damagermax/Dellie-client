"use client";

import React from "react";
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
    <AppModal open={open} toggle={toggle} title="Fulfill Items" onOk={controller.submit} width={640} loading={controller.fulfilling} okText="Fulfill">
      <div className="px-5 py-4">
        <p className="mb-4 text-sm text-gray-500">Fulfill purchase items for {purchase.locationId?.name || "the purchase location"}.</p>
        <PurchaseReceiptLineList lines={controller.lines} quantities={controller.quantities} onQuantityChange={controller.setQuantity} />
      </div>
    </AppModal>
  );
}
