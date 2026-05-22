"use client";

import { CategoriesFilters } from "@/components/categories/CategoriesFilters";
import CategoriesFormModal from "@/components/categories/CategoriesFormModal";
import CategoriesView from "@/components/categories/categories-view/CategoriesList";
import { AddButton } from "@/components/ui/AppButtons";
import { AppSearch } from "@/components/ui/AppSearchInput";
import useToggle from "@/hooks/UseToggle";
import { CategoriesQueryParams, CategoryType } from "@/types/category";
import { Link } from "lucide-react";
import { usePathname, useRouter } from "next/navigation";
import { useState } from "react";
import { Menu, Radio, RadioChangeEvent } from "antd";

export default function CategoriesPage() {
  const [openCategoryForm, toggleCategoryForm] = useToggle();
  const [categoriesQuery, setCategoriesQuery] = useState<CategoriesQueryParams>({ type: CategoryType.PRODUCT });

  const handleFilterChange = (values: Partial<CategoriesQueryParams>) => {
    setCategoriesQuery((prev) => ({ ...prev, ...values }));
  };

  const handleFilterRest = () => {
    setCategoriesQuery({});
  };

  const handleChange = (e: RadioChangeEvent) => {
    handleFilterChange({ type: e.target.value });
  };

  return (
    <div>
      <div className=" px-8 flex justify-between w-full">
        <div className=" flex items-center gap-2">
          <AppSearch placeholder="Search categories" onReset={handleFilterRest} onSearchChange={handleFilterChange} menu={{ items: CategoriesFilters({ onChange: handleFilterChange, filters: categoriesQuery }) }} />
        </div>
        <div className=" flex gap-x-5 items-center ">
          <Radio.Group value={categoriesQuery.type} onChange={handleChange}>
            <Radio.Button value={CategoryType.PRODUCT}>Product</Radio.Button>
            <Radio.Button value={CategoryType.SERVICE}>Service</Radio.Button>
            <Radio.Button value={CategoryType.EXPENSE}>Expense</Radio.Button>
          </Radio.Group>
        </div>
      </div>

      <CategoriesView query={categoriesQuery} />
      {openCategoryForm && <CategoriesFormModal open={openCategoryForm} toggle={toggleCategoryForm} />}
    </div>
  );
}
