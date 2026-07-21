import { Flex, MenuProps } from "antd";
import { GrEdit } from "react-icons/gr";
import { HiOutlineTrash } from "react-icons/hi2";
import { LuEyeOff } from "react-icons/lu";
import { ReactNode } from "react";
import ResponsiveActionMenu from "./ResponsiveActionMenu";

type ActionMenuItem = NonNullable<MenuProps["items"]>[number] & { onClick?: () => void };

export interface ActionDropdownProps {
  menu?: MenuProps;
  openEditModal?: () => void;
  onDelete?: () => void;
  onActivate?: () => void;
  onDeactivate?: () => void;
  status?: "active" | "inactive";
  isTransparent?: boolean;
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

export function ActionDropdown({ menu, openEditModal, onDelete, onActivate, onDeactivate, status, isTransparent }: ActionDropdownProps) {
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
            key: "activate",
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

  const handleClick: MenuProps["onClick"] = ({ key }) => {
    const selectedItem = items.find((item): item is ActionMenuItem => Boolean(item && "key" in item && item.key === key));

    if (key === "edit" && openEditModal) {
      openEditModal();
      return;
    }
    if (key === "delete") {
      if (onDelete) {
        onDelete();
        return;
      }
    }
    if (key === "deactivate") {
      if (onDeactivate) {
        onDeactivate();
        return;
      }
    }
    if (key === "activate") {
      if (onActivate) {
        onActivate();
        return;
      }
    }

    selectedItem?.onClick?.();
  };

  return <ResponsiveActionMenu items={items} onClick={handleClick} isTransparent={isTransparent} />;
}
