import { AddPurchaseLandedCostInput, CreatePurchaseInput, FulfillPurchaseInput, Purchase, PurchaseQueryParams, PurchasesResponse, ReturnPurchaseInput, UpdatePurchaseInput } from "@/types/index";
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
  useAddPurchaseLandedCostMutation,
} = purchasesApi;
