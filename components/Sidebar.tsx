"use client";
import { cn } from "@/lib/utils";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { memo, useCallback, useState } from "react";
import { GoChevronLeft, GoChevronRight, GoCreditCard, GoTag } from "react-icons/go";
import { RiGroupLine, RiSettings2Line, RiShoppingBag2Line } from "react-icons/ri";
import { TbLayoutGridAdd } from "react-icons/tb";
import { LuPackage2 } from "react-icons/lu";
import { IoWalletOutline } from "react-icons/io5";
import { useSelector } from "react-redux";

import SidebarAccountDropdown from "./SidebarAccountDropdown";
import { StoreSelector } from "./dashboard/StoreSelector";
import { RootState } from "@/lib/store";
import { StorePermission } from "@/types/store-access";
import { StoreModuleKey } from "@/types/store-settings";

type SidebarMenuItem = {
  title: string;
  link: string;
  icon: React.ReactNode;
  permission?: StorePermission;
  moduleKey?: StoreModuleKey;
};

// Memoize the menu items to prevent unnecessary re-renders
const MENU_ITEMS: SidebarMenuItem[] = [
  { title: "Dashboard", link: "/dashboard", icon: <TbLayoutGridAdd /> },
  { title: "Catalog", link: "/products", icon: <LuPackage2 />, permission: StorePermission.PRODUCTS_VIEW, moduleKey: "catalog" },
  { title: "Purchases", link: "/purchases", icon: <RiShoppingBag2Line />, permission: StorePermission.PURCHASES_VIEW, moduleKey: "purchases" },
  { title: "Inventory", link: "/transactions", icon: <GoCreditCard /> },
  { title: "Sales", link: "/orders", icon: <GoTag />, permission: StorePermission.SALES_VIEW, moduleKey: "sales" },
  { title: "Expenses", link: "/expenses", icon: <GoCreditCard />, permission: StorePermission.EXPENSES_VIEW, moduleKey: "expenses" },
  { title: "Contacts", link: "/contacts", icon: <RiGroupLine />, permission: StorePermission.CONTACTS_VIEW, moduleKey: "contacts" },
  // { title: "Cash Book", link: "/wallet", icon: <IoWalletOutline />, permission: StorePermission.PAYMENTS_VIEW, moduleKey: "cashBook" },
  { title: "POS", link: "/pos", icon: <IoWalletOutline />, permission: StorePermission.SALES_VIEW, moduleKey: "pos" },
  { title: "Settings", link: "/settings", icon: <RiSettings2Line /> },
];

// Memoized component to prevent unnecessary re-renders
const MenuItem = memo(({ title, link, icon, isActive, isCollapsed = true }: { title: string; link: string; icon: React.ReactNode; isActive: boolean; isCollapsed: boolean }) => (
  <li>
    <Link
      href={link}
      className={cn("group !text-gray-600 hover:text-gray-900 transition-colors flex  items-center p-x-2 py-1.5 rounded-md", isActive && "!text-gray-900 font-medium bg-gray-100", isCollapsed && "justify-center  my-1! ")}
      title={isCollapsed ? title : undefined}
    >
      <div className="flex items-center text-lg gap-x-4">
        <span className="text-xl ">{icon}</span>
        {!isCollapsed && <span className="whitespace-nowrap">{title}</span>}
      </div>
    </Link>
  </li>
));
MenuItem.displayName = "MenuItem";

const Sidebar = () => {
  const [isCollapsed, setIsCollapsed] = useState(false);
  const toggleSidebar = useCallback(() => setIsCollapsed((prev) => !prev), []);

  return (
    <aside className={cn("h-screen bg-gray-100 hidden md:block    border-gray-200 transition-all duration-300 relative flex-shrink-0", isCollapsed ? "w-14 " : "w-56 ")} aria-label="Sidebar navigation">
      <div className="h-full flex flex-col  px-3">
        {/* Logo Section */}
        <div className={cn("py-[1rem]  border-b-0 border-gray-200 flex   ", isCollapsed ? "justify-center hidden" : "px-2 gap-x-2")}>
          {/* <img src={"/images/dellie-logo.png"} alt="Moor Logo" style={{ width: "100px", height: "auto" }} className="object-contain hidden" loading="eager" /> */}
          {/* {!isCollapsed && <h2 className="text-2xl  hidden   font-semibold text-gray-800 whitespace-nowrap">Moor</h2>} */}
        </div>

        {/* Navigation Links */}
        <StoreSelector />

        <div className="flex-1 overflow-y-auto py-4">
          <PageLinks isCollapsed={isCollapsed} />
        </div>

        {/* User Account */}
        <SidebarAccountDropdown isCollapsed={isCollapsed} />

        {/* Collapse Toggle */}
        <button
          onClick={toggleSidebar}
          className="absolute right-[-9px] top-5 w-5 h-5 rounded-full bg-white border border-gray-300 flex items-center justify-center shadow-md hover:bg-gray-50 transition-colors z-10"
          aria-label={isCollapsed ? "Expand sidebar" : "Collapse sidebar"}
        >
          {isCollapsed ? <GoChevronRight size={14} /> : <GoChevronLeft size={14} />}
        </button>
      </div>
    </aside>
  );
};

interface PageLinksProps {
  isCollapsed: boolean;
}

const PageLinks = ({ isCollapsed }: PageLinksProps) => {
  const pathname = usePathname();
  const permissions = useSelector((state: RootState) => state.currentUser.permissions);
  const enabledModules = useSelector((state: RootState) => state.currentUser.storeSettings.enabledModules);

  return (
    <nav>
      <ul className="grid ">
        {MENU_ITEMS.filter((item) => !item.permission || permissions.includes(item.permission))
          .filter((item) => !item.moduleKey || enabledModules[item.moduleKey])
          .map(({ title, link, icon }, index) => (
            <MenuItem key={link + title + index} title={title} link={link} icon={icon} isActive={pathname === link} isCollapsed={isCollapsed} />
          ))}
      </ul>
    </nav>
  );
};

export default Sidebar;
