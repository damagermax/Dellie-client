"use client";

import React, { useState } from "react";
import { Button } from "antd";
import Link from "next/link";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import type { IconType } from "react-icons";
import { LuAppWindow, LuBadgePercent, LuCalendarClock, LuChevronLeft, LuChevronRight, LuCircleDollarSign, LuCreditCard, LuFileStack, LuFolderTree, LuGlobe, LuMapPin, LuPlus, LuReceipt, LuScanLine, LuSettings, LuStore } from "react-icons/lu";
import CategoriesFormModal from "../categories/CategoriesFormModal";
import CategoriesList from "../categories/categories-view/CategoriesList";
import DiscountsList from "../discounts/discount-view/DiscountsList";
import DiscountFormModal from "../discounts/DiscountFormModal";
import { Category, CategoryType } from "@/types/category";
import { DeliveryZone } from "@/types/delivery-zone";
import { Discount } from "@/types/discount";
import { Location, Tax } from "@/types/index";
import { PaymentMethod } from "@/types/payment-method";
import { PaymentTerm } from "@/types/payment-term";
import LocationList from "./locations/LocationList";
import LocationsFormModal from "./locations/LocationsFormModal";
import PaymentMethodsForm from "./PaymentMethodsForm";
import PaymentMethodsList from "./PaymentMethodsList";
import PaymentTermsForm from "./PaymentTermsForm";
import PaymentTermsList from "./PaymentTermsList";
import POSSettings from "./POSSettings";
import BusinessProfileSettings from "./BusinessProfileSettings";
import DocumentsSettings from "./DocumentsSettings";
import GeneralSettings from "./GeneralSettings";
import OnlineStoreSettings from "./OnlineStoreSettings";
import DeliveryZonesForm from "./DeliveryZonesForm";
import DeliveryZonesList from "./DeliveryZonesList";
import { TaxesDrawer } from "./TaxForm";
import TaxList from "./TaxList";

export type SettingTab = "Business Profile" | "Features" | "POS" | "Documents" | "Taxes" | "Locations" | "Discount" | "product_categories" | "expense_categories" | "payment_term" | "payment_method" | "Online Store" | "Delivery Zones";
type SettingItem = Tax | Location | PaymentTerm | PaymentMethod | Category | Discount | DeliveryZone | null;

type SettingOption = {
  key: SettingTab;
  label: string;
  description: string;
  createLabel?: string;
  canCreate: boolean;
  icon: IconType;
  tone: string;
};

type SettingGroup = {
  title: string;
  description: string;
  items: Array<
    | {
        type: "section";
        key: SettingTab;
      }
    | {
        type: "link";
        key: string;
        label: string;
        description: string;
        href: string;
        icon: IconType;
        tone: string;
      }
  >;
};

