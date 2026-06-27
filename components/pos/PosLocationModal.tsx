"use client";

import { Check } from "lucide-react";
import { Modal } from "antd";
import type { Location } from "@/types/index";
import { POS_MODAL_OVERLAY_STYLE } from "./utils";

type PosLocationModalProps = {
  open: boolean;
  locations?: Location[];
  activeLocationId?: string;
  onClose: () => void;
  onSelectLocation: (location: Location) => void;
};

export default function PosLocationModal({ open, locations, activeLocationId, onClose, onSelectLocation }: PosLocationModalProps) {
  return (
    <Modal title="Select POS Location" className="overflow-clip" open={open} onCancel={onClose} footer={null} width={580} destroyOnHidden styles={{ mask: POS_MODAL_OVERLAY_STYLE }}>
      <div className="space-y-1.5  ">
        {locations?.map((location) => {
          const isActive = location.id === activeLocationId;

          return (
            <div key={location.id} onClick={() => onSelectLocation(location)} className="flex cursor-pointer items-center justify-between  border-b  border-stone-200/70 p-3 px-5 transition-all duration-200 hover:border-stone-300 hover:bg-stone-50">
              <div>
                <p className="text-sm font-medium text-stone-800">{location.name}</p>
                {location.address && <p className="mt-0.5 text-xs text-stone-500">{location.address}</p>}
              </div>
              {isActive ? (
                <div className="flex h-6 w-6 items-center justify-center rounded-full bg-emerald-100">
                  <Check size={14} className="text-emerald-600" strokeWidth={3} />
                </div>
              ) : null}
            </div>
          );
        })}
        {(!locations || locations.length === 0) && <p className="py-8 text-center text-sm text-stone-400">No locations found.</p>}
      </div>
    </Modal>
  );
}
