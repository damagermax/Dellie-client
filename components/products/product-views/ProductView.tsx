"use client";

import { valueType } from "antd/es/statistic/utils";
import ProductCardView from "./ProductCardView";
import ProductListView from "./ProductListView";
import ProductTable from "./ProductTable";
import ProductsMobileList from "./ProductsMobileList";

import { ProductQueryParams } from "@/types/product";

import { useGetProductsQuery } from "@/lib/redux/services";
import { AppViewLoader } from "@/components/ui/AppViewLoader";
import { AppNotFoundView } from "@/components/ui/AppNotFoundView";
import AppPaginationFooter from "@/components/ui/AppPaginationFooter";
import MobileInfiniteScrollFooter from "@/components/ui/MobileInfiniteScrollFooter";
import MobileListShimmer from "@/components/ui/MobileListShimmer";
import { useMobileInfiniteList } from "@/hooks/useMobileInfiniteList";
import { Alert } from "antd";

interface ProductViewProps {
  view: valueType;
  query: ProductQueryParams;
  onQueryChange: (query: ProductQueryParams | ((current: ProductQueryParams) => ProductQueryParams)) => void;
}

export default function ProductView({ view, query, onQueryChange }: ProductViewProps) {
  const { data: productData, isLoading: loadingProducts, isFetching, isError, refetch } = useGetProductsQuery(query);
  const items = productData?.data || [];
  const mobileList = useMobileInfiniteList({ query, response: productData, isFetching, setQuery: onQueryChange });
  const handlePageChange = (nextPage: number, nextLimit: number) => {
    onQueryChange((current) => ({ ...current, page: nextPage, limit: nextLimit }));
  };

  return (
    <section className="  h-[calc(100vh-12rem)]  ">
      <div className="hidden md:block">
        <AppViewLoader loading={loadingProducts} />
      </div>
      <AppNotFoundView dataLength={items.length} loading={loadingProducts} query={query} entity="Products" />
      {isError && <Alert className="mx-4 md:mx-8" type="error" showIcon message="Products could not be loaded" action={<button type="button" className="font-medium text-red-700" onClick={() => refetch()}>Retry</button>} />}

      {!isError && (loadingProducts ? <MobileListShimmer /> : <ProductsMobileList products={mobileList.items} />)}
      <MobileInfiniteScrollFooter entity="products" dataLength={mobileList.items.length} hasNextPage={mobileList.hasNextPage} isFetching={isFetching && !loadingProducts} sentinelRef={mobileList.sentinelRef} onLoadMore={mobileList.loadNextPage} />
      <div className="hidden md:block">
        {view === "card" && <ProductCardView products={items} />}
        {view === "list" && <ProductListView products={items} />}
        {view === "table" && <ProductTable products={items} pagination={false} />}
        <AppPaginationFooter entity="products" dataLength={items.length} meta={productData?.meta} page={productData?.page || query.page} limit={productData?.limit || query.limit} total={productData?.total} onChange={handlePageChange} />
      </div>
    </section>
  );
}
