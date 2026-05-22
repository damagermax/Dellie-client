"use client";
import { DatePicker, Form, Input, Select } from "antd";
import dayjs from "dayjs";
import { useState } from "react";

import { InputFormItem, SelectFormItem } from "../ui/AppFormItems";
import { AppModal } from "../ui/AppModal";

interface ModalProps {
    open: boolean;
    toggle: () => void;
    onOk?: () => void;
}

interface CouponFormValues {
    code: string;
    discountType: "Percentage" | "Fixed Amount";
    value: string;
    status: "Active" | "Expired" | "Scheduled";
    usageLimit: number | "Unlimited";
    startDate: string;
    endDate: string;
    customUsageLimit?: number;
}

export default function CouponFormModal({ open, toggle, onOk }: ModalProps) {
    const [form] = Form.useForm<CouponFormValues>();
    const [discountType, setDiscountType] = useState<"Percentage" | "Fixed Amount">("Percentage");
    const [customUsageLimit, setCustomUsageLimit] = useState<boolean>(false);

    const handleSubmit = (values: CouponFormValues) => {
        console.log("Form values:", values);
        if (onOk) onOk();
        if (toggle) toggle();
    };

    const handleDiscountTypeChange = (value: string | string[]) => {
        if (Array.isArray(value)) return;
        const type = value as "Percentage" | "Fixed Amount";
        setDiscountType(type);
        form.setFieldsValue({ value: type === "Percentage" ? "0%" : "GHS 0" });
    };

    const handleUsageLimitChange = (value: string | string[]) => {
        if (Array.isArray(value)) return;
        setCustomUsageLimit(value === "custom");
        if (value !== "custom") {
            form.setFieldsValue({ usageLimit: value === "Unlimited" ? "Unlimited" : parseInt(value, 10) });
        }
    };

    return (
        <AppModal title="Create Coupon" width={800} open={open} toggle={toggle} onOk={() => form.submit()}>
            <Form
                form={form}
                layout="vertical"
                size="small"
                onFinish={handleSubmit}
                initialValues={{
                    discountType: "Percentage",
                    status: "Active",
                    usageLimit: 100,
                    value: "0%",
                }}
            >
                <div className="grid grid-cols-2 gap-x-4 p-5 px-8">
                    <InputFormItem label="Coupon Code" name="code" placeholder="e.g., SUMMER25" rules={[{ message: "Please enter a coupon code" }]} />

                    <SelectFormItem
                        label="Discount Type"
                        name="discountType"
                        options={[
                            { value: "Percentage", label: "Percentage" },
                            { value: "Fixed Amount", label: "Fixed Amount" },
                        ]}
                        onChange={handleDiscountTypeChange}
                    />

                    <Form.Item
                        label={`Discount ${discountType === "Percentage" ? "(%)" : "(GHS)"}`}
                        name="value"
                        rules={[
                            { required: true, message: "Please enter a discount value" },
                            {
                                validator: (_, value: string) => {
                                    if (typeof value !== "string") {
                                        return Promise.reject("Please enter a valid value");
                                    }

                                    if (discountType === "Percentage") {
                                        const percentage = parseFloat(value.replace("%", ""));
                                        if (isNaN(percentage) || percentage < 0 || percentage > 100) {
                                            return Promise.reject("Please enter a valid percentage (0-100)");
                                        }
                                    } else {
                                        const amount = parseFloat(value.replace(/[^0-9.]/g, ""));
                                        if (isNaN(amount) || amount < 0) {
                                            return Promise.reject("Please enter a valid amount");
                                        }
                                    }
                                    return Promise.resolve();
                                },
                            },
                        ]}
                    >
                        <Input
                            placeholder={discountType === "Percentage" ? "0%" : "GHS 0"}
                            className="w-full"
                            prefix={discountType === "Fixed Amount" ? <span>GHS </span> : undefined}
                            suffix={discountType === "Percentage" ? "%" : undefined}
                            type={discountType === "Percentage" ? "number" : "text"}
                            min={0}
                            max={discountType === "Percentage" ? 100 : undefined}
                        />
                    </Form.Item>

                    <SelectFormItem
                        label="Status"
                        name="status"
                        options={[
                            { value: "Active", label: "Active" },
                            { value: "Scheduled", label: "Scheduled" },
                            { value: "Expired", label: "Expired" },
                        ]}
                    />

                    <Form.Item label="Start Date" name="startDate" rules={[{ required: true, message: "Please select start date" }]}>
                        <DatePicker
                            className="w-full"
                            format="MMM D, YYYY"
                            disabledDate={(current: dayjs.Dayjs) => {
                                return current && current < dayjs().startOf("day");
                            }}
                        />
                    </Form.Item>

                    <Form.Item
                        label="End Date"
                        name="endDate"
                        rules={[
                            { required: true, message: "Please select end date" },
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
                                const startDate = form.getFieldValue("startDate");
                                return current && (current < dayjs().startOf("day") || (startDate && current < dayjs(startDate).startOf("day")));
                            }}
                        />
                    </Form.Item>

                    <div className="col-span-2">
                        <Form.Item label="Usage Limit" name="usageLimit">
                            <Select
                                placeholder="Select usage limit"
                                onChange={handleUsageLimitChange}
                                options={[
                                    { value: "Unlimited", label: "Unlimited" },
                                    { value: "50", label: "50 uses" },
                                    { value: "100", label: "100 uses" },
                                    { value: "200", label: "200 uses" },
                                    { value: "500", label: "500 uses" },
                                    { value: "1000", label: "1000 uses" },
                                    { value: "custom", label: "Custom..." },
                                ]}
                            />
                        </Form.Item>
                        {customUsageLimit && (
                            <InputFormItem
                                label="Coupon Code"
                                type="number"
                                name="customUsageLimit"
                                placeholder="Enter custom usage limit"
                                rules={[{ message: "Please enter a coupon code" }]}
                            />
                        )}
                    </div>
                </div>
            </Form>
        </AppModal>
    );
}
