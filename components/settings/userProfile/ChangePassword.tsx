"use client";

import { AppModal } from "@/components/ui/AppModal";
import { Form, Button } from "antd";
import { InputFormItem } from "@/components/ui/AppFormItems";
import useToggle from "@/hooks/UseToggle";
import { LockOutlined } from "@ant-design/icons";

import { useChangePasswordMutation } from "@/lib/redux/services";

function ChangePassword() {
  const [isVisible, toggleVisibility] = useToggle();

  const [form] = Form.useForm();
  const [changePassword, { isLoading, isSuccess, isError }] = useChangePasswordMutation();

  const handleSubmit = async (values: any) => {
    await changePassword(values).unwrap();
    form.resetFields();
    toggleVisibility();
  };

  return (
    <>
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 p-4 bg-gray-50 rounded-lg">
        <div className="flex items-start gap-4">
          <div className="p-2 bg-blue-100 rounded-lg">
            <LockOutlined className="text-blue-600 text-xl" />
          </div>
          <div>
            <h4 className="font-medium text-gray-900">Password</h4>
            <p className="text-sm text-gray-500">Last changed 3 months ago</p>
          </div>
        </div>
        <Button type="link" onClick={toggleVisibility} className="text-blue-600 hover:text-blue-700 p-0">
          Change Password
        </Button>
      </div>

      <AppModal title="Change Password" open={isVisible} toggle={toggleVisibility} width={500} okText="Change" onOk={() => form.submit()}>
        <Form form={form} onFinish={handleSubmit} layout="vertical" size="small" className=" w-full !px-8 !py-4" disabled={isLoading}>
          <InputFormItem label="Current Password" name="currentPassword" placeholder="Enter your current password" rules={[{ required: true, message: "Please enter your current password" }]} />
          <InputFormItem label="New Password" name="newPassword" placeholder="Enter your new password" rules={[{ required: true, message: "Please enter your new password" }]} />
        </Form>
      </AppModal>
    </>
  );
}

export default ChangePassword;
