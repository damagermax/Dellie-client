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

interface Props {}

const SettingsDrawer = ({}: Props) => {
  const [selectedTab, setSelectedTab] = useState("Taxes");
  const [selectedItem, setSelectedItem] = useState<unknown | null>(null);
  const [openSetting, toggleOpenSetting] = useToggle();
  const [openForm, toggleOpenForm] = useToggle();

  const options = [
    { key: "Taxes", label: "Taxes" },
    { key: "Locations", label: "Locations" },
    { key: "Discount", label: "Discount" },
    { key: "Categories", label: "Categories" },
  ];

  useEffect(() => {
    if (selectedItem) {
      toggleOpenForm();
    }
  }, [selectedItem]);

  return (
    <div>
      <Button shape="circle" title="settings" onClick={toggleOpenSetting}>
        <LuSettings className="!text-gray-600" />
      </Button>

      {openSetting && (
        <Drawer destroyOnClose width={550} styles={{ body: { padding: 0 } }} closeIcon={null} onClose={toggleOpenSetting} open={openSetting}>
          <div className=" sticky top-0 z-50   bg-gray-100 ">
            <div className=" px-5 flex items-center justify-between ">
              <p className=" pageTittle">
                <p className=" text-transparent ">Settings</p>
              </p>

              <Button type="text" shape="circle" title="settings" className="!bg-gray-200" onClick={toggleOpenSetting}>
                <AiOutlineClose className="!text-gray-600 " />
              </Button>
            </div>
            <Menu onSelect={({ key }) => setSelectedTab(key)} selectedKeys={[selectedTab]} style={{ fontSize: "16px" }} className="!bg-gray-100 settings" mode="horizontal" items={options} />
          </div>

          {selectedTab == "Taxes" && <TaxList onSelect={setSelectedItem} />}
          {selectedTab == "Locations" && <LocationList onSelect={setSelectedItem} />}
          {selectedTab == "Discount" && <DiscountsList />}
          {selectedTab == "Categories" && <CategoriesList query={{}} />}

          <FloatButton
            type="primary"
            icon={<LuPlus />}
            onClick={() => {
              setSelectedItem(null);
              toggleOpenForm();
            }}
          />
        </Drawer>
      )}

      {selectedTab == "Taxes" && <TaxesDrawer initialValue={selectedItem as Tax} open={openForm} toggle={toggleOpenForm} />}
      {selectedTab == "Locations" && <LocationsFormModal initialValues={selectedItem as Location} open={openForm} toggle={toggleOpenForm} />}
    </div>
  );
};

export default SettingsDrawer;
