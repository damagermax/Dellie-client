import React, { memo } from "react";
import { Dropdown, type MenuProps } from "antd";
import { useRouter } from "next/navigation";

import { FiSettings, FiHelpCircle, FiLogOut } from "react-icons/fi";
import { useDispatch, useSelector } from "react-redux";

import { clearAccessToken } from "@/lib/redux/features/authSlice";
import { clearUser } from "@/lib/redux/features/userSlice";
import { AppDispatch, RootState } from "@/lib/redux/store";
import { useLogoutMutation } from "@/lib/redux/services";
import { baseApi } from "@/lib/redux/services/baseApi";

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
  const dispatch = useDispatch<AppDispatch>();
  const router = useRouter();
  const currentUser = useSelector((state: RootState) => state.currentUser);
  const [logout] = useLogoutMutation();

  const handleLogout = async () => {
    try {
      await logout().unwrap();
    } catch {
      // Clear the local session even if the server logout request fails.
    } finally {
      dispatch(clearAccessToken());
      dispatch(clearUser());
      dispatch(baseApi.util.resetApiState());
      localStorage.removeItem("accessToken");
      localStorage.removeItem("user");
      router.replace("/auth/signin");
    }
  };

  const onMenuClick: MenuProps["onClick"] = async ({ key }) => {
    switch (key) {
      case "settings":
        router.push("/settings");
        break;

      case "help":
        // open help page
        break;

      case "logout":
        await handleLogout();
        break;
    }
  };

  return (
    <Dropdown menu={{ items, onClick: onMenuClick }} placement="top">
      <div className="p-3 border-t border-gray-200">
        <Account isCollapsed={isCollapsed} user={currentUser.user} />
      </div>
    </Dropdown>
  );
};

const Account = memo(({ isCollapsed, user }: AccountProps & { user: { name?: string; email?: string } | null }) => {
  if (isCollapsed) return null;
  const initial = user?.name?.charAt(0)?.toUpperCase() || user?.email?.charAt(0)?.toUpperCase() || "U";

  return (
    <div className="flex items-center gap-x-3">
      <div className="w-8 h-8 rounded-full bg-gray-100 flex items-center justify-center text-sm font-medium text-gray-600">{initial}</div>
      <div className="overflow-hidden">
        <p className="text-sm font-medium text-gray-900 truncate">{user?.name || "Account"}</p>
        <p className="text-xs text-gray-500 truncate">{user?.email || "Signed in"}</p>
      </div>
    </div>
  );
});
Account.displayName = "Account";

export default SidebarAccountDropdown;
