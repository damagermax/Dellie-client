import { ExpenseQueryParams } from "@/types/transaction";

import { useGetExpensesQuery } from "@/lib/redux/services";
import { AppViewLoader } from "@/components/ui/AppViewLoader";
import { AppNotFoundView } from "@/components/ui/AppNotFoundView";
import AppPaginationFooter from "@/components/ui/AppPaginationFooter";
import MobileInfiniteScrollFooter from "@/components/ui/MobileInfiniteScrollFooter";
import MobileListShimmer from "@/components/ui/MobileListShimmer";
import ExpenseTable from "./ExpenseTable";
import ExpensesMobileList from "../ExpensesMobileList";
import { useMobileInfiniteList } from "@/hooks/useMobileInfiniteList";

interface ExpenseViewProps {
  query: ExpenseQueryParams;
  onQueryChange: (query: ExpenseQueryParams | ((current: ExpenseQueryParams) => ExpenseQueryParams)) => void;
}

export default function ExpenseView({ query, onQueryChange }: ExpenseViewProps) {
  const { data: expensesData, isLoading: loadingExpenses, isFetching } = useGetExpensesQuery(query, { refetchOnMountOrArgChange: true });
  const meta = expensesData?.meta;
  const mobileList = useMobileInfiniteList({ query, response: expensesData, isFetching, setQuery: onQueryChange });

  return (
    <>
      <div className="hidden md:block">
        <AppViewLoader loading={loadingExpenses} />
      </div>

      <AppNotFoundView dataLength={expensesData?.data?.length || 0} loading={loadingExpenses} query={query} entity="Expenses" />

      <div className="hidden md:block">
        <ExpenseTable expenses={expensesData?.data || []} pagination={false} />
        <AppPaginationFooter entity="expenses" dataLength={expensesData?.data?.length || 0} meta={meta} page={expensesData?.page || query.page} limit={expensesData?.limit || query.limit} total={expensesData?.total} onChange={(page, limit) => onQueryChange((current) => ({ ...current, page, limit }))} />
      </div>
      {loadingExpenses ? <MobileListShimmer showAvatar={false} /> : <ExpensesMobileList expenses={mobileList.items} />}
      <MobileInfiniteScrollFooter entity="expenses" dataLength={mobileList.items.length} hasNextPage={mobileList.hasNextPage} isFetching={isFetching && !loadingExpenses} sentinelRef={mobileList.sentinelRef} onLoadMore={mobileList.loadNextPage} />
    </>
  );
}
