import { baseApi, TAG_TYPES } from "./baseApi";

import { CreateLocationInput, Location, UpdateLocationInput, LocationsQueryParams, Inventory, PaginatedResponse } from "../../../types";

export const inventoryApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    moveInventory: builder.mutation<void, CreateLocationInput>({
      query: (body) => ({
        url: "inventory/move",
        method: "POST",
        body,
      }),
      invalidatesTags: [TAG_TYPES.INVENTORY],
    }),
    transferInventory: builder.mutation<void, UpdateLocationInput>({
      query: (body) => ({
        url: `inventory/transfer/${body.id}`,
        method: "PUT",
        body,
      }),
      invalidatesTags: (result, error) => [TAG_TYPES.INVENTORY],
    }),

    getInventory: builder.query<PaginatedResponse<Inventory>, LocationsQueryParams>({
      query: () => "inventory",
      providesTags: [TAG_TYPES.INVENTORY],
    }),
  }),
});

export const { useGetInventoryQuery } = inventoryApi;
