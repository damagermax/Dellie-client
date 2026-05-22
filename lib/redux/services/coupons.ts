import { baseApi, TAG_TYPES } from "./baseApi";

import { Coupon, CreateCouponInput, UpdateCouponInput } from "../../../types/coupon";

export const couponsApi = baseApi.injectEndpoints({
    endpoints: (builder) => ({
        createCoupon: builder.mutation<void, CreateCouponInput>({
            query: (body) => ({
                url: "coupons",
                method: "POST",
                body,
            }),
            invalidatesTags: [TAG_TYPES.COUPONS],
        }),
        updateCoupon: builder.mutation<void, UpdateCouponInput>({
            query: (body) => ({
                url: `coupons/${body.id}`,
                method: "PUT",
                body,
            }),
            invalidatesTags: (result, error, { id }) => [{ type: TAG_TYPES.COUPON, id }, TAG_TYPES.COUPONS],
        }),
        deleteCoupon: builder.mutation<void, string>({
            query: (id) => ({
                url: `coupons/${id}`,
                method: "DELETE",
            }),
            invalidatesTags: [TAG_TYPES.COUPONS],
        }),

        getCoupons: builder.query<Coupon[], void>({
            query: () => "coupons",
            providesTags: [TAG_TYPES.COUPONS],
        }),

        getCoupon: builder.query<Coupon, string>({
            query: (id) => `coupons/${id}`,
            providesTags: (result, error, id) => [{ type: TAG_TYPES.COUPON, id }],
        }),
    }),
});

export const { useCreateCouponMutation, useUpdateCouponMutation, useDeleteCouponMutation, useGetCouponsQuery, useGetCouponQuery } = couponsApi;
