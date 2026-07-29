"use client";

import { message, Skeleton, Switch } from "antd";
import { useEffect, useState } from "react";
import { useDispatch } from "react-redux";

import { setStoreSettings } from "@/lib/redux/features/userSlice";
import { useGetStoreSettingsQuery, useUpdateStoreSettingsMutation } from "@/lib/redux/services/storeSettingsApi";
import {
  DEFAULT_ENABLED_MODULES,
  DEFAULT_FEATURE_SETTINGS,
  DEFAULT_PRICING_SETTINGS,
  StoreEnabledModules,
  StoreFeatureSettings,
  StoreModuleKey,
  StorePricingSettings,
} from "@/types/store-settings";

type ModuleToggle = {
  key: StoreModuleKey;
  label: string;
  description: string;
};

type ModuleGroup = {
  title: string;
  items: ModuleToggle[];
};

type FeatureToggle = {
  key: keyof StoreFeatureSettings;
  label: string;
  description: string;
};

type FeatureGroup = {
  title: string;
  description: string;
  items: FeatureToggle[];
};

const MODULE_GROUPS: ModuleGroup[] = [
  {
    title: "Operations",
    items: [
      { key: "storefront", label: "Storefront", description: "Public product visibility and online store views." },
      { key: "sales", label: "Manual Sales", description: "Allow creating manual sales and quotes from the sales module." },
      { key: "pos", label: "POS", description: "Point-of-sale checkout experience." },
      { key: "purchases", label: "Purchases", description: "Purchase orders, receiving, and landed costs." },
      { key: "expenses", label: "Expenses", description: "Expense tracking and expense categories." },
      { key: "contacts", label: "Contacts", description: "Customers, suppliers, and team contact records." },
    ],
  },
];

const FEATURE_GROUPS: FeatureGroup[] = [
  {
    title: "Sales",
    description: "Fulfillment and return options for customer sales.",
    items: [
      { key: "quotesEnabled", label: "Allow quotes", description: "Show quote-saving actions and quote filters for sales." },
      { key: "pickupEnabled", label: "Allow pickup", description: "Show pickup fulfillment in manual sales when enabled." },
      { key: "deliveryEnabled", label: "Allow delivery", description: "Keep delivery-based sales flows available." },
      { key: "salesReturnsEnabled", label: "Allow sales returns", description: "Enable sale return actions and return records." },
    ],
  },
  {
    title: "Purchases",
    description: "Supplier return controls.",
    items: [{ key: "purchaseReturnsEnabled", label: "Allow purchase returns", description: "Enable purchase return actions and return records." }],
  },
  {
    title: "Catalog",
    description: "Product and stock handling rules.",
    items: [
      { key: "trackQuantityEnabled", label: "Track quantity", description: "Keep stock-tracked products and inventory reporting available." },
      { key: "expiryEnabled", label: "Track expiry", description: "Show and accept expiry inputs for stock batches." },
      { key: "stockBundleEnabled", label: "Production Components", description: "Let stock-tracked products contain component products." },
      { key: "nonStockBundleEnabled", label: "Bundle Components", description: "Let non-stock products contain component products." },
    ],
  },
  {
    title: "Billing & Currency",
    description: "Currency, payment-term, refund, and write-off behavior.",
    items: [
      { key: "multiCurrencyEnabled", label: "Allow multi-currency", description: "Hide currency and exchange rate fields from sale and purchase forms when turned off." },
      { key: "paymentTermsEnabled", label: "Allow payment terms", description: "Hide payment term and due date fields from sale and purchase forms when turned off." },
      { key: "refundPaymentsEnabled", label: "Allow refund payments", description: "Enable refund payment actions for sales and purchases." },
      { key: "writeOffPaymentsEnabled", label: "Allow write-offs", description: "Enable write-off payment actions for sales, purchases, and expenses." },
    ],
  },
];

