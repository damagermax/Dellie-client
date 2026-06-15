"use client";

import { Button, Form, Input, Select, Skeleton, Switch, message } from "antd";
import { useEffect } from "react";
import { LuMapPin, LuReceipt, LuSave, LuShieldCheck, LuUsers } from "react-icons/lu";
import { useDispatch } from "react-redux";

import { setStoreSettings } from "@/lib/redux/features/userSlice";
import { useGetLocationsQuery, useGetTaxesQuery } from "@/lib/redux/services";
import { useGetStoreSettingsQuery, useUpdateStoreSettingsMutation } from "@/lib/redux/services/storeSettingsApi";
import { DEFAULT_POS_SETTINGS, PosCustomerMode, PosFulfillmentDefault, PosReceiptPaperSize, PosSettings as PosSettingsType } from "@/types/store-settings";

type PosSettingsFormValues = PosSettingsType;

type ChoiceCardOption<T extends string> = {
  value: T;
  label: string;
  description: string;
};

const CUSTOMER_MODE_OPTIONS: ChoiceCardOption<PosCustomerMode>[] = [
  { value: "walk_in_default", label: "Walk-in default", description: "Checkout works immediately unless the cashier adds a customer." },
  { value: "prompt_before_checkout", label: "Prompt before checkout", description: "Ask the cashier to confirm walk-in or choose a customer before finishing." },
  { value: "require_customer", label: "Require customer", description: "Block checkout until a customer is selected." },
];

const FULFILLMENT_OPTIONS: ChoiceCardOption<PosFulfillmentDefault>[] = [
  { value: "fulfill_now", label: "Fulfill now", description: "Reduce stock immediately when the sale is completed." },
  { value: "pending", label: "Leave pending", description: "Create the sale first and fulfill it later from the sales flow." },
];

const RECEIPT_SIZE_OPTIONS: ChoiceCardOption<PosReceiptPaperSize>[] = [
  { value: "compact", label: "Compact receipt", description: "Narrow receipt layout for quick counter printing and sharing." },
  { value: "full_page", label: "Full page", description: "Larger document layout with more whitespace." },
];

function SectionHeader({ icon: Icon, title, description, tone }: { icon: React.ComponentType<{ size?: number; className?: string }>; title: string; description: string; tone: string }) {
  return (
    <div className="border-b border-gray-100 px-4 py-4">
      <div className="flex items-start gap-3">
        <span className={`flex size-10 shrink-0 items-center justify-center rounded-xl ${tone}`}>
          <Icon size={20} />
        </span>
        <div className="min-w-0">
          <h2 className="text-base font-semibold text-gray-950">{title}</h2>
          <p className="mt-1 text-sm leading-5 text-gray-500">{description}</p>
        </div>
      </div>
    </div>
  );
}

function ChoiceCards<T extends string>({ value, options, onChange }: { value?: T; options: ChoiceCardOption<T>[]; onChange: (value: T) => void }) {
  return (
    <div className="grid grid-cols-1 gap-3">
      {options.map((option) => {
        const active = value === option.value;

        return (
          <button
            key={option.value}
            type="button"
            onClick={() => onChange(option.value)}
            className={`rounded-2xl border px-4 py-4 text-left transition-all ${
              active ? "border-[#2d837d] bg-[#2d837d]/5" : "border-gray-200 bg-white active:bg-gray-50"
            }`}
          >
            <div className="flex items-start justify-between gap-3">
              <div className="min-w-0">
                <p className={`text-sm font-semibold ${active ? "text-[#1f5d59]" : "text-gray-900"}`}>{option.label}</p>
                <p className="mt-1 text-sm leading-5 text-gray-500">{option.description}</p>
              </div>
              <span className={`mt-1 size-4 rounded-full border ${active ? "border-[#2d837d] bg-[#2d837d]" : "border-gray-300 bg-white"}`} />
            </div>
          </button>
        );
      })}
    </div>
  );
}

