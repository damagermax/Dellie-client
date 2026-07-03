"use client";

import { Form } from "antd";
import { InputFormItem, DatePickerFormItem } from "../ui/AppFormItems";
import { AppModal, ModalProps } from "../ui/AppModal";
import { ApplyPaymentInput, UpdateAppliedPaymentInput, Payment, TransactionType } from "../../types/transaction";
import { useEffect } from "react";
import { SearchableCurrenciesSelect } from "../system/SearchableCurrencySelect";
import { ExchangeRateFormItem } from "../system/ExchangeRateFormItem";
import dayjs from "dayjs";
import { useSelector } from "react-redux";

import { useCreateTransactionActionMutation, useUpdateTransactionActionMutation, useGetTransactionQuery } from "@/lib/redux/services";
import { RootState } from "@/lib/redux/store";

import { SearchablePaymentMethodSelect } from "../paymentMethods/SearchablePaymentMethodSelect";
import { TextAreaFormItem } from "../ui/AppFormItems";

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
  const featureSettings = useSelector((state: RootState) => state.currentUser.storeSettings.features);
  const multiCurrencyEnabled = featureSettings?.multiCurrencyEnabled !== false;

  const transactionType = initialValues?.type || type;
  const showPayment = transactionType == TransactionType.PAYMENT || transactionType == TransactionType.REFUND;

  const { data: expenseData, isSuccess } = useGetTransactionQuery(initialValues?.id || "", { skip: !initialValues?.id, refetchOnMountOrArgChange: true });
  const [createPayment, { isLoading: isCreating, isSuccess: createSuccess }] = useCreateTransactionActionMutation();
  const [updatePayment, { isLoading: isUpdating, isSuccess: updateSuccess }] = useUpdateTransactionActionMutation();

  useEffect(() => {
    if (expenseData && isSuccess) {
      expenseForm.setFieldsValue({
        ...expenseData,
        date: dayjs(expenseData.date),
        totalAmount: expenseData.amount,
        categoryId: expenseData.category?.id,
        contactId: expenseData.contact?.id,
        currencyId: expenseData.currency?.id,
        paymentMethodId: expenseData.paymentMethod?.id,
        note: expenseData.note || expenseData.reference,
      });
    }
  }, [expenseData, expenseForm, isSuccess]);

  useEffect(() => {
    if (updateSuccess || createSuccess) {
      expenseForm.resetFields();
      toggle();
    }
  }, [createSuccess, expenseForm, toggle, updateSuccess]);

  useEffect(() => {
    if (!initialValues) {
      expenseForm.setFieldsValue({ currencyId: storeCurrencyId, rate: 1 });
    }

    if (initialValues) {
      expenseForm.setFieldsValue({
        currencyId: initialValues.currency?.id,
        rate: initialValues.rate ?? 1,
        paymentMethodId: initialValues.paymentMethod?.id,
        note: initialValues.note,
      });
    }
  }, [expenseForm, initialValues, storeCurrencyId]);

  useEffect(() => {
    if (linkTransaction) {
      expenseForm.setFieldsValue({ currencyId: linkTransaction.currencyId, rate: linkTransaction.rate });
    }
  }, [expenseForm, linkTransaction]);

  useEffect(() => {
    if (!multiCurrencyEnabled) {
      expenseForm.setFieldsValue({
        currencyId: linkTransaction?.currencyId || initialValues?.currency?.id || storeCurrencyId,
        rate: 1,
      });
    }
  }, [expenseForm, initialValues?.currency?.id, linkTransaction?.currencyId, multiCurrencyEnabled, storeCurrencyId]);

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
      <AppModal height={"70vh"} title={initialValues ? editTitle(transactionType) : createTitle(transactionType)} onOk={expenseForm.submit} width={showPayment ? 600 : 600} okText={isCreating || isUpdating ? "Saving.." : "Save"} open={open} toggle={toggle}>
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
          <div className={`grid ${showPayment ? "grid-cols-2" : "grid-cols-2"}  gap-x-5 px-5 `}>
            <DatePickerFormItem name="date" label="Date" />

            {multiCurrencyEnabled ? (
              <>
                <Form.Item label="Currency" name="currencyId">
                  <SearchableCurrenciesSelect />
                </Form.Item>

                <ExchangeRateFormItem name="rate" />
              </>
            ) : null}

            <>
              <InputFormItem placeholder="00.00" type="number" label="Amount" name="amount" rules={[{ required: true, message: "Enter payment amount" }]} />
              {showPayment && (
                <Form.Item label="Payment Method (Optional)" name="paymentMethodId">
                  <SearchablePaymentMethodSelect allowClear />
                </Form.Item>
              )}
              <div className="col-span-2">
                <TextAreaFormItem label="Note" name="note" placeholder="Add an optional note" />
              </div>
            </>
          </div>
        </Form>
      </AppModal>
    </>
  );
}
