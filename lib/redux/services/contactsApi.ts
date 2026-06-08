import { baseApi, TAG_TYPES } from "./baseApi";

import {
  Contact,
  CreateContactInput,
  UpdateContactInput,
  ContactQueryParams,
  PaginatedResponse,
  EmployeeAccessInput,
  EmployeeAccessResponse,
} from "../../../types";

export const contactsApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    createContact: builder.mutation<any, CreateContactInput>({
      query: (body) => ({
        url: "contacts",
        method: "POST",
        body,
      }),
      invalidatesTags: [TAG_TYPES.CONTACTS],
    }),
    updateContact: builder.mutation<Contact, UpdateContactInput>({
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
    enableEmployeeAccess: builder.mutation<EmployeeAccessResponse, { id: string; body: EmployeeAccessInput }>({
      query: ({ id, body }) => ({
        url: `contacts/${id}/employee-access`,
        method: "POST",
        body,
      }),
      invalidatesTags: (result, error, { id }) => [{ type: TAG_TYPES.CONTACT, id }, TAG_TYPES.CONTACTS, TAG_TYPES.USER],
    }),
    disableEmployeeAccess: builder.mutation<EmployeeAccessResponse, string>({
      query: (id) => ({
        url: `contacts/${id}/employee-access`,
        method: "DELETE",
      }),
      invalidatesTags: (result, error, id) => [{ type: TAG_TYPES.CONTACT, id }, TAG_TYPES.CONTACTS, TAG_TYPES.USER],
    }),
  }),
});

export const {
  useCreateContactMutation,
  useUpdateContactMutation,
  useDeleteContactMutation,
  useGetContactsQuery,
  useGetContactQuery,
  useEnableEmployeeAccessMutation,
  useDisableEmployeeAccessMutation,
} = contactsApi;
