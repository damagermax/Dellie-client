import { baseApi, TAG_TYPES } from "./baseApi";

import { PaginatedResponse, ProductQueryParams, ProductListItem } from "@/types/index";

export type UpdateProductPayload = {
  id: string;
  [key: string]: unknown;
};

type ProductApiResult = ProductListItem & {
  media?: Array<{ url?: string; key?: string; type?: string }>;
  [key: string]: unknown;
};

export const productsApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    getProducts: builder.query<PaginatedResponse<ProductListItem>, ProductQueryParams>({
      query: (params) => ({ url: "products", params }),
      providesTags: [TAG_TYPES.PRODUCTS],
    }),
    getProduct: builder.query<ProductApiResult, string>({
      query: (id) => `products/${id}`,
      providesTags: (result, error, id) => [{ type: TAG_TYPES.PRODUCT, id }],
    }),
    createProduct: builder.mutation<ProductApiResult, FormData>({
      query: (body) => ({
        url: "products",
        method: "POST",
        formData: true,
        body,
      }),
      invalidatesTags: [TAG_TYPES.PRODUCTS],
    }),
    updateProduct: builder.mutation<ProductApiResult, UpdateProductPayload>({
      query: ({ id, ...data }) => ({
        url: `products/${id}`,
        method: "PUT",
        body: data,
      }),
      invalidatesTags: (result, error, { id }) => [{ type: TAG_TYPES.PRODUCT, id }, TAG_TYPES.PRODUCTS],
    }),

    // productId is optional to allow invalidation when updating variant from product page
    updateProductVariant: builder.mutation<ProductApiResult, { id: string; data: FormData; productId?: string }>({
      query: ({ id, data }) => ({
        url: `products/variant/${id}`,
        method: "PUT",
        formData: true,
        body: data,
      }),
      invalidatesTags: (result, error, { productId: id }) => [{ type: TAG_TYPES.PRODUCT, id }, TAG_TYPES.PRODUCTS],
    }),

    deleteProduct: builder.mutation<void, string>({
      query: (id) => ({
        url: `products/${id}`,
        method: "DELETE",
      }),
      invalidatesTags: [TAG_TYPES.PRODUCTS],
    }),
    restoreProduct: builder.mutation<void, string>({
      query: (id) => ({ url: `products/${id}/restore`, method: "PATCH" }),
      invalidatesTags: (result, error, id) => [{ type: TAG_TYPES.PRODUCT, id }, TAG_TYPES.PRODUCTS],
    }),

    deleteProductMedia: builder.mutation<ProductApiResult, { id: string; key: string }>({
      query: ({ id, key }) => ({
        url: `products/${id}/media/${encodeURIComponent(key)}`,
        method: "DELETE",
      }),
      invalidatesTags: (result, error, { id }) => [{ type: TAG_TYPES.PRODUCT, id }, TAG_TYPES.PRODUCTS],
    }),

    addProductMedia: builder.mutation<ProductApiResult, { id: string; data: FormData }>({
      query: ({ id, data }) => ({
        url: `products/${id}/media`,
        method: "POST",
        formData: true,
        body: data,
      }),
      invalidatesTags: (result, error, { id }) => [{ type: TAG_TYPES.PRODUCT, id }, TAG_TYPES.PRODUCTS],
    }),
    reorderProductMedia: builder.mutation<ProductApiResult, { id: string; keys: string[] }>({
      query: ({ id, keys }) => ({
        url: `products/${id}/media/reorder`,
        method: "PATCH",
        body: { keys },
      }),
      invalidatesTags: (result, error, { id }) => [{ type: TAG_TYPES.PRODUCT, id }, TAG_TYPES.PRODUCTS],
    }),
  }),
  overrideExisting: false,
});

export const { useGetProductsQuery, useGetProductQuery, useCreateProductMutation, useUpdateProductMutation, useDeleteProductMutation, useRestoreProductMutation, useUpdateProductVariantMutation, useDeleteProductMediaMutation, useAddProductMediaMutation, useReorderProductMediaMutation } = productsApi;
