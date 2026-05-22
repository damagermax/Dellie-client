"use client";

import { valueType } from "antd/es/statistic/utils";
import ProductCardView from "./ProductCardView";
import ProductListView from "./ProductListView";
import ProductTable from "./ProductTable";

import { ProductQueryParams } from "@/types/product";

import { useGetProductsQuery } from "@/lib/redux/services";
import { AppViewLoader } from "@/components/ui/AppViewLoader";
import { AppNotFoundView } from "@/components/ui/AppNotFoundView";

interface ProductViewProps {
  view: valueType;
  query: ProductQueryParams;
}

export default function ProductView({ view, query }: ProductViewProps) {
  const { data: productData, isLoading: loadingProducts, error } = useGetProductsQuery(query);

  return (
    <section className="  h-[calc(100vh-12rem)]  ">
      <AppViewLoader loading={loadingProducts} />
      <AppNotFoundView dataLength={productData?.data?.length || 0} loading={loadingProducts} query={query} entity="Products" />

      {view === "card" && <ProductCardView products={productData?.data || []} />}
      {view === "list" && <ProductListView products={productData?.data || []} />}
      {view === "table" && <ProductTable products={productData?.data || []} />}
    </section>
  );
}
