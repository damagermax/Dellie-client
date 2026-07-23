"use client";

import { Button, Input, Modal } from "antd";
import { Check, Search, UserPlus, X } from "lucide-react";
import type { Contact } from "@/types/contact";
import { POS_MODAL_OVERLAY_STYLE } from "./utils";

type PosCustomerModalProps = {
  open: boolean;
  customerSearch: string;
  contactsLoading: boolean;
  contacts: Contact[];
  selectedContactId?: string;
  selectedContactName: string | null;
  customerMode?: string;
  onClose: () => void;
  onCustomerSearchChange: (value: string) => void;
  onClearSelectedCustomer: () => void;
  onSelectCustomer: (contact: Contact) => void;
  onWalkInCustomer: () => void;
  onOpenNewCustomer: () => void;
};

export default function PosCustomerModal({
  open,
  customerSearch,
  contactsLoading,
  contacts,
  selectedContactId,
  selectedContactName,
  customerMode,
  onClose,
  onCustomerSearchChange,
  onClearSelectedCustomer,
  onSelectCustomer,
  onWalkInCustomer,
  onOpenNewCustomer,
}: PosCustomerModalProps) {
  return (
    <Modal title="Select Customer" open={open} onCancel={onClose} footer={null} width={580} destroyOnHidden styles={{ mask: POS_MODAL_OVERLAY_STYLE }}>
      <div className="space-y-4 px-5 pb-5 pt-3">
        <div className="rounded-2xl border border-stone-200 bg-white px-4 py-3">
          <div className="flex items-center gap-3">
            <Search size={18} className="text-stone-400" />
            <Input value={customerSearch} onChange={(event) => onCustomerSearchChange(event.target.value)} placeholder="Search customer" bordered={false} className="!px-0" />
          </div>
        </div>

        {selectedContactName ? (
          <div className="rounded-2xl border border-stone-200 bg-white px-4 py-3">
            <p className="text-xs font-medium uppercase tracking-[0.12em] text-stone-500">Selected</p>
            <div className="mt-2 flex items-center justify-between gap-3">
              <div className="min-w-0">
                <p className="truncate text-sm font-semibold text-stone-900">{selectedContactName}</p>
                <p className="mt-0.5 text-xs text-stone-500">Customer attached to this sale</p>
              </div>
              <button type="button" className="rounded-full border border-stone-200 p-2 text-stone-500" onClick={onClearSelectedCustomer} aria-label="Clear selected customer">
                <X size={14} />
              </button>
            </div>
          </div>
        ) : null}

        <div className="overflow-hidden rounded-2xl border border-stone-200 bg-white">
          <div className="border-b border-stone-100 px-4 py-3">
            <p className="text-sm font-medium text-stone-900">Customers</p>
          </div>

          <div className="max-h-[52vh] overflow-y-auto">
            {contactsLoading ? (
              <p className="px-4 py-6 text-sm text-stone-500">Loading customers...</p>
            ) : contacts.length > 0 ? (
              contacts.map((contact) => {
                const isActive = selectedContactId === contact.id;

                return (
                  <button key={contact.id} type="button" className="flex w-full items-center justify-between gap-3 border-b border-stone-100 px-4 py-3 text-left last:border-b-0 active:bg-stone-50" onClick={() => onSelectCustomer(contact)}>
                    <div className="min-w-0">
                      <p className="truncate text-sm font-medium text-stone-900">{contact.name}</p>
                      <p className="mt-0.5 truncate text-xs text-stone-500">{contact.phone || contact.mobile || contact.email || "No contact info"}</p>
                    </div>
                    {isActive ? (
                      <span className="flex h-6 w-6 items-center justify-center rounded-full bg-emerald-100 text-emerald-600">
                        <Check size={14} strokeWidth={3} />
                      </span>
                    ) : null}
                  </button>
                );
              })
            ) : (
              <div className="px-4 py-8 text-center">
                <p className="text-sm font-medium text-stone-900">No customers found</p>
                <p className="mt-1 text-xs text-stone-500">Try another search or add a new customer.</p>
              </div>
            )}
          </div>
        </div>

        <div className="grid grid-cols-1 gap-2 sm:grid-cols-2">
          {customerMode !== "require_customer" ? (
            <Button size="large" className="!h-11 !rounded-2xl" onClick={onWalkInCustomer}>
              Walk-in Customer
            </Button>
          ) : null}

          <Button size="large" icon={<UserPlus size={16} />} className="!h-11 !rounded-2xl" onClick={onOpenNewCustomer}>
            New Customer
          </Button>
        </div>
      </div>
    </Modal>
  );
}
