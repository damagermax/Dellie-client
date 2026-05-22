"use client";

import { Form } from "antd";
import { InputFormItem, DatePickerFormItem, SelectFormItem } from "../ui/AppFormItems";
import { AppModal, ModalProps } from "../ui/AppModal";
import { Expense, CreateExpenseInput, UpdateExpenseInput, TransactionType } from "../../types/transaction";
import { useEffect, useState } from "react";
import { SearchableCurrenciesSelect } from "../system/SearchableCurrencySelect";
import dayjs from "dayjs";

import { useCreateExpenseMutation, useUpdateExpenseMutation, useGetTransactionQuery } from "@/lib/redux/services";
import { SearchableExpenseCategorySelect } from "./SearchableExpenseCategorySelect";
import useToggle from "@/hooks/UseToggle";
import { CiReceipt } from "react-icons/ci";
import { CategoryType } from "@/types/category";
import CategoriesFormModal from "../categories/CategoriesFormModal";

import { SearchableContactSelect } from "../contacts/SeachableContactSelect";
import ContactsFormModal from "../contacts/ContactsFormModal";
import { SearchablePaymentAccountSelect } from "../paymentAccounts/SearchabalePaymentAccountSelect";

interface ExpenseFormModalProps extends ModalProps {
  initialValues?: Expense;
}

type ExpenseFormValues = CreateExpenseInput | UpdateExpenseInput;

export default function ExpenseFormModal({ open, toggle, initialValues }: ExpenseFormModalProps) {
  const [expenseForm] = Form.useForm();
  const storeCurrencyId = JSON.parse(localStorage.getItem("user")!)?.store?.currencyId;

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
      expenseForm.setFieldsValue({ totalAmount: initialValues.amount });
    }
  }, [initialValues]);

  useEffect(() => {
    if (!selectedImage) return;

    const objectUrl = URL.createObjectURL(selectedImage);
    setPreview(objectUrl);

    return () => URL.revokeObjectURL(objectUrl);
  }, [selectedImage]);

  const handleSubmit = async (values: ExpenseFormValues) => {
    console.log("Form Values:", values);

    const formData = new FormData();
    formData.append("type", TransactionType.EXPENSE);

    Object.entries(values).forEach(([key, value]) => {
      if (value !== undefined && value !== null) {
        formData.append(key, value as any);
      }
    });

    selectedImage && formData.append("receipt", selectedImage);

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
      <CategoriesFormModal type={CategoryType.EXPENSE} open={openExpenseCategoryModal} toggle={toggleOpenExpenseCategoryModal} />

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
          }}
          layout={"vertical"}
        >
          <div className="grid grid-cols-2 gap-x-5 px-5">
            <div className="col-span-2">
              <InputFormItem label="Description" name="note" placeholder="What was it for" rules={[{ required: true, message: "Enter description" }]} />
            </div>

            <Form.Item label="Category" name="categoryId">
              <SearchableExpenseCategorySelect type={CategoryType.EXPENSE} onAddCategory={toggleOpenExpenseCategoryModal} />
            </Form.Item>

            <DatePickerFormItem name="date" label="Date" />

            <Form.Item label="Contact" name="contactId">
              <SearchableContactSelect onAddContact={toggleContactModal} />
            </Form.Item>

            <Form.Item label="Currency" name="currencyId">
              <SearchableCurrenciesSelect disabled={canChangeCurrency} />
            </Form.Item>

            <InputFormItem label="Exchange Rate" name="rate" />

            <InputFormItem addonBefore="GHS" type="number" label="Total Amount (without discount)" name="totalAmount" rules={[{ required: true, message: "Enter amount" }]} />

            {!initialValues && (
              <>
                <InputFormItem addonBefore="GHS" type="number" label="Paid Amount" name="paidAmount" />
                <Form.Item label="Paid Through" name="accountId" rules={[{ required: paidAmount, message: "Select payment account" }]}>
                  <SearchablePaymentAccountSelect />
                </Form.Item>{" "}
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

      {isContactModalOpen && <ContactsFormModal open={isContactModalOpen} toggle={toggleContactModal} />}
    </>
  );
}
