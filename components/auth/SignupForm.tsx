"use client";

import { Alert, Form, Input } from "antd";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { BaseButton } from "../ui/AppButtons";
import { InputFormItem, PhoneInputFormItem } from "../ui/AppFormItems";
import { useResendSignupOtpMutation, useStartSignupMutation, useVerifySignupOtpMutation } from "@/lib/redux/services";
import { SearchableCurrenciesSelect } from "../system/SearchableCurrencySelect";
import { useDispatch } from "react-redux";
import { setAccessToken } from "@/lib/redux/features/authSlice";
import AuthPageShell from "./AuthPageShell";
import { RegisterUserInput } from "@/types/auth";

export default function SignupForm() {
  const [signinForm] = Form.useForm();
  const router = useRouter();
  const dispatch = useDispatch();
  const [otpForm] = Form.useForm();
  const [step, setStep] = useState<"details" | "otp">("details");
  const [pendingEmail, setPendingEmail] = useState("");
  const [feedback, setFeedback] = useState<string | null>(null);
  const [startSignup, startState] = useStartSignupMutation();
  const [resendSignupOtp, resendState] = useResendSignupOtpMutation();
  const [verifySignupOtp, verifyState] = useVerifySignupOtpMutation();
  const data = verifyState.data;
  const isSuccess = verifyState.isSuccess;

  const handleSubmit = async (values: RegisterUserInput) => {
    setFeedback(null);
    const response = await startSignup(values).unwrap();
    setPendingEmail(response.email);
    setStep("otp");
    setFeedback(response.message);
  };

  const handleVerifyOtp = async (values: { otp: string }) => {
    if (!pendingEmail) return;
    setFeedback(null);
    await verifySignupOtp({ email: pendingEmail, otp: values.otp }).unwrap();
  };

  const handleResendOtp = async () => {
    if (!pendingEmail) return;
    const response = await resendSignupOtp({ email: pendingEmail }).unwrap();
    setFeedback(response.message);
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

  const mutationError = verifyState.error || resendState.error || startState.error;
  const errorMessage =
    mutationError && "data" in mutationError && typeof mutationError.data === "object" && mutationError.data && "message" in mutationError.data
      ? Array.isArray(mutationError.data.message)
        ? mutationError.data.message[0]
        : String(mutationError.data.message)
      : null;

  return (
    <AuthPageShell title="Create your business workspace" description="Set up Dellie and start running your business clearly.">
      {step === "details" ? (
        <Form disabled={startState.isLoading} onFinish={handleSubmit} size="small" id="signupForm" form={signinForm} className="auth grid gap-x-5 sm:grid-cols-2" layout="vertical">
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
      ) : (
        <Form disabled={verifyState.isLoading} onFinish={handleVerifyOtp} size="small" id="signupOtpForm" form={otpForm} className="auth grid gap-x-5 sm:grid-cols-2" layout="vertical">
          <Form.Item className="sm:col-span-2" label="Verification code" name="otp" rules={[{ required: true, message: "Please enter the verification code." }]}>
            <Input placeholder="Enter the 6-digit code" maxLength={6} />
          </Form.Item>
          <div className="sm:col-span-2 text-sm text-gray-600">
            We sent a verification code to <span className="font-medium text-gray-900">{pendingEmail}</span>.
          </div>
        </Form>
      )}

      {errorMessage ? <Alert className="mt-4 rounded-2xl" type="error" showIcon message={errorMessage} /> : null}
      {!errorMessage && feedback ? <Alert className="mt-4 rounded-2xl" type="success" showIcon message={feedback} /> : null}

      <div className="mt-6">
        {step === "details" ? (
          <BaseButton htmlType="submit" form="signupForm" label={startState.isLoading ? "Sending code..." : "Create account"} classNames="w-full !bg-black !py-[1.35rem] !text-white hover:!bg-[#1a1a1a]" />
        ) : (
          <div className="space-y-3">
            <BaseButton htmlType="submit" form="signupOtpForm" label={verifyState.isLoading ? "Verifying..." : "Verify email and continue"} classNames="w-full !bg-black !py-[1.35rem] !text-white hover:!bg-[#1a1a1a]" />
            <div className="flex items-center justify-between gap-3">
              <button
                type="button"
                className="text-sm font-medium text-gray-700 transition-colors hover:text-black"
                onClick={() => {
                  setStep("details");
                  setFeedback(null);
                }}
              >
                Edit email
              </button>
              <button type="button" className="text-sm font-medium text-gray-700 transition-colors hover:text-black disabled:hover:text-gray-700" disabled={resendState.isLoading} onClick={handleResendOtp}>
                {resendState.isLoading ? "Resending..." : "Resend code"}
              </button>
            </div>
          </div>
        )}
      </div>

      <div className="mt-6 text-center text-sm text-gray-600">
        Already have an account?{" "}
        <Link href="/auth/signin" className="font-semibold text-gray-700 transition-colors hover:text-black">
          Sign in
        </Link>
      </div>
    </AuthPageShell>
  );
}
