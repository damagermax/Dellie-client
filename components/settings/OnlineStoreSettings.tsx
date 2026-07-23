"use client";

import { Button, Input, Skeleton, message } from "antd";
import { useEffect, useState } from "react";
import { LuCheck, LuMapPin, LuPackage, LuPalette, LuSave, LuSearch, LuTruck, LuX } from "react-icons/lu";

import { useGetLocationsQuery } from "@/lib/redux/services";
import { useGetStoreSettingsQuery, useUpdateStoreSettingsMutation } from "@/lib/redux/services/storeSettingsApi";
import { LocationStatus } from "@/types/location";
import type { OnlineStoreTheme } from "@/types/store-settings";

type TemplateOption = {
  value: OnlineStoreTheme;
  label: string;
  description: string;
  accentClass: string;
  surfaceClass: string;
};

const TEMPLATE_OPTIONS: TemplateOption[] = [
  {
    value: "minimal",
    label: "Minimal",
    description: "Clean product-first layout.",
    accentClass: "bg-[#111827]",
    surfaceClass: "bg-[#f8fafc]",
  },
  {
    value: "modern",
    label: "Modern",
    description: "Balanced softer structure.",
    accentClass: "bg-[#567c3b]",
    surfaceClass: "bg-[#f3f7ef]",
  },
  {
    value: "bold",
    label: "Bold",
    description: "Expressive visual tone.",
    accentClass: "bg-[#ef5a36]",
    surfaceClass: "bg-[#fff1ec]",
  },
];