export const SETTING_OPTIONS: SettingOption[] = [
  {
    key: "Business Profile",
    label: "Business Profile",
    description: "Business details, contact handles, and default currency",
    canCreate: false,
    icon: LuStore,
    tone: "bg-blue-50 text-blue-700 ring-blue-100",
  },
  {
    key: "Features",
    label: "Features",
    description: "Show or hide app modules and operational features",
    canCreate: false,
    icon: LuSettings,
    tone: "bg-gray-100 text-gray-700 ring-gray-200",
  },
  {
    key: "POS",
    label: "POS",
    description: "Counter profile, tax defaults, receipts, and fulfillment",
    canCreate: false,
    icon: LuScanLine,
    tone: "bg-teal-50 text-teal-700 ring-teal-100",
  },
  {
    key: "Documents",
    label: "Documents",
    description: "Default templates for purchase orders, invoices, and receipts",
    canCreate: false,
    icon: LuFileStack,
    tone: "bg-orange-50 text-orange-700 ring-orange-100",
  },
  {
    key: "Online Store",
    label: "Online Store",
    description: "Storefront template, fulfillment locations, and selling online",
    canCreate: false,
    icon: LuGlobe,
    tone: "bg-lime-50 text-lime-700 ring-lime-100",
  },
  {
    key: "Taxes",
    label: "Taxes",
    description: "Tax rates and schemas",
    createLabel: "New Tax",
    canCreate: true,
    icon: LuReceipt,
    tone: "bg-emerald-50 text-emerald-700 ring-emerald-100",
  },
  {
    key: "Locations",
    label: "Locations",
    description: "Stores, warehouses, and stock locations",
    createLabel: "New Location",
    canCreate: true,
    icon: LuMapPin,
    tone: "bg-sky-50 text-sky-700 ring-sky-100",
  },
  {
    key: "Discount",
    label: "Discounts",
    description: "Promotions and discount rules",
    createLabel: "New Discount",
    canCreate: true,
    icon: LuBadgePercent,
    tone: "bg-rose-50 text-rose-700 ring-rose-100",
  },
  {
    key: "product_categories",
    label: "Product Categories",
    description: "Catalog labels and POS visibility",
    createLabel: "New Product Category",
    canCreate: true,
    icon: LuFolderTree,
    tone: "bg-violet-50 text-violet-700 ring-violet-100",
  },
  {
    key: "expense_categories",
    label: "Expense Categories",
    description: "Expense labels and reporting groups",
    createLabel: "New Expense Category",
    canCreate: true,
    icon: LuCircleDollarSign,
    tone: "bg-amber-50 text-amber-700 ring-amber-100",
  },
  {
    key: "payment_term",
    label: "Payment Terms",
    description: "Due dates such as Net 30",
    createLabel: "New Payment Term",
    canCreate: true,
    icon: LuCalendarClock,
    tone: "bg-indigo-50 text-indigo-700 ring-indigo-100",
  },
  {
    key: "payment_method",
    label: "Payment Methods",
    description: "Payment methods used on transactions",
    createLabel: "New Payment Method",
    canCreate: true,
    icon: LuCreditCard,
    tone: "bg-cyan-50 text-cyan-700 ring-cyan-100",
  },
  {
    key: "Delivery Zones",
    label: "Delivery Zones",
    description: "Delivery areas and fees within each region",
    createLabel: "New Delivery Zone",
    canCreate: true,
    icon: LuMapPin,
    tone: "bg-teal-50 text-teal-700 ring-teal-100",
  },
];

const SETTINGS_GROUPS: SettingGroup[] = [
  {
    title: "Modules",
    description: "Categories, discounts, taxes, locations, payment terms, and delivery zones.",
    items: [
      { type: "section", key: "product_categories" },
      { type: "section", key: "Discount" },
      { type: "section", key: "Taxes" },
      { type: "section", key: "Locations" },
      { type: "section", key: "payment_term" },
      { type: "section", key: "payment_method" },
      { type: "section", key: "Delivery Zones" },
      { type: "section", key: "expense_categories" },
      {
        type: "link",
        key: "apps",
        label: "Apps & Integrations",
        description: "Set up Paystack, Stripe, and other connected services",
        href: "/settings/apps",
        icon: LuAppWindow,
        tone: "bg-fuchsia-50 text-fuchsia-700 ring-fuchsia-100",
      },
    ],
  },
  {
    title: "Settings",
    description: "Business identity, modules, POS defaults, document templates, and operating locations.",
    items: [
      { type: "section", key: "Business Profile" },
      { type: "section", key: "Online Store" },
      { type: "section", key: "Features" },
      { type: "section", key: "POS" },
      { type: "section", key: "Documents" },
    ],
  },
];

const normalizeRequestedTab = (value: string | null): SettingTab | null => {
  if (value === "General") return "Features";
  return isSettingTab(value) ? value : null;
};

const isSettingTab = (value: string | null): value is SettingTab => SETTING_OPTIONS.some((option) => option.key === value);

const getSettingOption = (tab: SettingTab) => SETTING_OPTIONS.find((option) => option.key === tab) || SETTING_OPTIONS[0];

