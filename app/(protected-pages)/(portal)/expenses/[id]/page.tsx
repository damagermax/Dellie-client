"use client";

import React, { useMemo, useState } from "react";
import { Button, Divider, Modal, Tag, message } from "antd";
import dayjs from "dayjs";
import relativeTime from "dayjs/plugin/relativeTime";
import { Paperclip, Pencil, XCircle } from "lucide-react";
import ExpenseFormModal from "@/components/expenses/ExpenseFormModel";
import ExpenseAttachmentsModal from "@/components/expenses/ExpenseAttachmentsModal";
import PaymentFormModal from "@/components/payment/PaymentFormModel";
import PaymentView from "@/components/payment/PaymentView";
import EntityAuditTimeline from "@/components/audit/EntityAuditTimeline";
import { GoBack } from "@/components/ui/GoBack";
import { AppViewLoader } from "@/components/ui/AppViewLoader";
import { AccessDeniedView } from "@/components/ui/AccessDeniedView";
import ResponsiveActionMenu from "@/components/ui/ResponsiveActionMenu";
import { DropdownItemLabel } from "@/components/ui/ActionDropdown";
import useToggle from "@/hooks/UseToggle";
import { useAddExpenseAttachmentsMutation, useDeleteExpenseAttachmentMutation, useDeleteExpenseMutation, useGetTransactionQuery } from "@/lib/redux/services";
import { formatDate } from "@/lib/dateUtils";
import { Expense, Payment, TransactionType } from "@/types/transaction";
import { usePermissions } from "@/hooks/usePermissions";
import { StorePermission } from "@/types/store-access";
import { useSelector } from "react-redux";
import { RootState } from "@/lib/store";
import { useRouter } from "next/navigation";
dayjs.extend(relativeTime);

