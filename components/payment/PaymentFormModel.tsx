"use client";

import { useEffect, useMemo, useState } from "react";
import dayjs from "dayjs";
import { Form, InputNumber, Segmented, message } from "antd";
import type { TableProps } from "antd/es/table";
import { useSelector } from "react-redux";

import { useCreateTransactionActionMutation, useGetCurrencyQuery, useGetPurchaseQuery, useGetSaleQuery, useGetTransactionQuery, useUpdateTransactionActionMutation } from "@/lib/redux/services";
import { RootState } from "@/lib/redux/store";
import { ResolvedProductName } from "@/components/products/ResolvedProductName";
import AppTable from "@/components/ui/AppTable";
import PreviewImage from "@/components/ui/PreviewImage";
import type { Purchase } from "@/types/purchase";
import type { Sale } from "@/types/sale";
import { ApplyPaymentInput, Payment, RefundItemInput, RefundMode, TransactionType, UpdateAppliedPaymentInput } from "@/types/transaction";

import { computeRefundPreview, getRemainingRefundablePaidAmount, getRefundableLines } from "./saleRefundMath";
import { SearchablePaymentMethodSelect } from "../paymentMethods/SearchablePaymentMethodSelect";
import { ExchangeRateFormItem } from "../system/ExchangeRateFormItem";
import { SearchableCurrenciesSelect } from "../system/SearchableCurrencySelect";
import { DatePickerFormItem, TextAreaFormItem } from "../ui/AppFormItems";
import { AppModal, ModalProps } from "../ui/AppModal";

interface PaymentFormModalProps extends ModalProps {
  initialValues?: Payment;
  type?: TransactionType;
  linkTransaction?: {
    id: string;
    currencyId: string;
    rate: number;
    type?: TransactionType;
  };
  sale?: Sale;
  purchase?: Purchase;
}

type PaymentFormValues = ApplyPaymentInput | UpdateAppliedPaymentInput;

