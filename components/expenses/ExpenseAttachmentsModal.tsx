"use client";

import { useMemo, useRef } from "react";
import { Button, message } from "antd";
import { ImagePlus, ReceiptText, Trash2 } from "lucide-react";
import { AppModal, ModalProps } from "@/components/ui/AppModal";
import PreviewImage from "@/components/ui/PreviewImage";
import { TransactionAttachment } from "@/types/transaction";

interface ExpenseAttachmentsModalProps extends ModalProps {
  expenseId: string;
  attachments: TransactionAttachment[];
  canManage: boolean;
  isUploading: boolean;
  isDeleting: boolean;
  onUpload: (files: File[]) => Promise<void>;
  onDelete: (key?: string) => Promise<void>;
}

export default function ExpenseAttachmentsModal({
  open,
  toggle,
  expenseId,
  attachments,
  canManage,
  isUploading,
  isDeleting,
  onUpload,
  onDelete,
}: ExpenseAttachmentsModalProps) {
  const inputRef = useRef<HTMLInputElement | null>(null);
  const attachmentLimit = 4;
  const remainingSlots = useMemo(() => Math.max(attachmentLimit - attachments.length, 0), [attachments.length]);

  const handleChange = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(event.target.files || []).slice(0, remainingSlots);
    event.target.value = "";

    if (!files.length) return;

    try {
      await onUpload(files);
      message.success(files.length === 1 ? "Attachment uploaded." : "Attachments uploaded.");
    } catch {
      message.error("Attachment could not be uploaded.");
    }
  };

  const handleDelete = async (key?: string) => {
    if (!key || isDeleting) return;

    try {
      await onDelete(key);
      message.success("Attachment removed.");
    } catch {
      message.error("Attachment could not be removed.");
    }
  };

  return (
    <AppModal
      open={open}
      toggle={toggle}
      title="Expense Attachments"
      width={760}
      height="70vh"
      footer={null}
      loading={isUploading || isDeleting}
    >
      <div className="px-5 pb-6 pt-2 md:px-6">
        <input ref={inputRef} type="file" accept="image/*" multiple className="hidden" onChange={handleChange} />

        <div className="flex flex-wrap items-center justify-between gap-3 border-b border-gray-200 pb-4">
          <div>
            <p className="text-sm font-medium text-gray-900">Upload and review expense images</p>
            <p className="mt-1 text-xs text-gray-500">Expense ID: {expenseId}. Up to 4 images.</p>
          </div>

          {canManage && (
            <Button type="default" className="!border-gray-300 !shadow-none" icon={<ImagePlus size={16} />} disabled={remainingSlots === 0 || isUploading} onClick={() => inputRef.current?.click()}>
              Add image
            </Button>
          )}
        </div>

        {!attachments.length ? (
          <div className="flex min-h-[320px] flex-col items-center justify-center rounded-2xl border border-dashed border-gray-300 bg-gray-50 px-6 py-10 text-center">
            <div className="rounded-full bg-gray-200 p-5">
              <ReceiptText className="text-gray-400" strokeWidth={0.8} size={30} />
            </div>
            <p className="mt-5 text-sm font-medium text-gray-700">No attachments yet</p>
            <p className="mt-1 text-xs text-gray-500">Upload receipt or supporting images for this expense.</p>
            {canManage && (
              <Button type="primary" className="!mt-5 !bg-[#f7c855] !font-semibold !text-black !shadow-none" disabled={isUploading} onClick={() => inputRef.current?.click()}>
                Upload image
              </Button>
            )}
          </div>
        ) : (
          <div className="mt-5 grid grid-cols-2 gap-4 md:grid-cols-3">
            {attachments.map((item, index) => (
              <div key={item.key || item.url || index} className="overflow-hidden rounded-2xl border border-gray-200 bg-white">
                <div className="relative aspect-square bg-gray-100">
                  <PreviewImage width={260} height={260} src={item.url} alt={`Expense attachment ${index + 1}`} />
                  {canManage && (
                    <button
                      type="button"
                      disabled={isDeleting}
                      className="absolute right-2 top-2 rounded-full border border-gray-200 bg-white/95 p-1.5 text-gray-600 transition hover:text-red-500 disabled:opacity-60"
                      onClick={() => handleDelete(item.key)}
                      aria-label="Remove attachment"
                    >
                      <Trash2 size={14} />
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </AppModal>
  );
}
