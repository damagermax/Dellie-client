"use client";

import { Form } from "antd";
import Link from "next/link";

import { InputFormItem } from "../ui/AppFormItems";
import { BaseButton } from "../ui/AppButtons";
import { useForgotPasswordMutation } from "@/lib/redux/services";
import { ForgotPasswordInput } from "@/types";

export default function ForgotPasswordForm() {
  const [signinForm] = Form.useForm();

  const [forgotPassword, { isLoading }] = useForgotPasswordMutation();

  const handleSubmit = async (values: ForgotPasswordInput) => {
    await forgotPassword(values);
  };

  return (
    <div className=" w-full bg-white p-6 rounded-3xl">
      <p className=" text-center w-full pb-2 text-xl font-semibold">Forgot Password</p>
      <div className=" mb-6 text-center flex items-center justify-center">
        <p className=" w-[70%]">Enter your 8-character username to reset an employee account password. Owner accounts can still use their email here.</p>
      </div>
      <Form size="small" disabled={isLoading} form={signinForm} onFinish={handleSubmit} className="auth grid  gap-x-5" layout={"vertical"}>
        <InputFormItem
          variant="underlined"
          label="Username or Email"
          name="username"
          placeholder="maxwell1"
          rules={[
            { required: true, message: "Please enter your username or email" },
          ]}
        />
      </Form>

      <div>
        <BaseButton onClick={() => signinForm.submit()} disabled={isLoading} label={isLoading ? "Requesting..." : "Request Reset Link"} classNames=" w-full !py-[1.4rem] mt-3   " />
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
