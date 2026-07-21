"use client";

import Link from "next/link";
import { Tag } from "antd";
import { formatDate } from "@/lib/dateUtils";
import { Expense } from "@/types/transaction";

interface ExpensesMobileListProps {
  expenses: Expense[];
}

const mobileTagClassName = "!m-0 !rounded-full !border-0 !px-1.5 !py-0 !text-[10px] !leading-5";

export default function ExpensesMobileList({ expenses }: ExpensesMobileListProps) {
  return (
    <div className="md:hidden">
      {expenses.map((expense) => {
        const title = expense.note || expense.title || expense.category?.name || "Expense";
        const vendor = expense.contact?.displayName || expense.contact?.name || "Open Market";
        const currency = expense.currency?.code || "";
        const isPaid = Number(expense.balance || 0) <= 0;

        return (
          <div key={expense.id} className=" gap-3 border-b border-gray-100 px-4 py-4">
            <Link href={`/expenses/${expense.id}`} className="min-w-0 flex-1">
              <div className="flex items-start justify-between gap-3">
                <div className="min-w-0">
                  <p className="line-clamp-1 text-[15px] font-semibold capitalize text-gray-900">{title}</p>
                </div>
                <p className="shrink-0 text-sm font-semibold text-gray-900">
                  {currency} {Number(expense.amount || 0).toLocaleString(undefined, { minimumFractionDigits: 2 })}
                </p>
              </div>
              <div className="mt-2 flex flex-wrap items-center gap-2 text-xs text-gray-500">
                <span className="max-w-[140px] truncate rounded-full bg-gray-100 px-1.5 py-0.5 text-[10px] leading-5 text-gray-600">{expense.category?.name || "Uncategorized"}</span>
                <Tag className={mobileTagClassName} color={isPaid ? "green" : "gold"}>
                  {isPaid ? "Paid" : "Open"}
                </Tag>
              </div>
            </Link>
            <div className="flex mt-1 items-start text-sm text-gray-500 justify-between">
              <div className=" flex items-center gap-2">
                <p className="truncate  ">{vendor}</p> | <span>{formatDate(expense.date)}</span>
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
}
