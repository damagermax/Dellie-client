import { baseApi, TAG_TYPES } from "./baseApi";

import { CreateLocationInput, Location, UpdateLocationInput, LocationsQueryParams, PaginatedResponse } from "../../../types";

export const locationsApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    createLocation: builder.mutation<void, CreateLocationInput>({
      query: (body) => ({
        url: "locations",
        method: "POST",
        body,
      }),
      invalidatesTags: [TAG_TYPES.LOCATIONS],
    }),
    updateLocation: builder.mutation<void, UpdateLocationInput>({
      query: (body) => ({
        url: `locations/${body.id}`,
        method: "PUT",
        body,
      }),
      invalidatesTags: (result, error, { id }) => [{ type: TAG_TYPES.LOCATION, id }, TAG_TYPES.LOCATIONS],
    }),
    deleteLocation: builder.mutation<void, string>({
      query: (id) => ({
        url: `locations/${id}`,
        method: "DELETE",
      }),
      invalidatesTags: [TAG_TYPES.LOCATIONS],
    }),

    getLocations: builder.query<Location[], LocationsQueryParams>({
      query: () => "locations",
      providesTags: [TAG_TYPES.LOCATIONS],
    }),

    getDefaultLocation: builder.query<Location, void>({
      query: () => "locations/default",
      providesTags: [TAG_TYPES.LOCATION],
    }),

    getLocation: builder.query<Location, string>({
      query: (id) => `locations/${id}`,
      providesTags: (result, error, id) => [{ type: TAG_TYPES.LOCATION, id }],
    }),
  }),
});

export const { useCreateLocationMutation, useUpdateLocationMutation, useGetDefaultLocationQuery, useDeleteLocationMutation, useGetLocationsQuery, useGetLocationQuery } = locationsApi;
