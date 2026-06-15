"use client";

import AppTable from "@/components/ui/AppTable";
import PreviewImage from "../ui/PreviewImage";
import useToggle from "@/hooks/UseToggle";
import { VariantDetailModal } from "./VariantDetailModal";
import { useState } from "react";
import { ProductPriceTier, getNormalPrice } from "@/lib/products/pricing";

type VariantInventoryLevel = {
  available?: number;
};

export type ProductVariantRow = {
  id: string;
  name: string;
  imageUrl?: string;
  productId?: string;
  priceTiers?: ProductPriceTier[];
  inventory?: {
    inventoryLevels?: VariantInventoryLevel[];
  };
};

export function ProductVariantsTable({ variants }: { variants: ProductVariantRow[] }) {
  const [openVariantModal, toggleVariantModal] = useToggle();
  const [selectedVariant, setSelectedVariant] = useState<ProductVariantRow>();

  // safely get inventory levels from the first variant
  const inventoryLevels = variants?.[0]?.inventory?.inventoryLevels ?? [];

  const handleVariantItemClick = (variant: ProductVariantRow) => {
    setSelectedVariant(variant);
    toggleVariantModal();
  };

  function getTotalAvailableStock(inventory?: ProductVariantRow["inventory"]) {
    const levels = inventory?.inventoryLevels || [];
    return levels.reduce((sum, lvl) => sum + (lvl.available || 0), 0);
  }
  const tableColumns = [
    {
      title: "Variant",
      className: "!pl-8",
      dataIndex: "id",
      key: "id",
      render: (_: unknown, variant: ProductVariantRow) => (
        <div className="flex items-center space-x-4">
          <div className=" ">
            <PreviewImage height={50} width={50} src={variant.imageUrl ? variant.imageUrl : "/images/dellie-logo.png"} />
          </div>
          <div className="min-w-0 cursor-pointer" onClick={() => handleVariantItemClick(variant)}>
            <div className="font-medium  text-gray-900 truncate">{variant?.name}</div>
            <div className=" text-xs text-gray-400 truncate">SKU: {variant?.name}</div>
          </div>
        </div>
      ),
      width: "300px",
    },
    {
      title: "Selling Price",
      dataIndex: "priceTiers",
      key: "priceTiers",
      align: "center" as const,
      width: `${inventoryLevels.length == 1 ? 20 : 8}%`,
      render: (_: unknown, variant: ProductVariantRow) => `GHS ${getNormalPrice(variant).toFixed(2)}`,
    },

    {
      title: "Stocks",
      dataIndex: "inventory",
      key: "inventory",
      align: "center" as const,
      width: `${inventoryLevels.length == 1 ? 20 : 8}%`,
      render: (inventory: ProductVariantRow["inventory"]) => getTotalAvailableStock(inventory),
    },

    // {
    //   title: "Locations",
    //   align: "center",
    //   children: [
    //     ...inventoryLevels.map((level: any) => ({
    //       title: level.locationName,
    //       dataIndex: level.id,
    //       key: level.id,
    //       render: (id: string, variant: any) => {
    //         const variantLevel = variant.inventory?.inventoryLevels?.find((lvl: any) => lvl.locationName === level.locationName);
    //         return <QuantityCell key={id} inventoryLevel={variantLevel} />;
    //       },
    //       width: `${Math.max(15, 50 / inventoryLevels.length)}%`,
    //       className: "!pl-8",
    //       onCell: () => ({
    //         className: "p-0 hover:bg-gray-50",
    //       }),
    //     })),
    //   ],
    // },

    {
      title: "",
      dataIndex: "",
      key: "",
      align: "center" as const,
      width: `${inventoryLevels.length == 1 ? 10 : 6}%`,
    },
  ];

  return (
    <div className="border-t border-gray-200">
      <div className="px-5 py-4">
        <h2 className="text-lg font-medium text-gray-600">Variants & Inventory</h2>
        <p className="mt-1 text-sm text-gray-500">Manage inventory for each variant across different locations</p>
      </div>

      <AppTable dataSource={variants} columns={tableColumns} className="custom-table" pagination={false} scrollY={6000} />

      {selectedVariant && <VariantDetailModal open={openVariantModal} selectedVariant={selectedVariant} toggle={toggleVariantModal} />}
    </div>
  );
}
