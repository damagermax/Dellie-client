"use client";

import { DiscountsFilters } from "@/components/discounts/DiscountFilters";
import { PurchaseOrderFormModal } from "@/components/purchase-orders/PurchaseOrderFormModal";
import SettingsDrawer from "@/components/settings/SettingsDrawer";
import { AddButton } from "@/components/ui/AppButtons";
import { AppSearch } from "@/components/ui/AppSearchInput";
import useToggle from "@/hooks/UseToggle";
import { useState } from "react";

export default function PurchaseOrdersPage() {
  const [openDiscountForm, toggleDiscountForm] = useToggle();

  const [discountQuery, setDiscountQuery] = useState<any>({});

  const handleFilterChange = (values: Partial<any>) => {
    setDiscountQuery((prev: any) => ({ ...prev, ...values }));
  };

  const handleFilterRest = () => {
    setDiscountQuery({});
  };

  return (
    <div>
      <div>
        <div className="">
          <h3 className=" px-8 pageTittle ">Purchases</h3>

          <hr className=" border-gray-200/80" />
        </div>
      </div>

      
      <div className="py-8 px-8 flex justify-between w-full">
        <div className=" flex items-center gap-2">
          <AppSearch placeholder="Search tags..." onReset={handleFilterRest} onSearchChange={handleFilterChange} menu={{ items: DiscountsFilters({ onChange: handleFilterChange, filters: discountQuery }) }} />
        </div>
        <div className=" flex gap-x-5 ">
          <AddButton onClick={toggleDiscountForm} label="New Purchase" />

          <SettingsDrawer />
        </div>
      </div>

      {openDiscountForm && <PurchaseOrderFormModal open={openDiscountForm} toggle={toggleDiscountForm} />}
    </div>
  );
}
