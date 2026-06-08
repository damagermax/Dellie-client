import React, { useEffect, useState } from "react";
import { Button, Drawer, Menu, FloatButton } from "antd";
import { LuPlus, LuSettings } from "react-icons/lu";
import useToggle from "@/hooks/UseToggle";
import { AiOutlineClose } from "react-icons/ai";
import { TaxesDrawer } from "./TaxForm";
import TaxList from "./TaxList";
import { Tax, Location } from "@/types/index";
import LocationList from "./locations/LocationList";
import LocationsFormModal from "./locations/LocationsFormModal";
import DiscountsList from "../discounts/discount-view/DiscountsList";
import CategoriesList from "../categories/categories-view/CategoriesList";
import PaymentTermsList from "./PaymentTermsList";
import PaymentTermsForm from "./PaymentTermsForm";
import { PaymentTerm } from "@/types/payment-term";
import PaymentMethodsList from "./PaymentMethodsList";
import PaymentMethodsForm from "./PaymentMethodsForm";
import { PaymentMethod } from "@/types/payment-method";
import PricingGroupsList from "./PricingGroupsList";
import PricingGroupsForm from "./PricingGroupsForm";
import { PricingGroup } from "@/types/pricing-group";
import CategoriesFormModal from "../categories/CategoriesFormModal";
import { CategoryType } from "@/types/category";

const SettingsDrawer = () => {
  const [selectedTab, setSelectedTab] = useState("Taxes");
  const [selectedItem, setSelectedItem] = useState<Tax | Location | PaymentTerm | PaymentMethod | PricingGroup | null>(null);
  const [openSetting, toggleOpenSetting] = useToggle();
  const [openForm, toggleOpenForm] = useToggle();

  const options = [
    { key: "Taxes", label: "Taxes" },
    { key: "Locations", label: "Locations" },
    { key: "Discount", label: "Discounts" },
    { key: "product_categories", label: "Product Categories" },
    { key: "expense_categories", label: "Expense Categories" },
    { key: "payment_term", label: "Payment Terms" },
    { key: "payment_method", label: "Payment Method" },
    { key: "pricing_group", label: "Pricing Groups" },
  ];

  useEffect(() => {
    if (selectedItem) {
      toggleOpenForm();
    }
  }, [selectedItem, toggleOpenForm]);

  return (
    <div>
      <Button shape="circle" title="settings" onClick={toggleOpenSetting}>
        <LuSettings className="!text-gray-600" />
      </Button>

      {openSetting && (
        <Drawer destroyOnClose width={750} styles={{ body: { padding: 0 } }} closeIcon={null} onClose={toggleOpenSetting} open={openSetting}>
          <div className=" sticky top-0 z-50   bg-gray-100 ">
            {/* <div className=" px-5 flex items-center justify-between ">
              <p className=" pageTittle">
                <p className=" text-transparent ">Settings</p>
              </p>

              <Button type="text" shape="circle" title="settings" className="!bg-gray-200" onClick={toggleOpenSetting}>
                <AiOutlineClose className="!text-gray-600 " />
              </Button>
            </div> */}
            {/* <Menu
              onSelect={({ key }) => setSelectedTab(key)}
              selectedKeys={[selectedTab]}
              style={{ fontSize: "16px" }}
              className="!bg-gray-100 settings"
              //mode="horizontal"
              items={options}
            /> */}
          </div>

          <div className=" flex min-h-screen w-full ">
            <Menu
              onSelect={({ key }) => setSelectedTab(key)}
              selectedKeys={[selectedTab]}
              style={{ fontSize: "16px" }}
              className="!bg-gray-100 settings !w-[50%]"
              //mode="horizontal"
              items={options}
            />

            <div className=" w-full">
              <div className=" px-5 flex border-b border-b-blue-100 items-center justify-between ">
                <p className=" pageTittle">
                  <p className=" text-transparent ">Settings</p>
                </p>

                <Button type="text" shape="circle" title="settings" className="!bg-gray-200" onClick={toggleOpenSetting}>
                  <AiOutlineClose className="!text-gray-600 " />
                </Button>
              </div>
              {selectedTab == "Taxes" && <TaxList onSelect={setSelectedItem as (tax: Tax) => void} />}
              {selectedTab == "Locations" && <LocationList onSelect={setSelectedItem as (location: Location) => void} />}
              {selectedTab == "Discount" && <DiscountsList />}
              {selectedTab == "product_categories" && <CategoriesList query={{ type: CategoryType.PRODUCT }} />}
              {selectedTab == "expense_categories" && <CategoriesList query={{ type: CategoryType.EXPENSE }} />}
              {selectedTab == "payment_term" && <PaymentTermsList onSelect={setSelectedItem as (paymentTerm: PaymentTerm) => void} />}
              {selectedTab == "payment_method" && <PaymentMethodsList onSelect={setSelectedItem as (paymentMethod: PaymentMethod) => void} />}
              {selectedTab == "pricing_group" && <PricingGroupsList onSelect={setSelectedItem as (pricingGroup: PricingGroup) => void} />}
            </div>
          </div>

          {(selectedTab == "Taxes" || selectedTab == "Locations" || selectedTab == "payment_term" || selectedTab == "payment_method" || selectedTab == "pricing_group" || selectedTab == "product_categories" || selectedTab == "expense_categories") && (
            <FloatButton
              type="primary"
              icon={<LuPlus />}
              onClick={() => {
                setSelectedItem(null);
                toggleOpenForm();
              }}
            />
          )}
        </Drawer>
      )}

      {selectedTab == "Taxes" && <TaxesDrawer initialValue={selectedItem as Tax} open={openForm} toggle={toggleOpenForm} />}
      {selectedTab == "Locations" && <LocationsFormModal initialValues={selectedItem as Location} open={openForm} toggle={toggleOpenForm} />}
      {selectedTab == "product_categories" && <CategoriesFormModal type={CategoryType.PRODUCT} open={openForm} toggle={toggleOpenForm} />}
      {selectedTab == "expense_categories" && <CategoriesFormModal type={CategoryType.EXPENSE} open={openForm} toggle={toggleOpenForm} />}
      {selectedTab == "payment_term" && <PaymentTermsForm initialValues={selectedItem as PaymentTerm} open={openForm} toggle={toggleOpenForm} />}
      {selectedTab == "payment_method" && <PaymentMethodsForm initialValues={selectedItem as PaymentMethod} open={openForm} toggle={toggleOpenForm} />}
      {selectedTab == "pricing_group" && <PricingGroupsForm initialValues={selectedItem as PricingGroup} open={openForm} toggle={toggleOpenForm} />}
    </div>
  );
};

export default SettingsDrawer;