export default function POSSettings() {
  const dispatch = useDispatch();
  const [form] = Form.useForm<PosSettingsFormValues>();
  const { data, isLoading, isError } = useGetStoreSettingsQuery();
  const { data: locations = [] } = useGetLocationsQuery({});
  const { data: taxes = [] } = useGetTaxesQuery();
  const [updateStoreSettings, { isLoading: isSaving }] = useUpdateStoreSettingsMutation();

  useEffect(() => {
    if (data?.pos) {
      form.setFieldsValue({ ...DEFAULT_POS_SETTINGS, ...data.pos });
    }
  }, [data, form]);

  const handleSubmit = async (values: PosSettingsFormValues) => {
    try {
      const updatedSettings = await updateStoreSettings({ pos: values }).unwrap();
      dispatch(setStoreSettings(updatedSettings));
      form.setFieldsValue(updatedSettings.pos);
      message.success("POS settings updated.");
    } catch {
      message.error("POS settings could not be updated.");
    }
  };

  if (isLoading) {
    return (
      <div className="space-y-4 px-4 py-4 sm:px-6">
        <Skeleton active paragraph={{ rows: 12 }} title={false} />
      </div>
    );
  }

  if (isError || !data) {
    return (
      <div className="px-4 py-6 sm:px-6">
        <div className="rounded-lg border border-red-200 px-4 py-4 text-sm text-red-600">POS settings could not be loaded right now.</div>
      </div>
    );
  }

  return (
    <Form form={form} layout="vertical" requiredMark={false} onFinish={handleSubmit} className="px-4 py-4 sm:px-6">
      <div className="space-y-4">
        <section className="overflow-hidden rounded-lg border border-gray-200 bg-white">
          <SectionHeader icon={LuMapPin} title="Counter Profile" description="Choose how POS starts at the counter and how customer selection behaves." tone="bg-sky-50 text-sky-700" />

          <div className="space-y-4 px-4 py-4">
            <Form.Item label="Counter Name" name="counterName" className="!mb-0">
              <Input placeholder="Main Counter" className="!h-11" maxLength={120} />
            </Form.Item>

            <Form.Item label="Default Location" name="defaultLocationId" className="!mb-0">
              <Select
                allowClear
                showSearch
                placeholder="Choose POS location"
                className="!h-11"
                optionFilterProp="label"
                options={locations.map((location) => ({
                  value: location.id,
                  label: location.name,
                }))}
              />
            </Form.Item>

            <Form.Item noStyle shouldUpdate>
              {() => (
                <Form.Item label="Customer Flow" name="customerMode" className="!mb-0">
                  <ChoiceCards value={form.getFieldValue("customerMode")} options={CUSTOMER_MODE_OPTIONS} onChange={(value) => form.setFieldValue("customerMode", value)} />
                </Form.Item>
              )}
            </Form.Item>
          </div>
        </section>

        <section className="overflow-hidden rounded-lg border border-gray-200 bg-white">
          <SectionHeader icon={LuShieldCheck} title="Tax" description="Set the POS tax default and whether it should start active automatically." tone="bg-emerald-50 text-emerald-700" />

          <div className="space-y-4 px-4 py-4">
            <div className="flex items-center justify-between gap-4 rounded-2xl border border-gray-200 px-4 py-4">
              <div className="min-w-0">
                <p className="text-sm font-semibold text-gray-950">Apply Tax By Default</p>
                <p className="mt-1 text-sm leading-5 text-gray-500">Turn this on to preload the selected tax whenever POS opens.</p>
              </div>
              <Form.Item name="applyTaxByDefault" valuePropName="checked" className="!mb-0">
                <Switch />
              </Form.Item>
            </div>

            <Form.Item label="Default Tax" name="defaultTaxId" className="!mb-0">
              <Select
                allowClear
                showSearch
                placeholder="Choose default tax"
                className="!h-11"
                optionFilterProp="label"
                options={taxes.map((tax) => ({
                  value: tax.id,
                  label: tax.description,
                }))}
              />
            </Form.Item>
          </div>
        </section>

        <section className="overflow-hidden rounded-lg border border-gray-200 bg-white">
          <SectionHeader icon={LuUsers} title="Fulfillment" description="Control whether POS sales reduce stock immediately or stay pending for later processing." tone="bg-amber-50 text-amber-700" />

          <div className="space-y-4 px-4 py-4">
            <Form.Item noStyle shouldUpdate>
              {() => (
                <Form.Item label="Default Fulfillment" name="fulfillmentDefault" className="!mb-0">
                  <ChoiceCards value={form.getFieldValue("fulfillmentDefault")} options={FULFILLMENT_OPTIONS} onChange={(value) => form.setFieldValue("fulfillmentDefault", value)} />
                </Form.Item>
              )}
            </Form.Item>

            <div className="flex items-center justify-between gap-4 rounded-2xl border border-gray-200 px-4 py-4">
              <div className="min-w-0">
                <p className="text-sm font-semibold text-gray-950">Allow Choice At Checkout</p>
                <p className="mt-1 text-sm leading-5 text-gray-500">Let the cashier choose between Fulfill now and Leave pending at checkout.</p>
              </div>
              <Form.Item name="allowFulfillmentChoiceAtCheckout" valuePropName="checked" className="!mb-0">
                <Switch />
              </Form.Item>
            </div>
          </div>
        </section>

        <section className="overflow-hidden rounded-lg border border-gray-200 bg-white">
          <SectionHeader icon={LuReceipt} title="Receipt" description="Decide whether the receipt opens automatically and which print layout POS uses." tone="bg-violet-50 text-violet-700" />

          <div className="space-y-4 px-4 py-4">
            <div className="flex items-center justify-between gap-4 rounded-2xl border border-gray-200 px-4 py-4">
              <div className="min-w-0">
                <p className="text-sm font-semibold text-gray-950">Open Receipt Automatically</p>
                <p className="mt-1 text-sm leading-5 text-gray-500">Show the receipt modal immediately after a successful sale.</p>
              </div>
              <Form.Item name="receiptAutoOpen" valuePropName="checked" className="!mb-0">
                <Switch />
              </Form.Item>
            </div>

            <Form.Item noStyle shouldUpdate>
              {() => (
                <Form.Item label="Paper Size" name="receiptPaperSize" className="!mb-0">
                  <ChoiceCards value={form.getFieldValue("receiptPaperSize")} options={RECEIPT_SIZE_OPTIONS} onChange={(value) => form.setFieldValue("receiptPaperSize", value)} />
                </Form.Item>
              )}
            </Form.Item>
          </div>
        </section>

        <Button type="primary" htmlType="submit" size="large" icon={<LuSave size={18} />} className="!h-12 !w-full !rounded-full !font-semibold" loading={isSaving}>
          Save Changes
        </Button>
      </div>
    </Form>
  );
}
