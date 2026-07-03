"use client";

import { Button, Modal } from "antd";
import { PackageSearch, Trash2 } from "lucide-react";
import Image from "next/image";
import QuantityControl from "./QuantityControl";
import type { PosCartItem } from "./types";
import { POS_MODAL_OVERLAY_STYLE, formatMoney, isTrackedInventory } from "./utils";

type PosEditItemModalProps = {
  editingItem: PosCartItem | null;
  open: boolean;
  selectedCurrencyCode: string;
  onClose: () => void;
  onDecrease: () => void;
  onIncrease: () => void;
  onRemove: () => void;
};

export default function PosEditItemModal({ editingItem, open, selectedCurrencyCode, onClose, onDecrease, onIncrease, onRemove }: PosEditItemModalProps) {
  const tracksInventory = isTrackedInventory(editingItem?.type);

  return (
    <Modal
      title={
        <div>
          <p className="text-lg font-semibold text-stone-950">Edit Item</p>
          <p className="mt-1 text-sm text-stone-500">Adjust quantity or remove this item from the cart.</p>
        </div>
      }
      open={open}
      onCancel={onClose}
      footer={null}
      width={620}
      destroyOnHidden
      styles={{ mask: POS_MODAL_OVERLAY_STYLE, body: { padding: 0 }, header: { padding: "18px 18px 0" } }}
    >
      {editingItem && (
        <div className="px-4 pb-4 pt-3 sm:px-5">
          <div className="space-y-8">
            <section className="rounded-2xl border border-stone-200 bg-white">
              <div className="px-4 py-4">
                <div className="flex items-start gap-4">
                  <div className="flex h-18 w-18 flex-shrink-0 items-center justify-center overflow-hidden rounded-xl bg-stone-50">
                    {editingItem.imageUrl ? (
                      <div className="relative h-full w-full">
                        <Image src={editingItem.imageUrl} alt="" fill className="object-cover" sizes="80px" />
                      </div>
                    ) : (
                      <div className="flex h-full w-full items-center justify-center text-stone-300">
                        <PackageSearch size={28} />
                      </div>
                    )}
                  </div>
                  <div className="min-w-0">
                    <p className="text-lg font-semibold leading-tight text-stone-950">{editingItem.name}</p>
                    {editingItem.sku ? <p className=" text-xs text-stone-500">SKU: {editingItem.sku}</p> : null}
                    <div className="mt-2 text-sm font-medium text-stone-900">Unit Price: {formatMoney(selectedCurrencyCode, editingItem.unitPrice)}</div>
                  </div>
                </div>
              </div>

              <div className="space-y-4 border-t border-stone-200 px-4 py-4">
                <div className="">
                  <div className="mb-3 flex items-center justify-between">
                    <div>
                      <p className="text-sm font-semibold text-stone-950">Quantity</p>
                      <p className="mt-1 text-xs text-stone-500">Tap minus or plus to change the number of items.</p>
                    </div>
                  </div>
                  <QuantityControl
                    value={editingItem.quantity}
                    onDecrease={onDecrease}
                    onIncrease={onIncrease}
                    decreaseDisabled={editingItem.quantity <= 1}
                  />
                  {tracksInventory && typeof editingItem.availableStock === "number" ? <p className="mt-2 text-xs text-stone-500">Available at this location: {editingItem.availableStock}</p> : null}
                </div>

                <div className="border-t border-stone-200 pt-4">
                  <p className="text-xs font-medium uppercase tracking-[0.12em] text-stone-500">Line Total</p>
                  <p className="mt-2 text-3xl font-semibold leading-none text-stone-950">{formatMoney(selectedCurrencyCode, editingItem.unitPrice * editingItem.quantity)}</p>
                </div>
              </div>
            </section>

            <div className="grid grid-cols-2  gap-3">
              <Button danger size="large" icon={<Trash2 size={16} />} className="!h-12 !rounded-2xl" onClick={onRemove}>
                Remove
              </Button>
              <Button type="primary" size="large" className="!h-12 !rounded-2xl !border-0 !shadow-none" style={{ backgroundColor: "#2d837d" }} onClick={onClose}>
                Done
              </Button>
            </div>
          </div>
        </div>
      )}
    </Modal>
  );
}
