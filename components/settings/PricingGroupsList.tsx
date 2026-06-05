"use client";

import { Tag } from "antd";
import { AppNotFoundView } from "@/components/ui/AppNotFoundView";
import { AppViewLoader } from "@/components/ui/AppViewLoader";
import { ActionDropdown } from "@/components/ui/ActionDropdown";
import { useDeletePricingGroupMutation, useGetPricingGroupsQuery } from "@/lib/redux/services";
import { PricingGroup } from "@/types/pricing-group";

interface PricingGroupsListProps {
  onSelect: (pricingGroup: PricingGroup) => void;
}

export default function PricingGroupsList({ onSelect }: PricingGroupsListProps) {
  const { data: pricingGroups, isLoading } = useGetPricingGroupsQuery();
  const [deletePricingGroup] = useDeletePricingGroupMutation();

  const handleDelete = async (pricingGroupId: string) => {
    if (!window.confirm("Delete this pricing group?")) return;
    await deletePricingGroup(pricingGroupId).unwrap();
  };

  return (
    <div className="pb-32">
      <AppViewLoader loading={isLoading} />
      <AppNotFoundView dataLength={pricingGroups?.length || 0} loading={isLoading} query={{}} entity="Pricing Group" />

      <div className="px-5">
        {pricingGroups?.map((pricingGroup, index) => (
          <div key={pricingGroup.id} className={`flex items-center justify-between gap-4 py-4 border-b border-blue-100 ${index !== pricingGroups.length - 1 ? "" : ""}`}>
            <button type="button" className="flex min-w-0 flex-1 flex-col items-start text-left" onClick={() => onSelect(pricingGroup)}>
              <div className="flex items-center gap-2">
                <h3 className="truncate font-medium text-gray-800">{pricingGroup.name}</h3>
                {pricingGroup.isDefault && (
                  <Tag color="blue" className="!m-0 !rounded-full">
                    Default
                  </Tag>
                )}
              </div>
            </button>

            <ActionDropdown openEditModal={() => onSelect(pricingGroup)} onDelete={() => handleDelete(pricingGroup.id)} />
          </div>
        ))}
      </div>
    </div>
  );
}
