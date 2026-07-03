"use client";

import { Alert, Form } from "antd";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { useRouter } from "next/navigation";
import { useEffect } from "react";

import { InputFormItem } from "../ui/AppFormItems";
import { BaseButton } from "../ui/AppButtons";
import { useResetPasswordMutation } from "@/lib/redux/services";
import AuthPageShell from "./AuthPageShell";

interface ResetPasswordValues {
  newPassword: string;
  confirmPassword: string;
}

export default function ResetPasswordForm() {
  const [resetForm] = Form.useForm();
  const router = useRouter();

  const [resetPassword, { isLoading, isSuccess }] = useResetPasswordMutation();

  const searchParams = useSearchParams();
  const token = searchParams.get("token");

  const handleSubmit = async (values: ResetPasswordValues) => {
    if (values.newPassword !== values.confirmPassword) {
      resetForm.setFields([
        {
          name: "confirmPassword",
          errors: ["The two passwords that you entered do not match!"],
        },
      ]);
      return;
    }

    await resetPassword({ token: token as string, newPassword: values.newPassword });
  };

  useEffect(() => {
    if (!isSuccess) {
      return;
    }

    router.push("/auth/signin");
  }, [isSuccess, router]);

  return (
    <AuthPageShell eyebrow="Secure your account" title="Choose a new password" description="Set a strong password for this account so you can get back to work without losing momentum.">
      {!token ? <Alert className="mb-5 rounded-2xl" type="warning" showIcon message="Reset token missing" description="Open the reset link from your email again to continue." /> : null}

      <Form size="small" disabled={isLoading || !token} form={resetForm} onFinish={handleSubmit} className="auth grid gap-x-5" layout="vertical">
        <InputFormItem type="password" label="New password" name="newPassword" placeholder="Enter your new password" rules={[{ required: true, message: "Please enter your new password." }]} />
        <InputFormItem type="password" label="Confirm new password" name="confirmPassword" placeholder="Confirm your new password" rules={[{ required: true, message: "Please confirm your new password." }]} />
      </Form>

      <div className="mt-6">
        <BaseButton onClick={() => resetForm.submit()} disabled={isLoading || !token} label={isLoading ? "Resetting..." : "Reset password"} classNames="w-full !bg-[#102d2b] !py-[1.35rem] !text-white hover:!bg-[#173d3a]" />
      </div>

      <div className="mt-6 text-center text-sm text-gray-600">
        Return to{" "}
        <Link href="/auth/signin" className="font-semibold text-[#1f5d58] transition-colors hover:text-[#102d2b]">
          sign in
        </Link>
      </div>
    </AuthPageShell>
  );
}
