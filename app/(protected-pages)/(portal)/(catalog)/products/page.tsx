"use client";
import { AddButton, BaseButton } from "@/components/ui/AppButtons";
import { AppSearch } from "@/components/ui/AppSearchInput";

import ProductFormModal from "@/components/products/ProductFormModal";
import ProductView from "@/components/products/product-views/ProductView";
import useToggle from "@/hooks/UseToggle";
import { useState } from "react";

import { ProductQueryParams } from "@/types/product";

import AppViewSegments, { ViewType } from "@/components/ui/AppViewSegments";
import { ProductsFilters } from "@/components/products/ProductsFilters";
import SettingsDrawer from "@/components/settings/SettingsDrawer";
import { Button, Dropdown, MenuProps, Space } from "antd";
import { IoEllipsisVertical } from "react-icons/io5";
import { TbDatabaseImport, TbDatabaseExport } from "react-icons/tb";
import { TiPrinter } from "react-icons/ti";
import { BiMessageSquareEdit } from "react-icons/bi";

export default function ProductsPage() {
  const [openProductForm, toggleProductForm] = useToggle();
  const [view, setView] = useState<ViewType>("table");

  const [productsQuery, setProductsQuery] = useState<ProductQueryParams>({});

  const handleFilterChange = (values: Partial<ProductQueryParams>) => {
    setProductsQuery((prev) => ({ ...prev, ...values }));
  };

  const handleFilterRest = () => {
    setProductsQuery({});
  };

  const items = [
    {
      key: "1",
      label: "Stock Adjustments",
    },
    {
      key: "2",
      label: "Stock Count",
    },
  ];

  const actionItems = [
    {
      key: "import",
      label: "Import products",
      icon: <TbDatabaseImport />,
    },
    {
      key: "export",
      label: "Export Products",
      icon: <TbDatabaseExport />,
    },

    {
      key: "edit",
      label: "Bulk Edit",
      icon: <BiMessageSquareEdit />,
    },
    {
      key: "print",
      label: "Print Labels",
      icon: <TiPrinter />,
    },
  ];

  const onMenuClick: MenuProps["onClick"] = (e) => {
    console.log("click", e);
  };

  return (
    <div>
      <div className="py-8 px-8 flex justify-between w-full">
        <div className=" flex items-center gap-x-2">
          <AppSearch placeholder="Search categories" onReset={handleFilterRest} onSearchChange={handleFilterChange} menu={{ items: ProductsFilters({ onChange: handleFilterChange, filters: productsQuery }) }} />
        </div>

        <div className=" flex items-center justify-between  gap-3 ">
          {/* <Space.Compact>
            <Button>Stock Transfer</Button>
            <Dropdown menu={{ items, onClick: onMenuClick }} placement="bottomRight">
              <Button icon={<IoEllipsisVertical />} />
            </Dropdown>
          </Space.Compact> */}

          <Space.Compact>
            <Button type="primary" size="middle" className=" !shadow-none" onClick={toggleProductForm}>
              Add Product
            </Button>

            <Dropdown menu={{ items: actionItems, onClick: onMenuClick }} placement="bottomRight">
              <Button type="primary" size="middle" className=" !shadow-none" icon={<IoEllipsisVertical />} />
            </Dropdown>
          </Space.Compact>

          <SettingsDrawer />
        </div>
      </div>

      <ProductView view={view} query={productsQuery} />

      {openProductForm && <ProductFormModal open={openProductForm} toggle={toggleProductForm} />}
    </div>
  );
}
