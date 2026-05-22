import { baseApi, TAG_TYPES } from "./baseApi";
import { CurrentUser } from "@/types/user";

export const userApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    getCurrentUser: builder.query<CurrentUser, void>({
      query: () => "/users/me",
      providesTags: [TAG_TYPES.USER],
    }),
    updateUserProfile: builder.mutation<void, FormData>({
      query: (data) => ({
        url: "/users/me",
        method: "PUT",
        body: data,
        formData: true,
      }),
      invalidatesTags: [TAG_TYPES.USER],
    }),
  }),
});

export const { useGetCurrentUserQuery, useUpdateUserProfileMutation } = userApi;
