"use client";

import { Card, Avatar, Button, Upload, Form, message } from "antd";
import type { FormInstance, UploadProps } from "antd";

import { EditOutlined, UploadOutlined, UserOutlined } from "@ant-design/icons";

import { InputFormItem, PhoneInputFormItem } from "@/components/ui/AppFormItems";
import { useState, useEffect } from "react";
import { useSelector } from "react-redux";
import { useUpdateUserProfileMutation } from "@/lib/redux/services/userApi";
import type { RootState } from "@/lib/redux/store";

function normalizePhoneInputValue(phone?: string | null) {
  return (phone ?? "").replace(/[^\d]/g, "");
}

function formatPhoneForSubmit(phone?: string) {
  const digits = normalizePhoneInputValue(phone);
  return digits ? `+${digits}` : "";
}

function getErrorMessage(error: unknown, fallback: string) {
  if (typeof error === "object" && error !== null) {
    const apiError = error as { data?: { message?: string | string[] }; message?: string };
    const messageValue = apiError.data?.message ?? apiError.message;
    if (Array.isArray(messageValue)) return messageValue.join(" ");
    if (typeof messageValue === "string" && messageValue.trim()) return messageValue;
  }
  return fallback;
}

export default function PersonalInfo({ isEditing, profileForm, onSaved }: { isEditing: boolean; profileForm: FormInstance; onSaved: () => void }) {
  const currentUser = useSelector((state: RootState) => state.currentUser);
  const [updateUserProfile, { isLoading }] = useUpdateUserProfileMutation();

  useEffect(() => {
    if (currentUser?.user) {
      profileForm.setFieldsValue({
        name: currentUser.user.name,
        username: currentUser.user.username,
        email: currentUser.user.email,
        phone: normalizePhoneInputValue(currentUser.user.phone),
      });
    }
  }, [currentUser, profileForm]);

  const handleSubmit = async (values: { name: string; phone?: string }) => {
    const formData = new FormData();
    const payload = {
      ...values,
      phone: formatPhoneForSubmit(values.phone),
    };

    for (const [key, value] of Object.entries(payload)) {
      if (value !== undefined && value !== null) {
        formData.append(key, value);
      }
    }

    if (isLoading) return;

    try {
      await updateUserProfile(formData).unwrap();
      message.success("Profile updated.");
      onSaved();
    } catch (error) {
      message.error(getErrorMessage(error, "Profile could not be updated."));
    }
  };

  return (
    <div className=" rounded-xl overflow-hidden">
      {/* Header */}

      <div className="p-6">
        <div className=" gap-8">
          <div className="w-full mb-5  flex gap-x-5  ">
            <div className="relative mb-4 group">
              <div className="relative">
                <Avatar size={90} icon={<UserOutlined />} className="border-4 border-white  transition-all duration-300 hover:shadow-xl" />
              </div>
            </div>

            <div className="  ">
              <h3 className="text-lg font-semibold text-gray-900">{currentUser?.user?.name}</h3>
              <p className="text-gray-600 text-sm">
                {currentUser?.user?.email} | {currentUser?.user?.username}
              </p>
              <div className="inline-flex mt-2  items-center px-3 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800">
                <span className=" h-2  w-2 mr-2 rounded-full bg-green-500 mr"></span>
                Active Account
              </div>
            </div>
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

                <PhoneInputFormItem label="Phone" name="phone" rules={[{ required: true, message: "Please input your phone number!" }]} className="mb-0" />
              </div>
            </Form>
          </div>
        </div>
      </div>
    </div>
  );
}
