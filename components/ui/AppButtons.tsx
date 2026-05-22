import { Button } from "antd";
import { IoAddCircleOutline } from "react-icons/io5";
import { LuFilter } from "react-icons/lu";
import { TfiImport, TfiExport } from "react-icons/tfi";

export function BaseButton({
  icon,
  label,
  type = "primary",
  classNames,
  form,
  htmlType,
  onClick,
  size = "large",
  disabled,
}: {
  classNames?: string;
  type?: "primary" | "default";
  icon?: React.ReactNode;
  label: string;
  form?: string;
  htmlType?: "button" | "submit" | "reset";
  onClick?: () => void;
  size?: "large" | "small" | "middle";
  disabled?: boolean;
}) {
  return (
    <Button onClick={onClick} type={type} disabled={disabled} size={size} htmlType={htmlType} form={form} className={`  !py-[.3rem] border-0    !font-medium  !shadow-none  !rounded-full ` + classNames}>
      {icon} {label}
    </Button>
  );
}

export function AddButton({ label, onClick }: { label: string; onClick: () => void }) {
  return <BaseButton size="middle" onClick={onClick} icon={<IoAddCircleOutline />} label={label} classNames="  !text-sm " />;
}

export function FilterButton({ onClick }: { onClick: () => void }) {
  return <BaseButton onClick={onClick} icon={<LuFilter />} label={"Filter"} type="default" classNames="!text-gray-500 font-normal !h-[36px] !text-sm" />;
}

export function ImportExportButton() {
  return (
    <>
      <Button shape="circle">
        <TfiImport />
      </Button>
      <Button shape="circle">
        <TfiExport />
      </Button>
    </>
  );
}
