import { baseApi, TAG_TYPES } from "./baseApi";

import { Currency, PaginatedResponse } from "../../../types";

export const systemsApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    // createContact: builder.mutation<void, CreateContactInput>({
    //   query: (body) => ({
    //     url: "contacts",
    //     method: "POST",
    //     body,
    //   }),
    //   invalidatesTags: [TAG_TYPES.CONTACTS],
    // }),
    // updateContact: builder.mutation<void, UpdateContactInput>({
    //   query: (body) => ({
    //     url: `contacts/${body.id}`,
    //     method: "PUT",
    //     body,
    //   }),
    //   invalidatesTags: (result, error, { id }) => [{ type: TAG_TYPES.CONTACT, id }, TAG_TYPES.CONTACTS],
    // }),
    // deleteContact: builder.mutation<void, string>({
    //   query: (id) => ({
    //     url: `contacts/${id}`,
    //     method: "DELETE",
    //   }),
    //   invalidatesTags: [TAG_TYPES.CONTACTS],
    // }),

    getCurrencies: builder.query<PaginatedResponse<Currency>, { search: string }>({
      query: (params) => ({ url: "system/currencies", method: "GET", params }),
      providesTags: [TAG_TYPES.SYSTEM],
    }),

    getCurrency: builder.query<Currency, string>({
      query: (id) => ({ url: `system/currencies/${id}`, method: "GET" }),
      providesTags: [TAG_TYPES.SYSTEM],
    }),
    // getContact: builder.query<Contact, string>({
    //   query: (id) => `contacts/${id}`,
    //   providesTags: (result, error, id) => [{ type: TAG_TYPES.CONTACT, id }],
    // }),
  }),
});

export const { useGetCurrenciesQuery, useGetCurrencyQuery } = systemsApi;
