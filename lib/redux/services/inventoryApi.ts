import { baseApi, TAG_TYPES } from "./baseApi";

import { CreateLocationInput, UpdateLocationInput, LocationsQueryParams, Inventory, PaginatedResponse, AdjustBatchInput, TransferBatchInput, RestockProductInput } from "../../../types";

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
      invalidatesTags: [TAG_TYPES.INVENTORY],
    }),

    getInventory: builder.query<PaginatedResponse<Inventory>, LocationsQueryParams>({
      query: () => "inventory",
      providesTags: [TAG_TYPES.INVENTORY],
    }),

    adjustBatch: builder.mutation<void, AdjustBatchInput>({
      query: ({ id, ...body }) => ({
        url: `inventory/batches/${id}/adjust`,
        method: "PATCH",
        body,
      }),
      invalidatesTags: [TAG_TYPES.INVENTORY],
    }),

    transferBatchByBatchId: builder.mutation<void, TransferBatchInput>({
      query: ({ id, ...body }) => ({
        url: `inventory/batches/${id}/transfer`,
        method: "POST",
        body,
      }),
      invalidatesTags: [TAG_TYPES.INVENTORY],
    }),

    restockProduct: builder.mutation<void, RestockProductInput>({
      query: ({ productId, ...body }) => ({
        url: `inventory/products/${productId}/restock`,
        method: "POST",
        body,
      }),
      invalidatesTags: [TAG_TYPES.INVENTORY],
    }),
  }),
});

export const { useGetInventoryQuery, useAdjustBatchMutation, useTransferBatchByBatchIdMutation, useRestockProductMutation } = inventoryApi;
