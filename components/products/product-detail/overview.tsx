"use client";

import type { ReactNode } from "react";
import { FaBox, FaLayerGroup } from "react-icons/fa";
import { GrHistory } from "react-icons/gr";
import { ImBoxRemove } from "react-icons/im";

import { ProductVariantsTable } from "@/components/products/ProductVariantsTable";
import { ITEM_TYPE } from "@/components/products/ProductFormModal";
import { hasBundleComponents } from "@/lib/products/type-label";

import { BundleSection } from "./bundle-section";
import { OverviewSection } from "./overview-section";
import { TabLabel } from "./shared";
import type { DetailTab, ProductDetail } from "./types";

export function buildProductDetailTabs(
  product: ProductDetail | undefined,
  options: {
    canManageProduct: boolean;
    onEditProduct: () => void;
    enableTradePrice: boolean;
    renderBatchTable: (product: ProductDetail) => ReactNode;
    renderOrderHistory: (product: ProductDetail) => ReactNode;
  },
): DetailTab[] {
  if (!product) return [];

  if (product.hasVariants) {
    return [
      {
        key: "variants",
        label: <TabLabel icon={<FaLayerGroup />} text="Variants" />,
        children: <ProductVariantsTable variants={product.variants || []} />,
      },
    ];
  }

  const tabs: DetailTab[] = [
      {
        key: "overview",
        label: <TabLabel icon={<FaBox />} text="Overview" />,
        children: <OverviewSection product={product} canManageProduct={options.canManageProduct} onEditProduct={options.onEditProduct} enableTradePrice={options.enableTradePrice} />,
      },
  ];

  const batchCount = product.inventory?.batchCount ?? product.inventory?.batches?.length ?? 0;
  const historyCount = product.orderHistoryCount ?? product.orderHistory?.length ?? 0;

  if (product.type === ITEM_TYPE.STOCK && batchCount > 0) {
    tabs.push({
      key: "batches",
      label: <TabLabel icon={<ImBoxRemove />} text="Batches" />,
      children: options.renderBatchTable(product),
    });
  }

  if (hasBundleComponents(product)) {
    tabs.push({
      key: "components",
      label: <TabLabel icon={<FaLayerGroup />} text="Components" />,
      children: <BundleSection product={product} />,
    });
  }

  if (historyCount > 0) {
    tabs.push({
      key: "order-history",
      label: <TabLabel icon={<GrHistory />} text="Order History" />,
      children: options.renderOrderHistory(product),
    });
  }

  return tabs;
}
