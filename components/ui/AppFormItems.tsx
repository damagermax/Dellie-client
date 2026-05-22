import { ColorPicker, DatePicker, Form, Input, Select } from "antd";
import { ReactNode } from "react";

import PhoneInput from "react-phone-input-2";
import "react-phone-input-2/lib/style.css";

const { TextArea } = Input;

type FormItemProps = {
  label: string;
  name: string;
  placeholder?: string;
  rules?: any;
  help?: string;
  className?: string;
  afterText?: string | ReactNode;
  addonBefore?: string;
  type?: string;
  mode?: "multiple" | "tags" | undefined;
  variant?: "outlined" | "underlined";
  disable?: boolean;
};

interface DatePickerFormItemProps extends FormItemProps {
  showTime?: boolean;
  format?: string;
  disabledDate?: (currentDate: any) => boolean;
  className?: string;
  picker?: "date" | "week" | "month" | "quarter" | "year";
}

export function PhoneInputFormItem({ label, name, rules, className }: FormItemProps) {
  return (
    <Form.Item className={className} label={label} name={name} rules={rules} getValueFromEvent={(value: string) => value}>
      <PhoneInput country={"gh"} containerStyle={{ width: "100%" }} inputStyle={{ width: "100%" }} />
    </Form.Item>
  );
}

export function DatePickerFormItem({ label, name, placeholder, rules, showTime = false, format = "YYYY-MM-DD", disabledDate, className = "", picker = "date" }: DatePickerFormItemProps) {
  return (
    <Form.Item className={className} label={label} name={name} rules={rules}>
      <DatePicker className="w-full" showTime={showTime} format={format} disabledDate={disabledDate} picker={picker} placeholder={placeholder} />
    </Form.Item>
  );
}

export function ColorFormItem({ label, name, rules, className }: FormItemProps) {
  return (
    <Form.Item className={className} label={label} name={name} rules={rules} valuePropName="value" getValueFromEvent={(color, hex) => hex}>
      <ColorPicker onChange={(color, hex) => hex} format="hex" defaultValue="#1677ff" className=" !px-2  !py-[5px] !justify-start   !w-full" size="middle" showText />
    </Form.Item>
  );
}

export function InputFormItem({ type, help, disable, variant = "outlined", className, label, name, placeholder, rules, addonBefore, afterText }: FormItemProps) {
  return (
    <Form.Item help={<p className=" text-[8px]!">{help}</p>} className={className} label={label} name={name} rules={rules}>
      {type === "password" ? (
        <Input.Password variant={variant} placeholder={placeholder} className=" disabled:!bg-white disabled:!text-gray-700" />
      ) : (
        <Input type={type} variant={variant} disabled={disable} placeholder={placeholder} addonBefore={addonBefore} suffix={afterText} className=" disabled:!bg-white disabled:!text-gray-700" />
      )}
    </Form.Item>
  );
}

export function TextAreaFormItem({ className, label, name, placeholder, rules, help }: FormItemProps) {
  return (
    <Form.Item className={className} help={help} label={label} name={name} rules={rules}>
      <TextArea rows={3} aria-expanded placeholder={placeholder} className=" disabled:!bg-white disabled:!text-gray-700" />
    </Form.Item>
  );
}

interface SelectFormItemProps extends FormItemProps {
  options: { value: string | boolean; label: string }[];
  mode?: "multiple" | "tags";
  onChange?: (value: string | string[]) => void;
}

export function SelectFormItem({ variant = "outlined", className, label, name, placeholder, rules, options, mode, onChange }: SelectFormItemProps) {
  return (
    <Form.Item className={className} label={label} name={name} rules={rules}>
      <Select mode={mode} allowClear variant={variant} options={options} placeholder={placeholder || "Select one..."} onChange={onChange} className=" disabled:!bg-white disabled:!text-gray-700" />
    </Form.Item>
  );
}
