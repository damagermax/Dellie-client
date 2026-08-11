"use client";

import { ClockCircleOutlined, EditOutlined, GlobalOutlined, LockOutlined, SaveOutlined } from "@ant-design/icons";
import { Button, Card, Form, Select, Switch } from "antd";
import { useState } from "react";

import ChangePassword from "@/components/settings/userProfile/ChangePassword";
import PersonalInfo from "@/components/settings/userProfile/PersonalInfo";
import { GoBack } from "@/components/ui/GoBack";

const { Option } = Select;

export default function ProfilePage() {
  const [isEditing, setIsEditing] = useState(false);
  const [is2FAEnabled, setIs2FAEnabled] = useState(false);
  const [profileForm] = Form.useForm();

  return (
    <div className=" flex  justify-center ">
      <div className=" w-[70%]">
        <div className="flex pt-4 flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-8">
          <div className="flex gap-4 items-start">
            <GoBack />
            <div>
              <h1 className="text-2xl md:text-3xl font-bold text-gray-900">Account Settings</h1>
              <p className="text-gray-600">Manage your profile and account preferences</p>
            </div>
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
          <PersonalInfo isEditing={isEditing} profileForm={profileForm} onSaved={() => setIsEditing(false)} />

          {/* Security Section */}
          <Card title={<span className="text-lg font-semibold">Security</span>} className="border-0  rounded-xl">
            <div className="space-y-6">
              <ChangePassword />
            </div>
          </Card>
        </div>
      </div>
      {/* Header */}
    </div>
  );
}
