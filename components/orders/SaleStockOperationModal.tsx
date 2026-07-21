"use client";

import React from "react";
import { AppModal } from "@/components/ui/AppModal";
import { Sale } from "@/types/index";
import { SaleFulfillmentLineList } from "./saleStockOperationSections";
import { useSaleStockOperationController } from "./useSaleStockOperationController";

interface SaleStockOperationModalProps {
  open: boolean;
  toggle: () => void;
  sale: Sale;
  onSaved: () => void;
}

export default function SaleStockOperationModal({ open, toggle, sale, onSaved }: SaleStockOperationModalProps) {
  const controller = useSaleStockOperationController({ open, sale, onSaved, toggle });

  return (
    <AppModal
      open={open}
      toggle={toggle}
      title={controller.isPickup ? "Mark as Picked Up" : "Fulfill Sale"}
      onOk={controller.submit}
      width={640}
      loading={controller.fulfilling}
      okText={controller.isPickup ? "Mark as Picked Up" : "Fulfill"}
    >
      <div className="px-5 py-4">
        <p className="mb-4 text-sm text-gray-500">
          {controller.isPickup ? "Mark items collected from " : "Mark items delivered from "}
          {sale.locationId?.name || "the sale location"}.
        </p>
        <SaleFulfillmentLineList lines={controller.lines} quantities={controller.quantities} onQuantityChange={controller.setQuantity} />
      </div>
    </AppModal>
  );
}
