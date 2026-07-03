"use client";

import { Alert, Checkbox, Form } from "antd";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect } from "react";

import { useLoginMutation } from "@/lib/redux/services";
import { LoginUserInput } from "@/types/index";
import { useDispatch } from "react-redux";
import { setAccessToken } from "@/lib/redux/features/authSlice";

import AuthPageShell from "./AuthPageShell";
import { BaseButton } from "../ui/AppButtons";
import { InputFormItem } from "../ui/AppFormItems";

export default function SigninForm() {
  const [signinForm] = Form.useForm();
  const router = useRouter();

  const [login, { isLoading, isSuccess, data, error }] = useLoginMutation();
  const dispatch = useDispatch();

  const handleLogin = async (values: LoginUserInput) => {
    await login(values);
  };

  useEffect(() => {
    if (!isSuccess || !data) {
      return;
    }

    dispatch(setAccessToken(data.accessToken));
    localStorage.setItem("accessToken", data.accessToken);
    localStorage.setItem("user", JSON.stringify(data.user));
    router.push("/dashboard");
  }, [data, dispatch, isSuccess, router]);

  const errorMessage =
    error && "data" in error && typeof error.data === "object" && error.data && "message" in error.data
      ? Array.isArray(error.data.message)
        ? error.data.message[0]
        : String(error.data.message)
      : null;

  return (
    <AuthPageShell eyebrow="Welcome back" title="Access your account" description="Sign in to manage stock, sales, and payments.">
      <Form disabled={isLoading} id="signinForm" onFinish={handleLogin} size="small" form={signinForm} className="auth grid gap-x-5" layout="vertical">
        <InputFormItem
          rules={[
            {
              required: true,
              message: "Enter your username or email.",
            },
          ]}
          label="Username or email"
          name="identifier"
          placeholder="maxwell1"
        />

        <InputFormItem
          type="password"
          rules={[
            {
              required: true,
              message: "Enter your password.",
            },
          ]}
          label="Password"
          name="password"
          placeholder="Enter your password"
        />
      </Form>

      <div className="mt-2 flex items-center justify-between gap-4 text-sm text-gray-600">
        <label className="inline-flex items-center gap-2">
          <Checkbox />
          <span>Remember me</span>
        </label>
        <Link href="/auth/forgot-password" className="font-medium text-[#1f5d58] transition-colors hover:text-[#102d2b]">
          Forgot password?
        </Link>
      </div>

      <div className="mt-6">
        <BaseButton disabled={isLoading} form="signinForm" htmlType="submit" label={isLoading ? "Signing in..." : "Sign in"} classNames="w-full !bg-[#102d2b] !py-[1.35rem] !text-white hover:!bg-[#173d3a]" />
      </div>

      {errorMessage ? <Alert className="mt-4 rounded-2xl" type="error" showIcon message={errorMessage} /> : null}

      <div className="mt-6 text-center text-sm text-gray-600">
        New to Dellie?{" "}
        <Link href="/auth/signup" className="font-semibold text-[#1f5d58] transition-colors hover:text-[#102d2b]">
          Create your account
        </Link>
      </div>
    </AuthPageShell>
  );
}
