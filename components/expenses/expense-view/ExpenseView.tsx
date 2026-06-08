import { Expense, ExpenseQueryParams } from "@/types/transaction";

import { useGetExpensesQuery, useDeleteExpenseMutation } from "@/lib/redux/services";
import useToggle from "@/hooks/UseToggle";
import { useState } from "react";
import { AppViewLoader } from "@/components/ui/AppViewLoader";
import { AppNotFoundView } from "@/components/ui/AppNotFoundView";
import AppPaginationFooter from "@/components/ui/AppPaginationFooter";
import MobileInfiniteScrollFooter from "@/components/ui/MobileInfiniteScrollFooter";
import MobileListShimmer from "@/components/ui/MobileListShimmer";
import ExpenseFormModal from "../ExpenseFormModel";
import ExpenseTable from "./ExpenseTable";
import ExpensesMobileList from "../ExpensesMobileList";
import { useMobileInfiniteList } from "@/hooks/useMobileInfiniteList";

export interface ExpenseViewItemAction {
  openEditModal: (expense: Expense) => void;
  onItemClick: (expense: Expense) => void;
  onDelete: (id: string) => void;
}

interface ExpenseViewProps {
  query: ExpenseQueryParams;
  onQueryChange: (query: ExpenseQueryParams | ((current: ExpenseQueryParams) => ExpenseQueryParams)) => void;
}

export default function ExpenseView({ query, onQueryChange }: ExpenseViewProps) {
  const [deleteExpense, { isLoading: isDeleting }] = useDeleteExpenseMutation();

  const [isEditModalOpen, toggleEditModal] = useToggle();
  const [, toggleDetailDrawer] = useToggle();

  const [selectedExpense, setSelectedExpense] = useState<Expense>();

  const { data: expensesData, isLoading: loadingExpenses, isFetching } = useGetExpensesQuery(query, { refetchOnMountOrArgChange: true });
  const meta = expensesData?.meta;
  const mobileList = useMobileInfiniteList({ query, response: expensesData, isFetching, setQuery: onQueryChange });

  const handleEditTExpense = (expense: Expense) => {
    setSelectedExpense(expense);
    toggleEditModal();
  };

  const handleItemSelect = (expense: Expense) => {
    setSelectedExpense(expense);
    toggleDetailDrawer();
  };

  const handleDeleteExpense = async (expenseId: string) => {
    if (!isDeleting) await deleteExpense(expenseId);
  };

  return (
    <>
      <div className="hidden md:block">
        <AppViewLoader loading={loadingExpenses} />
      </div>

      <AppNotFoundView dataLength={expensesData?.data?.length || 0} loading={loadingExpenses} query={query} entity="Expenses" />

      <div className="hidden md:block">
        <ExpenseTable
          onItemClick={handleItemSelect}
          expenses={expensesData?.data || []}
          onDelete={handleDeleteExpense}
          openEditModal={handleEditTExpense}
          pagination={false}
        />
        <AppPaginationFooter entity="expenses" dataLength={expensesData?.data?.length || 0} meta={meta} page={expensesData?.page || query.page} limit={expensesData?.limit || query.limit} total={expensesData?.total} onChange={(page, limit) => onQueryChange((current) => ({ ...current, page, limit }))} />
      </div>
      {loadingExpenses ? <MobileListShimmer showAvatar={false} /> : <ExpensesMobileList expenses={mobileList.items} onDelete={handleDeleteExpense} openEditModal={handleEditTExpense} />}
      <MobileInfiniteScrollFooter entity="expenses" dataLength={mobileList.items.length} hasNextPage={mobileList.hasNextPage} isFetching={isFetching && !loadingExpenses} sentinelRef={mobileList.sentinelRef} onLoadMore={mobileList.loadNextPage} />

      {isEditModalOpen && <ExpenseFormModal open={isEditModalOpen} toggle={toggleEditModal} initialValues={selectedExpense} />}
    </>
  );
}
