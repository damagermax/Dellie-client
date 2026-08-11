"use client";

import React from "react";
import { DatePicker } from "antd";
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
      subtitle={
        controller.isPickup
          ? `Record picked-up quantities from ${sale.locationId?.name || "the sale location"}.`
          : `Record fulfilled quantities from ${sale.locationId?.name || "the sale location"}.`
      }
      onOk={controller.submit}
      width={840}
      loading={controller.fulfilling}
      okText={controller.isPickup ? "Mark as Picked Up" : "Fulfill"}
    >
      <div className="pb-4">
        <SaleFulfillmentLineList lines={controller.lines} quantities={controller.quantities} onQuantityChange={controller.setQuantity} />
        <div className="px-5 pt-5">
          <label className="mb-2 block text-sm font-medium text-gray-700">{controller.isPickup ? "Picked up at" : "Fulfilled at"}</label>
          <DatePicker className="!w-full" value={controller.date} onChange={(value) => value && controller.setDate(value)} />
        </div>
      </div>
    </AppModal>
  );
}
