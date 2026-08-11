"use client";

import { Form } from "antd";
import { InputFormItem, DatePickerFormItem } from "../ui/AppFormItems";
import { AppModal, ModalProps } from "../ui/AppModal";
import { Expense, CreateExpenseInput, UpdateExpenseInput, TransactionType } from "../../types/transaction";
import { useEffect, useState } from "react";
import { SearchableCurrenciesSelect } from "../system/SearchableCurrencySelect";
import { ExchangeRateFormItem } from "../system/ExchangeRateFormItem";
import { SearchablePaymentMethodSelect } from "../paymentMethods/SearchablePaymentMethodSelect";
import dayjs from "dayjs";
import { useSelector } from "react-redux";

import { useCreateExpenseMutation, useUpdateExpenseMutation, useGetTransactionQuery, useGetCurrencyQuery } from "@/lib/redux/services";
import { SearchableExpenseCategorySelect } from "./SearchableExpenseCategorySelect";
import useToggle from "@/hooks/UseToggle";
import { CiReceipt } from "react-icons/ci";
import { CategoryType } from "@/types/category";
import CategoriesFormModal from "../categories/CategoriesFormModal";
import { RootState } from "@/lib/redux/store";

import { SearchableContactSelect } from "../contacts/SeachableContactSelect";
import ContactsFormModal from "../contacts/ContactsFormModal";
import { ContactRole } from "@/types/contact";

interface ExpenseFormModalProps extends ModalProps {
  initialValues?: Expense;
}

type ExpenseFormValues = CreateExpenseInput | UpdateExpenseInput;

