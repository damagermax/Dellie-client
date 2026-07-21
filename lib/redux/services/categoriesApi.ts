import { baseApi, TAG_TYPES } from "./baseApi";

import { CategoriesQueryParams, Category, CategoryCreateInput, CategoryUpdateInput, PaginatedResponse } from "../../../types";

type CategoryMutationBody = CategoryCreateInput | FormData;
type CategoryUpdateBody = CategoryUpdateInput | { id: string; data: FormData };

export const categoriesApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    createCategory: builder.mutation<Category, CategoryMutationBody>({
      query: (body) => ({
        url: "categories",
        method: "POST",
        formData: body instanceof FormData,
        body,
      }),
      invalidatesTags: [TAG_TYPES.CATEGORIES],
    }),

    updateCategory: builder.mutation<Category, CategoryUpdateBody>({
      query: (input) => {
        if ("data" in input) {
          return {
            url: `categories/${input.id}`,
            method: "PUT",
            formData: true,
            body: input.data,
          };
        }

        const { id, ...data } = input;
        return {
          url: `categories/${id}`,
          method: "PUT",
          body: data,
        };
      },

      invalidatesTags: (result, error, { id }) => [{ type: TAG_TYPES.CATEGORY, id }, TAG_TYPES.CATEGORIES],
    }),

    deleteCategory: builder.mutation<void, string>({
      query: (id) => ({
        url: `categories/${id}`,
        method: "DELETE",
      }),
      invalidatesTags: [TAG_TYPES.CATEGORIES],
    }),

    getCategories: builder.query<PaginatedResponse<Category>, CategoriesQueryParams>({
      query: (params) => ({ url: "categories", params }),
      providesTags: [TAG_TYPES.CATEGORIES],
    }),
    getCategory: builder.query<Category, string>({
      query: (id) => `categories/${id}`,
      providesTags: (result, error, id) => [{ type: TAG_TYPES.CATEGORY, id }],
    }),
  }),
});

export const { useCreateCategoryMutation, useUpdateCategoryMutation, useDeleteCategoryMutation, useGetCategoriesQuery, useGetCategoryQuery } = categoriesApi;
