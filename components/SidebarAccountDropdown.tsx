import React, { memo } from "react";
import { Dropdown, type MenuProps } from "antd";

import { FiSettings, FiHelpCircle, FiLogOut } from "react-icons/fi";

const items: MenuProps["items"] = [
  {
    key: "settings",
    icon: <FiSettings size={16} />,
    label: <div>Settings</div>,
  },
  {
    key: "help",
    icon: <FiHelpCircle size={16} />,
    label: <div>Help</div>,
  },
  {
    key: "logout",
    icon: <FiLogOut size={16} />,
    danger: true,
    label: <div>Logout</div>,
  },
];

interface AccountProps {
  isCollapsed: boolean;
}

const SidebarAccountDropdown = ({ isCollapsed }: AccountProps) => {
  const onMenuClick: MenuProps["onClick"] = ({ key }) => {
    switch (key) {
      case "settings":
        // navigate to settings
        break;

      case "help":
        // open help page
        break;

      case "logout":
        // logout user
        break;
    }
  };

  return (
    <Dropdown menu={{ items }} placement="top">
      <div className="p-3 border-t border-gray-200">
        <Account isCollapsed={isCollapsed} />
      </div>
    </Dropdown>
  );
};

const Account = memo(({ isCollapsed }: AccountProps) => {
  if (isCollapsed) return null;

  const user = {
    name: "User Name",
    email: "user@example.com",
    initial: "U",
  };

  return (
    <div className="flex items-center gap-x-3">
      <div className="w-8 h-8 rounded-full bg-gray-100 flex items-center justify-center text-sm font-medium text-gray-600">{user.initial}</div>
      <div className="overflow-hidden">
        <p className="text-sm font-medium text-gray-900 truncate">{user.name}</p>
        <p className="text-xs text-gray-500 truncate">{user.email}</p>
      </div>
    </div>
  );
});
Account.displayName = "Account";

export default SidebarAccountDropdown;
