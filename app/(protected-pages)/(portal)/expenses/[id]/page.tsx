"use client";

import { BaseButton } from "@/components/ui/AppButtons";
import { Divider, Form } from "antd";
import ExpenseFormModal from "@/components/expenses/ExpenseFormModel";
import { useGetTransactionQuery } from "@/lib/redux/services";
import React, { useEffect, useState } from "react";
import { LuReceiptText } from "react-icons/lu";
import dayjs from "dayjs";
import relativeTime from "dayjs/plugin/relativeTime";
import { GoBack } from "@/components/ui/GoBack";
import PurchaseOrderExpenses from "@/components/purchase-orders/PurchaseOrderExpenses";
import { formatDate } from "@/lib/dateUtils";
import { Payment, Transaction, TransactionType } from "@/types/transaction";
import useToggle from "@/hooks/UseToggle";
import PaymentFormModal from "@/components/payment/PaymentFormModel";
import PaymentTable from "@/components/payment/PaymentTable";
import PaymentView from "@/components/payment/PaymentView";
dayjs.extend(relativeTime);

export default function ExpenseDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = React.use(params);

  const [expenseModalOpen, toggleExpenseModal] = useToggle();
  const [paymentModalOpen, togglePaymentModal] = useToggle();
  const [paymentType, setPaymentType] = useState(TransactionType.PAYMENT);

  const { data, isLoading } = useGetTransactionQuery(id, { skip: !id, refetchOnMountOrArgChange: true });

  const totalPaidAmount =
    data?.payments?.reduce((sum, tx: any) => {
      if (!tx) return sum;

      const amount = tx.amount ?? 0;

      switch (tx.type) {
        case TransactionType.PAYMENT:
          return sum + amount;

        case TransactionType.REFUND:
        case TransactionType.WRITE_OFF:
          return sum - amount;

        default:
          return sum;
      }
    }, 0) ?? 0;

  const balance = data?.balance ?? 0;

  const isOverPayment = balance < 0;
  const showRefund = balance === 0;
  const showWriteOff = balance > 0;

  const lastPayment = data?.payments?.[data.payments.length - 1];

  const totalAmount = data?.amount ?? 0;

  const progress = totalAmount > 0 ? (totalPaidAmount / totalAmount) * 100 : 0;

  return (
    <div className="pb-5  min-h-screen">
      <ExpenseFormModal open={expenseModalOpen} toggle={toggleExpenseModal} initialValues={data} />
      {paymentModalOpen && <PaymentFormModal type={paymentType} open={paymentModalOpen} toggle={togglePaymentModal} linkTransaction={{ id, rate: data?.rate!!, currencyId: data?.currency?.id!! }} />}

      <div className="  xl:flex  -lg:gap-x-6">
        <div className="xl:w-[75%] w-[100%] border min-h-screen  bg-white border-l-0  border-y-0 border-gray-200 ">
          <div className="pb-5 border-b   border-gray-200">
            <div className=" flex items-center justify-between px-8">
              <div className="flex gap-x-3 items-center">
                <GoBack />
                <h1 className=" pageTittle">{data?.note}</h1>
              </div>

              <div className=" flex gap-x-4">
                <BaseButton size="middle" label="Edit" type="default" classNames="!py-1" onClick={toggleExpenseModal} />
              </div>
            </div>

            <div className=" flex px-18  text-gray-500 items-center gap-x-2">
              <p>
                Created by <span>{data?.createdBy?.name}</span>
              </p>
              .
              <p>
                Created <span>{formatDate(data?.createdAt)}</span>
              </p>
              .
              <p>
                Last Updated <span>{formatDate(data?.createdAt)}</span>
              </p>
            </div>
          </div>

          <div className=" py-6   px-8">
            <div className="grid grid-cols-4 gap-5">
              <div className="grid gap-y-1">
                <p className="text-xs text-gray-500">Total Expense</p>
                <p className="font-medium">
                  {data?.currency?.code} {data?.amount?.toLocaleString()}
                </p>
              </div>
              <div className="grid gap-y-1">
                <p className="text-xs text-gray-500">Date</p>
                <p>{formatDate(data?.date || data?.createdAt)}</p>
              </div>

              <div className="grid gap-y-1">
                <p className="text-xs text-gray-500">Category</p>
                <p>{data?.category?.name || "Uncategorized"}</p>
              </div>

              <div className="grid gap-y-1">
                <p className="text-xs text-gray-500">Contact</p>
                <p>{data?.contact?.displayName || "Open Market"}</p>
              </div>

              <div className="grid gap-y-1">
                <p className="text-xs text-gray-500">Paid Amount</p>
                <p className="text-green-600 font-medium">
                  {data?.currency?.code} {totalPaidAmount?.toLocaleString()}
                </p>
              </div>

              <div className="grid gap-y-1">
                <p className="text-xs text-gray-500">Balance</p>
                <p className="text-red-500 font-medium">
                  {data?.currency?.code} {data?.balance?.toLocaleString()}
                </p>
              </div>

              <div className="grid gap-y-1">
                <p className="text-xs text-gray-500">Last Payment</p>
                <p>
                  {data?.currency?.code} {lastPayment?.amount?.toLocaleString()}
                </p>
              </div>
              <div className="grid gap-y-1">
                <p className="text-xs text-gray-500">Last Payment Date</p>
                <p>{formatDate(lastPayment?.date)}</p>
              </div>
            </div>
            <div className="mt-5">
              <div className="flex justify-between text-xs mb-1">
                <span>Payment Progress</span>
                <span>{progress?.toFixed(1)}%</span>
              </div>
              <div className="w-full bg-gray-200 h-2 rounded-full">
                <div className="bg-green-500 h-2 rounded-full" style={{ width: `${Math.max(0, Math.min(progress, 100))}%` }} />
              </div>
            </div>
          </div>

          <Divider className=" m-0! p-0!" />
          <div className="py-5 px-8">
            <div className=" flex justify-between items-center">
              <h2 className="text-lg ">Activity</h2>

              <div className=" flex gap-x-2">
                {isOverPayment && (
                  <BaseButton
                    size="middle"
                    type="default"
                    label="Issue Credit"
                    classNames="!py-1"
                    onClick={() => {
                      setPaymentType(TransactionType.ISSUE_CREDIT);
                      togglePaymentModal();
                    }}
                  />
                )}

                {showWriteOff && (
                  <BaseButton
                    type="default"
                    size="middle"
                    label="Write Off"
                    classNames="!py-1"
                    onClick={() => {
                      setPaymentType(TransactionType.WRITE_OFF);
                      togglePaymentModal();
                    }}
                  />
                )}

                {showWriteOff && (
                  <BaseButton
                    size="middle"
                    label="Record Payment"
                    classNames="!py-1"
                    onClick={() => {
                      setPaymentType(TransactionType.PAYMENT);
                      togglePaymentModal();
                    }}
                  />
                )}

                {(isOverPayment || showRefund) && (
                  <BaseButton
                    size="middle"
                    label="Refund"
                    classNames="!py-1"
                    onClick={() => {
                      setPaymentType(TransactionType.REFUND);
                      togglePaymentModal();
                    }}
                  />
                )}
              </div>
            </div>
          </div>
          <PaymentView payments={data?.payments as Payment[]} />
        </div>

        <div className=" bg-gray-50 pl-8   hidden lg:w-[25%] pt-5 pr-8 lg:mt-0 xl:flex flex-col  gap-2">
          <div className=" -bg-white  -border rounded-sm -border-gray-200 mb-5">
            <p className=" text-lg mb-3">Attachments</p>
            <div className="   border-solid  flex flex-col  cursor-pointer justify-center items-center text-center   bg-gray-100 rounded-lg p-5   w-full min-h-[230px]">
              <div className=" bg-gray-200 p-5 rounded-full">
                <LuReceiptText className="  text-gray-400" strokeWidth={0.8} size={30} />
              </div>
              <p className="text-sm text-gray-600 mt-5 mb-1">Upload a clear image of your receipt</p>
              <p className="text-xs text-gray-400">Make sure the image is clear and readable (JPG or PNG, up to 2MB)</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
