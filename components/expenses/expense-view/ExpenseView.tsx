import { Expense, UpdateExpenseInput, ExpenseQueryParams } from "@/types/transaction";

import { useGetExpensesQuery, useUpdateExpenseMutation, useDeleteExpenseMutation } from "@/lib/redux/services";
import useToggle from "@/hooks/UseToggle";
import { useState } from "react";
import { AppViewLoader } from "@/components/ui/AppViewLoader";
import { AppNotFoundView } from "@/components/ui/AppNotFoundView";
import ExpenseFormModal from "../ExpenseFormModel";
import ExpenseTable from "./ExpenseTable";

export interface ExpenseViewItemAction {
  openEditModal: (expense: Expense) => void;
  onItemClick: (expense: Expense) => void;
  onDelete: (id: string) => void;
}

interface ExpenseViewProps {
  query: ExpenseQueryParams;
}

export default function ExpenseView({ query }: ExpenseViewProps) {
  const [deleteExpense, { isLoading: isDeleting }] = useDeleteExpenseMutation();

  const [isEditModalOpen, toggleEditModal] = useToggle();
  const [isDetailDrawerOpen, toggleDetailDrawer] = useToggle();

  const [selectedExpense, setSelectedExpense] = useState<Expense>();

  const { data: expensesData, isLoading: loadingExpenses } = useGetExpensesQuery(query, { refetchOnMountOrArgChange: true });

  const handleEditTExpense = (expense: Expense) => {
    setSelectedExpense(expense);
    toggleEditModal();
  };

  const handleItemSelect = (expense: Expense) => {
    setSelectedExpense(expense);
    toggleDetailDrawer();
  };

  const handleDeleteExpense = async (expenseId: string) => {
    !isDeleting && (await deleteExpense(expenseId));
  };

  return (
    <>
      <AppViewLoader loading={loadingExpenses} />

      <AppNotFoundView dataLength={expensesData?.data?.length || 0} loading={loadingExpenses} query={query} entity="Expenses" />

      <ExpenseTable onItemClick={handleItemSelect} expenses={expensesData?.data || []} onDelete={handleDeleteExpense} openEditModal={handleEditTExpense} />

      {isEditModalOpen && <ExpenseFormModal open={isEditModalOpen} toggle={toggleEditModal} initialValues={selectedExpense} />}
    </>
  );
}
