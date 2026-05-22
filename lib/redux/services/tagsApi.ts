import { baseApi, TAG_TYPES } from "./baseApi";

import { Tag, TagCreateInput, TagUpdateInput, TagsQueryParams, PaginatedResponse } from "../../../types";

export const tagsApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    createTag: builder.mutation<void, TagCreateInput>({
      query: (body) => ({
        url: "tags",
        method: "POST",
        body,
      }),
      invalidatesTags: [TAG_TYPES.TAGS],
    }),
    updateTag: builder.mutation<void, TagUpdateInput>({
      query: ({ id, ...body }) => ({
        url: `tags/${id}`,
        method: "PUT",
        body,
      }),
      invalidatesTags: (result, error, { id }) => [{ type: TAG_TYPES.TAG, id }, TAG_TYPES.TAGS],
    }),
    deleteTag: builder.mutation<void, string>({
      query: (id) => ({
        url: `tags/${id}`,
        method: "DELETE",
      }),
      invalidatesTags: [TAG_TYPES.TAGS],
    }),

    getTags: builder.query<PaginatedResponse<Tag>, TagsQueryParams>({
      query: (params) => ({
        url: "tags",
        method: "GET",
        params,
      }),
      providesTags: [TAG_TYPES.TAGS],
    }),

    getTag: builder.query<Tag, string>({
      query: (id) => `tags/${id}`,
      providesTags: (result, error, id) => {
        console.log("log", id);
        return [{ type: TAG_TYPES.TAG, id }];
      },
    }),
  }),
});

export const { useCreateTagMutation, useUpdateTagMutation, useDeleteTagMutation, useGetTagsQuery, useGetTagQuery } = tagsApi;
