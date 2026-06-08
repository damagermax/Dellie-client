"use client";

import React, { useMemo, useRef, useState } from "react";
import { Button, Divider, Tag, message } from "antd";
import dayjs from "dayjs";
import relativeTime from "dayjs/plugin/relativeTime";
import { CalendarDays, CreditCard, FileText, Pencil, Plus, ReceiptText, Trash2, WalletCards } from "lucide-react";
import ExpenseFormModal from "@/components/expenses/ExpenseFormModel";
import PaymentFormModal from "@/components/payment/PaymentFormModel";
import PaymentView from "@/components/payment/PaymentView";
import PreviewImage from "@/components/ui/PreviewImage";
import { GoBack } from "@/components/ui/GoBack";
import { AppViewLoader } from "@/components/ui/AppViewLoader";
import { AccessDeniedView } from "@/components/ui/AccessDeniedView";
import useToggle from "@/hooks/UseToggle";
import { useAddExpenseAttachmentsMutation, useDeleteExpenseAttachmentMutation, useGetTransactionQuery } from "@/lib/redux/services";
import { formatDate } from "@/lib/dateUtils";
import { Expense, Payment, TransactionType } from "@/types/transaction";
import { usePermissions } from "@/hooks/usePermissions";
import { StorePermission } from "@/types/store-access";
dayjs.extend(relativeTime);

