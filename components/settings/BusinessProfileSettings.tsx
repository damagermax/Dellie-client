"use client";

import { CameraOutlined } from "@ant-design/icons";
import { Avatar, Button, Form, Input, Select, Skeleton, Upload, message } from "antd";
import type { UploadChangeParam, UploadFile } from "antd/es/upload";
import { useEffect, useState } from "react";
import { useDispatch } from "react-redux";
import { LuBuilding2, LuCoins, LuLockKeyhole, LuSave, LuStore } from "react-icons/lu";
import { SiFacebook, SiInstagram, SiTiktok, SiWhatsapp } from "react-icons/si";

import { SearchableCurrenciesSelect } from "@/components/system/SearchableCurrencySelect";
import { setStoreSettings, updateCurrentStore } from "@/lib/redux/features/userSlice";
import { useGetStoreSettingsQuery, useUpdateStoreSettingsMutation } from "@/lib/redux/services/storeSettingsApi";
import type { StoreBusinessProfile } from "@/types/store-settings";

const { TextArea } = Input;

type BusinessProfileFormValues = StoreBusinessProfile;

type ProfileFieldConfig = {
  name: keyof BusinessProfileFormValues;
  label: string;
  placeholder: string;
  description: string;
  icon: React.ComponentType<{ size?: number; className?: string }>;
  tone: string;
  prefix?: string;
  optional?: boolean;
};

const BUSINESS_CATEGORY_OPTIONS = [
  "Fashion",
  "Electronics",
  "Home & Garden",
  "Beauty & Health",
  "Sports & Outdoors",
  "Toys & Hobbies",
  "Automotive",
  "Food & Grocery",
  "Pharmacy",
  "Other",
];

const SOCIAL_FIELDS: ProfileFieldConfig[] = [
  {
    name: "whatsappNumber",
    label: "WhatsApp",
    placeholder: "233201234567",
    description: "Customer chat and order follow-ups",
    icon: SiWhatsapp,
    tone: "bg-emerald-50 text-emerald-600 ring-emerald-100",
    optional: true,
  },
  {
    name: "instagramUsername",
    label: "Instagram",
    placeholder: "yourstore",
    description: "Product discovery and social proof",
    icon: SiInstagram,
    tone: "bg-pink-50 text-pink-600 ring-pink-100",
    prefix: "@",
    optional: true,
  },
  {
    name: "facebookPage",
    label: "Facebook",
    placeholder: "yourstorepage",
    description: "Page name or public handle",
    icon: SiFacebook,
    tone: "bg-blue-50 text-blue-600 ring-blue-100",
    optional: true,
  },
  {
    name: "tiktokUsername",
    label: "TikTok",
    placeholder: "yourstore",
    description: "Short-form product content handle",
    icon: SiTiktok,
    tone: "bg-gray-100 text-gray-900 ring-gray-200",
    prefix: "@",
    optional: true,
  },
];

const categoryOptions = BUSINESS_CATEGORY_OPTIONS.map((category) => ({ label: category, value: category }));

function SectionHeader({ icon: Icon, title, description, tone }: { icon: React.ComponentType<{ size?: number; className?: string }>; title: string; description: string; tone: string }) {
  return (
    <div className="flex items-start gap-3 border-b border-gray-100 bg-gray-50/70 px-4 py-4">
      <span className={`flex size-10 shrink-0 items-center justify-center rounded-lg ring-1 ${tone}`}>
        <Icon size={20} />
      </span>
      <div className="min-w-0">
        <h2 className="text-base font-semibold leading-6 text-gray-950">{title}</h2>
        <p className="mt-0.5 text-sm leading-5 text-gray-500">{description}</p>
      </div>
    </div>
  );
}

function FieldLabel({ icon: Icon, title, description, tone }: { icon: React.ComponentType<{ size?: number; className?: string }>; title: string; description: string; tone: string }) {
  return (
    <div className="mb-2 flex items-center gap-3">
      <span className={`flex size-9 shrink-0 items-center justify-center rounded-lg ring-1 ${tone}`}>
        <Icon size={18} />
      </span>
      <span className="min-w-0">
        <span className="block text-sm font-semibold text-gray-950">{title}</span>
        <span className="block text-xs leading-4 text-gray-500">{description}</span>
      </span>
    </div>
  );
}

