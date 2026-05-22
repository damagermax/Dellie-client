"use client";

import { Card, Avatar, Button, Upload, Form } from "antd";

import { EditOutlined, UploadOutlined, UserOutlined } from "@ant-design/icons";

import { InputFormItem, TextAreaFormItem } from "@/components/ui/AppFormItems";
import { useState, useEffect } from "react";
import { useSelector } from "react-redux";
import { useUpdateUserProfileMutation } from "@/lib/redux/services/userApi";

export default function PersonalInfo({ isEditing }: { isEditing: boolean }) {
  const [profileForm] = Form.useForm();
  const [image, setImage] = useState<string | File | undefined>(undefined);

  const currentUser = useSelector((state: any) => state.currentUser);
  const [updateUserProfile, { isLoading }] = useUpdateUserProfileMutation();

  useEffect(() => {
    if (currentUser?.user) {
      profileForm.setFieldsValue({
        name: currentUser.user.name,
        email: currentUser.user.email,
        phone: currentUser.user.phone,
        bio: currentUser.user.bio,
      });
    }
  }, [currentUser]);

  const handleSubmit = async (values: any) => {
    const formData = new FormData();

    if (image) {
      formData.append("image", image as string | Blob);
    }

    for (const key in values) {
      if (values[key] !== undefined && values[key] !== null) {
        formData.append(key, values[key]);
      }
    }

    !isLoading && (await updateUserProfile(formData));
  };

  const handleChange = (values: any) => {
    setImage(values.file);
    console.log(" file:", values.file);
  };

  return (
    <Card className="border-0  rounded-xl overflow-hidden">
      {/* Header */}
      <div className="px-6 py-4 border-b border-gray-100">
        <h2 className="text-xl font-semibold text-gray-800">Personal Information</h2>
        <p className="text-gray-500 text-sm">Update your personal details and contact information</p>
      </div>

      <div className="p-6">
        <div className=" gap-8">
          <div className="w-full mb-5  flex gap-x-5  items-center">
            <div className="relative mb-4 group">
              <div className="relative">
                <Avatar src={image ? URL.createObjectURL(image as File) : currentUser?.user?.imageUrl} size={90} icon={<UserOutlined />} className="border-4 border-white  transition-all duration-300 hover:shadow-xl" />
                {isEditing && (
                  <div className="absolute inset-0 flex items-center justify-center bg-gray-50 rounded-full opacity-0 group-hover:opacity-100 transition-opacity duration-200">
                    <Upload maxCount={1} showUploadList={false} onChange={handleChange} beforeUpload={() => false}>
                      <Button type="primary" shape="circle" icon={<EditOutlined />} className="bg-white/90 hover:bg-white text-blue-600 shadow-md" size="large" />
                    </Upload>
                  </div>
                )}
              </div>
            </div>

            {isEditing ? (
              <Upload showUploadList={false} onChange={handleChange} maxCount={1} className=" " beforeUpload={() => false}>
                <Button type="default" icon={<UploadOutlined />} className="w-full border-dashed hover:border-blue-400 hover:text-blue-600">
                  Change Photo
                </Button>
              </Upload>
            ) : (
              <div className="text-center space-y-2 ">
                <h3 className="text-xl font-semibold text-gray-900">{}</h3>
                <div className="inline-flex  items-center px-3 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800">
                  <span className=" h-2 w-2 mr-2 rounded-full bg-green-500 mr"></span>
                  Active Account
                </div>
              </div>
            )}
          </div>

          <div className="flex-1">
            <Form id="profileForm" onFinish={handleSubmit} disabled={!isEditing || isLoading} size="small" form={profileForm} layout="vertical">
              <div className="grid w-full grid-cols-1 md:grid-cols-2  gap-x-5">
                <InputFormItem
                  name="name"
                  label="Full Name"
                  rules={[
                    {
                      required: true,
                      message: "Please input your name!",
                    },
                  ]}
                  className="mb-0"
                />

                <InputFormItem name="phone" label="Phone" rules={[{ message: "Please input your name!" }]} className="mb-0" />

                <div className=" col-span-2">
                  <InputFormItem
                    name="email"
                    label="Email"
                    rules={[
                      {
                        required: true,
                        message: "Please input your name!",
                      },
                    ]}
                    className="mb-0"
                  />
                </div>

                <div className=" col-span-2">
                  <TextAreaFormItem name="bio" label="About Me" placeholder="Tell us about yourself, your experience, or anything else you'd like to share..." />

                  <div className="mt-1 text-xs text-gray-400">This will be displayed on your public profile</div>
                </div>
              </div>
            </Form>
          </div>
        </div>
      </div>
    </Card>
  );
}
