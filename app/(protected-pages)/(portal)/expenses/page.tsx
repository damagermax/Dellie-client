"use client";

import { AddButton } from "@/components/ui/AppButtons";
import { AppSearch } from "@/components/ui/AppSearchInput";
import ExpenseFormModal from "@/components/expenses/ExpenseFormModel";

import useToggle from "@/hooks/UseToggle";
import ExpenseView from "@/components/expenses/expense-view/ExpenseView";
import { AppViewLoader } from "@/components/ui/AppViewLoader";
import { TransactionType } from "@/types/transaction";
import { Button } from "antd";
import { LuSettings } from "react-icons/lu";
import { AccessDeniedView } from "@/components/ui/AccessDeniedView";
import { usePermissions } from "@/hooks/usePermissions";
import { StorePermission } from "@/types/store-access";
import { ExpenseQueryParams } from "@/types/transaction";
import { useState } from "react";

export default function ExpensePage() {
  const { ready, hasPermission } = usePermissions();
  const [openExpenseModal, toggleOpenExpenseModal] = useToggle();
  const [query, setQuery] = useState<ExpenseQueryParams>({ type: TransactionType.EXPENSE, page: 1, limit: 20 });

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

      <div className="flex w-full flex-col gap-4 px-4 py-5 md:flex-row md:justify-between md:px-8 md:pb-8">
        <div className="flex gap-x-5">
          <AppSearch placeholder="Search ..." onReset={() => setQuery({ type: TransactionType.EXPENSE, page: 1, limit: 20 })} onSearchChange={(values) => setQuery((current) => ({ ...current, ...values, page: 1 }))} />
          {/* <AppViewSegments view={"table"} onChange={(view) => console.log(view)} /> */}
        </div>
        <div className="flex items-center gap-x-3">
          <AddButton onClick={toggleOpenExpenseModal} label="New Expense " />
          {/* <Button shape="circle" title="report">
            <PiChartLineBold className="!text-gray-600" />
          </Button> */}
          <Button shape="circle" title="settings">
            <LuSettings className="!text-gray-600" />
          </Button>
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

      {openExpenseModal && <ExpenseFormModal open={openExpenseModal} toggle={toggleOpenExpenseModal} />}
    </div>
  );
}
