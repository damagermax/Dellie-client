import { baseApi, TAG_TYPES } from "./baseApi";
import { CreatePricingGroupInput, PricingGroup, PricingGroupsQueryParams, UpdatePricingGroupInput } from "../../../types";

export const pricingGroupsApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    createPricingGroup: builder.mutation<PricingGroup, CreatePricingGroupInput>({
      query: (body) => ({
        url: "pricing-groups",
        method: "POST",
        body,
      }),
      invalidatesTags: [TAG_TYPES.PRICING_GROUPS],
    }),
    updatePricingGroup: builder.mutation<PricingGroup, UpdatePricingGroupInput>({
      query: ({ id, ...body }) => ({
        url: `pricing-groups/${id}`,
        method: "PUT",
        body,
      }),
      invalidatesTags: (result, error, { id }) => [{ type: TAG_TYPES.PRICING_GROUP, id }, TAG_TYPES.PRICING_GROUPS],
    }),
    deletePricingGroup: builder.mutation<void, string>({
      query: (id) => ({
        url: `pricing-groups/${id}`,
        method: "DELETE",
      }),
      invalidatesTags: [TAG_TYPES.PRICING_GROUPS],
    }),
    getPricingGroups: builder.query<PricingGroup[], PricingGroupsQueryParams | void>({
      query: (params = {}) => ({
        url: "pricing-groups",
        method: "GET",
        params,
      }),
      providesTags: [TAG_TYPES.PRICING_GROUPS],
    }),
    getPricingGroup: builder.query<PricingGroup, string>({
      query: (id) => `pricing-groups/${id}`,
      providesTags: (result, error, id) => [{ type: TAG_TYPES.PRICING_GROUP, id }],
    }),
  }),
});

export const {
  useCreatePricingGroupMutation,
  useUpdatePricingGroupMutation,
  useDeletePricingGroupMutation,
  useGetPricingGroupsQuery,
  useGetPricingGroupQuery,
} = pricingGroupsApi;
