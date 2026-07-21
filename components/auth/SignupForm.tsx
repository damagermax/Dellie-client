"use client";

import { Alert, Form } from "antd";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect } from "react";
import { BaseButton } from "../ui/AppButtons";
import { InputFormItem, PhoneInputFormItem } from "../ui/AppFormItems";
import { useRegisterMutation } from "@/lib/redux/services";
import { SearchableCurrenciesSelect } from "../system/SearchableCurrencySelect";
import { useDispatch } from "react-redux";
import { setAccessToken } from "@/lib/redux/features/authSlice";
import AuthPageShell from "./AuthPageShell";
import { RegisterUserInput } from "@/types/auth";

export default function SignupForm() {
  const [signinForm] = Form.useForm();
  const router = useRouter();
  const dispatch = useDispatch();
  const [register, { isLoading, isSuccess, data, error }] = useRegisterMutation();

  const handleSubmit = async (values: RegisterUserInput) => {
    await register(values);
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
    <AuthPageShell eyebrow="Get started" title="Create your business workspace" description="Set up Dellie and start running your business clearly.">
      <Form disabled={isLoading} onFinish={handleSubmit} size="small" id="signupForm" form={signinForm} className="auth grid gap-x-5 sm:grid-cols-2" layout="vertical">
        <InputFormItem label="Full name" name="name" placeholder="Enter your full name" rules={[{ required: true, message: "Please enter your full name." }]} />
        <InputFormItem
          label="Email"
          name="email"
          placeholder="name@business.com"
          rules={[
            { required: true, message: "Please enter your email." },
            { type: "email", message: "Please enter a valid email." },
          ]}
        />
        <PhoneInputFormItem label="Phone" name="phone" placeholder="Phone" rules={[{ required: true, message: "Please enter your phone number." }]} />
        <InputFormItem label="Business name" name="storeName" placeholder="Enter your business name" rules={[{ required: true, message: "Please enter your business name." }]} />

        <Form.Item label="Currency" name="currencyId" rules={[{ required: true, message: "Please select your trading currency." }]} className="sm:col-span-2">
          <SearchableCurrenciesSelect />
        </Form.Item>

        <InputFormItem type="password" label="Password" name="password" placeholder="Create a secure password" rules={[{ required: true, message: "Please enter your password." }]} className="sm:col-span-2" />
      </Form>

      {errorMessage ? <Alert className="mt-4 rounded-2xl" type="error" showIcon message={errorMessage} /> : null}

      <div className="mt-6">
        <BaseButton htmlType="submit" form="signupForm" label={isLoading ? "Creating workspace..." : "Create account"} classNames="w-full !bg-[#102d2b] !py-[1.35rem] !text-white hover:!bg-[#173d3a]" />
      </div>

      <div className="mt-6 text-center text-sm text-gray-600">
        Already have an account?{" "}
        <Link href="/auth/signin" className="font-semibold text-[#1f5d58] transition-colors hover:text-[#102d2b]">
          Sign in
        </Link>
      </div>
    </AuthPageShell>
  );
}
