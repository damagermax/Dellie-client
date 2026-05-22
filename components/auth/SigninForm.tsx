"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";

import { useLoginMutation } from "@/lib/redux/services";
import { LoginUserInput } from "@/types/index";
import { useDispatch } from "react-redux";
import { setAccessToken } from "@/lib/redux/features/authSlice";

import { Form } from "antd";
import { BaseButton } from "../ui/AppButtons";
import { InputFormItem } from "../ui/AppFormItems";

export default function SigninForm() {
  const [signinForm] = Form.useForm();
  const router = useRouter();

  const [login, { isLoading, isSuccess, data }] = useLoginMutation();
  const dispatch = useDispatch();

  const handleLogin = async (values: LoginUserInput) => {
    await login(values);
  };

  if (isSuccess) {
    dispatch(setAccessToken(data.accessToken));
    localStorage.setItem("accessToken", data.accessToken);
    localStorage.setItem("user", JSON.stringify(data.user));
    router.push("/dashboard");
  }

  return (
    <div className=" w-full bg-white p-6 rounded-3xl">
      <p className=" text-center w-full pb-8 text-xl font-semibold">Access your account</p>
      <Form disabled={isLoading} id="signinForm" onFinish={handleLogin} size="small" form={signinForm} className="auth grid  gap-x-5" layout={"vertical"}>
        <InputFormItem
          rules={[
            {
              required: true,
              message: "Enter your email!",
            },
          ]}
          variant="underlined"
          label="Email"
          name="email"
          placeholder="bambixx@gmail.com"
        />

        <InputFormItem
          rules={[
            {
              required: true,
              message: "Enter your password!",
            },
          ]}
          variant="underlined"
          label="Password"
          name="password"
          placeholder="Enter your password"
        />
      </Form>

      <div className=" mt-2 mb-8 flex justify-between items-center">
        <p>Remember Me</p>
        <Link href="/auth/forgot-password" className=" text-blue-800">
          Forgot Password?
        </Link>
      </div>

      <div>
        <BaseButton disabled={isLoading} form="signinForm" htmlType="submit" label={isLoading ? "Authenticating..." : "Login"} classNames=" w-full !py-[1.4rem] mt-3   " />
      </div>

      <div className=" text-center my-5">
        <Link href="/auth/signup" className=" text-center text-blue-800">
          Don't have an account? create one!
        </Link>
      </div>

      <div className=" mt-5 h-[100px] w-full bg-gray-100 rounded-2xl"></div>
    </div>
  );
}
