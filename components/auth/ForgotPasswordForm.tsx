"use client";

import { Alert, Form } from "antd";
import Link from "next/link";

import { InputFormItem } from "../ui/AppFormItems";
import { BaseButton } from "../ui/AppButtons";
import { useForgotPasswordMutation } from "@/lib/redux/services";
import { ForgotPasswordInput } from "@/types";
import AuthPageShell from "./AuthPageShell";

export default function ForgotPasswordForm() {
  const [signinForm] = Form.useForm();

  const [forgotPassword, { isLoading, isSuccess }] = useForgotPasswordMutation();

  const handleSubmit = async (values: ForgotPasswordInput) => {
    await forgotPassword(values);
  };

  return (
    <AuthPageShell eyebrow="Password help" title="Reset your access" description="Enter your username or email to recover access.">
      <Form size="small" disabled={isLoading} form={signinForm} onFinish={handleSubmit} className="auth grid gap-x-5" layout="vertical">
        <InputFormItem
          label="Username or email"
          name="username"
          placeholder="maxwell1"
          rules={[
            { required: true, message: "Please enter your username or email." },
          ]}
        />
      </Form>

      {isSuccess ? (
        <Alert
          className="mt-4 rounded-2xl"
          type="success"
          showIcon
          message="Reset instructions sent"
          description="If the account exists, the next recovery step has been sent."
        />
      ) : null}

      <div className="mt-6">
        <BaseButton onClick={() => signinForm.submit()} disabled={isLoading} label={isLoading ? "Requesting..." : "Request reset link"} classNames="w-full !bg-[#102d2b] !py-[1.35rem] !text-white hover:!bg-[#173d3a]" />
      </div>

      <div className="mt-6 text-center text-sm text-gray-600">
        Remembered your password?{" "}
        <Link href="/auth/signin" className="font-semibold text-[#1f5d58] transition-colors hover:text-[#102d2b]">
          Back to sign in
        </Link>
      </div>
    </AuthPageShell>
  );
}