export default function ExpenseDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = React.use(params);
  const { ready, hasAnyPermission } = usePermissions();
  const [expenseModalOpen, toggleExpenseModal] = useToggle();
  const [paymentModalOpen, togglePaymentModal] = useToggle();
  const [paymentType, setPaymentType] = useState(TransactionType.PAYMENT);
  const attachmentInputRef = useRef<HTMLInputElement | null>(null);
  const canViewExpense = hasAnyPermission([
    StorePermission.PAYMENTS_VIEW,
    StorePermission.PAYMENTS_MANAGE,
    StorePermission.EXPENSES_VIEW,
    StorePermission.EXPENSES_MANAGE,
  ]);
  const canManageExpense = hasAnyPermission([StorePermission.PAYMENTS_MANAGE, StorePermission.EXPENSES_MANAGE]);

  const { data, isLoading, isError } = useGetTransactionQuery(id, { skip: !id || !ready || !canViewExpense, refetchOnMountOrArgChange: true });
  const [addAttachments, { isLoading: isUploading }] = useAddExpenseAttachmentsMutation();
  const [deleteAttachment, { isLoading: isDeletingAttachment }] = useDeleteExpenseAttachmentMutation();

  const expense = data as Expense | undefined;
  const currency = expense?.currency?.code || "";
  const attachments = expense?.attachments || [];
  const attachmentLimit = 4;
  const remainingAttachments = Math.max(attachmentLimit - attachments.length, 0);
  const totalAmount = Number(expense?.amount || 0);
  const totalPaidAmount =
    expense?.payments?.reduce((sum, tx: any) => {
      if (!tx) return sum;
      const amount = Number(tx.amount || 0);

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

  const balance = Number(expense?.balance ?? totalAmount - totalPaidAmount);
  const isOverPayment = balance < 0;
  const showWriteOff = balance > 0;
  const showRefund = balance <= 0;
  const lastPayment = expense?.payments?.[Math.max((expense?.payments?.length || 1) - 1, 0)];
  const progress = totalAmount > 0 ? (totalPaidAmount / totalAmount) * 100 : 0;

  const paymentStatus = useMemo(() => {
    if (balance <= 0) return "paid";
    if (totalPaidAmount > 0) return "partial";
    return "unpaid";
  }, [balance, totalPaidAmount]);

  if (!ready || (canViewExpense && isLoading)) return <AppViewLoader loading />;
  if (!canViewExpense) return <AccessDeniedView title="Expenses" description="You do not have permission to view this expense." />;
  if (isError || !expense) return <p className="px-8 py-10 text-sm text-red-600">This expense could not be loaded.</p>;

  const handleAttachmentUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(event.target.files || []).slice(0, remainingAttachments);
    event.target.value = "";

    if (!files.length) return;

    const formData = new FormData();
    files.forEach((file) => formData.append("attachments", file));

    try {
      await addAttachments({ id, data: formData }).unwrap();
      message.success("Attachment uploaded.");
    } catch {
      message.error("Attachment could not be uploaded.");
    }
  };

  const handleDeleteAttachment = async (key?: string) => {
    if (!key || isDeletingAttachment) return;

    try {
      await deleteAttachment({ id, key }).unwrap();
      message.success("Attachment removed.");
    } catch {
      message.error("Attachment could not be removed.");
    }
  };

  return (
    <div className="min-h-screen bg-[linear-gradient(180deg,#f8faff_0%,#eef2ff_45%,#f7f8fc_100%)]">
      {canManageExpense && <ExpenseFormModal open={expenseModalOpen} toggle={toggleExpenseModal} initialValues={expense} />}
      {paymentModalOpen && <PaymentFormModal type={paymentType} open={paymentModalOpen} toggle={togglePaymentModal} linkTransaction={{ id, rate: expense?.rate || 1, currencyId: expense?.currency?.id || "" }} />}

      <div className="flex min-h-screen flex-col bg-gray-50 lg:flex-row">
        <section className="min-w-0 flex-1 border-r border-gray-200 bg-white lg:w-[70%] lg:flex-none">
          <div className="border-b border-gray-200 bg-gradient-to-b from-white to-gray-50/70 px-4 pb-7 pt-5 md:px-8">
            <div className="flex flex-wrap items-start justify-between gap-5">
              <div className="flex w-full items-start gap-x-4 md:w-fit">
                <GoBack />
                <div className="min-w-0">
                  <div className="flex flex-wrap items-center gap-2">
                    <h1 className="text-2xl font-semibold tracking-normal text-gray-950">{expense.title || expense.note || "Expense"}</h1>
                    <Tag className="!m-0 !rounded-full !px-2" color={paymentStatus === "paid" ? "green" : paymentStatus === "partial" ? "gold" : "blue"}>
                      {paymentStatus}
                    </Tag>
                  </div>
                  <p className="mt-2 max-w-2xl text-sm text-gray-500">
                    Created {formatDate(expense.createdAt)} by {expense.createdBy?.name || "-"}
                    {expense.updatedAt ? ` · Updated ${formatDate(expense.updatedAt)}` : ""}
                  </p>
                </div>
              </div>

              <div className="flex flex-wrap gap-2">
                {canManageExpense && isOverPayment && (
                  <Button
                    size="middle"
                    type="default"
                    className=" !py-1 !border-2 !border-[#f7c855] !bg-white !font-semibold !text-black !shadow-none"
                    onClick={() => {
                      setPaymentType(TransactionType.ISSUE_CREDIT);
                      togglePaymentModal();
                    }}
                  >
                    Issue Credit
                  </Button>
                )}
                {canManageExpense && showWriteOff && (
                  <Button
                    type="default"
                    size="middle"
                    className="!py-1 !border-2 !border-[#f7c855] !bg-white !font-semibold !text-black !shadow-none"
                    onClick={() => {
                      setPaymentType(TransactionType.WRITE_OFF);
                      togglePaymentModal();
                    }}
                  >
                    Write Off
                  </Button>
                )}
                {canManageExpense && showWriteOff && (
                  <Button
                    size="middle"
                    type="primary"
                    className="!py-1 !bg-[#f7c855] !font-semibold !text-black !shadow-none"
                    onClick={() => {
                      setPaymentType(TransactionType.PAYMENT);
                      togglePaymentModal();
                    }}
                  >
                    Record Payment
                  </Button>
                )}
                {canManageExpense && (isOverPayment || showRefund) && (
                  <Button
                    size="middle"
                    type="primary"
                    className="!py-1 !bg-[#f7c855] !font-semibold !text-black !shadow-none"
                    onClick={() => {
                      setPaymentType(TransactionType.REFUND);
                      togglePaymentModal();
                    }}
                  >
                    Refund
                  </Button>
                )}
                {canManageExpense && <Button type="text" className="!bg-gray-200/80 " icon={<Pencil size={15} />} onClick={toggleExpenseModal} />}
              </div>
              {/* <div className="flex flex-wrap items-center gap-2">
                <Button type="primary" className="!border-2 !border-[#f7c855] !bg-white !font-semibold !text-black !shadow-none" icon={<CreditCard size={15} />} onClick={() => (setPaymentType(TransactionType.PAYMENT), togglePaymentModal())}>
                  Record Payment
                </Button>
                <Button type="primary" className="!bg-[#f7c855] !font-semibold !text-black !shadow-none" icon={<Pencil size={15} />} onClick={toggleExpenseModal}>
                  Edit
                </Button>
              </div> */}
            </div>
          </div>

          <div className="px-4 py-6 md:px-8">
            <div className="grid gap-4 sm:grid-cols-2">
              <IdentityPanel label="Description" title={expense.title || expense.note || "Expense"} description={expense.note || "No additional description provided"} />
              <IdentityPanel label="Contact" title={expense.contact?.displayName || expense.contact?.name || "Open Market"} description={expense.contact?.name || "No contact details provided"} />
            </div>

            <Divider className="!mt-6" />

            <div className="mt-5 grid grid-cols-2 sm:grid-cols-4">
              <Detail className="border-b border-r border-gray-200 pb-5 pr-5 sm:border-b-0 sm:pb-0" icon={<CalendarDays size={17} />} label="Date" value={formatDate(expense.date || expense.createdAt)} />
              <Detail className="border-b border-gray-200 pb-5 pl-5 sm:border-b-0 sm:border-r sm:pr-5 sm:pb-0" icon={<WalletCards size={17} />} label="Category" value={expense.category?.name || "Uncategorized"} />
              <Detail className="border-r border-gray-200 pr-5 pt-5 sm:pl-5 sm:pt-0" icon={<CreditCard size={17} />} label="Paid Amount" value={`${currency} ${totalPaidAmount.toLocaleString()}`} />
              <Detail className="pl-5 pt-5 sm:pt-0" icon={<ReceiptText size={17} />} label="Balance" value={`${currency} ${balance.toLocaleString()}`} />
            </div>

            <div className="mt-5 grid grid-cols-2 sm:grid-cols-4">
              <Detail className="border-b border-r border-gray-200 pb-5 pr-5 sm:border-b-0 sm:pb-0" icon={<FileText size={17} />} label="Total Expense" value={`${currency} ${totalAmount.toLocaleString()}`} />
              <Detail className="border-b border-gray-200 pb-5 pl-5 sm:border-b-0 sm:border-r sm:pr-5 sm:pb-0" icon={<WalletCards size={17} />} label="Last Payment" value={`${currency} ${Number(lastPayment?.amount || 0).toLocaleString() || "-"}`} />
              <Detail className="border-r border-gray-200 pr-5 pt-5 sm:pl-5 sm:pt-0" icon={<CalendarDays size={17} />} label="Last Payment Date" value={formatDate(lastPayment?.date)} />
              <Detail className="pl-5 pt-5 sm:pt-0" icon={<ReceiptText size={17} />} label="Progress" value={`${progress.toFixed(1)}%`} />
            </div>

            <div className="mt-5 hidden">
              <div className="mb-2 flex justify-between text-xs text-gray-500">
                <span>Payment Progress</span>
                <span>{progress.toFixed(1)}%</span>
              </div>
              {/* <div className="h-2 w-full rounded-full bg-gray-200">
                <div className="h-2 rounded-full bg-gradient-to-r from-emerald-500 to-green-500" style={{ width: `${Math.max(0, Math.min(progress, 100))}%` }} />
              </div> */}
            </div>
          </div>

          <Divider className="!m-0" />

          <div className="px-4 py-5 md:px-8">
            <div className="flex flex-wrap items-center justify-between gap-4">
              <h2 className="text-lg font-medium text-gray-950">Transactions</h2>
            </div>
          </div>

          <PaymentView payments={expense.payments as Payment[]} canManage={canManageExpense} />
        </section>

        <aside className="hidden w-full flex-col gap-4 bg-[#f7f8fd] px-4 pb-4 pt-5 lg:flex lg:w-[30%] lg:px-6 xl:sticky xl:top-0 xl:h-screen xl:overflow-y-auto">
          <div className="overflow-hidden bg-gray-100  ">
            <div className="border-b border-gray-200  p-4">
              <p className="text-lg font-medium text-gray-900">Attachments</p>
            </div>
            <div className="p-4">
              {canManageExpense && <input ref={attachmentInputRef} type="file" accept="image/*" multiple className="hidden" onChange={handleAttachmentUpload} />}

              {!attachments.length ? (
                <button
                  type="button"
                  onClick={() => attachmentInputRef.current?.click()}
                  disabled={isUploading || !canManageExpense}
                  className="flex min-h-[230px] w-full cursor-pointer flex-col items-center justify-center rounded-lg border border-solid border-gray-200 bg-gray-100 p-5 text-center transition hover:border-gray-300 hover:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-70"
                >
                  <div className="rounded-full bg-gray-200 p-5">
                    <ReceiptText className="text-gray-400" strokeWidth={0.8} size={30} />
                  </div>
                  <p className="mt-5 mb-1 text-sm text-gray-600">Upload a clear image of your receipt</p>
                  <p className="text-xs text-gray-400">You can add up to 4 images. JPG or PNG only.</p>
                </button>
              ) : (
                <div className="grid grid-cols-4 gap-3">
                  {attachments.map((item, index) => (
                    <div key={item.key || item.url || index} className="group h-fit overflow-hidden rounded-lg border border-gray-200 bg-white ">
                      <div className="relative aspect-square ">
                        <PreviewImage width={260} height={260} src={item.url} alt={`Expense attachment ${index + 1}`} />
                        {canManageExpense && (
                          <button
                            type="button"
                            disabled={isDeletingAttachment}
                            className="absolute right-2 top-2 rounded-full bg-white/90 p-1.5 text-gray-600 opacity-0 shadow-sm transition hover:text-red-500 group-hover:opacity-100 disabled:opacity-60"
                            onClick={() => handleDeleteAttachment(item.key)}
                            aria-label="Remove attachment"
                          >
                            <Trash2 size={14} />
                          </button>
                        )}
                        <div className="absolute hidden left-2 top-2 rounded-full bg-white/90 px-2 py-1 text-[11px] font-medium text-gray-700 shadow-sm">{index + 1}</div>
                      </div>
                    </div>
                  ))}

                  {canManageExpense && remainingAttachments > 0 && (
                    <button
                      type="button"
                      onClick={() => attachmentInputRef.current?.click()}
                      disabled={isUploading}
                      className="flex aspect-square w-full min-h-0 flex-col items-center justify-center rounded-lg border border-dashed border-gray-300 bg-gray-50  text-center transition hover:border-gray-950 hover:bg-white disabled:cursor-not-allowed disabled:opacity-70"
                    >
                      <div className="rounded-full bg-gray-200 p-1">
                        <Plus size={12} className="text-gray-500" />
                      </div>
                      <span className=" text-[13px] mt-1   text-gray-900">Add image</span>
                      <span className=" text-xs text-gray-500">
                        {remainingAttachments} slot{remainingAttachments === 1 ? "" : "s"} left
                      </span>
                    </button>
                  )}
                </div>
              )}
            </div>
          </div>
        </aside>
      </div>
    </div>
  );
}

function IdentityPanel({ label, title, description }: { label: string; title: string; description: string }) {
  return (
    <div>
      <p className="text-xs font-medium uppercase tracking-[0.16em] text-gray-400">{label}</p>
      <p className="mt-1 truncate text-lg font-medium text-gray-800">{title}</p>
      <p className="mt-1 text-sm text-gray-500">{description}</p>
    </div>
  );
}

function Detail({ icon, label, value, className = "" }: { icon: React.ReactNode; label: string; value: string; className?: string }) {
  return (
    <div className={`min-w-0 ${className}`}>
      <p className="text-xs font-medium uppercase tracking-[0.12em] text-gray-400">{label}</p>
      <div className="mt-1 flex items-start gap-2">
        <span className="mt-0.5 text-gray-400">{icon}</span>
        <p className="text-sm font-medium text-gray-900">{value || "-"}</p>
      </div>
    </div>
  );
}
