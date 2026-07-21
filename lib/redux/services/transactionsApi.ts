import { baseApi, TAG_TYPES } from "./baseApi";

import { Expense, PaginatedResponse, ExpenseQueryParams, TransactionType, ApplyPaymentInput, UpdateAppliedPaymentInput, Payment, Transaction, UpdateExpenseInput } from "../../../types/index";

export const transactionsApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    createExpense: builder.mutation<void, FormData>({
      query: (body) => ({
        url: "transactions",
        method: "POST",
        body,
      }),
      invalidatesTags: [TAG_TYPES.TRANSACTIONS],
    }),

    updateExpense: builder.mutation<Transaction, UpdateExpenseInput>({
      query: ({ id, ...body }) => ({
        url: `transactions/${id}`,
        method: "PUT",
        body,
      }),
      invalidatesTags: (result, error, { id }) => [{ type: TAG_TYPES.TRANSACTION, id }, TAG_TYPES.TRANSACTIONS],
    }),

    addExpenseAttachments: builder.mutation<Transaction, { id: string; data: FormData }>({
      query: ({ id, data }) => ({
        url: `transactions/${id}/attachments`,
        method: "POST",
        formData: true,
        body: data,
      }),
      invalidatesTags: (result, error, { id }) => [{ type: TAG_TYPES.TRANSACTION, id }, TAG_TYPES.TRANSACTIONS],
    }),

    deleteExpenseAttachment: builder.mutation<Transaction, { id: string; key: string }>({
      query: ({ id, key }) => ({
        url: `transactions/${id}/attachments/${encodeURIComponent(key)}`,
        method: "DELETE",
      }),
      invalidatesTags: (result, error, { id }) => [{ type: TAG_TYPES.TRANSACTION, id }, TAG_TYPES.TRANSACTIONS],
    }),

    createTransactionAction: builder.mutation<void, ApplyPaymentInput>({
      query: ({ linkTransactionId, ...data }) => ({
        url: `transactions/${linkTransactionId}/payments`,
        method: "POST",
        body: data,
      }),
      invalidatesTags: (result, error, { linkTransactionId }) => [TAG_TYPES.TRANSACTIONS, { type: TAG_TYPES.TRANSACTION, id: linkTransactionId }],
    }),

    updateTransactionAction: builder.mutation<void, UpdateAppliedPaymentInput>({
      query: ({ id, ...data }) => ({
        url: `transactions/payments/${id}`,
        method: "PUT",
        body: data,
      }),
      invalidatesTags: (result, error, { linkTransactionId }) => [TAG_TYPES.TRANSACTIONS, { type: TAG_TYPES.TRANSACTION, id: linkTransactionId }],
    }),

    deleteTransactionAction: builder.mutation<any, string>({
      query: (id) => ({
        url: `transactions/payments/${id}`,
        method: "DELETE",
      }),
      invalidatesTags: ({ linkTransactionId }, error) => [TAG_TYPES.TRANSACTIONS, { type: TAG_TYPES.TRANSACTION, id: linkTransactionId }],
    }),

    deleteExpense: builder.mutation<void, string>({
      query: (id) => ({
        url: `transactions/${id}`,
        method: "DELETE",
      }),
      invalidatesTags: [TAG_TYPES.TRANSACTIONS],
    }),

    getExpenses: builder.query<PaginatedResponse<Expense>, ExpenseQueryParams>({
      query: (params) => ({ url: "transactions", params: { ...params, type: TransactionType.EXPENSE } }),
      providesTags: [TAG_TYPES.TRANSACTIONS],
    }),

    getTransaction: builder.query<Expense, string>({
      query: (id) => `transactions/${id}`,
      providesTags: (result, error, id) => [{ type: TAG_TYPES.TRANSACTION, id }],
    }),
  }),
});

export const {
  useCreateExpenseMutation,
  useUpdateExpenseMutation,
  useDeleteExpenseMutation,
  useGetExpensesQuery,
  useGetTransactionQuery,
  useCreateTransactionActionMutation,
  useDeleteTransactionActionMutation,
  useUpdateTransactionActionMutation,
  useAddExpenseAttachmentsMutation,
  useDeleteExpenseAttachmentMutation,
} = transactionsApi;
