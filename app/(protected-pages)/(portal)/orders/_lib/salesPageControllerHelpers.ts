"use client";

import type { SaleQueryParams } from "@/types/index";

export function countSalesFilters(query: SaleQueryParams) {
  return (
    Number(Boolean(query.status)) +
    Number(Boolean(query.fulfillmentStatus)) +
    Number(Boolean(query.paymentStatus)) +
    Number(Boolean(query.overdue)) +
    Number(Boolean(query.customerId)) +
    Number(Boolean(query.source)) +
    Number(Boolean(query.dateFrom || query.dateTo)) +
    Number(Boolean(query.locationId))
  );
}

export function buildSalesDraftFilters(query: SaleQueryParams): SaleQueryParams {
  return {
    status: query.status,
    fulfillmentStatus: query.fulfillmentStatus,
    paymentStatus: query.paymentStatus,
    overdue: query.overdue,
    customerId: query.customerId,
    source: query.source,
    dateFrom: query.dateFrom,
    dateTo: query.dateTo,
    locationId: query.locationId,
  };
}

export function applySalesFilters(current: SaleQueryParams, draftFilters: SaleQueryParams): SaleQueryParams {
  return {
    ...current,
    status: draftFilters.status,
    fulfillmentStatus: draftFilters.fulfillmentStatus,
    paymentStatus: draftFilters.paymentStatus,
    overdue: draftFilters.overdue,
    customerId: draftFilters.customerId,
    source: draftFilters.source,
    dateFrom: draftFilters.dateFrom,
    dateTo: draftFilters.dateTo,
    locationId: draftFilters.locationId,
    page: 1,
  };
}

export function clearSalesFilters(current: SaleQueryParams): SaleQueryParams {
  return {
    ...current,
    status: undefined,
    fulfillmentStatus: undefined,
    paymentStatus: undefined,
    overdue: undefined,
    customerId: undefined,
    source: undefined,
    dateFrom: undefined,
    dateTo: undefined,
    locationId: undefined,
    page: 1,
  };
}
