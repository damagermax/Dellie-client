import { baseApi, TAG_TYPES } from "./baseApi";

import { Tax, TaxCreateInput, TaxUpdateInput } from "../../../types";

export const taxesApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    createTax: builder.mutation<void, TaxCreateInput>({
      query: (body) => ({
        url: "taxes",
        method: "POST",
        body,
      }),
      invalidatesTags: [TAG_TYPES.TAXES],
    }),

    updateTax: builder.mutation<void, TaxUpdateInput>({
      query: ({ id, ...body }) => ({
        url: `taxes/${id}`,
        method: "PUT",
        body,
      }),
      invalidatesTags: (result, error, { id }) => [{ type: TAG_TYPES.TAX, id }, TAG_TYPES.TAXES],
    }),

    deleteTax: builder.mutation<void, string>({
      query: (id) => ({
        url: `taxes/${id}`,
        method: "DELETE",
      }),
      invalidatesTags: [TAG_TYPES.TAXES],
    }),

    getTaxes: builder.query<Tax[], void>({
      query: () => ({
        url: "taxes",
        method: "GET",
      }),
      providesTags: [TAG_TYPES.TAXES],
    }),

    getTax: builder.query<Tax, string>({
      query: (id) => `taxes/${id}`,
      providesTags: (result, error, id) => [{ type: TAG_TYPES.TAX, id }],
    }),
  }),
});

export const { useCreateTaxMutation, useUpdateTaxMutation, useDeleteTaxMutation, useGetTaxesQuery, useGetTaxQuery } = taxesApi;
