"use client";

import React, { useState } from "react";
import { Button } from "antd";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import type { IconType } from "react-icons";
import {
  LuBadgePercent,
  LuCalendarClock,
  LuChevronLeft,
  LuChevronRight,
  LuCircleDollarSign,
  LuCreditCard,
  LuFolderTree,
  LuMapPin,
  LuPlus,
  LuReceipt,
  LuScanLine,
  LuSettings,
  LuStore,
} from "react-icons/lu";
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
import POSSettings from "./POSSettings";
import PricingGroupsForm from "./PricingGroupsForm";
import PricingGroupsList from "./PricingGroupsList";
import BusinessProfileSettings from "./BusinessProfileSettings";
import GeneralSettings from "./GeneralSettings";
import { TaxesDrawer } from "./TaxForm";
import TaxList from "./TaxList";

export type SettingTab = "Business Profile" | "General" | "POS" | "Taxes" | "Locations" | "Discount" | "product_categories" | "expense_categories" | "payment_term" | "payment_method" | "pricing_group";
type SettingItem = Tax | Location | PaymentTerm | PaymentMethod | PricingGroup | null;

type SettingOption = {
  key: SettingTab;
  label: string;
  description: string;
  createLabel?: string;
  canCreate: boolean;
  icon: IconType;
  tone: string;
};

export const SETTING_OPTIONS: SettingOption[] = [
  {
    key: "Business Profile",
    label: "Business Profile",
    description: "Business details, contact handles, and default currency",
    canCreate: false,
    icon: LuStore,
    tone: "bg-blue-50 text-blue-700",
  },
  {
    key: "General",
    label: "General",
    description: "Show or hide app modules",
    canCreate: false,
    icon: LuSettings,
    tone: "bg-gray-100 text-gray-700",
  },
  {
    key: "POS",
    label: "POS",
    description: "Counter profile, tax defaults, receipts, and fulfillment",
    canCreate: false,
    icon: LuScanLine,
    tone: "bg-teal-50 text-teal-700",
  },
  {
    key: "Taxes",
    label: "Taxes",
    description: "Tax rates and schemas",
    createLabel: "New Tax",
    canCreate: true,
    icon: LuReceipt,
    tone: "bg-emerald-50 text-emerald-700",
  },
  {
    key: "Locations",
    label: "Locations",
    description: "Stores, warehouses, and stock locations",
    createLabel: "New Location",
    canCreate: true,
    icon: LuMapPin,
    tone: "bg-sky-50 text-sky-700",
  },
  {
    key: "Discount",
    label: "Discounts",
    description: "Promotions and discount rules",
    canCreate: false,
    icon: LuBadgePercent,
    tone: "bg-rose-50 text-rose-700",
  },
  {
    key: "product_categories",
    label: "Product Categories",
    description: "Catalog labels and POS visibility",
    createLabel: "New Product Category",
    canCreate: true,
    icon: LuFolderTree,
    tone: "bg-violet-50 text-violet-700",
  },
  {
    key: "expense_categories",
    label: "Expense Categories",
    description: "Expense labels and reporting groups",
    createLabel: "New Expense Category",
    canCreate: true,
    icon: LuCircleDollarSign,
    tone: "bg-amber-50 text-amber-700",
  },
  {
    key: "payment_term",
    label: "Payment Terms",
    description: "Due dates such as Net 30",
    createLabel: "New Payment Term",
    canCreate: true,
    icon: LuCalendarClock,
    tone: "bg-indigo-50 text-indigo-700",
  },
  {
    key: "payment_method",
    label: "Payment Methods",
    description: "Payment methods used on transactions",
    createLabel: "New Payment Method",
    canCreate: true,
    icon: LuCreditCard,
    tone: "bg-cyan-50 text-cyan-700",
  },
  {
    key: "pricing_group",
    label: "Pricing Groups",
    description: "Customer pricing groups and defaults",
    createLabel: "New Pricing Group",
    canCreate: true,
    icon: LuBadgePercent,
    tone: "bg-orange-50 text-orange-700",
  },
];

const isSettingTab = (value: string | null): value is SettingTab => SETTING_OPTIONS.some((option) => option.key === value);

const getSettingOption = (tab: SettingTab) => SETTING_OPTIONS.find((option) => option.key === tab) || SETTING_OPTIONS[0];

export default function SettingsWorkspace() {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  const requestedTab = searchParams.get("section");
  const selectedTab = isSettingTab(requestedTab) ? requestedTab : "Business Profile";
  const selectedOption = getSettingOption(selectedTab);
  const showCreateAction = selectedOption.canCreate;
  const showSettingsList = !isSettingTab(requestedTab);

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
      case "Business Profile":
        return <BusinessProfileSettings />;
      case "General":
        return <GeneralSettings />;
      case "POS":
        return <POSSettings />;
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
        <div className="mx-auto flex min-h-[calc(100vh-4rem)] w-full max-w-3xl flex-col bg-white">
          {showSettingsList && (
            <div className="border-b border-gray-200 px-4 py-5 sm:px-6">
              <h1 className="text-2xl font-semibold text-gray-900">Settings</h1>
              <p className="mt-1 text-sm leading-6 text-gray-500">Manage business profile, modules, taxes, locations, categories, payments, and pricing.</p>
            </div>
          )}

          <section className="flex min-h-0 flex-1 flex-col">
            {!showSettingsList && (
              <header className="sticky top-0 z-20 border-b border-gray-200 bg-white">
                <div className="flex items-center justify-between gap-4 px-4 py-4 sm:px-6">
                  <div className="flex min-w-0 items-center gap-2">
                    <Button type="text" shape="circle" title="Back to settings" className="!bg-gray-100" onClick={() => setSection(undefined)}>
                      <LuChevronLeft className="!text-gray-700" />
                    </Button>
                    <div className="min-w-0">
                      <p className="text-lg font-semibold leading-tight text-gray-900">{selectedOption.label}</p>
                      <p className="mt-0.5 truncate text-sm text-gray-500">{selectedOption.description}</p>
                    </div>
                  </div>
                </div>
              </header>
            )}

            <main className={`min-h-0 flex-1 overflow-y-auto bg-white ${showCreateAction && !showSettingsList ? "pb-24" : "pb-8"}`}>
              {showSettingsList ? (
                <div className="px-4 py-3 sm:px-6">
                  <div className="overflow-hidden rounded-lg border border-gray-200 bg-white">
                    {SETTING_OPTIONS.map((option) => {
                      const Icon = option.icon;

                      return (
                        <button key={option.key} type="button" className="flex w-full items-center gap-3 border-b border-gray-100 px-4 py-4 text-left last:border-b-0 active:bg-gray-50" onClick={() => setSection(option.key)}>
                          <span className={`flex size-11 shrink-0 items-center justify-center rounded-lg ${option.tone}`}>
                            <Icon size={21} strokeWidth={1.9} />
                          </span>
                          <span className="min-w-0 flex-1">
                            <span className="block font-medium text-gray-900">{option.label}</span>
                            <span className="mt-1 block text-sm leading-5 text-gray-500">{option.description}</span>
                          </span>
                          <LuChevronRight className="shrink-0 text-gray-400" />
                        </button>
                      );
                    })}
                  </div>
                </div>
              ) : (
                <div className="px-0 sm:px-2">{renderSettingsContent()}</div>
              )}
            </main>

            {showCreateAction && !showSettingsList && (
              <div className="sticky bottom-0 z-20 border-t border-gray-200 bg-white/95 px-4 py-3 backdrop-blur sm:px-6">
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
