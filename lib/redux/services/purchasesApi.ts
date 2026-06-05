import {
  AddPurchaseLandedCostInput,
  CreatePurchaseInput,
  FulfillPurchaseInput,
  Purchase,
  PurchaseQueryParams,
  PurchasesResponse,
  UpdatePurchaseLandedCostInput,
  UpdatePurchaseFulfillmentInput,
  UpdatePurchaseInput,
} from "@/types/index";
import { baseApi, TAG_TYPES } from "./baseApi";

export const purchasesApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    createPurchase: builder.mutation<Purchase, CreatePurchaseInput>({
      query: (body) => ({ url: "purchases", method: "POST", body }),
      invalidatesTags: [TAG_TYPES.PURCHASES],
    }),
    getPurchases: builder.query<PurchasesResponse, PurchaseQueryParams>({
      query: (params) => ({ url: "purchases", params }),
      providesTags: [TAG_TYPES.PURCHASES],
    }),
    getPurchase: builder.query<Purchase, string>({
      query: (id) => `purchases/${id}`,
      providesTags: (result, error, id) => [{ type: TAG_TYPES.PURCHASE, id }],
    }),
    updatePurchase: builder.mutation<Purchase, UpdatePurchaseInput>({
      query: ({ id, ...body }) => ({ url: `purchases/${id}`, method: "PATCH", body }),
      invalidatesTags: (result, error, { id }) => [{ type: TAG_TYPES.PURCHASE, id }, TAG_TYPES.PURCHASES],
    }),
    deletePurchase: builder.mutation<{ deleted: true; id: string }, string>({
      query: (id) => ({ url: `purchases/${id}`, method: "DELETE" }),
      invalidatesTags: (result, error, id) => [{ type: TAG_TYPES.PURCHASE, id }, TAG_TYPES.PURCHASES],
    }),
    reopenPurchase: builder.mutation<Purchase, string>({
      query: (id) => ({ url: `purchases/${id}/reopen`, method: "POST" }),
      invalidatesTags: (result, error, id) => [{ type: TAG_TYPES.PURCHASE, id }, TAG_TYPES.PURCHASES],
    }),
    fulfillPurchase: builder.mutation<Purchase, FulfillPurchaseInput>({
      query: ({ id, ...body }) => ({ url: `purchases/${id}/fulfillments`, method: "POST", body }),
      invalidatesTags: (result, error, { id }) => [{ type: TAG_TYPES.PURCHASE, id }, TAG_TYPES.PURCHASES, TAG_TYPES.PRODUCTS, TAG_TYPES.INVENTORY],
    }),
    updatePurchaseFulfillment: builder.mutation<Purchase, UpdatePurchaseFulfillmentInput>({
      query: ({ id, fulfillmentId, ...body }) => ({ url: `purchases/${id}/fulfillments/${fulfillmentId}`, method: "PATCH", body }),
      invalidatesTags: (result, error, { id }) => [{ type: TAG_TYPES.PURCHASE, id }, TAG_TYPES.PURCHASES, TAG_TYPES.PRODUCTS, TAG_TYPES.INVENTORY],
    }),
    deletePurchaseFulfillment: builder.mutation<Purchase, { id: string; fulfillmentId: string }>({
      query: ({ id, fulfillmentId }) => ({ url: `purchases/${id}/fulfillments/${fulfillmentId}`, method: "DELETE" }),
      invalidatesTags: (result, error, { id }) => [{ type: TAG_TYPES.PURCHASE, id }, TAG_TYPES.PURCHASES, TAG_TYPES.PRODUCTS, TAG_TYPES.INVENTORY],
    }),
    addPurchaseLandedCost: builder.mutation<Purchase, AddPurchaseLandedCostInput>({
      query: ({ id, ...body }) => ({ url: `purchases/${id}/landed-costs`, method: "POST", body }),
      invalidatesTags: (result, error, { id }) => [{ type: TAG_TYPES.PURCHASE, id }, TAG_TYPES.PURCHASES],
    }),
    updatePurchaseLandedCost: builder.mutation<Purchase, UpdatePurchaseLandedCostInput>({
      query: ({ id, landedCostId, ...body }) => ({ url: `purchases/${id}/landed-costs/${landedCostId}`, method: "PATCH", body }),
      invalidatesTags: (result, error, { id }) => [{ type: TAG_TYPES.PURCHASE, id }, TAG_TYPES.PURCHASES],
    }),
    deletePurchaseLandedCost: builder.mutation<Purchase, { id: string; landedCostId: string }>({
      query: ({ id, landedCostId }) => ({ url: `purchases/${id}/landed-costs/${landedCostId}`, method: "DELETE" }),
      invalidatesTags: (result, error, { id }) => [{ type: TAG_TYPES.PURCHASE, id }, TAG_TYPES.PURCHASES],
    }),
  }),
});

export const {
  useCreatePurchaseMutation,
  useGetPurchasesQuery,
  useGetPurchaseQuery,
  useUpdatePurchaseMutation,
  useDeletePurchaseMutation,
  useReopenPurchaseMutation,
  useFulfillPurchaseMutation,
  useUpdatePurchaseFulfillmentMutation,
  useDeletePurchaseFulfillmentMutation,
  useAddPurchaseLandedCostMutation,
  useUpdatePurchaseLandedCostMutation,
  useDeletePurchaseLandedCostMutation,
} = purchasesApi;
