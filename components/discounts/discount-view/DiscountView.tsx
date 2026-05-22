import { Discount, DiscountsQueryParams, DiscountStatus } from "../../../types";
import { useState } from "react";
import useToggle from "@/hooks/UseToggle";

import { useUpdateDiscountMutation, useDeleteDiscountMutation, useGetDiscountsQuery } from "@/lib/redux/services";
import DiscountsFormModal from "../DiscountFormModal";
import DiscountsTable from "./DiscountsTable";
import { AppViewLoader } from "@/components/ui/AppViewLoader";
import { AppNotFoundView } from "@/components/ui/AppNotFoundView";

export interface DiscountViewItemAction {
  openEditModal: (contact: Discount) => void;
  onDelete: (id: string) => void;
  onActivate: (id: string) => void;
  onDeactivate: (id: string) => void;
}

interface TagsViewProps {
  query: DiscountsQueryParams;
}

export function DiscountView({ query }: TagsViewProps) {
  const [updateDiscount, { isLoading: isUpdating }] = useUpdateDiscountMutation();
  const [deleteDiscount, { isLoading: isDeleting }] = useDeleteDiscountMutation();

  const [isEditModalOpen, toggleEditModal] = useToggle();

  const [selectedTag, setSelectedTag] = useState<Discount>();

  const { data: discountsData, isLoading: loadingTags } = useGetDiscountsQuery(query);

  const handleEditTag = (discount: Discount) => {
    setSelectedTag(discount);
    toggleEditModal();
  };

  const formData = new FormData();

  const handleActivateDiscount = async (discountId: string) => {
    formData.append("status", DiscountStatus.ACTIVE);
    console.log(formData);
    !isUpdating && (await updateDiscount({ id: discountId, data: formData }));

    formData.delete("status");
  };

  const handleDeactivateDiscount = async (discountId: string) => {
    formData.append("status", DiscountStatus.INACTIVE);
    console.log(formData);
    !isUpdating && (await updateDiscount({ id: discountId, data: formData }));

    formData.delete("status");
  };

  const handleDeleteDiscount = async (discountId: string) => {
    !isDeleting && (await deleteDiscount(discountId));
  };

  return (
    <>
      <AppViewLoader loading={loadingTags} />

      <AppNotFoundView dataLength={discountsData?.data?.length || 0} loading={loadingTags} query={query} entity="Discounts" />

      <DiscountsTable discounts={discountsData?.data || []} onActivate={handleActivateDiscount} onDeactivate={handleDeactivateDiscount} onDelete={handleDeleteDiscount} openEditModal={handleEditTag} />

      {isEditModalOpen && <DiscountsFormModal open={isEditModalOpen} toggle={toggleEditModal} initialValues={selectedTag} />}
    </>
  );
}
