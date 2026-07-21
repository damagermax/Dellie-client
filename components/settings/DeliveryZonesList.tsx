"use client";

import { AppNotFoundView } from "@/components/ui/AppNotFoundView";
import { AppViewLoader } from "@/components/ui/AppViewLoader";
import { ActionDropdown } from "@/components/ui/ActionDropdown";
import { useDeleteDeliveryZoneMutation, useGetDeliveryZonesQuery, useUpdateDeliveryZoneMutation } from "@/lib/redux/services";
import { DeliveryZone } from "@/types/delivery-zone";
import { Tag } from "antd";

interface DeliveryZonesListProps {
  onSelect: (deliveryZone: DeliveryZone) => void;
}

export default function DeliveryZonesList({ onSelect }: DeliveryZonesListProps) {
  const { data: deliveryZones, isLoading } = useGetDeliveryZonesQuery();
  const [deleteDeliveryZone] = useDeleteDeliveryZoneMutation();
  const [updateDeliveryZone] = useUpdateDeliveryZoneMutation();

  const handleDelete = async (id: string) => {
    if (!window.confirm("Delete this delivery zone?")) return;
    await deleteDeliveryZone(id).unwrap();
  };

  const handleActivate = async (id: string) => {
    await updateDeliveryZone({ id, status: "active" }).unwrap();
  };

  const handleDeactivate = async (id: string) => {
    await updateDeliveryZone({ id, status: "inactive" }).unwrap();
  };

  return (
    <div className="pb-32">
      <AppViewLoader loading={isLoading} />
      <AppNotFoundView dataLength={deliveryZones?.length || 0} loading={isLoading} query={{}} entity="Delivery Zone" />

      <div className="px-5">
        {deliveryZones?.map((zone, index) => (
          <div key={zone.id} className={`flex items-center justify-between gap-4 py-4 border-b border-blue-100`}>
            <button type="button" className="flex min-w-0 flex-1 flex-col items-start text-left" onClick={() => onSelect(zone)}>
              <div className="flex items-center gap-2 flex-wrap">
                <h3 className="truncate font-medium text-gray-800">{zone.name}</h3>
                <Tag color={zone.status === "active" ? "green" : "red"} className="!mr-0 !rounded-full !px-1.5 !py-0 !text-[10px] !leading-4">
                  {zone.status}
                </Tag>
              </div>
              <div className="mt-0.5 text-sm text-gray-500">
                ${zone.fee.toFixed(2)} &middot; {zone.areas}
              </div>
            </button>

            <ActionDropdown
              openEditModal={() => onSelect(zone)}
              onDelete={() => handleDelete(zone.id)}
              onActivate={() => handleActivate(zone.id)}
              onDeactivate={() => handleDeactivate(zone.id)}
              status={zone.status}
            />
          </div>
        ))}
      </div>
    </div>
  );
}
