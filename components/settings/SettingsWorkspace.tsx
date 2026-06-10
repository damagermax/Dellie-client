"use client";

import React, { useState } from "react";
import { Button, Grid, Menu } from "antd";
import type { MenuProps } from "antd";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { LuChevronLeft, LuChevronRight, LuPlus } from "react-icons/lu";
import CategoriesFormModal from "../categories/CategoriesFormModal";
import CategoriesList from "../categories/categories-view/CategoriesList";
import DiscountsList from "../discounts/discount-view/DiscountsList";
import { CategoryType } from "@/types/category";
import { Location, Tax } from "@/types/index";
import { PaymentMethod } from "@/types/payment-method";
import { PaymentTerm } from "@/types/payment-term";
import { PricingGroup } from "@/types/pricing-group";
import LocationList from "./locations/LocationList";
import LocationsFormModal from "./locations/LocationsFormModal";
import PaymentMethodsForm from "./PaymentMethodsForm";
import PaymentMethodsList from "./PaymentMethodsList";
import PaymentTermsForm from "./PaymentTermsForm";
import PaymentTermsList from "./PaymentTermsList";
import PricingGroupsForm from "./PricingGroupsForm";
import PricingGroupsList from "./PricingGroupsList";
import { TaxesDrawer } from "./TaxForm";
import TaxList from "./TaxList";

export type SettingTab = "Taxes" | "Locations" | "Discount" | "product_categories" | "expense_categories" | "payment_term" | "payment_method" | "pricing_group";
type SettingItem = Tax | Location | PaymentTerm | PaymentMethod | PricingGroup | null;

type SettingOption = {
  key: SettingTab;
  label: string;
  description: string;
  createLabel?: string;
  canCreate: boolean;
};

export const SETTING_OPTIONS: SettingOption[] = [
  { key: "Taxes", label: "Taxes", description: "Tax rates and schemas", createLabel: "New Tax", canCreate: true },
  { key: "Locations", label: "Locations", description: "Stores, warehouses, and stock locations", createLabel: "New Location", canCreate: true },
  { key: "Discount", label: "Discounts", description: "Promotions and discount rules", canCreate: false },
  { key: "product_categories", label: "Product Categories", description: "Catalog labels and POS visibility", createLabel: "New Product Category", canCreate: true },
  { key: "expense_categories", label: "Expense Categories", description: "Expense labels and reporting groups", createLabel: "New Expense Category", canCreate: true },
  { key: "payment_term", label: "Payment Terms", description: "Due dates such as Net 30", createLabel: "New Payment Term", canCreate: true },
  { key: "payment_method", label: "Payment Methods", description: "Payment methods used on transactions", createLabel: "New Payment Method", canCreate: true },
  { key: "pricing_group", label: "Pricing Groups", description: "Customer pricing groups and defaults", createLabel: "New Pricing Group", canCreate: true },
];

const menuItems: MenuProps["items"] = SETTING_OPTIONS.map(({ key, label }) => ({ key, label }));

const isSettingTab = (value: string | null): value is SettingTab => SETTING_OPTIONS.some((option) => option.key === value);

const getSettingOption = (tab: SettingTab) => SETTING_OPTIONS.find((option) => option.key === tab) || SETTING_OPTIONS[0];

