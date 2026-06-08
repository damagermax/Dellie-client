"use client";

import Link from "next/link";
import { Tag } from "antd";
import { ActionDropdown } from "@/components/ui/ActionDropdown";
import { formatDate } from "@/lib/dateUtils";
import { Expense } from "@/types/transaction";

interface ExpensesMobileListProps {
  expenses: Expense[];
  onDelete: (id: string) => void;
  openEditModal: (expense: Expense) => void;
}

export default function ExpensesMobileList({ expenses, onDelete, openEditModal }: ExpensesMobileListProps) {
  return (
    <div className="md:hidden">
      {expenses.map((expense) => {
        const title = expense.note || expense.title || expense.category?.name || "Expense";
        const vendor = expense.contact?.displayName || expense.contact?.name || "Open Market";
        const currency = expense.currency?.code || "";
        const isPaid = Number(expense.balance || 0) <= 0;

        return (
          <div key={expense.id} className="flex items-start gap-3 border-b border-gray-100 px-4 py-4">
            <Link href={`/expenses/${expense.id}`} className="min-w-0 flex-1">
              <div className="flex items-start justify-between gap-3">
                <div className="min-w-0">
                  <p className="line-clamp-1 text-[15px] font-semibold capitalize text-gray-900">{title}</p>
                  <p className="mt-1 truncate text-sm text-gray-500">{vendor}</p>
                </div>
                <p className="shrink-0 text-sm font-semibold text-gray-900">
                  {currency} {Number(expense.amount || 0).toLocaleString(undefined, { minimumFractionDigits: 2 })}
                </p>
              </div>
              <div className="mt-3 flex flex-wrap items-center gap-2 text-xs text-gray-500">
                <span>{formatDate(expense.date)}</span>
                <span>{expense.category?.name || "Uncategorized"}</span>
                <Tag className="!m-0 !rounded-full !px-2" color={isPaid ? "green" : "gold"}>
                  {isPaid ? "Paid" : "Open"}
                </Tag>
              </div>
            </Link>
            <ActionDropdown openEditModal={() => openEditModal(expense)} onDelete={() => onDelete(expense.id || "")} />
          </div>
        );
      })}
    </div>
  );
}
