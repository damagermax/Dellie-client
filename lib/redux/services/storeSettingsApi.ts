import { StoreSettings, UpdateStoreSettingsInput } from "@/types/store-settings";
import { baseApi, TAG_TYPES } from "./baseApi";

type StoreSettingsUpdateBody = UpdateStoreSettingsInput | FormData;

export const storeSettingsApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    getStoreSettings: builder.query<StoreSettings, void>({
      query: () => "store/settings",
      providesTags: [TAG_TYPES.STORE_SETTINGS],
    }),
    updateStoreSettings: builder.mutation<StoreSettings, StoreSettingsUpdateBody>({
      query: (body) => ({
        url: "store/settings",
        method: "PATCH",
        body,
        formData: body instanceof FormData,
      }),
      invalidatesTags: [TAG_TYPES.STORE_SETTINGS, TAG_TYPES.USER],
    }),
  }),
});

export const { useGetStoreSettingsQuery, useUpdateStoreSettingsMutation } = storeSettingsApi;
