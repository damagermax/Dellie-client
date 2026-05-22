"use client";

import { DiscountsFilters } from "@/components/discounts/DiscountFilters";
import InventoryView from "@/components/inventory/inventory-view/InventoryView";
import { AppSearch } from "@/components/ui/AppSearchInput";
import { Select, ConfigProvider } from "antd";
import { useState } from "react";

export default function InventoryPage() {
  const [discountQuery, setDiscountQuery] = useState<any>({});

  const handleFilterChange = (values: Partial<any>) => {
    setDiscountQuery((prev: any) => ({ ...prev, ...values }));
  };

  const handleFilterRest = () => {
    setDiscountQuery({});
  };

  return (
    <div>
      <div className="py-8 px-8 flex justify-between w-full">
        <div className=" flex w-full justify-baseline items-center gap-2">
          <AppSearch placeholder="Search tags..." onReset={handleFilterRest} onSearchChange={handleFilterChange} menu={{ items: DiscountsFilters({ onChange: handleFilterChange, filters: discountQuery }) }} />
        </div>

        <div>
          <ConfigProvider
            theme={{
              components: {
                Select: {
                  borderRadius: 999,
                  padding: 80,
                  controlHeight: 38,
                  optionSelectedBg: "none",
                  colorTextPlaceholder: "black",
                },
              },
            }}
          >
            <Select placeholder="Shop location" size="middle" style={{ width: 200 }} />
          </ConfigProvider>
        </div>
      </div>

      <InventoryView />
    </div>
  );
}
