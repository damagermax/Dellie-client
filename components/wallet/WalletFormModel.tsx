"use client";

import { useCreatePaymentAccountMutation, useUpdatePaymentAccountMutation } from "@/lib/redux/services";
import { InputFormItem } from "../ui/AppFormItems";
import { AppModal, ModalProps } from "../ui/AppModal";
import { useEffect, useState } from "react";
import { Form } from "antd";
import { TbBuildingBank } from "react-icons/tb";
import { LuWalletCards } from "react-icons/lu";
import { CreatePaymentAccountInput, PaymentAccount, UpdatePaymentAccountInput, AccountType } from "@/types/payment-account";

interface WalletFormModalProps extends ModalProps {
  initialValues?: PaymentAccount;
}

const accountOptions = [
  { type: AccountType.BANK, name: "Bank", icon: <TbBuildingBank /> },
  { type: AccountType.DIGITAL_WALLET, name: "Digital Wallet", icon: <LuWalletCards className="" /> },
];

type formValuesType = CreatePaymentAccountInput | UpdatePaymentAccountInput;

export default function WalletFormModal({ open, toggle, initialValues }: WalletFormModalProps) {
  const [walletForm] = Form.useForm();
  const [accountType, setAccountType] = useState(AccountType.BANK);

  const [createPaymentAccount, { isLoading: createPaymentLoading, isSuccess: createPaymentSuccess }] = useCreatePaymentAccountMutation();

  const [updatePaymentAccount, { isLoading: updatePaymentLoading, isSuccess: updatePaymentSuccess }] = useUpdatePaymentAccountMutation();

  const handleSubmit = async (values: formValuesType) => {
    console.log("Form Values:", { ...values, type: accountType });

    if (initialValues) {
      await updatePaymentAccount({ ...values, type: accountType, id: initialValues.id });
    } else {
      await createPaymentAccount({ ...values, type: accountType });
    }
  };

  useEffect(() => {
    if (createPaymentSuccess || updatePaymentSuccess) {
      walletForm.resetFields();
      toggle();
    }
  }, [createPaymentSuccess, updatePaymentSuccess]);

  return (
    <AppModal loading={createPaymentLoading || updatePaymentLoading} title={"Create Wallet"} width={600} open={open} toggle={toggle} onOk={walletForm.submit} okText={"Save"}>
      <Form size="small" form={walletForm} layout="vertical" onFinish={handleSubmit} initialValues={initialValues || {}}>
        <div className=" mt-2  px-6 gap-x-12">
          {!initialValues && (
            <div className=" grid grid-cols-2  p-1.5 items-center justify-center bg-gray-100 rounded-full overflow-clip">
              {accountOptions.map((option) => (
                <div key={option.type} onClick={() => setAccountType(option.type)} className={`cursor-pointer rounded-full p-2 ${accountType === option.type ? "bg-gray-800 text-gray-200" : "bg-transparent"}`}>
                  <div className="flex w-fit items-center gap-x-2">
                    <div className={`${accountType === option.type ? "bg-gray-200 text-gray-800" : "bg-gray-300 text-gray-500"} p-1 bg-gray-300 rounded-full`}>{option.icon}</div>
                    <p>{option.name}</p>
                  </div>
                </div>
              ))}
            </div>
          )}

          <div className="mt-5"></div>

          <div className=" grid grid-cols-2 gap-x-5">
            <InputFormItem rules={[{ required: true, message: "Name is required" }]} label="Name" name="name" placeholder="e.g. Access Bank/MTN Mobile Money" />

            <InputFormItem label="Account Number" name="accountNumber" placeholder="e.g. 123456789" />
            <InputFormItem label="Account Name" name="accountName" placeholder="e.g. John Doe" />
            <InputFormItem addonBefore="GHS" type="number" label="Opening Balance" name="openingBalance" placeholder="e.g. 1000.00" />
          </div>
        </div>
      </Form>
    </AppModal>
  );
}
