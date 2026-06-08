"use client";
import { AppSearch } from "@/components/ui/AppSearchInput";

import ProductFormModal from "@/components/products/ProductFormModal";
import ProductView from "@/components/products/product-views/ProductView";
import useToggle from "@/hooks/UseToggle";
import { useState } from "react";

import { ProductQueryParams } from "@/types/product";

import { ProductsFilters } from "@/components/products/ProductsFilters";
import SettingsDrawer from "@/components/settings/SettingsDrawer";
import { AccessDeniedView } from "@/components/ui/AccessDeniedView";
import { AppViewLoader } from "@/components/ui/AppViewLoader";
import { Button, Dropdown, MenuProps, Space } from "antd";
import { IoEllipsisVertical } from "react-icons/io5";
import { TbDatabaseImport, TbDatabaseExport } from "react-icons/tb";
import { TiPrinter } from "react-icons/ti";
import { BiMessageSquareEdit } from "react-icons/bi";
import { usePermissions } from "@/hooks/usePermissions";
import { StorePermission } from "@/types/store-access";

export default function ProductsPage() {
  const { ready, hasPermission } = usePermissions();
  const [openProductForm, toggleProductForm] = useToggle();
  const view = "table";

  const [productsQuery, setProductsQuery] = useState<ProductQueryParams>({ page: 1, limit: 20 });

  const handleFilterChange = (values: Partial<ProductQueryParams>) => {
    setProductsQuery((prev) => ({ ...prev, ...values, page: 1 }));
  };

  const handleFilterRest = () => {
    setProductsQuery({ page: 1, limit: 20 });
  };

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

  if (!ready) return <AppViewLoader loading />;

  if (!hasPermission(StorePermission.PRODUCTS_VIEW)) {
    return <AccessDeniedView title="Products" description="You do not have permission to view the products module." />;
  }

  return (
    <div>
      <div className="flex w-full flex-col gap-4 px-4 py-5 md:flex-row md:justify-between md:px-8 md:py-8">
        <div className="flex w-full items-center gap-x-2 md:w-auto">
          <AppSearch placeholder="Search categories" onReset={handleFilterRest} onSearchChange={handleFilterChange} menu={{ items: ProductsFilters({ onChange: handleFilterChange, filters: productsQuery }) }} />
        </div>

        <div className="flex items-center justify-between gap-3">
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

      <ProductView view={view} query={productsQuery} onQueryChange={setProductsQuery} />

      {openProductForm && <ProductFormModal open={openProductForm} toggle={toggleProductForm} />}
    </div>
  );
}
