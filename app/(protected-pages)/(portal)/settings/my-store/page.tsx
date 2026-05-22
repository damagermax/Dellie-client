"use client";

import { FacebookOutlined, InstagramOutlined, LinkedinOutlined, SaveOutlined, TikTokOutlined } from "@ant-design/icons";

import { Button, Form, Input, message, Switch } from "antd";
import React, { useState } from "react";

import { InputFormItem, SelectFormItem } from "@/components/ui/AppFormItems";

import MultiImageUploader from "@/components/ui/MultiImageUploader";
import AppSingleImagePicker from "@/components/ui/AppSingleImagePicker";

const socialPlatforms = [
  {
    key: "facebook",
    icon: <FacebookOutlined className="!text-[#1877F2]" />,
    label: "Facebook",
    placeholder: "yourpage",
    prefix: "facebook.com/",
    color: "#1877F2",
  },
  {
    key: "instagram",
    icon: <InstagramOutlined className="text-[#E1306C]" />,
    label: "Instagram",
    placeholder: "yourprofile",
    prefix: "instagram.com/",
    color: "#E1306C",
  },

  {
    key: "whatsapp",
    icon: <LinkedinOutlined className="text-[#0A66C2]" />,
    label: "What's App",
    placeholder: "company/yourcompany",
    prefix: "whatsapp.com/",
    color: "#0A66C2",
  },
  {
    key: "tiktok",
    icon: <TikTokOutlined className="text-[#000000]" />,
    label: "TikTok",
    placeholder: "yourusername",
    prefix: "tiktok.com/@",
    color: "#000000",
  },
];

const FormSection = ({ title, children }: { title: string; children: React.ReactNode }) => (
  <div className="mb-8">
    <h3 className="text-lg font-medium text-gray-800 mb-4">{title}</h3>
    <div className="bg-white p-6 rounded-lg border border-gray-200">{children}</div>
  </div>
);

const StoreSettingsPage = () => {
  const [form] = Form.useForm();
  const [loading, setLoading] = useState(false);
  const [selectedMenu, setSelectedMenu] = useState("general");

  const onFinish = async (values: any) => {
    console.log("store", values);
  };

  return (
    <div className="">
      <div className="flex justify-between items-center mb-8">
        <div>
          <h2 className="text-2xl font-semibold text-gray-900">My Store </h2>
          <p className="text-gray-500">Manage your store's general settings and preferences</p>
        </div>
        <Button type="primary" icon={<SaveOutlined />} onClick={() => form.submit()} loading={loading} className="h-10 px-6">
          Save Changes
        </Button>
      </div>

      <Form disabled={true} form={form} layout="vertical" onFinish={onFinish} className="">
        <FormSection title="Store Information">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-x-6">
            <div className=" col-span-2 mb-5 flex gap-x-5   ">
              <MultiImageUploader maxCount={1} multiple={false} label="Store Logo" description="100 x 100 px " />
              <div className=" w-[40%]">
                <p>For best results, use a high resolution, square image (1:1), 100 x 100 px min.</p>

                <p className="mt-2 mb-1">Get your own business logo.</p>
                <a href="">Create Logo</a>
              </div>
            </div>

            <InputFormItem
              name="name"
              label="Store Name"
              rules={[
                {
                  required: true,
                  message: "Please input your name!",
                },
              ]}
              className="mb-0"
            />
            <SelectFormItem
              name="category"
              label="Category"
              placeholder="Select category"
              rules={[
                {
                  required: true,
                  message: "Please select a category!",
                },
              ]}
              options={[
                { value: "fashion", label: "Fashion" },
                { value: "electronics", label: "Electronics" },
                { value: "home-garden", label: "Home & Garden" },
                { value: "beauty-health", label: "Beauty & Health" },
                { value: "sports-outdoors", label: "Sports & Outdoors" },
                { value: "toys-hobbies", label: "Toys & Hobbies" },
                { value: "automotive", label: "Automotive" },
                { value: "other", label: "Other" },
              ]}
              className="mb-0"
            />
          </div>
          <Form.Item label="Store Description" name="storeDescription" className="mt-4">
            <Input.TextArea rows={4} placeholder="Tell us about your store" />
          </Form.Item>
        </FormSection>

        <FormSection title="Connect Your Social Media">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {socialPlatforms.map((platform) => (
              <div key={platform.key} style={{ borderColor: platform.color }} className="p-4 border rounded-lg hover:shadow-md transition-shadow duration-200 bg-white">
                <div className="flex items-center gap-3 mb-4">
                  <div style={{ color: platform.color }} className="p-2 rounded-lg flex items-center justify-center bg-gray-50">
                    {React.cloneElement(platform.icon, { className: "text-xl" })}
                  </div>
                  <div>
                    <h4 className="font-medium text-gray-900">{platform.label}</h4>
                    <p className="text-xs text-gray-500">Connect your {platform.label} account</p>
                  </div>
                </div>
                <Form.Item name={["social", platform.key]} className="mb-0">
                  <Input addonBefore={platform.prefix} placeholder={platform.placeholder} className="flex-1 min-w-0 block w-full px-3 py-2 rounded-none rounded-r-md border-gray-300 focus:ring-2 focus:ring-primary-500 focus:border-primary-500" size="large" />
                </Form.Item>
              </div>
            ))}
          </div>
          <div className="mt-6 p-4 bg-blue-50 rounded-lg border border-blue-100">
            <div className="flex">
              <div className="flex-shrink-0">
                <svg className="h-5 w-5 text-blue-400" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h2a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
                </svg>
              </div>
              <div className="ml-3">
                <h3 className="text-sm font-medium text-blue-800">Social Media Integration</h3>
                <div className="mt-2 text-sm text-blue-700">
                  <p>Connect your social media accounts to share products and engage with customers.</p>
                </div>
              </div>
            </div>
          </div>
        </FormSection>

        <FormSection title="Checkout Settings">
          <div className="space-y-4">
            <div className="flex justify-between items-center p-4 bg-gray-50 rounded-lg">
              <div>
                <h4 className="font-medium text-gray-800">Guest Checkout</h4>
                <p className="text-sm text-gray-500">Allow customers to checkout without creating an account</p>
              </div>
              <Form.Item name="guestCheckout" valuePropName="checked" noStyle>
                <Switch />
              </Form.Item>
            </div>
            <div className="flex justify-between items-center p-4 bg-gray-50 rounded-lg">
              <div>
                <h4 className="font-medium text-gray-800">Require Shipping Address</h4>
                <p className="text-sm text-gray-500">Customers must provide a shipping address</p>
              </div>
              <Form.Item name="requireShipping" valuePropName="checked" noStyle>
                <Switch />
              </Form.Item>
            </div>
          </div>
        </FormSection>
      </Form>
    </div>
  );
};

export default StoreSettingsPage;
