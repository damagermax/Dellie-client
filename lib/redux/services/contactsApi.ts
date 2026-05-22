import { baseApi, TAG_TYPES } from "./baseApi";

import { Contact, CreateContactInput, UpdateContactInput, ContactQueryParams, PaginatedResponse } from "../../../types";

export const contactsApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    createContact: builder.mutation<void, CreateContactInput>({
      query: (body) => ({
        url: "contacts",
        method: "POST",
        body,
      }),
      invalidatesTags: [TAG_TYPES.CONTACTS],
    }),
    updateContact: builder.mutation<void, UpdateContactInput>({
      query: (body) => ({
        url: `contacts/${body.id}`,
        method: "PUT",
        body,
      }),
      invalidatesTags: (result, error, { id }) => [{ type: TAG_TYPES.CONTACT, id }, TAG_TYPES.CONTACTS],
    }),
    deleteContact: builder.mutation<void, string>({
      query: (id) => ({
        url: `contacts/${id}`,
        method: "DELETE",
      }),
      invalidatesTags: [TAG_TYPES.CONTACTS],
    }),

    getContacts: builder.query<PaginatedResponse<Contact>, ContactQueryParams>({
      query: (params) => ({ url: "contacts", method: "GET", params }),
      providesTags: [TAG_TYPES.CONTACTS],
    }),
    getContact: builder.query<Contact, string>({
      query: (id) => `contacts/${id}`,
      providesTags: (result, error, id) => [{ type: TAG_TYPES.CONTACT, id }],
    }),
  }),
});

export const { useCreateContactMutation, useUpdateContactMutation, useDeleteContactMutation, useGetContactsQuery, useGetContactQuery } = contactsApi;
