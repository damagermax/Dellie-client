import { Form, DatePicker, Segmented } from "antd";
import { InputFormItem, SelectFormItem } from "../ui/AppFormItems";
import { AppModal, ModalProps } from "../ui/AppModal";
import { Discount, DiscountCreateInput, DiscountUpdateInput, DiscountType, DiscountMethod, DiscountAppliesTo } from "../../types";
import { useEffect, useState } from "react";
import dayjs from "dayjs";

import { useGetDiscountQuery, useUpdateDiscountMutation, useCreateDiscountMutation } from "@/lib/redux/services";
import ProductPicker from "./ProductPicker";

interface DiscountsFormModalProps extends ModalProps {
  initialValues?: Discount;
}

type DiscountsFormValues = DiscountCreateInput | DiscountUpdateInput;

const isValueType = (type: DiscountType) => type === DiscountType.PERCENT || type === DiscountType.FIXED;

export default function DiscountFormModal({ open, toggle, initialValues }: DiscountsFormModalProps) {
  const [discountForm] = Form.useForm();
  const [discountType, setDiscountType] = useState(initialValues?.type || DiscountType.PERCENT);
  const [discountMethod, setDiscountMethod] = useState(initialValues?.method || DiscountMethod.CODE);

  const { data: discountData, isSuccess } = useGetDiscountQuery(initialValues?.id || "", { skip: !initialValues?.id, refetchOnMountOrArgChange: true });
  const [createDiscount, { isLoading: isCreating, isSuccess: createSuccess }] = useCreateDiscountMutation();
  const [updateDiscount, { isLoading: isUpdating, isSuccess: updateSuccess }] = useUpdateDiscountMutation();

  const isCode = discountMethod == DiscountMethod.CODE || initialValues?.method == DiscountMethod.CODE;
  const isAuto = discountMethod == DiscountMethod.AUTO || initialValues?.method == DiscountMethod.AUTO;
  const disableCodeInput = isCode && !!initialValues?.id;

  useEffect(() => {
    if (discountData && isSuccess) {
      const { endDate, startDate, ...rest } = discountData;
      discountForm.setFieldsValue({
        ...rest,
        image: rest.bannerUrl,
        ...(startDate && { startDate: dayjs(startDate) }),
        ...(endDate && { endDate: dayjs(endDate) }),
      });

      setDiscountMethod(discountData.method);
      setDiscountType(discountData.type);
    }
  }, [discountData, isSuccess]);

  useEffect(() => {
    if (initialValues?.method) {
      setDiscountMethod(initialValues.method);
    }
    if (initialValues?.type) {
      setDiscountType(initialValues.type);
    }
  }, [initialValues?.method, initialValues?.type]);

  useEffect(() => {
    if (updateSuccess || createSuccess) {
      discountForm.resetFields();
      toggle();
    }
  }, [updateSuccess, createSuccess]);

  const handleSubmit = async (values: DiscountsFormValues) => {
    const formData = new FormData();

    if (values.type == DiscountType.PERCENT && values?.value! > 100) {
      discountForm.setFields([
        {
          name: "value",
          errors: ["Percentage discount can not be more than 100%"],
        },
      ]);
      return;
    }

    formData.append("method", discountMethod);

    for (const key in values) {
      const typedKey = key as keyof DiscountsFormValues;
      const value = values[typedKey];

      if (value !== undefined && value !== null) {
        if (Array.isArray(value)) {
          formData.append(typedKey, JSON.stringify(value));
        } else {
          formData.append(typedKey, value as string | Blob);
        }
      }
    }

    if (initialValues?.id) {
      await updateDiscount({ id: initialValues?.id, data: formData });
    } else {
      await createDiscount(formData);
    }
  };

  const handleGenerateCode = () => {
    if (disableCodeInput) return;

    const characters = "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789";
    let result = "SAVE";
    for (let i = 0; i < 8; i++) {
      result += characters.charAt(Math.floor(Math.random() * characters.length));
    }

    discountForm.setFieldsValue({ name: result });
  };

  const handleDiscountTypeChange = (value: string | string[]) => {
    if (Array.isArray(value)) return;
    const type = value as DiscountType;
    setDiscountType(type);
    discountForm.setFields([
      { name: "value", errors: [] },
      { name: "freeShippingMinAmount", errors: [] },
    ]);
    if (type === DiscountType.FREE_SHIPPING && !initialValues) {
      const currentName = discountForm.getFieldValue("name");
      if (!currentName) {
        discountForm.setFieldsValue({ name: "Free shipping" });
      }
    }
  };

  return (
    <AppModal title={initialValues ? "Edit Discount" : "Create Discount"} onOk={discountForm.submit} width={600} okText={isCreating || isUpdating ? "Saving.." : "Save"} open={open} toggle={toggle}>
      <Form
        size="small"
        initialValues={{
          ...initialValues,
          image: initialValues && initialValues.bannerUrl,
          ...(initialValues?.startDate && {
            startDate: dayjs(initialValues.startDate),
          }),
          ...(initialValues?.endDate && {
            endDate: dayjs(initialValues.endDate),
          }),
        }}
        disabled={isCreating || isUpdating}
        onFinish={handleSubmit}
        form={discountForm}
        layout={"vertical"}
      >
        {!initialValues && (
          <div className="px-8 py-5">
            <p className="mb-2">Method</p>
            <Segmented
              defaultValue={discountMethod}
              options={[
                { label: "Discount Code", value: DiscountMethod.CODE },
                { label: "Automatic Discount", value: DiscountMethod.AUTO },
              ]}
              onChange={(value) => {
                setDiscountMethod(value as DiscountMethod);
              }}
            />
          </div>
        )}

        <div className="grid grid-cols-2 gap-x-4 px-8">
          {isValueType(discountType) && isAuto && (
            <InputFormItem
              label="Label"
              name="name"
              placeholder="e.g., BLACK FRIDAY"
              className="!col-span-2 !pb-3"
              rules={[{ required: true, message: "Please enter a discount name" }]}
              help="This discount will be automatically applied in the cart and at checkout."
            />
          )}

          {isValueType(discountType) && isCode && (
            <InputFormItem
              label="Code"
              disable={disableCodeInput}
              name="name"
              placeholder="SWEET-DELLIE"
              className="!col-span-2 !pb-3"
              rules={[{ required: true, message: "Please enter a discount name" }]}
              help="The discount applies only if customers enter this code at checkout."
              afterText={
                <p className="text-blue-700 cursor-pointer" onClick={handleGenerateCode}>
                  Generate code
                </p>
              }
            />
          )}

          {discountType === DiscountType.FREE_SHIPPING && (
            <InputFormItem
              label="Discount name"
              name="name"
              placeholder="e.g., Free Shipping"
              className="!col-span-2"
              rules={[{ required: true, message: "Please enter a discount name" }]}
            />
          )}

          <SelectFormItem
            label="Discount Type"
            name="type"
            options={[
              { value: DiscountType.PERCENT, label: "Percentage" },
              { value: DiscountType.FIXED, label: "Fixed Amount" },
              { value: DiscountType.FREE_SHIPPING, label: "Free Shipping" },
            ]}
            onChange={handleDiscountTypeChange}
            rules={[{ required: true, message: "Please select a discount type" }]}
          />

          {isValueType(discountType) && (
            <InputFormItem
              type="number"
              label={`Discount ${discountType === DiscountType.PERCENT ? "(%)" : "(GHS)"}`}
              name="value"
              placeholder={discountType === DiscountType.PERCENT ? "0%" : "GHS 0"}
              rules={[{ required: true, message: "Please enter a discount value" }]}
            />
          )}

          {discountType === DiscountType.FREE_SHIPPING && (
            <InputFormItem
              type="number"
              label="Minimum order amount (GHS)"
              name="freeShippingMinAmount"
              placeholder="Optional minimum"
            />
          )}

          <Form.Item label="When Discount Begins" name="startDate">
            <DatePicker
              className="w-full"
              format="MMM D, YYYY"
              disabledDate={(current: dayjs.Dayjs) => {
                return current && current < dayjs().startOf("day");
              }}
            />
          </Form.Item>

          <Form.Item
            label="When Discount Ends"
            name="endDate"
            rules={[
              ({ getFieldValue }) => ({
                validator(_, value) {
                  const startDate = getFieldValue("startDate");
                  if (value && startDate && dayjs(value).isBefore(dayjs(startDate))) {
                    return Promise.reject("End date must be after start date");
                  }
                  return Promise.resolve();
                },
              }),
            ]}
          >
            <DatePicker
              className="w-full"
              format="MMM D, YYYY"
              disabledDate={(current: dayjs.Dayjs) => {
                const startDate = discountForm.getFieldValue("startDate");
                return current && (current < dayjs().startOf("day") || (startDate && current < dayjs(startDate).startOf("day")));
              }}
            />
          </Form.Item>

          {isValueType(discountType) && <InputFormItem type="number" label="Minimum purchase amount (GHS)" name="minAmount" placeholder="Enter amount if any" />}

          {isValueType(discountType) && isCode && <InputFormItem type="number" label="Total Usage Limit" name="usageLimit" placeholder="e.g. 100 uses total" />}

          <Form.Item label="Products" name="applicableProductIds" className="col-span-2">
            <ProductPicker />
          </Form.Item>

          {isAuto && (
            <div className="col-span-2">
              <Form.Item label="Applies to" name="appliesTo" initialValue={DiscountAppliesTo.BOTH}>
                <Segmented
                  options={[
                    { label: "Storefront", value: DiscountAppliesTo.STOREFRONT },
                    { label: "POS", value: DiscountAppliesTo.POS },
                    { label: "Both", value: DiscountAppliesTo.BOTH },
                  ]}
                />
              </Form.Item>
            </div>
          )}
        </div>
      </Form>
    </AppModal>
  );
}