export default function OnlineStoreSettings() {
  const { data, isLoading, isError } = useGetStoreSettingsQuery();
  const { data: locations = [], isLoading: isLocationsLoading } = useGetLocationsQuery({ status: LocationStatus.ACTIVE, parentsOnly: false });
  const [updateStoreSettings, { isLoading: isSaving }] = useUpdateStoreSettingsMutation();

  const [theme, setTheme] = useState<OnlineStoreTheme>("modern");
  const [fulfillmentLocationIds, setFulfillmentLocationIds] = useState<string[]>([]);
  const [fulfillmentMethods, setFulfillmentMethods] = useState<string[]>([]);
  const [locationSearch, setLocationSearch] = useState("");

  useEffect(() => {
    if (!data) return;
    setTheme(data.onlineStore?.theme || "modern");
    setFulfillmentLocationIds(data.onlineStore?.fulfillmentLocationIds || []);
    setFulfillmentMethods(data.onlineStore?.fulfillmentMethods || []);
  }, [data]);

  const toggleMethod = (method: string) => {
    setFulfillmentMethods((current) => (current.includes(method) ? current.filter((m) => m !== method) : [...current, method]));
  };

  const toggleLocation = (locationId: string) => {
    setFulfillmentLocationIds((current) => (current.includes(locationId) ? current.filter((id) => id !== locationId) : [...current, locationId]));
  };

  const normalizedSearch = locationSearch.trim().toLowerCase();
  const filteredLocations = locations.filter((location) => {
    if (!normalizedSearch) return true;
    const haystack = [location.name, location.address].filter(Boolean).join(" ").toLowerCase();
    return haystack.includes(normalizedSearch);
  });

  const hasChanges = theme !== (data?.onlineStore?.theme || "modern") || JSON.stringify(fulfillmentLocationIds) !== JSON.stringify(data?.onlineStore?.fulfillmentLocationIds || []) || JSON.stringify(fulfillmentMethods) !== JSON.stringify(data?.onlineStore?.fulfillmentMethods || []);

  const handleSave = async () => {
    try {
      await updateStoreSettings({
        onlineStore: { theme, fulfillmentLocationIds, fulfillmentMethods },
      }).unwrap();
      message.success("Online store settings updated.");
    } catch {
      message.error("Online store settings could not be updated.");
    }
  };

  if (isLoading) {
    return (
      <div className="px-4 py-6 sm:px-6">
        <Skeleton active paragraph={{ rows: 10 }} />
      </div>
    );
  }

  if (isError || !data) {
    return (
      <div className="px-4 py-6 sm:px-6">
        <div className="border border-red-200 bg-white px-4 py-4 text-sm text-red-600">Online store settings could not be loaded right now.</div>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-3xl px-4 py-8 sm:px-6">
      <div className="space-y-8">
        <section>
          <div className="mb-3 flex items-center gap-2">
            <LuMapPin size={16} className="text-gray-700" />
            <h2 className="text-sm font-semibold text-gray-950">Fulfillment Locations</h2>
          </div>
          <p className="mb-4 text-sm text-gray-500">Search and select locations that will fulfill web orders.</p>

          {fulfillmentLocationIds.length > 0 && (
            <div className="mb-3 flex flex-wrap gap-2">
              {fulfillmentLocationIds.map((id) => {
                const loc = locations.find((l) => l.id === id);
                if (!loc) return null;
                return (
                  <button key={id} type="button" onClick={() => toggleLocation(id)}
                    className="inline-flex items-center gap-1.5 rounded-lg border border-gray-200 bg-gray-50 px-2.5 py-1 text-sm text-gray-700">
                    <span>{loc.name}</span>
                    <LuX size={13} />
                  </button>
                );
              })}
              <button type="button" onClick={() => setFulfillmentLocationIds([])}
                className="text-xs text-gray-400 hover:text-gray-700">
                Clear all
              </button>
            </div>
          )}

          <Input
            value={locationSearch}
            onChange={(e) => setLocationSearch(e.target.value)}
            placeholder="Search locations"
            prefix={<LuSearch size={15} className="text-gray-400" />}
            className="mb-3"
          />

          {isLocationsLoading ? (
            <Skeleton active paragraph={{ rows: 3 }} title={false} />
          ) : locations.length > 0 ? (
            <div className="rounded-xl border border-gray-200">
              {filteredLocations.length > 0 ? (
                filteredLocations.map((location, i) => {
                  const selected = fulfillmentLocationIds.includes(location.id);
                  return (
                    <button key={location.id} type="button" onClick={() => toggleLocation(location.id)}
                      className={`flex w-full items-center justify-between px-4 py-3 text-left ${i > 0 ? "border-t border-gray-100" : ""} ${selected ? "bg-gray-50" : "hover:bg-gray-50"}`}>
                      <div className="flex items-center gap-2 min-w-0">
                        <span className="text-sm font-medium text-gray-900 truncate">{location.name}</span>
                        {location.isDefault && <span className="text-[11px] text-gray-400 border border-gray-200 px-1.5">Default</span>}
                      </div>
                      <span className={`flex size-5 shrink-0 items-center justify-center border ${selected ? "bg-gray-900 border-gray-900 text-white" : "border-gray-300"}`}>
                        {selected && <LuCheck size={12} />}
                      </span>
                    </button>
                  );
                })
              ) : (
                <div className="px-4 py-6 text-sm text-gray-400">No locations match your search.</div>
              )}
            </div>
          ) : (
            <div className="rounded-xl border border-dashed border-gray-300 bg-gray-50 px-4 py-5 text-sm text-gray-400">
              No active locations yet. Add locations first, then assign storefront fulfillment.
            </div>
          )}
        </section>

        <section>
          <div className="mb-3 flex items-center gap-2">
            <LuPackage size={16} className="text-gray-700" />
            <h2 className="text-sm font-semibold text-gray-950">Fulfillment Methods</h2>
          </div>
          <p className="mb-4 text-sm text-gray-500">Choose how customers receive their online store orders.</p>

          <div className="flex gap-3">
            {[
              { value: 'delivery', title: 'Delivery', description: 'Ship orders to customer addresses.', icon: LuTruck },
              { value: 'pickup', title: 'Pickup', description: 'Customers pick up orders from your location.', icon: LuPackage },
            ].map((method) => {
              const selected = fulfillmentMethods.includes(method.value);
              return (
                <button key={method.value} type="button" onClick={() => toggleMethod(method.value)}
                  className={`flex flex-1 items-center gap-3 rounded-xl border px-4 py-4 text-left ${selected ? 'border-gray-900 bg-gray-50' : 'border-gray-200 hover:border-gray-300'}`}>
                  <span className={`flex size-9 shrink-0 items-center justify-center rounded-lg ${selected ? 'bg-gray-900 text-white' : 'bg-gray-100 text-gray-600'}`}>
                    <method.icon size={18} />
                  </span>
                  <div className="min-w-0 flex-1">
                    <span className="text-sm font-medium text-gray-900">{method.title}</span>
                    <p className="mt-0.5 text-sm text-gray-500">{method.description}</p>
                  </div>
                  <span className={`flex size-5 shrink-0 items-center justify-center border ${selected ? 'bg-gray-900 border-gray-900 text-white' : 'border-gray-300'}`}>
                    {selected && <LuCheck size={12} />}
                  </span>
                </button>
              );
            })}
          </div>
        </section>

        <section>
          <div className="mb-3 flex items-center gap-2">
            <LuPalette size={16} className="text-gray-700" />
            <h2 className="text-sm font-semibold text-gray-950">Templates</h2>
          </div>
          <p className="mb-4 text-sm text-gray-500">Choose the storefront template your customers will see.</p>

          <div className="grid grid-cols-3 gap-3">
            {TEMPLATE_OPTIONS.map((option) => {
              const active = theme === option.value;
              return (
                <button key={option.value} type="button" onClick={() => setTheme(option.value)}
                  className={`flex flex-col rounded-xl border text-left overflow-hidden ${active ? "border-gray-900" : "border-gray-200 hover:border-gray-300"}`}>
                  <div className={`aspect-[16/10] ${option.surfaceClass} flex items-center justify-center p-4`}>
                    <div className="flex h-full w-full flex-col gap-2">
                      <div className="flex items-center gap-1.5">
                        <div className={`h-2 w-12 rounded-sm ${option.accentClass}`} />
                        <div className="h-2 w-8 rounded-sm bg-black/10" />
                        <div className="ml-auto flex gap-1">
                          <div className="size-2 rounded-full bg-black/20" />
                          <div className="size-2 rounded-full bg-black/20" />
                        </div>
                      </div>
                      <div className="flex flex-1 gap-2">
                        <div className="flex-1 rounded-md bg-white/80" />
                        <div className="flex w-1/3 flex-col gap-1.5">
                          <div className={`h-3 rounded-sm ${option.accentClass}`} />
                          <div className="h-2 rounded-sm bg-black/10" />
                          <div className="mt-auto h-6 rounded-sm bg-black/5" />
                        </div>
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center justify-between px-4 py-3">
                    <div>
                      <span className="text-sm font-medium text-gray-900">{option.label}</span>
                      <p className="mt-0.5 text-sm text-gray-500">{option.description}</p>
                    </div>
                    <span className={`flex size-5 shrink-0 items-center justify-center border ${active ? "bg-gray-900 border-gray-900 text-white" : "border-gray-300"}`}>
                      {active && <LuCheck size={12} />}
                    </span>
                  </div>
                </button>
              );
            })}
          </div>
        </section>
      </div>

      <Button type="primary" size="large" loading={isSaving} disabled={!hasChanges} onClick={handleSave}
        icon={<LuSave size={18} />}
        className="mt-8 !h-12 !w-full !rounded-full !font-semibold">
        Save Changes
      </Button>
    </div>
  );
}
