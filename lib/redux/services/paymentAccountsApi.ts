import { baseApi, TAG_TYPES } from "./baseApi";

import { PaginatedResponse, CreatePaymentAccountInput, UpdatePaymentAccountInput, PaymentAccountQueryParams, PaymentAccount } from "../../../types";

export const PaymentAccountsApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    createPaymentAccount: builder.mutation<void, CreatePaymentAccountInput>({
      query: (body) => ({
        url: "payment-accounts",
        method: "POST",
        body,
      }),
      invalidatesTags: [TAG_TYPES.PAYMENT_ACCOUNTS],
    }),
    updatePaymentAccount: builder.mutation<void, UpdatePaymentAccountInput>({
      query: (body) => ({
        url: `payment-accounts/${body.id}`,
        method: "PUT",
        body,
      }),
      invalidatesTags: (result, error, { id }) => [{ type: TAG_TYPES.PAYMENT_ACCOUNT, id }, TAG_TYPES.PAYMENT_ACCOUNTS],
    }),

    deletePaymentAccount: builder.mutation<void, string>({
      query: (id) => ({
        url: `payment-accounts/${id}`,
        method: "DELETE",
      }),
      invalidatesTags: [TAG_TYPES.PAYMENT_ACCOUNTS],
    }),

    getPaymentAccounts: builder.query<PaginatedResponse<PaymentAccount>, PaymentAccountQueryParams>({
      query: () => "payment-accounts",
      providesTags: [TAG_TYPES.PAYMENT_ACCOUNTS],
    }),

    getLocation: builder.query<Location, string>({
      query: (id) => `gl-accounts/${id}`,
      providesTags: (result, error, id) => [{ type: TAG_TYPES.PAYMENT_ACCOUNT, id }],
    }),
  }),
});

export const { useCreatePaymentAccountMutation, useUpdatePaymentAccountMutation, useDeletePaymentAccountMutation, useGetPaymentAccountsQuery } = PaymentAccountsApi;