export default function ExpenseFormModal({ open, toggle, initialValues }: ExpenseFormModalProps) {
  const [expenseForm] = Form.useForm();
  const storeCurrencyId = JSON.parse(localStorage.getItem("user")!)?.store?.currencyId;
  const featureSettings = useSelector((state: RootState) => state.currentUser.storeSettings.features);
  const multiCurrencyEnabled = featureSettings?.multiCurrencyEnabled !== false;

  const [selectedImage, setImage] = useState<File>();
  const [preview, setPreview] = useState<string>();

  const { data: expenseData, isSuccess } = useGetTransactionQuery(initialValues?.id || "", { skip: !initialValues?.id, refetchOnMountOrArgChange: true });
  const [createExpense, { isLoading: isCreating, isSuccess: createSuccess }] = useCreateExpenseMutation();
  const [updateExpense, { isLoading: isUpdating, isSuccess: updateSuccess }] = useUpdateExpenseMutation();
  const [openExpenseCategoryModal, toggleOpenExpenseCategoryModal] = useToggle();

  const [isContactModalOpen, toggleContactModal] = useToggle();

  const [paidAmountEntered, setPaidAmountEntered] = useState();
  const totalAmount = Form.useWatch("totalAmount", expenseForm);
  const paidAmount = Form.useWatch("paidAmount", expenseForm);
  const selectedCurrencyId = Form.useWatch("currencyId", expenseForm) as string | undefined;
  const fallbackStoreCurrencyCode = JSON.parse(localStorage.getItem("user") || "{}")?.store?.currency?.code || JSON.parse(localStorage.getItem("user") || "{}")?.store?.currencyCode || "";
  const { data: selectedCurrency } = useGetCurrencyQuery(selectedCurrencyId as string, { skip: !selectedCurrencyId });
  const { data: storeCurrency } = useGetCurrencyQuery(storeCurrencyId as string, { skip: !storeCurrencyId || Boolean(fallbackStoreCurrencyCode) });
  const amountCurrencyCode =
    (selectedCurrencyId && selectedCurrency?.code) ||
    fallbackStoreCurrencyCode ||
    storeCurrency?.code ||
    "GHS";

  const canChangeCurrency = expenseData?.balance != expenseData?.amount || initialValues?.balance != initialValues?.amount;

  useEffect(() => {
    if (paidAmount === undefined || paidAmount == paidAmountEntered) {
      setPaidAmountEntered(totalAmount);
      expenseForm.setFieldsValue({ paidAmount: totalAmount });
    }
  }, [totalAmount]);

  useEffect(() => {
    if (expenseData && isSuccess) {
        expenseForm.setFieldsValue({
          ...expenseData,
          date: dayjs(expenseData.date),
          dueDate: expenseData.dueDate ? dayjs(expenseData.dueDate) : undefined,
          totalAmount: expenseData.amount,
          categoryId: expenseData.category?.id,
          contactId: expenseData.contact?.id,
          paymentMethodId: expenseData.paymentMethod?.id,
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
      expenseForm.setFieldsValue({ currencyId: storeCurrencyId, rate: 1 });
    }

    if (initialValues) {
      expenseForm.setFieldsValue({
        totalAmount: initialValues.amount,
        currencyId: initialValues.currency?.id,
        rate: initialValues.rate ?? 1,
        dueDate: initialValues.dueDate ? dayjs(initialValues.dueDate) : undefined,
        paymentMethodId: initialValues.paymentMethod?.id,
      });
    }
  }, [expenseForm, initialValues, storeCurrencyId]);

  useEffect(() => {
    if (!multiCurrencyEnabled) {
      expenseForm.setFieldsValue({
        currencyId: initialValues?.currency?.id || storeCurrencyId,
        rate: 1,
      });
    }
  }, [expenseForm, initialValues?.currency?.id, multiCurrencyEnabled, storeCurrencyId]);

  useEffect(() => {
    if (!selectedImage) return;

    const objectUrl = URL.createObjectURL(selectedImage);
    setPreview(objectUrl);

    return () => URL.revokeObjectURL(objectUrl);
  }, [selectedImage]);

  const handleSubmit = async (values: ExpenseFormValues) => {
    const formData = new FormData();
    formData.append("type", TransactionType.EXPENSE);

    Object.entries(values).forEach(([key, value]) => {
      if (value !== undefined && value !== null) {
        formData.append(key, String(value));
      }
    });

    if (selectedImage) formData.append("receipt", selectedImage);

    if (initialValues?.id) {
      await updateExpense({ id: initialValues?.id, ...values, type: TransactionType.EXPENSE } as UpdateExpenseInput);
    } else {
      await createExpense(formData);
    }
  };

  const handleDelete = () => {
    setImage(undefined);
    setPreview(undefined);
  };

  const handleUploadCategoryImage = () => {
    // Create a file input element dynamically
    const input = document.createElement("input");
    input.type = "file";
    input.accept = "image/*";
    input.click();

    // Wait for the user to pick a file
    input.onchange = () => {
      if (!input.files || input.files.length === 0) {
        console.log("No file selected.");
        return;
      }

      const image = input.files[0];
      setImage(image);
    };
  };

  return (
    <>
      <CategoriesFormModal
        type={CategoryType.EXPENSE}
        open={openExpenseCategoryModal}
        toggle={toggleOpenExpenseCategoryModal}
        onSaved={(category) => {
          if (category?.id) {
            expenseForm.setFieldValue("categoryId", category.id);
          }
        }}
      />

      <AppModal height={"62vh"} title={initialValues ? "Edit Expense " : "Create Expense "} onOk={expenseForm.submit} width={600} okText={isCreating || isUpdating ? "Saving.." : "Save"} open={open} toggle={toggle}>
        <Form
          size="small"
          disabled={isCreating || isUpdating}
          onFinish={handleSubmit}
          form={expenseForm}
          initialValues={{
            ...initialValues,
            ...(initialValues?.date && {
              date: dayjs(initialValues.date),
            }),
            ...(initialValues?.dueDate && {
              dueDate: dayjs(initialValues.dueDate),
            }),
          }}
          layout={"vertical"}
        >
          <div className="grid grid-cols-2 gap-x-5 px-5">
            <div className="col-span-2">
              <InputFormItem label="Description" name="note" placeholder="What was it for" rules={[{ required: true, message: "Enter description" }]} />
            </div>

            <div className="col-span-2">
              <Form.Item label="Contact" name="contactId">
                <SearchableContactSelect onAddContact={toggleContactModal} />
              </Form.Item>
            </div>

            <Form.Item label="Category" name="categoryId">
              <SearchableExpenseCategorySelect type={CategoryType.EXPENSE} onAddCategory={toggleOpenExpenseCategoryModal} />
            </Form.Item>

            <DatePickerFormItem name="date" label="Date" />

            <Form.Item label="Payment Method" name="paymentMethodId">
              <SearchablePaymentMethodSelect allowClear />
            </Form.Item>

            <DatePickerFormItem name="dueDate" label="Due Date" />

            {multiCurrencyEnabled ? (
              <>
                <Form.Item label="Currency" name="currencyId">
                  <SearchableCurrenciesSelect disabled={canChangeCurrency} />
                </Form.Item>

                <ExchangeRateFormItem name="rate" className="w-full" />
              </>
            ) : null}

            <InputFormItem addonBefore={amountCurrencyCode} type="number" label="Total Amount" name="totalAmount" rules={[{ required: true, message: "Enter amount" }]} />

            {!initialValues && (
              <>
                <InputFormItem addonBefore={amountCurrencyCode} type="number" label="Paid Amount" name="paidAmount" />
                <div className="  hidden col-span-2 p-3 bg-gray-50 rounded-lg flex   flex-col border-gray-200 border border-solid">
                  {preview && (
                    <div className=" flex gap-x-5 items-center">
                      <img src={preview} className=" w-[60px] aspect-square object-contain" alt="" />

                      <div>
                        <div className=" flex text-xs gap-x-2 mb-2">
                          <p onClick={handleDelete} className=" mt-2 cursor-pointer p-1 bg-white border border-gray-200 text-red-500 px-5 rounded-4xl">
                            Delete
                          </p>
                          <p onClick={handleUploadCategoryImage} className=" mt-2 p-1 cursor-pointer text-blue-500  bg-white border border-gray-200 px-5 rounded-4xl">
                            Change{" "}
                          </p>
                        </div>
                        <p className=" text-sm text-gray-400">Maximum image size is 20 MB.</p>{" "}
                      </div>
                    </div>
                  )}

                  {!preview && (
                    <div className=" flex  gap-x-2 cursor-pointer items-center" onClick={handleUploadCategoryImage}>
                      <div className=" bg-gray-100 p-2 border border-gray-300 border-solid rounded-lg">
                        <CiReceipt size={30} className=" text-gray-300" />
                      </div>
                      <div>
                        <p className=" mt-2 text-gray-500">{preview ? "Change Receipt" : "Upload Receipt"}</p>
                        <p className=" text-sm text-gray-400">Maximum image size is 20 MB.</p>{" "}
                      </div>
                    </div>
                  )}
                </div>
              </>
            )}

            {/* <InputFormItem label="Reference" name="reference" /> */}
          </div>
        </Form>
      </AppModal>

      {isContactModalOpen && (
        <ContactsFormModal
          open={isContactModalOpen}
          toggle={toggleContactModal}
          hideRoles
          defaultRoles={[ContactRole.SUPPLIER]}
          onSaved={(contact) => {
            if (contact?.id) {
              expenseForm.setFieldValue("contactId", contact.id);
            }
          }}
        />
      )}
    </>
  );
}
