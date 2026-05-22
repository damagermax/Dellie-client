import { ExpenseCategory, UpdateExpenseCategoryInput, ExpenseQueryParams } from "@/types/transaction";

import { useGetExpenseCategoriesQuery, useUpdateExpenseCategoryMutation, useDeleteExpenseCategoryMutation } from "@/lib/redux/services";
import useToggle from "@/hooks/UseToggle";
import { useState } from "react";
import { AppViewLoader } from "@/components/ui/AppViewLoader";
import { AppNotFoundView } from "@/components/ui/AppNotFoundView";
import ExpenseCategoryFormModal from "../ExpenseCategoryFormModal";
import ExpenseCategoryTable from "./ExpenseCategoryTable";

export interface ExpenseCategoryViewItemAction {
  openEditModal: (expenseCategory: ExpenseCategory) => void;
  onDelete: (id: string) => void;
  onToggleLock: (id: string, isLocked: boolean) => void;
}

interface ExpenseCategoryViewProps {
  query: ExpenseQueryParams;
}

export default function ExpenseCategoryView({ query }: ExpenseCategoryViewProps) {
  const [updateExpenseCategory, { isLoading: isUpdating }] = useUpdateExpenseCategoryMutation();
  const [deleteExpenseCategory, { isLoading: isDeleting }] = useDeleteExpenseCategoryMutation();

  const [isEditModalOpen, toggleEditModal] = useToggle();

  const [selectedExpenseCategory, setSelectedExpenseCategory] = useState<ExpenseCategory>();

  const { data: expenseCategoriesData, isLoading: loadingExpenseCategories } = useGetExpenseCategoriesQuery(query, { refetchOnMountOrArgChange: true });

  const handleEditTExpenseCategory = (expenseCategory: ExpenseCategory) => {
    setSelectedExpenseCategory(expenseCategory);
    toggleEditModal();
  };

  const handleToggleLockExpenseCategory = async (expenseId: string, isLocked: boolean) => {
    !isUpdating && (await updateExpenseCategory({ id: expenseId, isLocked } as UpdateExpenseCategoryInput));
  };

  const handleDeleteExpenseCategory = async (expenseId: string) => {
    !isDeleting && (await deleteExpenseCategory(expenseId));
  };

  return (
    <>
      <AppViewLoader loading={loadingExpenseCategories} />

      <AppNotFoundView dataLength={expenseCategoriesData?.data?.length || 0} loading={loadingExpenseCategories} query={query} entity="Expense Category" />

      <ExpenseCategoryTable expenseCategories={expenseCategoriesData?.data || []} onDelete={handleDeleteExpenseCategory} onToggleLock={handleToggleLockExpenseCategory} openEditModal={handleEditTExpenseCategory} />

      <ExpenseCategoryFormModal open={isEditModalOpen} toggle={toggleEditModal} initialValues={selectedExpenseCategory} />
    </>
  );
}
