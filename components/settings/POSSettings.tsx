"use client";

import { Button, Form, Select, Skeleton, Switch, message } from "antd";
import { useEffect } from "react";
import { LuMapPin, LuPlus, LuReceipt, LuSave, LuShieldCheck, LuTrash2, LuUsers, LuWalletCards } from "react-icons/lu";
import { useDispatch } from "react-redux";

import { setStoreSettings } from "@/lib/redux/features/userSlice";
import { useGetLocationsQuery, useGetTaxesQuery } from "@/lib/redux/services";
import { useGetStoreSettingsQuery, useUpdateStoreSettingsMutation } from "@/lib/redux/services/storeSettingsApi";
import { Location, LocationStatus } from "@/types/location";
import { DEFAULT_POS_SETTINGS, PosCustomerMode, PosFulfillmentDefault, PosReceiptPaperSize, PosSettings as PosSettingsType } from "@/types/store-settings";

type PosSettingsFormValues = PosSettingsType;
type TaxRuleFormValue = {
  locationId?: string;
  taxId?: string;
};

type PosSettingsFormState = PosSettingsFormValues & {
  taxRules?: TaxRuleFormValue[];
};

type ChoiceCardOption<T extends string> = {
  value: T;
  label: string;
  description: string;
};

type SettingsPanelProps = {
  icon: React.ComponentType<{ size?: number; className?: string }>;
  title: string;
  children: React.ReactNode;
};

type ToggleRowProps = {
  title: string;
  description: string;
  name: keyof PosSettingsFormValues;
};