export default function ExpenseDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = React.use(params);
  const router = useRouter();
  const { ready, hasAnyPermission } = usePermissions();
  const [expenseModalOpen, toggleExpenseModal] = useToggle();
  const [paymentModalOpen, togglePaymentModal] = useToggle();
  const [attachmentsOpen, toggleAttachmentsOpen] = useToggle();
  const [cancelConfirmOpen, setCancelConfirmOpen] = useState(false);
  const [paymentType, setPaymentType] = useState(TransactionType.PAYMENT);
  const canViewExpense = hasAnyPermission([StorePermission.PAYMENTS_VIEW, StorePermission.PAYMENTS_MANAGE, StorePermission.EXPENSES_VIEW, StorePermission.EXPENSES_MANAGE]);
  const canManageExpense = hasAnyPermission([StorePermission.PAYMENTS_MANAGE, StorePermission.EXPENSES_MANAGE]);
  const featureSettings = useSelector((state: RootState) => state.currentUser.storeSettings.features);

  const { data, isLoading, isError } = useGetTransactionQuery(id, { skip: !id || !ready || !canViewExpense, refetchOnMountOrArgChange: true });
  const [addAttachments, { isLoading: isUploading }] = useAddExpenseAttachmentsMutation();
  const [deleteAttachment, { isLoading: isDeletingAttachment }] = useDeleteExpenseAttachmentMutation();
  const [deleteExpense, { isLoading: isCancelling }] = useDeleteExpenseMutation();

  const expense = data as Expense | undefined;
  const currency = expense?.currency?.code || "";
  const expenseLinkTransaction = expense
    ? {
        id,
        rate: expense.rate || 1,
        currencyId: expense.currency?.id || "",
        type: TransactionType.EXPENSE,
      }
    : undefined;
  const attachments = expense?.attachments || [];
  const totalAmount = Number(expense?.amount || 0);
  const totalPaidAmount =
    expense?.payments?.reduce<number>((sum, tx) => {
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
  const canUseRefunds = featureSettings?.refundPaymentsEnabled !== false;
  const canUseWriteOffs = featureSettings?.writeOffPaymentsEnabled !== false;
  const paymentStatus = useMemo(() => {
    if (balance <= 0) return "paid";
    if (totalPaidAmount > 0) return "partial";
    return "unpaid";
  }, [balance, totalPaidAmount]);

  if (!ready || (canViewExpense && isLoading)) return <AppViewLoader loading />;
  if (!canViewExpense) return <AccessDeniedView title="Expenses" description="You do not have permission to view this expense." />;
  if (isError || !expense) return <p className="px-8 py-10 text-sm text-red-600">This expense could not be loaded.</p>;

  const handleAttachmentUpload = async (files: File[]) => {
    if (!files.length) return;

    const formData = new FormData();
    files.forEach((file) => formData.append("attachments", file));
    await addAttachments({ id, data: formData }).unwrap();
  };

  const handleDeleteAttachment = async (key?: string) => {
    if (!key || isDeletingAttachment) return;
    await deleteAttachment({ id, key }).unwrap();
  };

  const handleCancelExpense = async () => {
    try {
      await deleteExpense(id).unwrap();
      message.success("Expense cancelled.");
      router.push("/expenses");
    } catch {
      message.error("Expense could not be cancelled.");
    }
  };

  const headerActionItems = canManageExpense
    ? [
        {
          key: "edit",
          label: <DropdownItemLabel icon={<Pencil size={15} />} text="Edit" />,
          onClick: toggleExpenseModal,
        },
        {
          key: "attachment",
          label: <DropdownItemLabel icon={<Paperclip size={15} />} text="Attachment" />,
          onClick: toggleAttachmentsOpen,
        },
        {
          key: "cancel",
          label: <DropdownItemLabel icon={<XCircle size={15} />} text="Cancel" danger />,
          danger: true,
          onClick: () => setCancelConfirmOpen(true),
        },
      ]
    : [];

  return (
    <div className="min-h-screen bg-[linear-gradient(180deg,#f8faff_0%,#eef2ff_45%,#f7f8fc_100%)]">
      {canManageExpense && <ExpenseFormModal open={expenseModalOpen} toggle={toggleExpenseModal} initialValues={expense} />}
      {paymentModalOpen && <PaymentFormModal type={paymentType} open={paymentModalOpen} toggle={togglePaymentModal} linkTransaction={expenseLinkTransaction} />}
      <ExpenseAttachmentsModal
        open={attachmentsOpen}
        toggle={toggleAttachmentsOpen}
        expenseId={expense.id || id}
        attachments={attachments}
        canManage={canManageExpense}
        isUploading={isUploading}
        isDeleting={isDeletingAttachment}
        onUpload={handleAttachmentUpload}
        onDelete={handleDeleteAttachment}
      />

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
                </div>
              </div>

              <div className="flex flex-wrap gap-2">
                {/* {canManageExpense && isOverPayment && (
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
                )} */}
                {canManageExpense && showWriteOff && canUseWriteOffs && (
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
                {canManageExpense && (isOverPayment || showRefund) && canUseRefunds && (
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
                {canManageExpense && <ResponsiveActionMenu items={headerActionItems} title="Expense Actions" />}
              </div>
            </div>
          </div>

          <div id="expense-overview" className="scroll-mt-14 px-4 py-6 md:px-8">
            <div className="grid gap-4 sm:grid-cols-2">
              <IdentityPanel label="Description" title={expense.title || expense.note || "Expense"} description={""} />
              <IdentityPanel label="Contact" title={expense.contact?.displayName || expense.contact?.name || "Open Market"} description={""} />
            </div>

            <Divider className="!mt-2" />

            <div className="mt-5 grid grid-cols-2 sm:grid-cols-3">
              <Detail className="border-r border-gray-200 pr-5" label="Date" value={formatDate(expense.date || expense.createdAt)} />
              <Detail className="pl-5 sm:border-r sm:pr-5" label="Category" value={expense.category?.name || "Uncategorized"} />
              <Detail className="col-span-2 mt-5 border-t border-gray-200 pt-5 sm:col-span-1 sm:mt-0 sm:border-t-0 sm:pl-5 sm:pt-0" label="Total Expense" value={`${currency} ${totalAmount.toLocaleString()}`} />
            </div>
          </div>

          <Divider className="!m-0" />

          <div id="expense-transactions" className="scroll-mt-14 px-4 py-5 md:px-8">
            <div className="flex flex-wrap items-center justify-between gap-4">
              <h2 className="text-lg font-medium text-gray-950">Transactions</h2>
            </div>
          </div>

          <PaymentView payments={expense.payments as Payment[]} canManage={canManageExpense} linkTransaction={expenseLinkTransaction} />

          <div className="border-t border-gray-200 bg-white px-4 py-6 md:px-8">
            <div className="grid w-full grid-cols-1 gap-4 xl:grid-cols-3">
              <div className="space-y-2 p-5 text-right xl:col-start-3 xl:col-end-4">
                <Summary label="Total Expense" value={money(currency, totalAmount)} />
                <Summary label="Paid" value={money(currency, totalPaidAmount)} />
                <div className="border-y border-gray-300 py-2">
                  <Summary label="Balance" value={money(currency, balance)} strong />
                </div>
              </div>
            </div>
          </div>
        </section>

        <aside id="expense-attachments" className="flex w-full scroll-mt-14 flex-col gap-4 border-t border-gray-200 bg-[#f7f8fd] px-4 pb-4 pt-5 lg:w-[30%] lg:border-l lg:border-t-0 lg:px-6 xl:sticky xl:top-0 xl:h-screen xl:overflow-y-auto">
          <div className="border-b border-gray-200 pb-5">
            <EntityAuditTimeline entityType="expense" entityId={expense.id || id} />
          </div>
        </aside>
      </div>

      <Modal open={cancelConfirmOpen} onCancel={() => setCancelConfirmOpen(false)} footer={null} title="Cancel expense?">
        <div className="px-5 py-4">
          <p className="text-sm text-gray-600">All related transactions will be reversed. This action cannot be undone.</p>
          <div className="mt-5 flex items-center justify-end gap-3">
            <Button onClick={() => setCancelConfirmOpen(false)}>Back</Button>
            <Button danger type="primary" loading={isCancelling} onClick={handleCancelExpense}>
              Cancel Expense
            </Button>
          </div>
        </div>
      </Modal>
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

function Detail({ label, value, className = "" }: { label: string; value: string; className?: string }) {
  return (
    <div className={`min-w-0 ${className}`}>
      <p className="text-xs font-medium uppercase tracking-[0.12em] text-gray-400">{label}</p>
      <p className="mt-1 text-sm font-medium text-gray-900">{value || "-"}</p>
    </div>
  );
}

function Summary({ label, value, strong = false }: { label: string; value: string; strong?: boolean }) {
  return (
    <div className={`mb-3 flex justify-between gap-4 ${strong ? "text-sm font-semibold text-gray-950 md:text-[15px]" : "text-xs text-gray-600 md:text-sm"}`}>
      <span>{label}</span>
      <span className="text-right">{value || "-"}</span>
    </div>
  );
}

function money(currency: string, value: number | undefined) {
  const amount = Number(value || 0);
  const prefix = amount < 0 ? "-" : "";
  return `${prefix}${currency} ${Math.abs(amount).toFixed(2)}`;
}
