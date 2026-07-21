"use client";

import { useMemo, useState } from "react";
import { useSearchParams } from "next/navigation";
import { AddButton, FloatingAddButton } from "@/components/ui/AppButtons";
import { AppSearch } from "@/components/ui/AppSearchInput";
import ExpenseFormModal from "@/components/expenses/ExpenseFormModel";

import useToggle from "@/hooks/UseToggle";
import ExpenseView from "@/components/expenses/expense-view/ExpenseView";
import { AppViewLoader } from "@/components/ui/AppViewLoader";
import { TransactionType } from "@/types/transaction";
import { AccessDeniedView } from "@/components/ui/AccessDeniedView";
import { usePermissions } from "@/hooks/usePermissions";
import { StorePermission } from "@/types/store-access";
import { ExpenseQueryParams } from "@/types/transaction";
import { ExpensesFilterDrawer } from "@/components/expenses/ExpensesFilterDrawer";
import { DesktopQuickFilterSegment } from "@/components/ui/DesktopQuickFilterSegment";

type ExpensesQuickFilter = "all" | "unpaid" | "paid" | "overdue";

export default function ExpensePage() {
  const { ready, hasPermission } = usePermissions();
  const searchParams = useSearchParams();
  const [openExpenseModal, toggleOpenExpenseModal] = useToggle();
  const [filterOpen, setFilterOpen] = useState(false);
  const initialQuery = useMemo<ExpenseQueryParams>(
    () => ({
      type: TransactionType.EXPENSE,
      page: 1,
      limit: 20,
      paymentStatus: readExpensePaymentStatus(searchParams.get("paymentStatus")),
      overdue: searchParams.get("overdue") === "true" ? true : undefined,
    }),
    [searchParams],
  );
  const [query, setQuery] = useState<ExpenseQueryParams>(initialQuery);
  const [draftFilters, setDraftFilters] = useState<ExpenseQueryParams>({ type: TransactionType.EXPENSE });
  const filterCount = Number(Boolean(query.status)) + Number(Boolean(query.categoryId)) + Number(Boolean(query.contactId)) + Number(Boolean(query.dateFrom || query.dateTo));
  const expensesQuickFilter: ExpensesQuickFilter | undefined =
    query.overdue && !query.paymentStatus
      ? "overdue"
      : query.paymentStatus === "unpaid" && !query.overdue
        ? "unpaid"
        : query.paymentStatus === "paid" && !query.overdue
          ? "paid"
          : !query.paymentStatus && !query.overdue
            ? "all"
            : undefined;

  const openFilters = () => {
    setDraftFilters({
      type: TransactionType.EXPENSE,
      status: query.status,
      categoryId: query.categoryId,
      contactId: query.contactId,
      dateFrom: query.dateFrom,
      dateTo: query.dateTo,
    });
    setFilterOpen(true);
  };

  const applyFilters = () => {
    setQuery((current) => ({
      ...current,
      status: draftFilters.status,
      categoryId: draftFilters.categoryId,
      contactId: draftFilters.contactId,
      dateFrom: draftFilters.dateFrom,
      dateTo: draftFilters.dateTo,
      page: 1,
    }));
    setFilterOpen(false);
  };

  const clearFilters = () => {
    setDraftFilters({ type: TransactionType.EXPENSE });
    setQuery((current) => ({
      ...current,
      status: undefined,
      categoryId: undefined,
      contactId: undefined,
      dateFrom: undefined,
      dateTo: undefined,
      page: 1,
    }));
  };

  if (!ready) return <AppViewLoader loading />;
  if (!hasPermission(StorePermission.EXPENSES_VIEW)) {
    return <AccessDeniedView title="Expenses" description="You do not have permission to view the expenses module." />;
  }

  return (
    <div>
      <div>
        <div className="">
          <h3 className="pageTittle px-4 md:px-8">Expenses</h3>

          <hr className=" border-gray-200/80" />
        </div>
      </div>

      <div className="flex w-full flex-col gap-4 px-4 py-5 md:flex-row md:items-center md:justify-between md:px-8 md:pb-8">
        <div className="flex w-full items-center gap-3 md:w-auto">
          <AppSearch placeholder="Search ..." onReset={() => setQuery((current) => ({ ...current, search: undefined, page: 1 }))} onSearchChange={(values) => setQuery((current) => ({ ...current, ...values, page: 1 }))} onFilterClick={openFilters} filterCount={filterCount} />
          <DesktopQuickFilterSegment<ExpensesQuickFilter>
            value={expensesQuickFilter}
            options={[
              { label: "All", value: "all" },
              { label: "Unpaid", value: "unpaid" },
              { label: "Paid", value: "paid" },
              { label: "Overdue", value: "overdue" },
            ]}
            onChange={(value) =>
              setQuery((current) => ({
                ...current,
                page: 1,
                paymentStatus: value === "unpaid" ? "unpaid" : value === "paid" ? "paid" : undefined,
                overdue: value === "overdue" ? true : undefined,
              }))
            }
          />
        </div>
        <div className="flex items-center gap-x-3">
          <div className="hidden md:block">
            <AddButton onClick={toggleOpenExpenseModal} label="New Expense " />
          </div>
        </div>
      </div>

      {/* 
      <div className=" hidden mb-5 grid grid-cols-3 border-y border-solid border-gray-100 px-8 bg-gray-50 py-5">
        <div>
          <p className=" text-gray-500">Total</p>
          <p className=" text-lg">GHS {data?.total?.toLocaleString()}</p>
        </div>

        <div>
          <p className=" text-gray-500">Paid</p>
          <p className=" text-lg">GHS {data?.paid?.toLocaleString()}</p>
        </div>

        <div>
          <p className=" text-gray-500">To be paid</p>
          <p className=" text-lg">GHS {data?.toBePaid?.toLocaleString()}</p>
        </div>
      </div> */}

      <ExpenseView query={query} onQueryChange={setQuery} />
      <ExpensesFilterDrawer open={filterOpen} filters={draftFilters} onChange={(values) => setDraftFilters((prev) => ({ ...prev, ...values }))} onClose={() => setFilterOpen(false)} onApply={applyFilters} onClear={clearFilters} />

      {openExpenseModal && <ExpenseFormModal open={openExpenseModal} toggle={toggleOpenExpenseModal} />}
      <FloatingAddButton onClick={toggleOpenExpenseModal} label="New Expense" />
    </div>
  );
}

function readExpensePaymentStatus(value: string | null): "paid" | "unpaid" | undefined {
  return value === "paid" || value === "unpaid" ? value : undefined;
}
