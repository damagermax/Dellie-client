import { baseApi } from "./baseApi";

import { ChangePasswordInput, ForgotPasswordInput, LoginUserInput, RegisterUserInput, AuthResponse, RestPasswordInput, CurrentUser, ResendSignupOtpInput, SignupOtpResponse, VerifySignupOtpInput } from "@/types/index";

export const authApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    login: builder.mutation<AuthResponse, LoginUserInput>({
      query: (body) => ({
        url: "auth/login",
        method: "POST",
        body,
      }),
    }),
    startSignup: builder.mutation<SignupOtpResponse, RegisterUserInput>({
      query: (body) => ({
        url: "auth/signup/start",
        method: "POST",
        body,
      }),
    }),
    resendSignupOtp: builder.mutation<SignupOtpResponse, ResendSignupOtpInput>({
      query: (body) => ({
        url: "auth/signup/resend",
        method: "POST",
        body,
      }),
    }),
    verifySignupOtp: builder.mutation<AuthResponse, VerifySignupOtpInput>({
      query: (body) => ({
        url: "auth/signup/verify",
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
    me: builder.query<CurrentUser, void>({
      query: () => ({
        url: "auth/me",
        method: "GET",
      }),
    }),
    switchStore: builder.mutation<AuthResponse, { storeId: string }>({
      query: (body) => ({
        url: "auth/switch-store",
        method: "POST",
        body,
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

export const { useLoginMutation, useStartSignupMutation, useResendSignupOtpMutation, useVerifySignupOtpMutation, useLogoutMutation, useMeQuery, useChangePasswordMutation, useForgotPasswordMutation, useResetPasswordMutation, useSwitchStoreMutation } = authApi;
