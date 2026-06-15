"use client";

import { message, Skeleton, Switch } from "antd";
import { useEffect, useState } from "react";
import { useDispatch } from "react-redux";

import { setStoreSettings } from "@/lib/redux/features/userSlice";
import { useGetStoreSettingsQuery, useUpdateStoreSettingsMutation } from "@/lib/redux/services/storeSettingsApi";
import { DEFAULT_ENABLED_MODULES, StoreEnabledModules, StoreModuleKey } from "@/types/store-settings";

type ModuleToggle = {
  key: StoreModuleKey;
  label: string;
  description: string;
};

type ModuleGroup = {
  title: string;
  items: ModuleToggle[];
};

const MODULE_GROUPS: ModuleGroup[] = [
  {
    title: "Commerce",
    items: [
      { key: "catalog", label: "Catalog", description: "Products, inventory views, discounts, and coupons." },
      { key: "storefront", label: "Storefront", description: "Public product visibility and online store views." },
      { key: "sales", label: "Sales", description: "Sales orders, quotes, and sale workflows." },
      { key: "pos", label: "POS", description: "Point-of-sale checkout experience." },
    ],
  },
  {
    title: "Operations",
    items: [
      { key: "purchases", label: "Purchases", description: "Purchase orders, receiving, and landed costs." },
      { key: "expenses", label: "Expenses", description: "Expense tracking and expense categories." },
      { key: "contacts", label: "Contacts", description: "Customers, suppliers, and team contact records." },
    ],
  },
  {
    title: "Finance",
    items: [{ key: "cashBook", label: "Cash Book", description: "Wallets, payments, and cash movement views." }],
  },
];

const normalizeEnabledModules = (enabledModules?: Partial<StoreEnabledModules>): StoreEnabledModules => ({
  ...DEFAULT_ENABLED_MODULES,
  ...(enabledModules || {}),
});

export default function GeneralSettings() {
  const dispatch = useDispatch();
  const { data, isLoading } = useGetStoreSettingsQuery();
  const [updateStoreSettings] = useUpdateStoreSettingsMutation();
  const [enabledModules, setEnabledModules] = useState<StoreEnabledModules>(DEFAULT_ENABLED_MODULES);
  const [savingKey, setSavingKey] = useState<StoreModuleKey | null>(null);

  useEffect(() => {
    if (data?.enabledModules) {
      setEnabledModules(normalizeEnabledModules(data.enabledModules));
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
    </div>
  );
}
