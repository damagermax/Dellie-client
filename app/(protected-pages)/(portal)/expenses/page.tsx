"use client";

import { AddButton } from "@/components/ui/AppButtons";
import { AppSearch } from "@/components/ui/AppSearchInput";
import AppViewSegments from "@/components/ui/AppViewSegments";
import ExpenseFormModal from "@/components/expenses/ExpenseFormModel";

import useToggle from "@/hooks/UseToggle";
import ExpenseView from "@/components/expenses/expense-view/ExpenseView";
import { TransactionType } from "@/types/transaction";
import { Button } from "antd";
import { LuSettings } from "react-icons/lu";
import { PiChartLineBold } from "react-icons/pi";

export default function ExpensePage() {
  const [openExpenseModal, toggleOpenExpenseModal] = useToggle();

  return (
    <div>
      <div>
        <div className="">
          <h3 className=" px-8 pageTittle ">Expenses</h3>

          <hr className=" border-gray-200/80" />
        </div>
      </div>

      <div className="px-8 pt-5  pb-8 flex justify-between w-full">
        <div className="flex gap-x-5">
          <AppSearch placeholder="Search ..." />
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

      <ExpenseView query={{ type: TransactionType.EXPENSE }} />

      {openExpenseModal && <ExpenseFormModal open={openExpenseModal} toggle={toggleOpenExpenseModal} />}
    </div>
  );
}