function SocialField({ field }: { field: ProfileFieldConfig }) {
  const Icon = field.icon;

  return (
    <div className="rounded-lg border border-gray-200 bg-white px-3 py-3">
      <FieldLabel icon={Icon} title={field.label} description={field.description} tone={field.tone} />
      <Form.Item name={field.name} className="!mb-0" rules={field.optional ? [] : [{ required: true, message: `Enter ${field.label.toLowerCase()}` }]}>
        <Input addonBefore={field.prefix} placeholder={field.placeholder} className="!h-10" />
      </Form.Item>
    </div>
  );
}

function LogoUploader({
  logoUrl,
  onChange,
}: {
  logoUrl?: string;
  onChange: (file?: File) => void;
}) {
  const [previewUrl, setPreviewUrl] = useState<string | undefined>(logoUrl || undefined);

  useEffect(() => {
    setPreviewUrl(logoUrl || undefined);
  }, [logoUrl]);

  const handleChange = ({ fileList }: UploadChangeParam<UploadFile>) => {
    const file = fileList[fileList.length - 1]?.originFileObj as File | undefined;

    if (!file) {
      setPreviewUrl(logoUrl || undefined);
      onChange(undefined);
      return;
    }

    const nextUrl = URL.createObjectURL(file);
    setPreviewUrl(nextUrl);
    onChange(file);
  };

  return (
    <div className="flex items-center gap-4">
      <div className="relative shrink-0">
        <Avatar src={previewUrl} size={84} shape="square" icon={<LuStore size={28} />} className="!rounded-2xl !bg-white !text-gray-400 ring-1 ring-gray-200" />
        <div className="absolute -bottom-2 -right-2 flex size-8 items-center justify-center rounded-full bg-gray-900 text-white ring-4 ring-white">
          <CameraOutlined />
        </div>
      </div>

      <div className="min-w-0 flex-1">
        <p className="text-sm font-semibold text-gray-950">Business Logo</p>
        <p className="mt-1 text-sm leading-5 text-gray-500">Square mark used in store identity, team views, and future branded surfaces.</p>
        <Upload accept="image/*" maxCount={1} showUploadList={false} beforeUpload={() => false} onChange={handleChange}>
          <Button type="default" className="!mt-3 !h-10 !rounded-full !border-gray-300 !px-4 !font-medium">
            Upload Logo
          </Button>
        </Upload>
      </div>
    </div>
  );
}

function getErrorMessage(error: unknown, fallback: string) {
  if (typeof error === "object" && error !== null && "data" in error) {
    const data = (error as { data?: { message?: string | string[] } }).data;
    if (Array.isArray(data?.message)) {
      return data.message[0] || fallback;
    }
    if (typeof data?.message === "string" && data.message.trim()) {
      return data.message;
    }
  }

  return fallback;
}