export default function SettingsWorkspace() {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  const requestedTab = searchParams.get("section");
  const selectedTab = normalizeRequestedTab(requestedTab) || "Business Profile";
  const selectedOption = getSettingOption(selectedTab);
  const showCreateAction = selectedOption.canCreate;
  const showSettingsList = !normalizeRequestedTab(requestedTab);
  const detailWidthClass = selectedTab === "Documents" ? "md:w-[90%]" : "md:w-1/2";

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

  const renderSettingsRow = (option: SettingOption) => {
    const Icon = option.icon;

    return (
      <button key={option.key} type="button"
        className="flex w-full items-center gap-3 px-4 py-4 text-left transition-colors hover:bg-gray-50/80 active:bg-gray-100"
        onClick={() => setSection(option.key)}>
        <span className={`flex size-10 shrink-0 items-center justify-center rounded-lg ring-1 ${option.tone}`}>
          <Icon size={20} strokeWidth={1.8} />
        </span>
        <span className="min-w-0 flex-1">
          <span className="block text-sm font-medium text-gray-900">{option.label}</span>
          <span className="mt-0.5 block text-sm leading-5 text-gray-500">{option.description}</span>
        </span>
        <LuChevronRight size={16} className="shrink-0 text-gray-300" />
      </button>
    );
  };

  const renderLinkRow = (item: Extract<SettingGroup["items"][number], { type: "link" }>) => {
    const Icon = item.icon;

    return (
      <Link key={item.key} href={item.href}
        className="flex w-full items-center gap-3 px-4 py-4 text-left transition-colors hover:bg-gray-50/80 active:bg-gray-100">
        <span className={`flex size-10 shrink-0 items-center justify-center rounded-lg ring-1 ${item.tone}`}>
          <Icon size={20} strokeWidth={1.8} />
        </span>
        <span className="min-w-0 flex-1">
          <span className="block text-sm font-medium text-gray-900">{item.label}</span>
          <span className="mt-0.5 block text-sm leading-5 text-gray-500">{item.description}</span>
        </span>
        <LuChevronRight size={16} className="shrink-0 text-gray-300" />
      </Link>
    );
  };

  const renderSettingsContent = () => {
    switch (selectedTab) {
      case "Business Profile":
        return <BusinessProfileSettings />;
      case "Features":
        return <GeneralSettings />;
      case "POS":
        return <POSSettings />;
      case "Documents":
        return <DocumentsSettings />;
      case "Online Store":
        return <OnlineStoreSettings />;
      case "Taxes":
        return <TaxList onSelect={(tax) => openEditForm(tax)} />;
      case "Locations":
        return <LocationList onSelect={(location) => openEditForm(location)} />;
      case "Discount":
        return <DiscountsList onSelect={(discount) => openEditForm(discount)} />;
      case "product_categories":
        return <CategoriesList query={{ type: CategoryType.PRODUCT }} />;
      case "expense_categories":
        return <CategoriesList query={{ type: CategoryType.EXPENSE }} />;
      case "payment_term":
        return <PaymentTermsList onSelect={(paymentTerm) => openEditForm(paymentTerm)} />;
      case "payment_method":
        return <PaymentMethodsList onSelect={(paymentMethod) => openEditForm(paymentMethod)} />;
      case "Delivery Zones":
        return <DeliveryZonesList onSelect={(zone) => openEditForm(zone)} />;
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
        return <CategoriesFormModal type={CategoryType.PRODUCT} initialValues={selectedItem as Category} open={openForm} toggle={toggleOpenForm} />;
      case "expense_categories":
        return <CategoriesFormModal type={CategoryType.EXPENSE} initialValues={selectedItem as Category} open={openForm} toggle={toggleOpenForm} />;
      case "payment_term":
        return <PaymentTermsForm initialValues={selectedItem as PaymentTerm} open={openForm} toggle={toggleOpenForm} />;
      case "payment_method":
        return <PaymentMethodsForm initialValues={selectedItem as PaymentMethod} open={openForm} toggle={toggleOpenForm} />;
      case "Discount":
        return <DiscountFormModal initialValues={selectedItem as Discount} open={openForm} toggle={toggleOpenForm} />;
      case "Delivery Zones":
        return <DeliveryZonesForm initialValues={selectedItem as DeliveryZone} open={openForm} toggle={toggleOpenForm} />;
      default:
        return null;
    }
  };

  const SelectedIcon = selectedOption?.icon;

  return (
    <>
      <div className="min-h-full bg-gray-50">
        <div className={`mx-auto flex min-h-[calc(100vh-4rem)] w-full flex-col ${showSettingsList ? "max-w-4xl" : detailWidthClass}`}>
          <section className="flex min-h-0 flex-1 flex-col">
            {!showSettingsList && (
              <header className="sticky top-0 z-20 border-b border-gray-200 bg-gray-50">
                <div className="flex items-center gap-3 px-4 py-4 sm:px-6">
                  <Button type="text" shape="circle" title="Back" className="!flex !size-9 !items-center !justify-center !bg-gray-100 !text-gray-600 hover:!bg-gray-200" onClick={() => setSection(undefined)}>
                    <LuChevronLeft size={18} />
                  </Button>
                  <div className="flex items-center gap-3 min-w-0">
                    {SelectedIcon && (
                      <span className={`flex size-9 shrink-0 items-center justify-center rounded-lg ring-1 ${selectedOption.tone}`}>
                        <SelectedIcon size={18} strokeWidth={1.8} />
                      </span>
                    )}
                    <div className="min-w-0">
                      <p className="text-base font-semibold leading-tight text-gray-950">{selectedOption.label}</p>
                      <p className="mt-0.5 truncate text-sm text-gray-500">{selectedOption.description}</p>
                    </div>
                  </div>
                </div>
              </header>
            )}

            <main className={`min-h-0 flex-1 overflow-y-auto bg-gray-50 ${showCreateAction && !showSettingsList ? "pb-28" : "pb-8"}`}>
              {showSettingsList ? (
                <div className="px-4 py-4 sm:px-8">
                  <div className="overflow-hidden rounded-xl border border-gray-200 bg-white md:hidden">
                    {renderLinkRow({
                      type: "link",
                      key: "apps-mobile",
                      label: "Apps & Integrations",
                      description: "Set up Paystack, Stripe, and other connected services",
                      href: "/settings/apps",
                      icon: LuAppWindow,
                      tone: "bg-fuchsia-50 text-fuchsia-700 ring-fuchsia-100",
                    })}
                    {SETTING_OPTIONS.map((option) => renderSettingsRow(option))}
                  </div>

                  <div className="hidden space-y-5 md:block">
                    {SETTINGS_GROUPS.map((group) => (
                      <section key={group.title} className="overflow-hidden rounded-xl border border-gray-200 bg-white">
                        {group.title && (
                          <div className="border-b border-gray-100 px-5 py-4">
                            <h2 className="text-base font-semibold text-gray-950">{group.title}</h2>
                            <p className="mt-1 text-sm leading-5 text-gray-500">{group.description}</p>
                          </div>
                        )}
                        <div className="divide-y divide-gray-100">
                          {group.items.map((item) => {
                            if (item.type === "link") {
                              return renderLinkRow(item);
                            }
                            const option = getSettingOption(item.key);
                            return renderSettingsRow(option);
                          })}
                        </div>
                      </section>
                    ))}
                  </div>
                </div>
              ) : (
                <div className="px-0 sm:px-2">{renderSettingsContent()}</div>
              )}
            </main>

            {showCreateAction && !showSettingsList && (
              <div className="sticky bottom-0 z-20 border-t border-gray-200/80 bg-white/90 px-4 py-4 backdrop-blur-lg sm:px-6">
                <Button type="primary" size="large" icon={<LuPlus size={18} />}
                  className="!flex !h-12 !w-full !items-center !justify-center !rounded-xl !font-semibold !shadow-sm"
                  onClick={openCreateForm}>
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
