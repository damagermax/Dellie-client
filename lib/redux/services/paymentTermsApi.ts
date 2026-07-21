import { baseApi, TAG_TYPES } from "./baseApi";
import { CreatePaymentTermInput, PaymentTerm, PaymentTermsQueryParams, UpdatePaymentTermInput } from "../../../types";

export const paymentTermsApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    createPaymentTerm: builder.mutation<PaymentTerm, CreatePaymentTermInput>({
      query: (body) => ({
        url: "payment-terms",
        method: "POST",
        body,
      }),
      invalidatesTags: [TAG_TYPES.PAYMENT_TERMS],
    }),
    updatePaymentTerm: builder.mutation<PaymentTerm, UpdatePaymentTermInput>({
      query: ({ id, ...body }) => ({
        url: `payment-terms/${id}`,
        method: "PUT",
        body,
      }),
      invalidatesTags: (result, error, { id }) => [{ type: TAG_TYPES.PAYMENT_TERM, id }, TAG_TYPES.PAYMENT_TERMS],
    }),
    deletePaymentTerm: builder.mutation<void, string>({
      query: (id) => ({
        url: `payment-terms/${id}`,
        method: "DELETE",
      }),
      invalidatesTags: [TAG_TYPES.PAYMENT_TERMS],
    }),
    getPaymentTerms: builder.query<PaymentTerm[], PaymentTermsQueryParams | void>({
      query: (params = {}) => ({
        url: "payment-terms",
        method: "GET",
        params,
      }),
      providesTags: [TAG_TYPES.PAYMENT_TERMS],
    }),
    getPaymentTerm: builder.query<PaymentTerm, string>({
      query: (id) => `payment-terms/${id}`,
      providesTags: (result, error, id) => [{ type: TAG_TYPES.PAYMENT_TERM, id }],
    }),
  }),
});

export const {
  useCreatePaymentTermMutation,
  useUpdatePaymentTermMutation,
  useDeletePaymentTermMutation,
  useGetPaymentTermsQuery,
  useGetPaymentTermQuery,
} = paymentTermsApi;
