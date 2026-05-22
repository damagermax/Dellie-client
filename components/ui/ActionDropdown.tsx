import { Dropdown, Flex, MenuProps } from "antd";
import { GrEdit } from "react-icons/gr";
import { HiOutlineTrash } from "react-icons/hi2";
import { LuEyeOff } from "react-icons/lu";
import { RiMoreLine } from "react-icons/ri";
import { ReactNode } from "react";

export interface ActionDropdownProps {
  menu?: MenuProps;
  openEditModal?: () => void;
  onDelete?: () => void;
  onActivate?: () => void;
  onDeactivate?: () => void;
  status?: "active" | "inactive";
}

interface DropdownItemLabelProps {
  icon: ReactNode;
  text: string;
  danger?: boolean;
}

export function DropdownItemLabel({ icon, text, danger = false }: DropdownItemLabelProps) {
  return (
    <Flex className={`flex gap-x-2 items-center ${danger ? "text-red-600" : "text-gray-600"}`}>
      {icon}
      <span>{text}</span>
    </Flex>
  );
}

export function ActionDropdown({ menu, openEditModal, onDelete, onActivate, onDeactivate, status }: ActionDropdownProps) {
  const items = [
    ...(openEditModal
      ? [
          {
            key: "edit",
            label: <DropdownItemLabel icon={<GrEdit size={15} />} text="Edit" />,
            onClick: openEditModal,
          },
        ]
      : []),

    ...(menu?.items ?? []),

    ...(status === "active" && onDeactivate
      ? [
          {
            key: "deactivate",
            label: <DropdownItemLabel icon={<LuEyeOff size={15} />} text="Deactivate" />,
            onClick: onDeactivate,
          },
        ]
      : []),

    ...(status === "inactive" && onActivate
      ? [
          {
            key: "deactivate",
            label: <DropdownItemLabel icon={<LuEyeOff size={15} />} text="Activate" />,
            onClick: onActivate,
          },
        ]
      : []),

    ...(onDelete
      ? [
          {
            key: "delete",
            label: <DropdownItemLabel icon={<HiOutlineTrash size={15} />} text="Delete" danger />,
            onClick: onDelete,
          },
        ]
      : []),
  ];

  return (
    <div className="flex gap-x-3 items-center justify-end">
      {/* <div onClick={openEditModal} className="p-[2px] rounded-full bg-gray-100 text-gray-500 cursor-pointer w-[2rem] flex items-center justify-center h-[2rem]">
        <GrEdit size={12} />
      </div> */}

      <Dropdown arrow={{ pointAtCenter: true }} menu={{ items }} trigger={["click"]} placement="bottomRight">
        <div className="p-[2px] rounded-full bg-gray-100 text-gray-600 cursor-pointer w-[2rem] flex items-center justify-center h-[2rem]">
          <RiMoreLine size={15} />
        </div>
      </Dropdown>
    </div>
  );
}
