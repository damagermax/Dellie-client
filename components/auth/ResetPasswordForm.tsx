"use client";

import { Form } from "antd";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { useRouter } from "next/navigation";

import { InputFormItem } from "../ui/AppFormItems";
import { BaseButton } from "../ui/AppButtons";
import { useResetPasswordMutation } from "@/lib/redux/services";

export default function ResetPasswordForm() {
  const [resetForm] = Form.useForm();
  const router = useRouter();

  const [resetPassword, { isLoading, isSuccess }] = useResetPasswordMutation();

  const searchParams = useSearchParams();
  const token = searchParams.get("token");

  const handleSubmit = async (values: any) => {
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

  if (isSuccess) {
    router.push("/auth/signin");
  }

  return (
    <div className=" w-full bg-white p-6 rounded-3xl">
      <p className=" text-center w-full pb-2 text-xl font-semibold">Reset Password</p>
      <div className=" mb-6 text-center flex items-center justify-center">
        {" "}
        <p className=" w-[70%]">Please enter a new password for your account. Make sure it’s strong and secure.</p>
      </div>
      <Form size="small" disabled={isLoading} form={resetForm} onFinish={handleSubmit} className="auth grid  gap-x-5" layout={"vertical"}>
        <InputFormItem type="password" variant="underlined" label="New Password" name="newPassword" placeholder="Enter your new password" rules={[{ required: true, message: "Please enter your new password" }]} />
        <InputFormItem type="password" variant="underlined" label="Confirm New Password" name="confirmPassword" placeholder="Confirm your new password" rules={[{ required: true, message: "Please confirm your new password" }]} />
      </Form>

      <div>
        <BaseButton onClick={() => resetForm.submit()} disabled={isLoading} label={isLoading ? "Resetting..." : " Reset Password"} classNames=" w-full !py-[1.4rem] mt-3   " />
      </div>

      <div className=" my-5 flex  justify-center items-center">
        <Link href="/auth/signin" className=" text-blue-800">
          Back To Login
        </Link>
      </div>

      <div className=" mt-5 h-[100px] w-full bg-gray-100 rounded-2xl"></div>
    </div>
  );
}