const buildTaxRules = (locations: Location[], defaultTaxByLocationId?: Record<string, string | undefined>): TaxRuleFormValue[] => {
  const configuredRules = Object.entries(defaultTaxByLocationId || {})
    .filter(([, taxId]) => Boolean(taxId))
    .map(([locationId, taxId]) => ({
      locationId,
      taxId,
    }));

  if (configuredRules.length) {
    return configuredRules;
  }

  const defaultLocation = locations.find((location) => location.isDefault) || locations[0];
  return defaultLocation ? [{ locationId: defaultLocation.id, taxId: undefined }] : [{ locationId: undefined, taxId: undefined }];
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

function SettingsPanel({ icon: Icon, title, children }: SettingsPanelProps) {
  return (
    <section className="rounded-xl border border-gray-200">
      <div className="flex items-center gap-3 border-b border-gray-200 px-4 py-4">
        <span className="flex size-9 shrink-0 items-center justify-center rounded-full bg-gray-100 text-gray-700">
          <Icon size={21} />
        </span>
        <h2 className="text-base font-semibold text-gray-950">{title}</h2>
      </div>
      <div className="space-y-4 px-4 py-4">{children}</div>
    </section>
  );
}

function ChoiceCards<T extends string>({ value, options, onChange }: { value?: T; options: ChoiceCardOption<T>[]; onChange: (value: T) => void }) {
  return (
    <div>
      {options.map((option, index) => {
        const active = value === option.value;

        return (
          <button key={option.value} type="button" onClick={() => onChange(option.value)} className={`w-full px-4 py-4 text-left transition-all ${index !== 0 ? "border-t border-gray-200" : ""} ${active ? "bg-[#2d837d]/[0.04]" : "bg-white"}`}>
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

function ToggleRow({ title, description, name }: ToggleRowProps) {
  return (
    <div className="flex items-center justify-between gap-4 border-t border-gray-200 px-4 py-4">
      <div className="min-w-0">
        <p className="text-sm font-semibold text-gray-950">{title}</p>
        <p className="mt-1 text-sm leading-5 text-gray-500">{description}</p>
      </div>
      <Form.Item name={name} valuePropName="checked" className="!mb-0">
        <Switch />
      </Form.Item>
    </div>
  );
}

export default function POSSettings() {
  const dispatch = useDispatch();
  const [form] = Form.useForm<PosSettingsFormState>();
  const { data, isLoading, isError } = useGetStoreSettingsQuery();
  const { data: locations = [] } = useGetLocationsQuery({ status: LocationStatus.ACTIVE, parentsOnly: false });
  const { data: taxes = [] } = useGetTaxesQuery();
  const [updateStoreSettings, { isLoading: isSaving }] = useUpdateStoreSettingsMutation();
  const applyTaxByDefault = Form.useWatch("applyTaxByDefault", form);

  useEffect(() => {
    if (data?.pos) {
      form.setFieldsValue({
        ...DEFAULT_POS_SETTINGS,
        ...data.pos,
        defaultTaxByLocationId: data.pos.defaultTaxByLocationId || {},
        taxRules: buildTaxRules(locations, data.pos.defaultTaxByLocationId),
      });
    }
  }, [data, form, locations]);

  const handleSubmit = async (values: PosSettingsFormState) => {
    const { taxRules = [], ...rest } = values;
    const defaultTaxByLocationId = taxRules.reduce<Record<string, string | undefined>>((rules, rule) => {
      if (rule.locationId && rule.taxId) {
        rules[rule.locationId] = rule.taxId;
      }

      return rules;
    }, {});

    const payload: PosSettingsFormValues = {
      ...rest,
      defaultTaxByLocationId,
    };

    try {
      const updatedSettings = await updateStoreSettings({ pos: payload }).unwrap();
      dispatch(setStoreSettings(updatedSettings));
      form.setFieldsValue({
        ...updatedSettings.pos,
        taxRules: buildTaxRules(locations, updatedSettings.pos.defaultTaxByLocationId),
      });
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
    <Form form={form} layout="vertical" requiredMark={false} onFinish={handleSubmit} className="px-4 py-6 mt-5! sm:px-6">
      <div className="space-y-8">
        <SettingsPanel icon={LuUsers} title="Customer Flow">
          <Form.Item noStyle shouldUpdate>
            {() => (
              <Form.Item label="Checkout customer behavior" name="customerMode" className="!mb-0">
                <ChoiceCards value={form.getFieldValue("customerMode")} options={CUSTOMER_MODE_OPTIONS} onChange={(value) => form.setFieldValue("customerMode", value)} />
              </Form.Item>
            )}
          </Form.Item>
        </SettingsPanel>

        <SettingsPanel icon={LuShieldCheck} title="Tax Defaults">
          <ToggleRow title="Apply tax automatically" description="When enabled, POS preloads the default tax configured for the active location." name="applyTaxByDefault" />

          <div className="space-y-3">
            <div className="flex items-start gap-3">
              <span className="flex size-9 shrink-0 items-center justify-center rounded-full bg-gray-100 text-gray-600">
                <LuMapPin size={18} />
              </span>
              <div className="min-w-0">
                <p className="text-sm font-semibold text-gray-950">Location tax rules</p>
                <p className="mt-1 text-sm leading-5 text-gray-500">Each active location can use a different tax. Leave a location blank when no tax should be applied by default.</p>
              </div>
            </div>

            {locations.length ? (
              <Form.List name="taxRules">
                {(fields, { add, remove }) => (
                  <div className="space-y-3">
                    {fields.map((field, index) => (
                      <div key={field.key} className={`grid grid-cols-1 gap-3 py-3 md:grid-cols-[minmax(0,1fr)_minmax(0,1fr)_auto] ${index !== fields.length - 1 ? "border-b border-gray-200" : ""}`}>
                        <Form.Item {...field} label="Location" name={[field.name, "locationId"]} className="!mb-0" rules={[{ required: true, message: "Select location" }]}>
                          <Select
                            allowClear
                            showSearch
                            disabled={!applyTaxByDefault}
                            placeholder={applyTaxByDefault ? "Select location" : "Enable automatic tax first"}
                            className="!h-11"
                            optionFilterProp="label"
                            options={locations.map((location) => ({
                              value: location.id,
                              label: location.name,
                            }))}
                          />
                        </Form.Item>

                        <Form.Item {...field} label="Tax" name={[field.name, "taxId"]} className="!mb-0">
                          <Select
                            allowClear
                            showSearch
                            disabled={!applyTaxByDefault}
                            placeholder={applyTaxByDefault ? "Select tax" : "Enable automatic tax first"}
                            className="!h-11"
                            optionFilterProp="label"
                            options={taxes.map((tax) => ({
                              value: tax.id,
                              label: tax.description,
                            }))}
                          />
                        </Form.Item>

                        <div className="flex items-end">
                          <Button type="text" aria-label="Remove tax rule" icon={<LuTrash2 size={16} />} disabled={!applyTaxByDefault || fields.length === 1} onClick={() => remove(field.name)} className="!h-11 !px-3 !text-gray-500" />
                        </div>
                      </div>
                    ))}

                    <Button type="default" icon={<LuPlus size={16} />} disabled={!applyTaxByDefault} onClick={() => add({ locationId: undefined, taxId: undefined })} className="!h-10 !rounded-lg !border-dashed !px-4">
                      Add Rule
                    </Button>
                  </div>
                )}
              </Form.List>
            ) : (
              <div className="rounded-xl border border-dashed border-gray-300 px-4 py-6 text-center">
                <p className="text-sm font-semibold text-gray-900">No active locations found</p>
                <p className="mt-1 text-sm text-gray-500">Create or activate a location before assigning POS tax defaults.</p>
              </div>
            )}
          </div>
        </SettingsPanel>

        <SettingsPanel icon={LuWalletCards} title="Fulfillment">
          <Form.Item noStyle shouldUpdate>
            {() => (
              <Form.Item label="Default stock handling" name="fulfillmentDefault" className="!mb-0">
                <ChoiceCards value={form.getFieldValue("fulfillmentDefault")} options={FULFILLMENT_OPTIONS} onChange={(value) => form.setFieldValue("fulfillmentDefault", value)} />
              </Form.Item>
            )}
          </Form.Item>

          <ToggleRow title="Allow choice at checkout" description="Let cashiers override the default fulfillment behavior before completing a sale." name="allowFulfillmentChoiceAtCheckout" />
        </SettingsPanel>

        <SettingsPanel icon={LuReceipt} title="Receipt Experience">
          <ToggleRow title="Open receipt after checkout" description="Show the receipt modal immediately after a successful POS sale." name="receiptAutoOpen" />

          <Form.Item noStyle shouldUpdate>
            {() => (
              <Form.Item label="Receipt paper size" name="receiptPaperSize" className="!mb-0">
                <ChoiceCards value={form.getFieldValue("receiptPaperSize")} options={RECEIPT_SIZE_OPTIONS} onChange={(value) => form.setFieldValue("receiptPaperSize", value)} />
              </Form.Item>
            )}
          </Form.Item>
        </SettingsPanel>

        <div className="sticky bottom-4 z-10 bg-white pt-2">
          <Button type="primary" htmlType="submit" size="large" icon={<LuSave size={18} />} className="!h-12 !w-full !rounded-full !font-semibold" loading={isSaving}>
            Save POS Settings
          </Button>
        </div>
      </div>
    </Form>
  );
}