export default function BusinessProfileSettings() {
  const dispatch = useDispatch();
  const [form] = Form.useForm<BusinessProfileFormValues>();
  const { data, isLoading, isError } = useGetStoreSettingsQuery();
  const [updateStoreSettings, { isLoading: isSaving }] = useUpdateStoreSettingsMutation();
  const [logoFile, setLogoFile] = useState<File | undefined>();

  useEffect(() => {
    if (data?.businessProfile) {
      form.setFieldsValue(data.businessProfile);
      setLogoFile(undefined);
    }
  }, [data, form]);

  const handleSubmit = async (values: BusinessProfileFormValues) => {
    try {
      const formData = new FormData();

      if (logoFile) {
        formData.append("logo", logoFile);
      }

      Object.entries(values).forEach(([key, value]) => {
        if (key === "logo") return;
        if (value !== undefined && value !== null) {
          formData.append(key, String(value));
        }
      });

      const updatedSettings = await updateStoreSettings(formData).unwrap();

      form.setFieldsValue(updatedSettings.businessProfile);
      setLogoFile(undefined);
      dispatch(setStoreSettings(updatedSettings));
      dispatch(
        updateCurrentStore({
          ...updatedSettings.businessProfile,
          settings: {
            enabledModules: updatedSettings.enabledModules,
          },
        }),
      );
      message.success("Business profile updated.");
    } catch (error) {
      message.error(getErrorMessage(error, "Business profile could not be updated."));
    }
  };

  if (isLoading) {
    return (
      <div className="space-y-4 px-4 py-4 sm:px-6">
        <Skeleton active paragraph={{ rows: 10 }} title={false} />
      </div>
    );
  }

  if (isError || !data) {
    return (
      <div className="px-4 py-6 sm:px-6">
        <div className="rounded-lg border border-red-200 px-4 py-4 text-sm text-red-600">Business profile could not be loaded right now.</div>
      </div>
    );
  }

  return (
    <Form form={form} layout="vertical" requiredMark={false} onFinish={handleSubmit} className="px-4 py-4 sm:px-6">
      <div className="space-y-4">
        <section className="overflow-hidden rounded-lg border border-gray-200 bg-white">
          <SectionHeader icon={LuBuilding2} title="Business Identity" description="The public details customers see across your store." tone="bg-blue-50 text-blue-700 ring-blue-100" />

          <div className="space-y-4 px-4 py-4">
            <div className="rounded-xl border border-gray-200 bg-gray-50/70 p-4">
              <LogoUploader logoUrl={data.businessProfile.logo} onChange={setLogoFile} />
            </div>

            <div className="rounded-xl border border-gray-200 bg-white p-4">
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                <Form.Item
                  label={
                    <div>
                      <span className="text-sm font-semibold text-gray-950">Business Name</span>
                      <p className="mt-1 text-xs leading-4 text-gray-500">Use the name customers already know.</p>
                    </div>
                  }
                  name="name"
                  rules={[{ required: true, message: "Enter business name" }]}
                  className="!mb-0"
                >
                  <Input placeholder="Dellie Store" className="!h-11" />
                </Form.Item>

                <Form.Item
                  label={
                    <div>
                      <span className="text-sm font-semibold text-gray-950">Category</span>
                      <p className="mt-1 text-xs leading-4 text-gray-500">Keeps reporting and storefront context tidy.</p>
                    </div>
                  }
                  name="category"
                  rules={[{ required: true, message: "Select a business category" }]}
                  className="!mb-0"
                >
                  <Select showSearch placeholder="Select category" options={categoryOptions} className="!h-11" optionFilterProp="label" />
                </Form.Item>

                <Form.Item
                  label={
                    <div>
                      <span className="text-sm font-semibold text-gray-950">Description</span>
                      <p className="mt-1 text-xs leading-4 text-gray-500">A concise pitch for products, services, and audience.</p>
                    </div>
                  }
                  name="description"
                  className="!col-span-1 !mb-0 sm:!col-span-2"
                >
                  <TextArea rows={4} placeholder="Tell customers what this business sells." />
                </Form.Item>
              </div>
            </div>
          </div>
        </section>

        <section className="overflow-hidden rounded-lg border border-gray-200 bg-white">
          <SectionHeader icon={LuCoins} title="Money Settings" description="Controls the default currency for future transactions." tone="bg-emerald-50 text-emerald-700 ring-emerald-100" />

          <div className="px-4 py-4">
            <Form.Item
              label="Default Currency"
              name="currencyId"
              rules={[{ required: true, message: "Select default currency" }]}
              className="!mb-0"
            >
              <SearchableCurrenciesSelect disabled={!data.canChangeCurrency || isSaving} />
            </Form.Item>

            {!data.canChangeCurrency && (
              <div className="mt-3 flex items-start gap-2 rounded-lg border border-amber-200 bg-amber-50 px-3 py-3 text-sm leading-5 text-amber-800">
                <LuLockKeyhole className="mt-0.5 shrink-0" size={16} />
                <p>Default currency is locked because this store already has transaction activity.</p>
              </div>
            )}
          </div>
        </section>

        <section className="overflow-hidden rounded-lg border border-gray-200 bg-white">
          <SectionHeader icon={SiInstagram} title="Contact & Socials" description="Add the channels customers use to reach and follow you." tone="bg-pink-50 text-pink-700 ring-pink-100" />

          <div className="grid grid-cols-1 gap-3 px-4 py-4 sm:grid-cols-2">
            {SOCIAL_FIELDS.map((field) => (
              <SocialField key={field.name} field={field} />
            ))}
          </div>
        </section>

        <Button type="primary" htmlType="submit" size="large" icon={<LuSave size={18} />} className="!h-12 !w-full !rounded-full !font-semibold" loading={isSaving}>
          Save Changes
        </Button>
      </div>
    </Form>
  );
}
