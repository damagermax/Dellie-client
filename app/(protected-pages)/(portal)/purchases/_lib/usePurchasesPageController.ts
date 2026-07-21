"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { Modal, message } from "antd";

import useToggle from "@/hooks/UseToggle";
import { useMobileInfiniteList } from "@/hooks/useMobileInfiniteList";
import { useDeletePurchaseMutation, useGetPurchasesQuery, useReopenPurchaseMutation } from "@/lib/redux/services";
import type { Purchase, PurchaseQueryParams } from "@/types/index";
import { apiError, applyPurchaseFilters, buildPurchaseDraftFilters, clearPurchaseFilters, countPurchaseFilters, visibleDeleteRestrictions } from "./purchasesPageControllerHelpers";

export function usePurchasesPageController(initialQuery?: PurchaseQueryParams) {
  const router = useRouter();
  const [formOpen, toggleForm] = useToggle();
  const [editOpen, toggleEdit] = useToggle();
  const [filterOpen, setFilterOpen] = useState(false);
  const [selectedPurchase, setSelectedPurchase] = useState<Purchase>();
  const [deletingPurchaseId, setDeletingPurchaseId] = useState<string>();
  const [reopeningPurchaseId, setReopeningPurchaseId] = useState<string>();
  const [query, setQuery] = useState<PurchaseQueryParams>(() => ({
    page: 1,
    limit: 20,
    ...initialQuery,
  }));
  const [draftFilters, setDraftFilters] = useState<PurchaseQueryParams>({});
  const { data, error, isLoading, isError, isFetching } = useGetPurchasesQuery(query, { refetchOnMountOrArgChange: true });
  const meta = data?.meta;
  const mobileList = useMobileInfiniteList({ query, response: data, isFetching, setQuery });
  const [cancelPurchase] = useDeletePurchaseMutation();
  const [reopenPurchase] = useReopenPurchaseMutation();

  const filterCount = countPurchaseFilters(query);

  const openFilters = () => {
    setDraftFilters(buildPurchaseDraftFilters(query));
    setFilterOpen(true);
  };

  const applyFilters = () => {
    setQuery((current) => applyPurchaseFilters(current, draftFilters));
    setFilterOpen(false);
  };

  const clearFilters = () => {
    setDraftFilters({});
    setQuery((current) => clearPurchaseFilters(current));
  };

  const openEdit = (purchase: Purchase) => {
    setSelectedPurchase(purchase);
    toggleEdit();
  };

  const confirmCancel = (purchase: Purchase) => {
    if (deletingPurchaseId === purchase.id) return;
    const restrictions = visibleDeleteRestrictions(purchase);
    if (restrictions.length) {
      Modal.warning({
        title: `${purchase.purchaseNumber} cannot be cancelled`,
        content: `This purchase cannot be cancelled because ${restrictions.join(", ")}.`,
      });
      return;
    }

    Modal.confirm({
      title: `Cancel ${purchase.purchaseNumber}?`,
      content: "All related transactions will be reversed. This action cannot be undone.",
      okText: "Cancel",
      okType: "danger",
      onOk: async () => {
        setDeletingPurchaseId(purchase.id);
        try {
          await cancelPurchase(purchase.id).unwrap();
          message.success("Purchase cancelled and related transactions reversed.");
          if (selectedPurchase?.id === purchase.id) {
            if (editOpen) toggleEdit();
            setSelectedPurchase(undefined);
          }
        } catch (error: unknown) {
          message.error(apiError(error, "Purchase could not be cancelled."));
          throw error;
        } finally {
          setDeletingPurchaseId(undefined);
        }
      },
    });
  };

  const reopenPurchaseItem = async (purchase: Purchase) => {
    if (reopeningPurchaseId === purchase.id) return;
    setReopeningPurchaseId(purchase.id);
    try {
      await reopenPurchase(purchase.id).unwrap();
      message.success("Purchase reopened.");
    } catch (error: unknown) {
      message.error(apiError(error, "Purchase could not be reopened."));
    } finally {
      setReopeningPurchaseId(undefined);
    }
  };

  return {
    formOpen,
    toggleForm,
    editOpen,
    toggleEdit,
    filterOpen,
    setFilterOpen,
    selectedPurchase,
    query,
    setQuery,
    draftFilters,
    setDraftFilters,
    data,
    error,
    isLoading,
    isError,
    isFetching,
    meta,
    mobileList,
    filterCount,
    openFilters,
    applyFilters,
    clearFilters,
    purchaseActionState: { deletingPurchaseId, reopeningPurchaseId },
    purchaseActionHandlers: {
      onView: (purchase: Purchase) => router.push(`/purchases/${purchase.id}`),
      onReopen: reopenPurchaseItem,
      onEdit: openEdit,
      onCancel: confirmCancel,
    },
  };
}