const normalizeEnabledModules = (enabledModules?: Partial<StoreEnabledModules>): StoreEnabledModules => ({
  ...DEFAULT_ENABLED_MODULES,
  ...(enabledModules?.storefront !== undefined ? { storefront: enabledModules.storefront } : {}),
  ...(enabledModules?.sales !== undefined ? { sales: enabledModules.sales } : {}),
  ...(enabledModules?.pos !== undefined ? { pos: enabledModules.pos } : {}),
  ...(enabledModules?.purchases !== undefined ? { purchases: enabledModules.purchases } : {}),
  ...(enabledModules?.expenses !== undefined ? { expenses: enabledModules.expenses } : {}),
  ...(enabledModules?.contacts !== undefined ? { contacts: enabledModules.contacts } : {}),
});

const normalizePricingSettings = (pricing?: Partial<StorePricingSettings>): StorePricingSettings => ({
  ...DEFAULT_PRICING_SETTINGS,
  ...(pricing || {}),
});

const normalizeFeatureSettings = (features?: Partial<StoreFeatureSettings>): StoreFeatureSettings => ({
  ...DEFAULT_FEATURE_SETTINGS,
  ...(features || {}),
});

export default function GeneralSettings() {
  const dispatch = useDispatch();
  const { data, isLoading } = useGetStoreSettingsQuery();
  const [updateStoreSettings] = useUpdateStoreSettingsMutation();
  const [enabledModules, setEnabledModules] = useState<StoreEnabledModules>(DEFAULT_ENABLED_MODULES);
  const [pricing, setPricing] = useState<StorePricingSettings>(DEFAULT_PRICING_SETTINGS);
  const [features, setFeatures] = useState<StoreFeatureSettings>(DEFAULT_FEATURE_SETTINGS);
  const [savingKey, setSavingKey] = useState<string | null>(null);

  useEffect(() => {
    if (data?.enabledModules) {
      setEnabledModules(normalizeEnabledModules(data.enabledModules));
    }
    if (data?.pricing) {
      setPricing(normalizePricingSettings(data.pricing));
    }
    if (data?.features) {
      setFeatures(normalizeFeatureSettings(data.features));
    }
  }, [data]);

  const handleToggle = async (key: StoreModuleKey, checked: boolean) => {
    const previousModules = enabledModules;
    const nextModules = { ...enabledModules, [key]: checked };

    setEnabledModules(nextModules);
    setSavingKey(key);

    try {
      const updatedSettings = await updateStoreSettings({ enabledModules: nextModules }).unwrap();
      const normalizedSettings = {
        ...updatedSettings,
        enabledModules: normalizeEnabledModules(updatedSettings.enabledModules),
        features: normalizeFeatureSettings(updatedSettings.features),
      };
      setEnabledModules(normalizedSettings.enabledModules);
      dispatch(setStoreSettings(normalizedSettings));
    } catch {
      setEnabledModules(previousModules);
      message.error("Setting could not be saved. Please try again.");
    } finally {
      setSavingKey(null);
    }
  };

  const handlePricingToggle = async (checked: boolean) => {
    const previousPricing = pricing;
    const nextPricing = { ...pricing, enableTradePrice: checked };

    setPricing(nextPricing);
    setSavingKey("enableTradePrice");

    try {
      const updatedSettings = await updateStoreSettings({ pricing: nextPricing }).unwrap();
      const normalizedSettings = {
        ...updatedSettings,
        enabledModules: normalizeEnabledModules(updatedSettings.enabledModules),
        pricing: normalizePricingSettings(updatedSettings.pricing),
        features: normalizeFeatureSettings(updatedSettings.features),
      };
      setEnabledModules(normalizedSettings.enabledModules);
      setPricing(normalizedSettings.pricing);
      dispatch(setStoreSettings(normalizedSettings));
    } catch {
      setPricing(previousPricing);
      message.error("Setting could not be saved. Please try again.");
    } finally {
      setSavingKey(null);
    }
  };

  const handleFeatureToggle = async (key: keyof StoreFeatureSettings, checked: boolean) => {
    const previousFeatures = features;
    const nextFeatures = { ...features, [key]: checked };

    setFeatures(nextFeatures);
    setSavingKey(key);

    try {
      const updatedSettings = await updateStoreSettings({ features: nextFeatures }).unwrap();
      const normalizedSettings = {
        ...updatedSettings,
        enabledModules: normalizeEnabledModules(updatedSettings.enabledModules),
        pricing: normalizePricingSettings(updatedSettings.pricing),
        features: normalizeFeatureSettings(updatedSettings.features),
      };
      setEnabledModules(normalizedSettings.enabledModules);
      setPricing(normalizedSettings.pricing);
      setFeatures(normalizedSettings.features);
      dispatch(setStoreSettings(normalizedSettings));
    } catch {
      setFeatures(previousFeatures);
      message.error("Setting could not be saved. Please try again.");
    } finally {
      setSavingKey(null);
    }
  };

  if (isLoading) {
    return (
      <div className="space-y-4 px-4 py-4 sm:px-6">
        <Skeleton active paragraph={{ rows: 8 }} title={false} />
      </div>
    );
  }

  return (
    <div className="space-y-5 px-4 py-4 sm:px-6">
      {MODULE_GROUPS.map((group) => (
        <section key={group.title} className="overflow-hidden rounded-lg border border-gray-200 bg-white">
          <div className="border-b border-gray-100 px-4 py-3">
            <h2 className="text-sm font-semibold uppercase tracking-wide text-gray-500">{group.title}</h2>
          </div>

          <div className="divide-y divide-gray-100">
            {group.items.map((item) => (
              <div key={item.key} className="flex items-center justify-between gap-4 px-4 py-4">
                <div className="min-w-0">
                  <p className="font-medium text-gray-900">{item.label}</p>
                  <p className="mt-1 text-sm leading-5 text-gray-500">{item.description}</p>
                </div>
                <Switch checked={enabledModules[item.key]} disabled={Boolean(savingKey)} loading={savingKey === item.key} onChange={(checked) => handleToggle(item.key, checked)} />
              </div>
            ))}
          </div>
        </section>
      ))}

      <section className="overflow-hidden rounded-lg border border-gray-200 bg-white">
        <div className="border-b border-gray-100 px-4 py-3">
          <h2 className="text-sm font-semibold uppercase tracking-wide text-gray-500">Pricing</h2>
        </div>

        <div className="divide-y divide-gray-100">
          <div className="flex items-center justify-between gap-4 px-4 py-4">
            <div className="min-w-0">
              <p className="font-medium text-gray-900">Enable Trade Price</p>
              <p className="mt-1 text-sm leading-5 text-gray-500">Show a second pricing tier for products. Turning this off hides Trade Price from product screens but keeps any saved values.</p>
            </div>
            <Switch checked={pricing.enableTradePrice} disabled={Boolean(savingKey)} loading={savingKey === "enableTradePrice"} onChange={handlePricingToggle} />
          </div>
        </div>
      </section>

      {FEATURE_GROUPS.filter((group) => {
        if (group.title === "Purchases" && !enabledModules.purchases) return false;
        return true;
      }).map((group) => (
        <section key={group.title} className="overflow-hidden rounded-lg border border-gray-200 bg-white">
          <div className="border-b border-gray-100 px-4 py-3">
            <h2 className="text-sm font-semibold uppercase tracking-wide text-gray-500">{group.title}</h2>
            <p className="mt-1 text-sm leading-5 text-gray-500">{group.description}</p>
          </div>

          <div className="divide-y divide-gray-100">
            {group.items.map((item) => (
              <div key={item.key} className="flex items-center justify-between gap-4 px-4 py-4">
                <div className="min-w-0">
                  <p className="font-medium text-gray-900">{item.label}</p>
                  <p className="mt-1 text-sm leading-5 text-gray-500">{item.description}</p>
                </div>
                <Switch checked={features[item.key]} disabled={Boolean(savingKey)} loading={savingKey === item.key} onChange={(checked) => handleFeatureToggle(item.key, checked)} />
              </div>
            ))}
          </div>
        </section>
      ))}
    </div>
  );
}
