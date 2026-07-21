"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { Modal, message } from "antd";

import useToggle from "@/hooks/UseToggle";
import { useMobileInfiniteList } from "@/hooks/useMobileInfiniteList";
import { useConvertSaleQuoteMutation, useDeleteSaleMutation, useGetSalesQuery, useReopenSaleMutation } from "@/lib/redux/services";
import type { Sale, SaleQueryParams } from "@/types/index";
import type { SaleDocumentType } from "@/components/orders/SaleShareDocumentModal";
import { saleApiError, saleDocumentNumber, visibleSaleDeleteRestrictions } from "@/components/orders/saleUtils";
import { applySalesFilters, buildSalesDraftFilters, clearSalesFilters, countSalesFilters } from "./salesPageControllerHelpers";

export function useSalesPageController(initialQuery?: SaleQueryParams) {
  const router = useRouter();
  const [formOpen, toggleForm] = useToggle();
  const [editOpen, toggleEdit] = useToggle();
  const [filterOpen, setFilterOpen] = useState(false);
  const [selectedSale, setSelectedSale] = useState<Sale>();
  const [shareDocumentType, setShareDocumentType] = useState<SaleDocumentType>();
  const [deletingSaleId, setDeletingSaleId] = useState<string>();
  const [reopeningSaleId, setReopeningSaleId] = useState<string>();
  const [convertingSaleId, setConvertingSaleId] = useState<string>();
  const [query, setQuery] = useState<SaleQueryParams>(() => ({
    page: 1,
    limit: 20,
    ...initialQuery,
  }));
  const [draftFilters, setDraftFilters] = useState<SaleQueryParams>({});
  const { data, error, isLoading, isError, isFetching } = useGetSalesQuery(query, { refetchOnMountOrArgChange: true });
  const meta = data?.meta;
  const mobileList = useMobileInfiniteList({ query, response: data, isFetching, setQuery });
  const [cancelSale] = useDeleteSaleMutation();
  const [reopenSale] = useReopenSaleMutation();
  const [convertSaleQuote] = useConvertSaleQuoteMutation();

  const filterCount = countSalesFilters(query);

  const openFilters = () => {
    setDraftFilters(buildSalesDraftFilters(query));
    setFilterOpen(true);
  };

  const applyFilters = () => {
    setQuery((current) => applySalesFilters(current, draftFilters));
    setFilterOpen(false);
  };

  const clearFilters = () => {
    setDraftFilters({});
    setQuery((current) => clearSalesFilters(current));
  };

  const confirmCancel = (sale: Sale) => {
    if (deletingSaleId === sale.id) return;
    const restrictions = visibleSaleDeleteRestrictions(sale);
    if (restrictions.length) {
      Modal.warning({
        title: `${saleDocumentNumber(sale)} cannot be cancelled`,
        content: `This sale cannot be cancelled because ${restrictions.join(", ")}.`,
      });
      return;
    }

    Modal.confirm({
      title: `Cancel ${saleDocumentNumber(sale)}?`,
      content: "All related transactions will be reversed. This action cannot be undone.",
      okText: "Cancel",
      okType: "danger",
      onOk: async () => {
        setDeletingSaleId(sale.id);
        try {
          await cancelSale(sale.id).unwrap();
          message.success("Sale cancelled and related transactions reversed.");
          if (selectedSale?.id === sale.id) {
            if (editOpen) toggleEdit();
            setSelectedSale(undefined);
          }
        } catch (error) {
          message.error(saleApiError(error, "Sale could not be cancelled."));
          throw error;
        } finally {
          setDeletingSaleId(undefined);
        }
      },
    });
  };

  const reopenSaleItem = async (sale: Sale) => {
    if (reopeningSaleId === sale.id) return;
    setReopeningSaleId(sale.id);
    try {
      await reopenSale(sale.id).unwrap();
      message.success("Sale reopened.");
    } catch (error) {
      message.error(saleApiError(error, "Sale could not be reopened."));
    } finally {
      setReopeningSaleId(undefined);
    }
  };

  const convertSaleItem = async (sale: Sale) => {
    if (convertingSaleId === sale.id) return;
    setConvertingSaleId(sale.id);
    try {
      await convertSaleQuote(sale.id).unwrap();
      message.success("Quote converted to sale.");
    } catch (error) {
      message.error(saleApiError(error, "Quote could not be converted."));
    } finally {
      setConvertingSaleId(undefined);
    }
  };

  const editSale = (sale: Sale) => {
    setSelectedSale(sale);
    toggleEdit();
  };

  const shareSaleDocument = (sale: Sale, type: SaleDocumentType) => {
    setSelectedSale(sale);
    setShareDocumentType(type);
  };

  return {
    formOpen,
    toggleForm,
    editOpen,
    toggleEdit,
    filterOpen,
    setFilterOpen,
    selectedSale,
    shareDocumentType,
    setShareDocumentType,
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
    deletingSaleId,
    reopeningSaleId,
    convertingSaleId,
    saleActionState: { deletingSaleId, reopeningSaleId, convertingSaleId },
    saleActionHandlers: {
      onView: (sale: Sale) => router.push(`/orders/${sale.id}`),
      onReopen: reopenSaleItem,
      onConvert: convertSaleItem,
      onEdit: editSale,
      onShare: shareSaleDocument,
      onCancel: confirmCancel,
    },
  };
}
