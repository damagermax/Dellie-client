"use client";

import React, { useMemo, useState } from "react";
import { Button, Drawer, FloatButton, Grid, Menu } from "antd";
import type { MenuProps } from "antd";
import { AiOutlineClose } from "react-icons/ai";
import { LuChevronLeft, LuChevronRight, LuPlus, LuSettings } from "react-icons/lu";
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

type SettingTab = "Taxes" | "Locations" | "Discount" | "product_categories" | "expense_categories" | "payment_term" | "payment_method" | "pricing_group";
type SettingItem = Tax | Location | PaymentTerm | PaymentMethod | PricingGroup | null;

type SettingOption = {
  key: SettingTab;
  label: string;
  description: string;
  createLabel?: string;
  canCreate: boolean;
};

const SETTING_OPTIONS: SettingOption[] = [
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

const getSettingOption = (tab: SettingTab) => SETTING_OPTIONS.find((option) => option.key === tab) || SETTING_OPTIONS[0];
const canCreateSetting = (tab: SettingTab) => getSettingOption(tab).canCreate;
const getCreateLabel = (tab: SettingTab) => getSettingOption(tab).createLabel || `New ${getSettingOption(tab).label}`;

const SettingsDrawer = () => {
  const screens = Grid.useBreakpoint();
  const isMobile = !screens.md;
  const [selectedTab, setSelectedTab] = useState<SettingTab>("Taxes");
  const [selectedItem, setSelectedItem] = useState<SettingItem>(null);
  const [openSetting, setOpenSetting] = useState(false);
  const [openForm, setOpenForm] = useState(false);
  const [mobileSectionOpen, setMobileSectionOpen] = useState(false);

  const selectedOption = useMemo(() => getSettingOption(selectedTab), [selectedTab]);
  const showCreateAction = canCreateSetting(selectedTab);

  const closeSettings = () => setOpenSetting(false);
  const toggleOpenForm = () => setOpenForm((current) => !current);

  const handleTabChange = (tab: SettingTab) => {
    setSelectedTab(tab);
    setSelectedItem(null);
    setMobileSectionOpen(true);
  };

  const showMobileSettingsList = isMobile && !mobileSectionOpen;
  const showMobileSection = !isMobile || mobileSectionOpen;

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
    <div>
      <Button shape="circle" title="settings" onClick={() => setOpenSetting(true)}>
        <LuSettings className="!text-gray-600" />
      </Button>

      <Drawer
        destroyOnClose
        width={isMobile ? "100vw" : 750}
        height={isMobile ? "100dvh" : undefined}
        placement="right"
        styles={{
          body: { padding: 0, height: "100%" },
          content: isMobile ? { height: "100dvh" } : undefined,
        }}
        closeIcon={null}
        onClose={closeSettings}
        open={openSetting}
        afterOpenChange={(open) => {
          if (!open) {
            setMobileSectionOpen(false);
            setSelectedItem(null);
          }
        }}
      >
        <div className="flex h-full min-h-0 bg-white">
          <aside className="hidden w-[270px] shrink-0 border-r border-gray-200 bg-gray-100 md:block">
            <div className="border-b border-gray-200 px-5 py-5">
              <p className="text-lg font-semibold text-gray-900">Settings</p>
              <p className="mt-1 text-sm text-gray-500">Manage store preferences</p>
            </div>
            <Menu
              onSelect={({ key }) => handleTabChange(key as SettingTab)}
              selectedKeys={[selectedTab]}
              style={{ fontSize: "16px" }}
              className="settings !border-none !bg-gray-100"
              items={menuItems}
            />
          </aside>

          <section className="flex min-h-0 flex-1 flex-col">
            <header className="sticky top-0 z-30 border-b border-gray-200 bg-white">
              <div className="flex items-center justify-between gap-4 px-4 py-4 md:px-5">
                <div className="flex min-w-0 items-center gap-2">
                  {mobileSectionOpen && (
                    <Button type="text" shape="circle" title="Back to settings" className="!bg-gray-100 md:!hidden" onClick={() => setMobileSectionOpen(false)}>
                      <LuChevronLeft className="!text-gray-700" />
                    </Button>
                  )}
                  <div className="min-w-0">
                    <p className="text-lg font-semibold leading-tight text-gray-900">Settings</p>
                    <p className="mt-0.5 truncate text-sm text-gray-500">{showMobileSettingsList ? "Choose a setting" : selectedOption.label}</p>
                  </div>
                </div>
                <Button type="text" shape="circle" title="Close settings" className="!bg-gray-100" onClick={closeSettings}>
                  <AiOutlineClose className="!text-gray-600" />
                </Button>
              </div>
            </header>

            <main className={`min-h-0 flex-1 overflow-y-auto bg-white ${isMobile && showCreateAction && showMobileSection ? "pb-24" : "pb-8"}`}>
              {showMobileSettingsList ? (
                <div className="divide-y divide-gray-100 px-4">
                  {SETTING_OPTIONS.map((option) => (
                    <button key={option.key} type="button" className="flex w-full items-center justify-between gap-4 py-4 text-left" onClick={() => handleTabChange(option.key)}>
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
              <div className="sticky bottom-0 z-30 border-t border-gray-200 bg-white/95 px-4 py-3 backdrop-blur">
                <Button type="primary" size="large" icon={<LuPlus />} className="!h-12 !w-full !rounded-full !font-semibold" onClick={openCreateForm}>
                  {getCreateLabel(selectedTab)}
                </Button>
              </div>
            )}
          </section>
        </div>

        {!isMobile && showCreateAction && <FloatButton type="primary" icon={<LuPlus />} onClick={openCreateForm} />}
      </Drawer>

      {renderSettingForm()}
    </div>
  );
};

export default SettingsDrawer;
