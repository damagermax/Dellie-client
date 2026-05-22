import { baseApi } from "./baseApi";

import { ChangePasswordInput, ForgotPasswordInput, LoginUserInput, RegisterUserInput, AuthResponse, RestPasswordInput } from "@/types/index";

export const authApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    login: builder.mutation<AuthResponse, LoginUserInput>({
      query: (body) => ({
        url: "auth/login",
        method: "POST",
        body,
      }),
    }),
    register: builder.mutation<AuthResponse, RegisterUserInput>({
      query: (body) => ({
        url: "auth/signup",
        method: "POST",
        body,
      }),
    }),
    logout: builder.mutation<void, void>({
      query: () => ({
        url: "auth/logout",
        method: "POST",
      }),
    }),
    me: builder.query<void, void>({
      query: () => ({
        url: "auth/me",
        method: "GET",
      }),
    }),

    changePassword: builder.mutation<void, ChangePasswordInput>({
      query: (body) => ({
        url: "auth/change-password",
        method: "POST",
        body,
      }),
    }),

    resetPassword: builder.mutation<void, RestPasswordInput>({
      query: (body) => ({
        url: "auth/reset-password",
        method: "POST",
        body,
      }),
    }),

    forgotPassword: builder.mutation<void, ForgotPasswordInput>({
      query: (body) => ({
        url: "auth/forgot-password",
        method: "POST",
        body,
      }),
    }),
  }),
});

export const { useLoginMutation, useRegisterMutation, useLogoutMutation, useMeQuery, useChangePasswordMutation, useForgotPasswordMutation, useResetPasswordMutation } = authApi;
