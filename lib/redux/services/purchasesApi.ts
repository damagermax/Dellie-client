import {
  AddPurchaseLandedCostInput,
  CreatePurchaseInput,
  FulfillPurchaseInput,
  Purchase,
  PurchaseQueryParams,
  PurchasesResponse,
  ReturnPurchaseInput,
  UpdatePurchaseFulfillmentInput,
  UpdatePurchaseInput,
  UpdatePurchaseReturnInput,
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
    fulfillPurchase: builder.mutation<Purchase, FulfillPurchaseInput>({
      query: ({ id, ...body }) => ({ url: `purchases/${id}/fulfillments`, method: "POST", body }),
      invalidatesTags: (result, error, { id }) => [{ type: TAG_TYPES.PURCHASE, id }, TAG_TYPES.PURCHASES, TAG_TYPES.PRODUCTS, TAG_TYPES.INVENTORY],
    }),
    returnPurchaseStock: builder.mutation<Purchase, ReturnPurchaseInput>({
      query: ({ id, ...body }) => ({ url: `purchases/${id}/returns`, method: "POST", body }),
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
    updatePurchaseReturn: builder.mutation<Purchase, UpdatePurchaseReturnInput>({
      query: ({ id, returnId, ...body }) => ({ url: `purchases/${id}/returns/${returnId}`, method: "PATCH", body }),
      invalidatesTags: (result, error, { id }) => [{ type: TAG_TYPES.PURCHASE, id }, TAG_TYPES.PURCHASES, TAG_TYPES.PRODUCTS, TAG_TYPES.INVENTORY],
    }),
    deletePurchaseReturn: builder.mutation<Purchase, { id: string; returnId: string }>({
      query: ({ id, returnId }) => ({ url: `purchases/${id}/returns/${returnId}`, method: "DELETE" }),
      invalidatesTags: (result, error, { id }) => [{ type: TAG_TYPES.PURCHASE, id }, TAG_TYPES.PURCHASES, TAG_TYPES.PRODUCTS, TAG_TYPES.INVENTORY],
    }),
    addPurchaseLandedCost: builder.mutation<Purchase, AddPurchaseLandedCostInput>({
      query: ({ id, ...body }) => ({ url: `purchases/${id}/landed-costs`, method: "POST", body }),
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
  useFulfillPurchaseMutation,
  useReturnPurchaseStockMutation,
  useUpdatePurchaseFulfillmentMutation,
  useDeletePurchaseFulfillmentMutation,
  useUpdatePurchaseReturnMutation,
  useDeletePurchaseReturnMutation,
  useAddPurchaseLandedCostMutation,
} = purchasesApi;
