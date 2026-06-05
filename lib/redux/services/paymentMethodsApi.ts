import { baseApi, TAG_TYPES } from "./baseApi";
import { CreatePaymentMethodInput, PaymentMethod, PaymentMethodsQueryParams, UpdatePaymentMethodInput } from "../../../types";

export const paymentMethodsApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    createPaymentMethod: builder.mutation<PaymentMethod, CreatePaymentMethodInput>({
      query: (body) => ({
        url: "payment-methods",
        method: "POST",
        body,
      }),
      invalidatesTags: [TAG_TYPES.PAYMENT_METHODS],
    }),
    updatePaymentMethod: builder.mutation<PaymentMethod, UpdatePaymentMethodInput>({
      query: ({ id, ...body }) => ({
        url: `payment-methods/${id}`,
        method: "PUT",
        body,
      }),
      invalidatesTags: (result, error, { id }) => [{ type: TAG_TYPES.PAYMENT_METHOD, id }, TAG_TYPES.PAYMENT_METHODS],
    }),
    deletePaymentMethod: builder.mutation<void, string>({
      query: (id) => ({
        url: `payment-methods/${id}`,
        method: "DELETE",
      }),
      invalidatesTags: [TAG_TYPES.PAYMENT_METHODS],
    }),
    getPaymentMethods: builder.query<PaymentMethod[], PaymentMethodsQueryParams | void>({
      query: (params = {}) => ({
        url: "payment-methods",
        method: "GET",
        params,
      }),
      providesTags: [TAG_TYPES.PAYMENT_METHODS],
    }),
    getPaymentMethod: builder.query<PaymentMethod, string>({
      query: (id) => `payment-methods/${id}`,
      providesTags: (result, error, id) => [{ type: TAG_TYPES.PAYMENT_METHOD, id }],
    }),
  }),
});

export const {
  useCreatePaymentMethodMutation,
  useUpdatePaymentMethodMutation,
  useDeletePaymentMethodMutation,
  useGetPaymentMethodsQuery,
  useGetPaymentMethodQuery,
} = paymentMethodsApi;
