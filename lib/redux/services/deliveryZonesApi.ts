import { baseApi, TAG_TYPES } from "./baseApi";
import { CreateDeliveryZoneInput, DeliveryZone, DeliveryZonesQueryParams, UpdateDeliveryZoneInput } from "../../../types";

export const deliveryZonesApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    createDeliveryZone: builder.mutation<DeliveryZone, CreateDeliveryZoneInput>({
      query: (body) => ({
        url: "delivery-zones",
        method: "POST",
        body,
      }),
      invalidatesTags: [TAG_TYPES.DELIVERY_ZONES],
    }),
    updateDeliveryZone: builder.mutation<DeliveryZone, UpdateDeliveryZoneInput>({
      query: ({ id, ...body }) => ({
        url: `delivery-zones/${id}`,
        method: "PUT",
        body,
      }),
      invalidatesTags: (result, error, { id }) => [{ type: TAG_TYPES.DELIVERY_ZONE, id }, TAG_TYPES.DELIVERY_ZONES],
    }),
    deleteDeliveryZone: builder.mutation<void, string>({
      query: (id) => ({
        url: `delivery-zones/${id}`,
        method: "DELETE",
      }),
      invalidatesTags: [TAG_TYPES.DELIVERY_ZONES],
    }),
    getDeliveryZones: builder.query<DeliveryZone[], DeliveryZonesQueryParams | void>({
      query: (params) => {
        const queryParams: Record<string, string> = {};
        if (params) {
          if (params.search) queryParams.search = params.search;
          if (params.status) queryParams.status = params.status;
        }
        return { url: "delivery-zones", method: "GET", params: queryParams };
      },
      providesTags: [TAG_TYPES.DELIVERY_ZONES],
    }),
    getDeliveryZone: builder.query<DeliveryZone, string>({
      query: (id) => `delivery-zones/${id}`,
      providesTags: (result, error, id) => [{ type: TAG_TYPES.DELIVERY_ZONE, id }],
    }),
  }),
});

export const {
  useCreateDeliveryZoneMutation,
  useUpdateDeliveryZoneMutation,
  useDeleteDeliveryZoneMutation,
  useGetDeliveryZonesQuery,
  useGetDeliveryZoneQuery,
} = deliveryZonesApi;
