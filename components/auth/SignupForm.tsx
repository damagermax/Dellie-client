"use client";

import { Form } from "antd";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { BaseButton } from "../ui/AppButtons";
import { InputFormItem, SelectFormItem } from "../ui/AppFormItems";
import { useRegisterMutation } from "@/lib/redux/services";
import { SearchableCurrenciesSelect } from "../system/SearchableCurrencySelect";

export default function SignupForm() {
  const [signinForm] = Form.useForm();
  const router = useRouter();
  const [register, { isLoading, isSuccess, data }] = useRegisterMutation();

  const handleSubmit = async (values: any) => {
    await register(values).unwrap();
  };

  if (isSuccess) {
    localStorage.setItem("accessToken", data.accessToken);
    localStorage.setItem("user", JSON.stringify(data.user));
    router.push("/dashboard");
  }

  return (
    <div className=" w-full bg-white p-6 rounded-3xl">
      <p className=" text-center w-full pb-8 text-xl font-semibold">Create an account</p>
      <Form disabled={isLoading} onFinish={handleSubmit} size="small" id="signupForm" form={signinForm} className="auth grid grid-cols-2 gap-x-5" layout={"vertical"}>
        <InputFormItem variant="underlined" label="Fullname" name="name" placeholder="Enter your fullname" rules={[{ required: true, message: "Please enter your fullname" }]} />
        <InputFormItem
          variant="underlined"
          label="Email"
          name="email"
          placeholder="bambixx@gmail.com"
          rules={[
            { required: true, message: "Please enter your email" },
            { type: "email", message: "Please enter a valid email" },
          ]}
        />
        <InputFormItem variant="underlined" label="Phone " name="phone" placeholder="054x xxx 789" rules={[{ required: true, message: "Please enter your phone number" }]} />

        <InputFormItem variant="underlined" label="Company name" name="storeName" placeholder="Enter company name" rules={[{ required: true, message: "Please enter your company name" }]} />

        <Form.Item label="Currency" name="currencyId" rules={[{ required: true, message: "Please select currency you trade in" }]}>
          <SearchableCurrenciesSelect variant="underlined" />
        </Form.Item>

        <InputFormItem variant="underlined" label="Password" name="password" placeholder="Enter your password" rules={[{ required: true, message: "Please enter your password" }]} />
      </Form>

      <div>
        <BaseButton htmlType="submit" form="signupForm" label={isLoading ? "Registering..." : "Register"} classNames=" w-full !py-[1.4rem] mt-3   " />
      </div>

      <div className=" text-center my-5">
        <Link href="/auth/signin" className=" text-center text-blue-800">
          Already have an account? Login
        </Link>
      </div>

      <div className=" mt-5 h-[100px] w-full bg-gray-100 rounded-2xl"></div>
    </div>
  );
}
