"use client";

import { ClockCircleOutlined, EditOutlined, GlobalOutlined, LockOutlined, SaveOutlined } from "@ant-design/icons";
import { Button, Card, Form, Input, message, Select, Switch, Upload, UploadFile, UploadProps } from "antd";
import { useState } from "react";

import ChangePassword from "@/components/settings/userProfile/ChangePassword";
import PersonalInfo from "@/components/settings/userProfile/PersonalInfo";

const { TextArea } = Input;
const { Option } = Select;

interface UserProfile {
  name: string;
  email: string;
  phone: string;
  address: string;
  bio: string;
  avatar?: string;
}

const timezones = [
  { value: "Africa/Accra", label: "(GMT+00:00) Accra" },
  { value: "UTC", label: "(GMT+00:00) UTC" },
  { value: "America/New_York", label: "(GMT-04:00) Eastern Time" },
  { value: "Europe/London", label: "(GMT+01:00) London" },
];

const languages = [
  { value: "en", label: "English" },
  { value: "fr", label: "Français" },
  { value: "es", label: "Español" },
  { value: "pt", label: "Português" },
];

export default function ProfilePage() {
  const [isEditing, setIsEditing] = useState(false);
  const [is2FAEnabled, setIs2FAEnabled] = useState(false);
  const [fileList, setFileList] = useState<UploadFile[]>([]);
  const [profileForm] = Form.useForm();

  // Sample user data

  const uploadProps: UploadProps = {
    onRemove: () => {
      setFileList([]);
      return false;
    },
    beforeUpload: (file) => {
      const isImage = file.type.startsWith("image/");
      if (!isImage) {
        message.error("You can only upload image files!");
        return Upload.LIST_IGNORE;
      }
      setFileList([file]);
      return false;
    },
    fileList,
  };

  return (
    <div className=" w-[70%]">
      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-8">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold text-gray-900">Account Settings</h1>
          <p className="text-gray-600">Manage your profile and account preferences</p>
        </div>
        {!isEditing ? (
          <Button type="primary" icon={<EditOutlined />} onClick={() => setIsEditing(true)} className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700">
            Edit Profile
          </Button>
        ) : (
          <div className="flex gap-3 w-full md:w-auto">
            <Button
              onClick={() => {
                profileForm.resetFields();
                setIsEditing(false);
              }}
              className="flex-1 md:flex-none"
            >
              Cancel
            </Button>
            <Button type="primary" form="profileForm" htmlType="submit" icon={<SaveOutlined />} className="flex-1 md:flex-none bg-blue-600 hover:bg-blue-700">
              Save Changes
            </Button>
          </div>
        )}
      </div>

      <div className="space-y-6">
        {/* Profile Card */}
        <PersonalInfo isEditing={isEditing} />

        {/* Security Section */}
        <Card title={<span className="text-lg font-semibold">Security</span>} className="border-0  rounded-xl">
          <div className="space-y-6">
            <ChangePassword />

            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 p-4 bg-gray-50 rounded-lg">
              <div className="flex items-start gap-4">
                <div className="p-2 bg-purple-100 rounded-lg">
                  <LockOutlined className="text-purple-600 text-xl" />
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <h4 className="font-medium text-gray-900">Two-Factor Authentication</h4>
                    <Switch checked={is2FAEnabled} onChange={setIs2FAEnabled} className={is2FAEnabled ? "bg-purple-600" : "bg-gray-300"} />
                  </div>
                  <p className="text-sm text-gray-500">Add an extra layer of security to your account</p>
                </div>
              </div>
              <Button type="link" className="text-blue-600 hover:text-blue-700 p-0">
                {is2FAEnabled ? "Manage" : "Set Up"}
              </Button>
            </div>
          </div>
        </Card>

        {/* Preferences Section */}
        <div className="space-y-6  w-full">
          <Card title={<span className="text-lg font-semibold">Preferences</span>} className="border-0  rounded-xl h-full">
            <div className=" grid grid-cols-2  gap-5">
              <div className="space-y-6">
                <div>
                  <div className="flex items-center gap-3 mb-2">
                    <GlobalOutlined className="text-gray-500" />
                    <h4 className="font-medium text-gray-900">Language</h4>
                  </div>
                  <Select defaultValue="en" className="w-full" size="large" disabled={!isEditing}>
                    {languages.map((lang) => (
                      <Option key={lang.value} value={lang.value}>
                        {lang.label}
                      </Option>
                    ))}
                  </Select>
                </div>

                <div>
                  <div className="flex items-center gap-3 mb-2">
                    <ClockCircleOutlined className="text-gray-500" />
                    <h4 className="font-medium text-gray-900">Timezone</h4>
                  </div>
                  <Select defaultValue="Africa/Accra" className="w-full" size="large" disabled={!isEditing}>
                    {timezones.map((tz) => (
                      <Option key={tz.value} value={tz.value}>
                        {tz.label}
                      </Option>
                    ))}
                  </Select>
                </div>
              </div>

              <div className="pt-4 border-l pl-6 border-gray-100">
                <h4 className="font-medium text-gray-900 mb-3">Email Notifications</h4>
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-gray-700">Order updates</span>
                    <Switch defaultChecked />
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-gray-700">Promotions</span>
                    <Switch defaultChecked />
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-gray-700">Security alerts</span>
                    <Switch defaultChecked />
                  </div>
                </div>
              </div>
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
}