export default function SettingsWorkspace() {
  const screens = Grid.useBreakpoint();
  const isMobile = !screens.md;
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  const requestedTab = searchParams.get("section");
  const selectedTab = isSettingTab(requestedTab) ? requestedTab : "Taxes";
  const selectedOption = getSettingOption(selectedTab);
  const showCreateAction = selectedOption.canCreate;
  const showMobileSettingsList = isMobile && !isSettingTab(requestedTab);
  const showMobileSection = !isMobile || isSettingTab(requestedTab);

  const [selectedItem, setSelectedItem] = useState<SettingItem>(null);
  const [openForm, setOpenForm] = useState(false);

  const setSection = (tab?: SettingTab) => {
    const params = new URLSearchParams(searchParams.toString());
    if (tab) {
      params.set("section", tab);
    } else {
      params.delete("section");
    }
    const nextQuery = params.toString();
    router.push(nextQuery ? `${pathname}?${nextQuery}` : pathname);
    setSelectedItem(null);
  };

  const toggleOpenForm = () => setOpenForm((current) => !current);

  const openCreateForm = () => {
    setSelectedItem(null);
    setOpenForm(true);
  };

  const openEditForm = (item: Exclude<SettingItem, null>) => {
    setSelectedItem(item);
    setOpenForm(true);
  };

  const renderSettingsContent = () => {
    switch (selectedTab) {
      case "Taxes":
        return <TaxList onSelect={(tax) => openEditForm(tax)} />;
      case "Locations":
        return <LocationList onSelect={(location) => openEditForm(location)} />;
      case "Discount":
        return <DiscountsList />;
      case "product_categories":
        return <CategoriesList query={{ type: CategoryType.PRODUCT }} />;
      case "expense_categories":
        return <CategoriesList query={{ type: CategoryType.EXPENSE }} />;
      case "payment_term":
        return <PaymentTermsList onSelect={(paymentTerm) => openEditForm(paymentTerm)} />;
      case "payment_method":
        return <PaymentMethodsList onSelect={(paymentMethod) => openEditForm(paymentMethod)} />;
      case "pricing_group":
        return <PricingGroupsList onSelect={(pricingGroup) => openEditForm(pricingGroup)} />;
      default:
        return null;
    }
  };

  const renderSettingForm = () => {
    switch (selectedTab) {
      case "Taxes":
        return <TaxesDrawer initialValue={selectedItem as Tax} open={openForm} toggle={toggleOpenForm} />;
      case "Locations":
        return <LocationsFormModal initialValues={selectedItem as Location} open={openForm} toggle={toggleOpenForm} />;
      case "product_categories":
        return <CategoriesFormModal type={CategoryType.PRODUCT} open={openForm} toggle={toggleOpenForm} />;
      case "expense_categories":
        return <CategoriesFormModal type={CategoryType.EXPENSE} open={openForm} toggle={toggleOpenForm} />;
      case "payment_term":
        return <PaymentTermsForm initialValues={selectedItem as PaymentTerm} open={openForm} toggle={toggleOpenForm} />;
      case "payment_method":
        return <PaymentMethodsForm initialValues={selectedItem as PaymentMethod} open={openForm} toggle={toggleOpenForm} />;
      case "pricing_group":
        return <PricingGroupsForm initialValues={selectedItem as PricingGroup} open={openForm} toggle={toggleOpenForm} />;
      default:
        return null;
    }
  };

  return (
    <>
      <div className="min-h-full bg-white">
        <div className="border-b border-gray-200 px-4 py-5 md:px-8 md:py-8">
          <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
            <div className="min-w-0">
              <h1 className="text-2xl font-semibold text-gray-900">Settings</h1>
              <p className="mt-1 text-sm text-gray-500">Manage taxes, categories, pricing, payment rules, and operational settings.</p>
            </div>
            {!isMobile && showCreateAction && (
              <Button type="primary" size="large" icon={<LuPlus />} className="!rounded-full !px-5 !font-semibold" onClick={openCreateForm}>
                {selectedOption.createLabel}
              </Button>
            )}
          </div>
        </div>

        <div className="flex min-h-[calc(100vh-10rem)] bg-white">
          <aside className="hidden w-[280px] shrink-0 border-r border-gray-200 bg-gray-50 md:block">
            <Menu onSelect={({ key }) => setSection(key as SettingTab)} selectedKeys={[selectedTab]} style={{ fontSize: "16px" }} className="settings !border-none !bg-gray-50" items={menuItems} />
          </aside>

          <section className="flex min-h-0 flex-1 flex-col">
            <header className="sticky top-0 z-20 border-b border-gray-200 bg-white">
              <div className="flex items-center justify-between gap-4 px-4 py-4 md:px-6">
                <div className="flex min-w-0 items-center gap-2">
                  {isMobile && showMobileSection && (
                    <Button type="text" shape="circle" title="Back to settings" className="!bg-gray-100" onClick={() => setSection(undefined)}>
                      <LuChevronLeft className="!text-gray-700" />
                    </Button>
                  )}
                  <div className="min-w-0">
                    <p className="text-lg font-semibold leading-tight text-gray-900">{showMobileSettingsList ? "Settings" : selectedOption.label}</p>
                    <p className="mt-0.5 truncate text-sm text-gray-500">{showMobileSettingsList ? "Choose a section to manage" : selectedOption.description}</p>
                  </div>
                </div>
              </div>
            </header>

            <main className={`min-h-0 flex-1 overflow-y-auto bg-white ${isMobile && showCreateAction && showMobileSection ? "pb-24" : "pb-8"}`}>
              {showMobileSettingsList ? (
                <div className="divide-y divide-gray-100 px-4">
                  {SETTING_OPTIONS.map((option) => (
                    <button key={option.key} type="button" className="flex w-full items-center justify-between gap-4 py-4 text-left" onClick={() => setSection(option.key)}>
                      <div className="min-w-0">
                        <p className="font-medium text-gray-900">{option.label}</p>
                        <p className="mt-1 text-sm text-gray-500">{option.description}</p>
                      </div>
                      <LuChevronRight className="shrink-0 text-gray-400" />
                    </button>
                  ))}
                </div>
              ) : (
                renderSettingsContent()
              )}
            </main>

            {isMobile && showCreateAction && showMobileSection && (
              <div className="sticky bottom-0 z-20 border-t border-gray-200 bg-white/95 px-4 py-3 backdrop-blur">
                <Button type="primary" size="large" icon={<LuPlus />} className="!h-12 !w-full !rounded-full !font-semibold" onClick={openCreateForm}>
                  {selectedOption.createLabel}
                </Button>
              </div>
            )}
          </section>
        </div>
      </div>

      {renderSettingForm()}
    </>
  );
}
