"use client";

import { Form } from "antd";
import { InputFormItem, DatePickerFormItem } from "../ui/AppFormItems";
import { AppModal, ModalProps } from "../ui/AppModal";
import { Transaction, ApplyPaymentInput, UpdateAppliedPaymentInput, Payment, TransactionType } from "../../types/transaction";
import { useEffect, useState } from "react";
import { SearchableCurrenciesSelect } from "../system/SearchableCurrencySelect";
import dayjs from "dayjs";

import { useCreateTransactionActionMutation, useUpdateTransactionActionMutation, useGetTransactionQuery } from "@/lib/redux/services";
import useToggle from "@/hooks/UseToggle";

import { SearchablePaymentAccountSelect } from "../paymentAccounts/SearchabalePaymentAccountSelect";

interface ExpenseFormModalProps extends ModalProps {
  initialValues?: Payment;
  type?: TransactionType;
  linkTransaction?: {
    id: string;
    currencyId: string;
    rate: number;
  };
}

type PaymentFormValues = ApplyPaymentInput | UpdateAppliedPaymentInput;

export default function PaymentFormModal({ open, toggle, initialValues, linkTransaction, type = TransactionType.PAYMENT }: ExpenseFormModalProps) {
  const [expenseForm] = Form.useForm();
  const storeCurrencyId = JSON.parse(localStorage.getItem("user")!)?.store?.currencyId;

  const transactionType = initialValues?.type || type;
  const showPayment = transactionType == TransactionType.PAYMENT || transactionType == TransactionType.REFUND;

  const { data: expenseData, isSuccess } = useGetTransactionQuery(initialValues?.id || "", { skip: !initialValues?.id, refetchOnMountOrArgChange: true });
  const [createPayment, { isLoading: isCreating, isSuccess: createSuccess }] = useCreateTransactionActionMutation();
  const [updatePayment, { isLoading: isUpdating, isSuccess: updateSuccess }] = useUpdateTransactionActionMutation();
  const [openExpenseCategoryModal, toggleOpenExpenseCategoryModal] = useToggle();

  useEffect(() => {
    if (expenseData && isSuccess) {
      expenseForm.setFieldsValue({
        ...expenseData,
        date: dayjs(expenseData.date),
        totalAmount: expenseData.amount,
        categoryId: expenseData.category?.id,
        contactId: expenseData.contact?.id,
        currencyId: expenseData.currency?.id,
      });
    }
  }, [expenseData, isSuccess]);

  useEffect(() => {
    if (updateSuccess || createSuccess) {
      expenseForm.resetFields();
      toggle();
    }
  }, [updateSuccess, createSuccess]);

  useEffect(() => {
    if (!initialValues) {
      expenseForm.setFieldsValue({ currencyId: storeCurrencyId });
    }

    if (initialValues) {
      expenseForm.setFieldsValue({ currencyId: initialValues.currency?.id, accountId: initialValues.paidFrom?.id });
    }
  }, [initialValues]);

  useEffect(() => {
    if (linkTransaction) {
      expenseForm.setFieldsValue({ currencyId: linkTransaction.currencyId, rate: linkTransaction.rate });
    }
  }, [linkTransaction]);

  const handleSubmit = async (values: PaymentFormValues) => {
    if (initialValues?.id) {
      await updatePayment({ id: initialValues?.id, ...values, type });
    } else {
      await createPayment({ ...values, linkTransactionId: linkTransaction?.id, type } as ApplyPaymentInput);
    }
  };

  const createTitle = (type: TransactionType) => {
    if (type == TransactionType.REFUND) return "Make Refund ";
    if (type == TransactionType.WRITE_OFF) return "Make Write OFF ";
    if (type == TransactionType.ISSUE_CREDIT) return "Issue Credit ";

    return "Make Payment ";
  };

  const editTitle = (type: TransactionType) => {
    if (type == TransactionType.REFUND) return "Edit Refund ";
    if (type == TransactionType.WRITE_OFF) return "Edit Write OFF ";
    if (type == TransactionType.ISSUE_CREDIT) return "Edit Credit ";
    return "Edit Payment ";
  };

  return (
    <>
      <AppModal height={"62vh"} title={initialValues ? editTitle(transactionType) : createTitle(transactionType)} onOk={expenseForm.submit} width={showPayment ? 600 : 500} okText={isCreating || isUpdating ? "Saving.." : "Save"} open={open} toggle={toggle}>
        <Form
          //size="small"
          disabled={isCreating || isUpdating}
          onFinish={handleSubmit}
          form={expenseForm}
          initialValues={{
            ...initialValues,
            date: dayjs(initialValues?.date),
          }}
          layout={"vertical"}
        >
          <div className={`grid ${showPayment ? "grid-cols-2" : "grid-cols-1"}  gap-x-5 px-5 `}>
            <DatePickerFormItem name="date" label="Date" />
            {showPayment && <InputFormItem label="Reference" name="reference" />}

            <Form.Item label="Currency" name="currencyId">
              <SearchableCurrenciesSelect />
            </Form.Item>

            <InputFormItem label="Exchange Rate" name="rate" placeholder="1" />

            <>
              <InputFormItem placeholder="00.00" type="number" label="Amount" name="amount" rules={[{ required: true, message: "Enter payment amount" }]} />
              {showPayment && (
                <Form.Item label="Payment Account" name="accountId" rules={[{ required: true, message: "Select payment account" }]}>
                  <SearchablePaymentAccountSelect />
                </Form.Item>
              )}
            </>
          </div>
        </Form>
      </AppModal>
    </>
  );
}
