"use client";
import { AddButton, FloatingAddButton } from "@/components/ui/AppButtons";
import { AppSearch } from "@/components/ui/AppSearchInput";
import useToggle from "@/hooks/UseToggle";
import { DiscountView } from "@/components/discounts/discount-view/DiscountView";
import { DiscountsQueryParams } from "@/types/discount";
import { useState } from "react";
import { DiscountsFilters } from "@/components/discounts/DiscountFilters";
import DiscountFormModal from "@/components/discounts/DiscountFormModal";

export default function DiscountsPage() {
  const [openDiscountForm, toggleDiscountForm] = useToggle();

  const [discountQuery, setDiscountQuery] = useState<DiscountsQueryParams>({});

  const handleFilterChange = (values: Partial<DiscountsQueryParams>) => {
    setDiscountQuery((prev) => ({ ...prev, ...values }));
  };

  const handleFilterRest = () => {
    setDiscountQuery({});
  };

  return (
    <div>
      <div className="py-8 px-8 flex justify-between w-full">
        <div className="flex items-center gap-2">
          <AppSearch placeholder="Search discounts..." onReset={handleFilterRest} onSearchChange={handleFilterChange} menu={{ items: DiscountsFilters({ onChange: handleFilterChange, filters: discountQuery }) }} />
        </div>
        <div className="flex gap-x-5 items-center">
          <div className="hidden md:block">
            <AddButton onClick={toggleDiscountForm} label="New Discount" />
          </div>
        </div>
      </div>

      <DiscountView query={discountQuery} />

      <DiscountFormModal open={openDiscountForm} toggle={toggleDiscountForm} />
      <FloatingAddButton onClick={toggleDiscountForm} label="New Discount" />
    </div>
  );
}
