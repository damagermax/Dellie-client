import {
  CreateSaleInput,
  FulfillSaleInput,
  ReturnSaleInput,
  Sale,
  SaleQueryParams,
  SalesResponse,
  UpdateSaleFulfillmentInput,
  UpdateSaleReturnInput,
  UpdateSaleInput,
} from "@/types/index";
import { baseApi, TAG_TYPES } from "./baseApi";

export const salesApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    createSale: builder.mutation<Sale, CreateSaleInput>({
      query: (body) => ({ url: "sales", method: "POST", body }),
      invalidatesTags: [TAG_TYPES.SALES, TAG_TYPES.PRODUCTS, TAG_TYPES.INVENTORY],
    }),
    getSales: builder.query<SalesResponse, SaleQueryParams>({
      query: (params) => ({ url: "sales", params }),
      providesTags: [TAG_TYPES.SALES],
    }),
    getSale: builder.query<Sale, string>({
      query: (id) => `sales/${id}`,
      providesTags: (result, error, id) => [{ type: TAG_TYPES.SALE, id }],
    }),
    updateSale: builder.mutation<Sale, UpdateSaleInput>({
      query: ({ id, ...body }) => ({ url: `sales/${id}`, method: "PATCH", body }),
      invalidatesTags: (result, error, { id }) => [{ type: TAG_TYPES.SALE, id }, TAG_TYPES.SALES, TAG_TYPES.PRODUCTS, TAG_TYPES.INVENTORY],
    }),
    convertSaleQuote: builder.mutation<Sale, string>({
      query: (id) => ({ url: `sales/${id}/convert`, method: "POST" }),
      invalidatesTags: (result, error, id) => [{ type: TAG_TYPES.SALE, id }, TAG_TYPES.SALES, TAG_TYPES.PRODUCTS, TAG_TYPES.INVENTORY],
    }),
    deleteSale: builder.mutation<{ deleted: true; id: string }, string>({
      query: (id) => ({ url: `sales/${id}`, method: "DELETE" }),
      invalidatesTags: (result, error, id) => [{ type: TAG_TYPES.SALE, id }, TAG_TYPES.SALES, TAG_TYPES.PRODUCTS, TAG_TYPES.INVENTORY],
    }),
    reopenSale: builder.mutation<Sale, string>({
      query: (id) => ({ url: `sales/${id}/reopen`, method: "POST" }),
      invalidatesTags: (result, error, id) => [{ type: TAG_TYPES.SALE, id }, TAG_TYPES.SALES, TAG_TYPES.PRODUCTS, TAG_TYPES.INVENTORY],
    }),
    closeSale: builder.mutation<Sale, string>({
      query: (id) => ({ url: `sales/${id}/close`, method: "POST" }),
      invalidatesTags: (result, error, id) => [{ type: TAG_TYPES.SALE, id }, TAG_TYPES.SALES],
    }),
    fulfillSale: builder.mutation<Sale, FulfillSaleInput>({
      query: ({ id, ...body }) => ({ url: `sales/${id}/fulfillments`, method: "POST", body }),
      invalidatesTags: (result, error, { id }) => [{ type: TAG_TYPES.SALE, id }, TAG_TYPES.SALES],
    }),
    returnSale: builder.mutation<Sale, ReturnSaleInput>({
      query: ({ id, ...body }) => ({ url: `sales/${id}/returns`, method: "POST", body }),
      invalidatesTags: (result, error, { id }) => [{ type: TAG_TYPES.SALE, id }, TAG_TYPES.SALES, TAG_TYPES.PRODUCTS, TAG_TYPES.INVENTORY],
    }),
    updateSaleFulfillment: builder.mutation<Sale, UpdateSaleFulfillmentInput>({
      query: ({ id, fulfillmentId, ...body }) => ({ url: `sales/${id}/fulfillments/${fulfillmentId}`, method: "PATCH", body }),
      invalidatesTags: (result, error, { id }) => [{ type: TAG_TYPES.SALE, id }, TAG_TYPES.SALES, TAG_TYPES.PRODUCTS, TAG_TYPES.INVENTORY],
    }),
    updateSaleReturn: builder.mutation<Sale, UpdateSaleReturnInput>({
      query: ({ id, returnId, ...body }) => ({ url: `sales/${id}/returns/${returnId}`, method: "PATCH", body }),
      invalidatesTags: (result, error, { id }) => [{ type: TAG_TYPES.SALE, id }, TAG_TYPES.SALES, TAG_TYPES.PRODUCTS, TAG_TYPES.INVENTORY],
    }),
    deleteSaleFulfillment: builder.mutation<Sale, { id: string; fulfillmentId: string }>({
      query: ({ id, fulfillmentId }) => ({ url: `sales/${id}/fulfillments/${fulfillmentId}`, method: "DELETE" }),
      invalidatesTags: (result, error, { id }) => [{ type: TAG_TYPES.SALE, id }, TAG_TYPES.SALES, TAG_TYPES.PRODUCTS, TAG_TYPES.INVENTORY],
    }),
    deleteSaleReturn: builder.mutation<Sale, { id: string; returnId: string }>({
      query: ({ id, returnId }) => ({ url: `sales/${id}/returns/${returnId}`, method: "DELETE" }),
      invalidatesTags: (result, error, { id }) => [{ type: TAG_TYPES.SALE, id }, TAG_TYPES.SALES, TAG_TYPES.PRODUCTS, TAG_TYPES.INVENTORY],
    }),
  }),
});

export const {
  useCreateSaleMutation,
  useGetSalesQuery,
  useGetSaleQuery,
  useUpdateSaleMutation,
  useConvertSaleQuoteMutation,
  useDeleteSaleMutation,
  useReopenSaleMutation,
  useCloseSaleMutation,
  useFulfillSaleMutation,
  useReturnSaleMutation,
  useUpdateSaleFulfillmentMutation,
  useUpdateSaleReturnMutation,
  useDeleteSaleFulfillmentMutation,
  useDeleteSaleReturnMutation,
} = salesApi;
