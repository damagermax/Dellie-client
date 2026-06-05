"use client";

import { AppModal, ModalProps } from "@/components/ui/AppModal";
import { useAddProductMediaMutation, useDeleteProductMediaMutation, useReorderProductMediaMutation } from "@/lib/redux/services";
import { Button, Empty, message, Spin } from "antd";
import { GripVertical, ImagePlus, Trash2 } from "lucide-react";
import { useEffect, useMemo, useRef, useState } from "react";

export type ProductMediaItem = {
  url?: string;
  key?: string;
  type?: string;
};

type ProductMediaManagerModalProps = ModalProps & {
  productId: string;
  productName: string;
  media?: ProductMediaItem[];
  onChanged?: () => void;
};

const MAX_MEDIA = 8;

export function ProductMediaManagerModal({ open, toggle, productId, productName, media = [], onChanged }: ProductMediaManagerModalProps) {
  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const [items, setItems] = useState<ProductMediaItem[]>(media);
  const [draggedKey, setDraggedKey] = useState<string | null>(null);
  const [addProductMedia, { isLoading: isUploading }] = useAddProductMediaMutation();
  const [deleteProductMedia, { isLoading: isDeleting }] = useDeleteProductMediaMutation();
  const [reorderProductMedia, { isLoading: isSavingOrder }] = useReorderProductMediaMutation();

  useEffect(() => {
    if (open) setItems(media);
  }, [media, open]);

  const isBusy = isUploading || isDeleting || isSavingOrder;
  const remainingSlots = Math.max(MAX_MEDIA - items.length, 0);
  const orderedKeys = useMemo(() => items.map((item) => item.key).filter(Boolean) as string[], [items]);
  const originalKeys = useMemo(() => media.map((item) => item.key).filter(Boolean) as string[], [media]);
  const hasOrderChanged = orderedKeys.join("|") !== originalKeys.join("|");

  const handleUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(event.target.files || []);
    event.target.value = "";
    if (!files.length || isBusy) return;

    if (files.length > remainingSlots) {
      message.warning(`You can add ${remainingSlots} more media item${remainingSlots === 1 ? "" : "s"}.`);
      return;
    }

    const formData = new FormData();
    files.forEach((file) => formData.append("media", file));

    try {
      const updatedProduct = await addProductMedia({ id: productId, data: formData }).unwrap();
      setItems(updatedProduct?.media || items);
      onChanged?.();
      message.success("Media uploaded.");
    } catch {
      message.error("Media could not be uploaded.");
    }
  };

  const handleDelete = async (item: ProductMediaItem) => {
    if (!item.key || isBusy) return;

    try {
      const updatedProduct = await deleteProductMedia({ id: productId, key: item.key }).unwrap();
      setItems(updatedProduct?.media || items.filter((current) => current.key !== item.key));
      onChanged?.();
      message.success("Media removed.");
    } catch {
      message.error("Media could not be removed.");
    }
  };

  const moveItem = (fromKey: string, toKey: string) => {
    if (fromKey === toKey) return;
    setItems((current) => {
      const fromIndex = current.findIndex((item) => item.key === fromKey);
      const toIndex = current.findIndex((item) => item.key === toKey);
      if (fromIndex < 0 || toIndex < 0) return current;

      const next = [...current];
      const [moved] = next.splice(fromIndex, 1);
      next.splice(toIndex, 0, moved);
      return next;
    });
  };

  const saveOrder = async () => {
    if (!hasOrderChanged || isBusy) return;

    try {
      const updatedProduct = await reorderProductMedia({ id: productId, keys: orderedKeys }).unwrap();
      setItems(updatedProduct?.media || items);
      onChanged?.();
      message.success("Media order saved.");
    } catch {
      message.error("Media order could not be saved.");
    }
  };

  return (
    <AppModal
      open={open}
      toggle={toggle}
      okText={"Continue"}
      title={
        <div>
          <p className="text-lg font-medium">Manage Media for {productName}</p>
          <p className="text-sm !font-normal text-gray-500">Upload up to 8 images or videos. Drag items to arrange the order customers see first.</p>
        </div>
      }
      width={760}
      height="72vh"
      footer={
        <div className="flex items-center justify-between gap-3">
          <p className="text-sm text-gray-500">
            {items.length}/{MAX_MEDIA} media items
          </p>

          <div className="flex gap-2">
            <Button onClick={toggle}>Close</Button>
            {/* <Button type="primary" className="!bg-gray-950 !shadow-none" disabled={!hasOrderChanged || isBusy} loading={isSavingOrder} onClick={saveOrder}>
              Save Order
            </Button> */}
          </div>
        </div>
      }
    >
      <Spin spinning={isBusy}>
        <div className="px-5 pb-5">
          <input ref={fileInputRef} type="file" accept="image/*,video/*" multiple className="hidden" onChange={handleUpload} />

          <div className="mt-5 grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-4">
            {items.map((item, index) => (
              <div
                key={item.key || item.url || index}
                draggable={Boolean(item.key)}
                onDragStart={() => setDraggedKey(item.key || null)}
                onDragOver={(event) => event.preventDefault()}
                onDrop={() => {
                  if (draggedKey && item.key) moveItem(draggedKey, item.key);
                  setDraggedKey(null);
                }}
                className={`group overflow-hidden rounded-md border bg-white  transition ${draggedKey === item.key ? "border-gray-950 opacity-60" : "border-gray-200 hover:border-gray-300"}`}
              >
                <div className="relative aspect-square bg-gray-100">
                  {item.type?.includes("video") ? (
                    <video src={item.url} className="h-full w-full object-cover" muted />
                  ) : item.url ? (
                    <img src={item.url} alt={`${productName} media ${index + 1}`} className="h-full w-full object-cover" />
                  ) : (
                    <div className="flex h-full items-center justify-center text-gray-400">No media</div>
                  )}
                  <div className="absolute left-2 top-2 rounded-full bg-white/90 px-2 py-1 text-xs font-medium text-gray-700 shadow-sm">{index + 1}</div>
                  <button type="button" className="absolute right-2 top-2 rounded-full bg-white/90 p-1.5 text-gray-600 opacity-0 shadow-sm transition hover:text-red-500  group-hover:opacity-100" onClick={() => handleDelete(item)} aria-label="Remove media">
                    <Trash2 size={15} />
                  </button>
                </div>
                <div className="flex items-center gap-2 px-3 py-2 text-xs text-gray-500">
                  <GripVertical size={14} />
                  <span>{index === 0 ? "Primary media" : "Drag to reorder"}</span>
                </div>
              </div>
            ))}

            {items.length < MAX_MEDIA && (
              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                className="flex aspect-square flex-col items-center h-full w-full justify-center rounded-md border border-dashed border-gray-300 bg-white text-center transition hover:border-gray-950 hover:bg-gray-50"
              >
                <ImagePlus size={26} className="text-gray-500" />
                <span className="mt-3 text-sm font-medium text-gray-900">Add Media</span>
                <span className="mt-1 px-4 text-xs text-gray-500">
                  {remainingSlots} slot{remainingSlots === 1 ? "" : "s"} left
                </span>
              </button>
            )}
          </div>

          {/* {!items.length && (
            <div className="mt-5 rounded-md border border-gray-200 bg-white">
              <Empty className="py-8" description="No media has been added yet." />
            </div>
          )} */}
        </div>
      </Spin>
    </AppModal>
  );
}