const quantityInputClass = "!w-24";
export default function PaymentFormModal({ open, toggle, initialValues, linkTransaction, type = TransactionType.PAYMENT, sale, purchase }: PaymentFormModalProps) {
  const [paymentForm] = Form.useForm();
  const [refundMode, setRefundMode] = useState<RefundMode>("manual");
  const [refundQuantities, setRefundQuantities] = useState<Record<string, number>>({});
  const storedUser = typeof window !== "undefined" ? JSON.parse(localStorage.getItem("user") || "{}") : {};
  const currentStore = useSelector((state: RootState) => state.currentUser.store);
  const storeCurrencyId = storedUser?.store?.currencyId;
  const storeCurrencyCode = currentStore?.settings?.currency || storedUser?.store?.currency?.code || storedUser?.store?.currencyCode || "";
  const featureSettings = useSelector((state: RootState) => state.currentUser.storeSettings.features);
  const multiCurrencyEnabled = featureSettings?.multiCurrencyEnabled !== false;

  const transactionType = initialValues?.type || type;
  const linkedTransactionType =
    sale ? TransactionType.SALE : purchase ? TransactionType.PURCHASE : linkTransaction?.type || (initialValues?.linkedDocumentSnapshot?.type as TransactionType | undefined);
  const saleRefundId = transactionType === TransactionType.REFUND && linkedTransactionType === TransactionType.SALE ? sale?.id || linkTransaction?.id || initialValues?.linkedTransactionId : undefined;
  const purchaseRefundId = transactionType === TransactionType.REFUND && linkedTransactionType === TransactionType.PURCHASE ? purchase?.id || linkTransaction?.id || initialValues?.linkedTransactionId : undefined;
  const { data: queriedSale } = useGetSaleQuery(saleRefundId || "", { skip: !saleRefundId || Boolean(sale) });
  const { data: queriedPurchase } = useGetPurchaseQuery(purchaseRefundId || "", { skip: !purchaseRefundId || Boolean(purchase) });
  const linkedSale = sale || queriedSale;
  const linkedPurchase = purchase || queriedPurchase;
  const isSaleRefund = transactionType === TransactionType.REFUND && linkedTransactionType === TransactionType.SALE && Boolean(linkedSale);
  const isPurchaseRefund = transactionType === TransactionType.REFUND && linkedTransactionType === TransactionType.PURCHASE && Boolean(linkedPurchase);
  const isItemRefund = isSaleRefund || isPurchaseRefund;
  const linkedSaleId = linkedSale?.id;
  const linkedPurchaseId = linkedPurchase?.id;
  const linkedRefundDocument = linkedSale || linkedPurchase;
  const linkedDocumentCurrencyId =
    linkedSale?.currencyId?.id ||
    linkedPurchase?.currencyId?.id ||
    linkTransaction?.currencyId ||
    initialValues?.currency?.id ||
    "";
  const { data: linkedDocumentCurrency } = useGetCurrencyQuery(linkedDocumentCurrencyId, { skip: !linkedDocumentCurrencyId });
  const hasLinkedDocument = Boolean(linkedSaleId || linkedPurchaseId || linkTransaction?.id || initialValues?.linkedTransactionId || initialValues?.linkedDocumentSnapshot);
  const currencyDiffersFromStore = Boolean(linkedDocumentCurrencyId && storeCurrencyId && linkedDocumentCurrencyId !== storeCurrencyId);
  const lockExchangeRate = hasLinkedDocument && currencyDiffersFromStore;
  const defaultManualRefundAmount = useMemo(() => {
    if (transactionType !== TransactionType.REFUND || !linkedRefundDocument) return undefined;
    return getRemainingRefundablePaidAmount(linkedRefundDocument.payments || [], initialValues?.id);
  }, [initialValues?.id, linkedRefundDocument, transactionType]);
  const { data: paymentData, isSuccess: paymentLoaded } = useGetTransactionQuery(initialValues?.id || "", { skip: !initialValues?.id, refetchOnMountOrArgChange: true });
  const amountCurrencyCode =
    linkedSale?.currencyId?.code ||
    linkedPurchase?.currencyId?.code ||
    linkedDocumentCurrency?.code ||
    linkedRefundDocument?.currencyId?.code ||
    initialValues?.currency?.code ||
    paymentData?.currency?.code ||
    storeCurrencyCode ||
    "";
  const [createPayment, { isLoading: isCreating, isSuccess: createSuccess }] = useCreateTransactionActionMutation();
  const [updatePayment, { isLoading: isUpdating, isSuccess: updateSuccess }] = useUpdateTransactionActionMutation();

  const refundableLines = useMemo(() => getRefundableLines(linkedRefundDocument, initialValues?.id), [initialValues?.id, linkedRefundDocument]);
  const hasRefundableLines = refundableLines.length > 0;
  const selectedRefundItems = useMemo<RefundItemInput[]>(
    () =>
      Object.entries(refundQuantities)
        .map(([lineItemId, quantity]) => ({ lineItemId, quantity: Number(quantity || 0) }))
        .filter((item) => Number(item.quantity || 0) > 0),
    [refundQuantities],
  );
  const refundPreview = useMemo(() => computeRefundPreview(linkedRefundDocument, selectedRefundItems, initialValues?.id), [initialValues?.id, linkedRefundDocument, selectedRefundItems]);
  const showPaymentFields = transactionType === TransactionType.PAYMENT || transactionType === TransactionType.REFUND;
  const formLoading = isCreating || isUpdating;
  const refundItemColumns = useMemo<TableProps<(typeof refundableLines)[number]>["columns"]>(
    () => [
      {
        title: "Product",
        dataIndex: "productName",
        key: "productName",
        className: "!pl-8",
        width: "55%",
        render: (_: unknown, line) => {
          const linkedLine = linkedRefundDocument?.lineItems.find((item) => String(item.id) === line.lineItemId);
          const imageUrl =
            linkedLine?.productUrl ||
            (typeof linkedLine?.productId === "string" ? undefined : linkedLine?.productId?.media?.[0]?.url);

          return (
            <div className="flex items-center gap-x-2">
              <PreviewImage width={28} height={28} src={imageUrl} />
              <div className="min-w-0">
                <ResolvedProductName
                  name={line.productName}
                  product={typeof linkedLine?.productId === "string" ? linkedLine?.productId : linkedLine?.productId}
                  className="line-clamp-1"
                />
                <p className="text-xs text-gray-500">
                  {line.productSku || "No SKU"} | Available {Number(line.availableRefundableQuantity || 0).toLocaleString()}
                </p>
              </div>
            </div>
          );
        },
      },
      {
        title: "Qty",
        dataIndex: "lineItemId",
        key: "quantity",
        width: "20%",
        render: (_: unknown, line) => (
          <div className="flex flex-col items-start gap-1">
            <InputNumber
              className={quantityInputClass}
              variant="underlined"
              min={0}
              max={line.availableRefundableQuantity}
              step={1}
              precision={0}
              controls={false}
              value={Number(refundQuantities[line.lineItemId] || 0)}
              onChange={(value) =>
                setRefundQuantities((prev) => ({
                  ...prev,
                  [line.lineItemId]: Math.max(0, Math.floor(Number(value || 0))),
                }))
              }
            />
          </div>
        ),
      },
      {
        title: "Preview",
        dataIndex: "lineItemId",
        key: "preview",
        align: "end",
        className: "!pr-8",
        width: "25%",
        render: (_: unknown, line) => {
          const previewItem = refundPreview.items.find((item) => item.lineItemId === line.lineItemId);
          return previewItem ? `${linkedRefundDocument?.currencyId?.code || ""} ${Number(previewItem.computedRefundAmount || 0).toFixed(2)}` : "-";
        },
      },
    ],
    [linkedRefundDocument?.currencyId?.code, linkedRefundDocument?.lineItems, refundPreview.items, refundQuantities],
  );

  useEffect(() => {
    if (paymentData && paymentLoaded) {
      paymentForm.setFieldsValue({
        ...paymentData,
        date: dayjs(paymentData.date),
        totalAmount: paymentData.amount,
        categoryId: paymentData.category?.id,
        contactId: paymentData.contact?.id,
        currencyId: paymentData.currency?.id,
        paymentMethodId: paymentData.paymentMethod?.id,
        note: paymentData.note || paymentData.reference,
        amount: paymentData.amount,
      });
    }
  }, [paymentData, paymentForm, paymentLoaded]);

  useEffect(() => {
    if (updateSuccess || createSuccess) {
      paymentForm.resetFields();
      setRefundQuantities({});
      toggle();
    }
  }, [createSuccess, paymentForm, toggle, updateSuccess]);

  useEffect(() => {
    if (!open) return;

    if (!initialValues) {
      paymentForm.setFieldsValue({
        currencyId: linkedDocumentCurrencyId || linkTransaction?.currencyId || storeCurrencyId,
        rate: linkTransaction?.rate || 1,
        amount: transactionType === TransactionType.REFUND ? defaultManualRefundAmount : undefined,
      });
    }

    if (initialValues) {
      paymentForm.setFieldsValue({
        currencyId: linkedDocumentCurrencyId || initialValues.currency?.id,
        rate: initialValues.rate ?? 1,
        paymentMethodId: initialValues.paymentMethod?.id,
        note: initialValues.note,
        amount: initialValues.amount,
      });
    }

    const initialRefundMode = isItemRefund ? (hasRefundableLines ? initialValues?.refundMode || "items" : "manual") : "manual";
    setRefundMode(initialRefundMode);

    if (initialRefundMode === "items" && hasRefundableLines && initialValues?.refundItems?.length) {
      setRefundQuantities(
        Object.fromEntries(initialValues.refundItems.map((item) => [item.lineItemId, Number(item.quantity || 0)])),
      );
    } else {
      setRefundQuantities({});
    }
  }, [defaultManualRefundAmount, hasRefundableLines, initialValues, isItemRefund, linkedDocumentCurrencyId, linkTransaction?.currencyId, linkTransaction?.rate, open, paymentForm, storeCurrencyId, transactionType]);

  useEffect(() => {
    if (linkTransaction) {
      paymentForm.setFieldsValue({ currencyId: linkedDocumentCurrencyId || linkTransaction.currencyId, rate: linkTransaction.rate });
    }
  }, [linkedDocumentCurrencyId, linkTransaction, paymentForm]);

  useEffect(() => {
    if (!multiCurrencyEnabled) {
      paymentForm.setFieldsValue({
        currencyId: linkTransaction?.currencyId || initialValues?.currency?.id || storeCurrencyId,
        rate: 1,
      });
    }
  }, [initialValues?.currency?.id, linkTransaction?.currencyId, multiCurrencyEnabled, paymentForm, storeCurrencyId]);

  const handleSubmit = async (values: PaymentFormValues) => {
    if (formLoading) return;

    if (isItemRefund && refundMode === "items") {
      const linkedTransactionId = linkedSaleId || linkedPurchaseId;
      if (!linkedTransactionId) {
        message.error("Refund details could not be loaded.");
        return;
      }
      if (!selectedRefundItems.length) {
        message.error("Select at least one refunded item quantity.");
        return;
      }
      if (refundPreview.totalRefundAmount <= 0) {
        message.error("The selected items do not produce a refundable amount.");
        return;
      }

      const payload = {
        ...values,
        amount: refundPreview.totalRefundAmount,
        refundMode: "items" as RefundMode,
        refundItems: selectedRefundItems,
      };

      if (initialValues?.id) {
        await updatePayment({ id: initialValues.id, ...payload, type });
      } else {
        await createPayment({ ...payload, linkTransactionId: linkedTransactionId, type } as ApplyPaymentInput);
      }
      return;
    }

    const payload = {
      ...values,
      refundMode: isItemRefund ? ("manual" as RefundMode) : undefined,
      refundItems: isItemRefund ? [] : undefined,
    };

    if (initialValues?.id) {
      await updatePayment({ id: initialValues.id, ...payload, type });
    } else {
      await createPayment({ ...payload, linkTransactionId: linkTransaction?.id, type } as ApplyPaymentInput);
    }
  };

  const createTitle = (value: TransactionType) => {
    if (value === TransactionType.REFUND) return "Make Refund";
    if (value === TransactionType.WRITE_OFF) return "Make Write Off";
    if (value === TransactionType.ISSUE_CREDIT) return "Issue Credit";
    return "Make Payment";
  };

  const editTitle = (value: TransactionType) => {
    if (value === TransactionType.REFUND) return "Edit Refund";
    if (value === TransactionType.WRITE_OFF) return "Edit Write Off";
    if (value === TransactionType.ISSUE_CREDIT) return "Edit Credit";
    return "Edit Payment";
  };

  const renderAmountField = (messageText: string, required = true) => (
    <Form.Item label="Amount" name="amount" rules={required ? [{ required: true, message: messageText }] : []}>
      <InputNumber
        className="!w-full"
        min={0}
        step={0.01}
        controls={false}
        placeholder="00.00"
        prefix={amountCurrencyCode || undefined}
      />
    </Form.Item>
  );

  return (
    <AppModal
      height="70vh"
      title={initialValues ? editTitle(transactionType) : createTitle(transactionType)}
      onOk={paymentForm.submit}
      width={isItemRefund && refundMode === "items" ? 840 : 560}
      okText={formLoading ? "Saving.." : "Save"}
      open={open}
      toggle={toggle}
      loading={formLoading}
    >
      <Form
        disabled={formLoading}
        onFinish={handleSubmit}
        form={paymentForm}
        initialValues={{
          ...initialValues,
          date: dayjs(initialValues?.date),
        }}
        layout="vertical"
      >
        {isItemRefund ? (
          <div className="pb-4">
            {hasRefundableLines ? (
              <>
                <div className="mb-6 flex justify-center px-5">
                  <Segmented
                    shape="round"
                    options={[
                      { label: "Items", value: "items" },
                      { label: "Manual", value: "manual" },
                    ]}
                    value={refundMode}
                    onChange={(value) => setRefundMode(value as RefundMode)}
                    className="[&_.ant-segmented-item-selected]:!bg-[#2d837d] [&_.ant-segmented-item-selected]:!text-white"
                    style={{ backgroundColor: "#ebebeb", padding: "5px" }}
                  />
                </div>
                {refundMode === "items" ? (
                  <div>
                    <AppTable columns={refundItemColumns} dataSource={refundableLines} rowKey={(line) => line.lineItemId} pagination={false} scrollX={720} />

                    <div className="border-y border-amber-200 bg-amber-50 px-5 py-3 text-sm text-amber-900">
                      <div className="flex flex-wrap items-center justify-between gap-3">
                        <span>Refund preview</span>
                        <span className="font-semibold">
                          {linkedRefundDocument?.currencyId?.code || ""} {refundPreview.totalRefundAmount.toFixed(2)}
                        </span>
                      </div>
                      <div className="mt-2 flex flex-wrap items-center justify-between gap-3 text-xs text-amber-800">
                        <span>Refundable paid amount: {linkedRefundDocument?.currencyId?.code || ""} {refundPreview.remainingRetainedPaidAmount.toFixed(2)}</span>
                        <span>Paid ratio: {(refundPreview.paidRatio * 100).toFixed(2)}%</span>
                      </div>
                    </div>
                  </div>
                ) : (
                  <div className="px-5 pt-2">
                    {renderAmountField("Enter refund amount", refundMode === "manual")}
                  </div>
                )}
              </>
            ) : (
              <div className="px-5 pt-2">
                {renderAmountField("Enter refund amount")}
              </div>
            )}

            <div className="mt-2 grid gap-x-5 px-5 md:grid-cols-2">
              <DatePickerFormItem name="date" label="Date" />

              {multiCurrencyEnabled && !hasLinkedDocument ? (
                <>
                  <Form.Item label="Currency" name="currencyId">
                    <SearchableCurrenciesSelect disabled={hasLinkedDocument} />
                  </Form.Item>

                  <ExchangeRateFormItem name="rate" disabled={lockExchangeRate} />
                </>
              ) : null}

              {showPaymentFields ? (
                <Form.Item label="Payment Method (Optional)" name="paymentMethodId">
                  <SearchablePaymentMethodSelect allowClear />
                </Form.Item>
              ) : null}

              <div className="md:col-span-2">
                <TextAreaFormItem label="Note" name="note" placeholder="Add an optional note" />
              </div>
            </div>
          </div>
        ) : (
          <div className="grid gap-x-5 px-5 py-4 md:grid-cols-2">
            <DatePickerFormItem name="date" label="Date" />

            {multiCurrencyEnabled && !hasLinkedDocument ? (
              <>
                <Form.Item label="Currency" name="currencyId">
                  <SearchableCurrenciesSelect disabled={hasLinkedDocument} />
                </Form.Item>

                <ExchangeRateFormItem name="rate" disabled={lockExchangeRate} />
              </>
            ) : null}

            {renderAmountField("Enter payment amount")}
            {showPaymentFields ? (
              <Form.Item label="Payment Method (Optional)" name="paymentMethodId">
                <SearchablePaymentMethodSelect allowClear />
              </Form.Item>
            ) : null}
            <div className="md:col-span-2">
              <TextAreaFormItem label="Note" name="note" placeholder="Add an optional note" />
            </div>
          </div>
        )}
      </Form>
    </AppModal>
  );
}
