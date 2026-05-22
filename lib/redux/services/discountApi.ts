import { baseApi, TAG_TYPES } from "./baseApi";

import { Discount, DiscountsQueryParams, PaginatedResponse } from "../../../types";

export const discountApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    createDiscount: builder.mutation<Discount, FormData>({
      query: (body) => ({
        url: "discounts",
        method: "POST",
        formData: true,
        body,
      }),
      invalidatesTags: [TAG_TYPES.DISCOUNTS],
    }),
    updateDiscount: builder.mutation<Discount, { id: string; data: FormData }>({
      query: ({ id, data }) => ({
        url: `discounts/${id}`,
        method: "PUT",
        formData: true,
        body: data,
      }),
      invalidatesTags: (result, error, { id }) => [{ type: TAG_TYPES.DISCOUNT, id }, TAG_TYPES.DISCOUNTS],
    }),
    deleteDiscount: builder.mutation<void, string>({
      query: (id) => ({
        url: `discounts/${id}`,
        method: "DELETE",
      }),
      invalidatesTags: [TAG_TYPES.DISCOUNTS],
    }),

    getDiscounts: builder.query<PaginatedResponse<Discount>, DiscountsQueryParams>({
      query: (params) => ({
        url: "discounts",
        method: "GET",
        params,
      }),
      providesTags: [TAG_TYPES.DISCOUNTS],
    }),

    getDiscount: builder.query<Discount, string>({
      query: (id) => `discounts/${id}`,
      providesTags: (result, error, id) => {
        console.log("log", id);
        return [{ type: TAG_TYPES.DISCOUNT, id }];
      },
    }),
  }),
});

export const { useCreateDiscountMutation, useDeleteDiscountMutation, useGetDiscountQuery, useGetDiscountsQuery, useUpdateDiscountMutation } = discountApi;
