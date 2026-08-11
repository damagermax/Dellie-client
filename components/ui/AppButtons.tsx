import { Button } from "antd";
import { IoAddCircleOutline } from "react-icons/io5";
import { LuPlus } from "react-icons/lu";

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

export function FloatingAddButton({ onClick, label = "Create" }: { onClick: () => void; label?: string }) {
  return (
    <Button
      type="primary"
      shape="circle"
      onClick={onClick}
      aria-label={label}
      className="!fixed !bottom-6 !right-4 !z-40 !flex !h-10 !w-10 !items-center !justify-center !border-0 !shadow-lg md:!hidden"
    >
      <LuPlus size={18} />
    </Button>
  );
}
