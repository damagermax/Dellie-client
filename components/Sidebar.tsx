"use client";
import { cn } from "@/lib/utils";
import { Drawer } from "antd";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { memo, useCallback, useEffect, useState } from "react";
import { GoChevronLeft, GoChevronRight, GoCreditCard, GoTag } from "react-icons/go";
import { RiGroupLine, RiShoppingBag2Line } from "react-icons/ri";
import { TbLayoutGridAdd } from "react-icons/tb";
import { LuEllipsis, LuMenu, LuPackage2 } from "react-icons/lu";
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

type MenuItemProps = {
  title: string;
  link: string;
  icon: React.ReactNode;
  isActive: boolean;
  isCollapsed: boolean;
  onClick?: () => void;
};

// Memoize the menu items to prevent unnecessary re-renders
const MENU_ITEMS: SidebarMenuItem[] = [
  { title: "Dashboard", link: "/dashboard", icon: <TbLayoutGridAdd /> },
  { title: "Catalog", link: "/products", icon: <LuPackage2 />, permission: StorePermission.PRODUCTS_VIEW, moduleKey: "catalog" },
  { title: "Purchases", link: "/purchases", icon: <RiShoppingBag2Line />, permission: StorePermission.PURCHASES_VIEW, moduleKey: "purchases" },
  // { title: "Inventory", link: "/transactions", icon: <GoCreditCard /> },
  { title: "Sales", link: "/orders", icon: <GoTag />, permission: StorePermission.SALES_VIEW, moduleKey: "sales" },
  { title: "Expenses", link: "/expenses", icon: <GoCreditCard />, permission: StorePermission.EXPENSES_VIEW, moduleKey: "expenses" },
  { title: "Contacts", link: "/contacts", icon: <RiGroupLine />, permission: StorePermission.CONTACTS_VIEW, moduleKey: "contacts" },
  { title: "POS", link: "/pos", icon: <IoWalletOutline />, permission: StorePermission.SALES_VIEW, moduleKey: "pos" },
  { title: "More", link: "/settings", icon: <LuEllipsis /> },
];

// Memoized component to prevent unnecessary re-renders
const MenuItem = memo(({ title, link, icon, isActive, isCollapsed = true, onClick }: MenuItemProps) => (
  <li>
    <Link
      href={link}
      onClick={onClick}
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
  const pathname = usePathname();
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [isMobileDrawerOpen, setIsMobileDrawerOpen] = useState(false);
  const toggleSidebar = useCallback(() => setIsCollapsed((prev) => !prev), []);
  const isPosPage = pathname === "/pos";
  const isTopLevelPage = pathname.split("/").filter(Boolean).length <= 1;

  useEffect(() => {
    setIsCollapsed(isPosPage);
  }, [isPosPage]);

  useEffect(() => {
    setIsMobileDrawerOpen(false);
  }, [pathname]);

  return (
    <>
      {!isMobileDrawerOpen && isTopLevelPage ? (
        <button
          type="button"
          onClick={() => setIsMobileDrawerOpen(true)}
          className="fixed right-4  top-3 z-40 flex h-9 w-9 items-center justify-center rounded-md border border-gray-200 bg-white text-gray-700  transition-colors hover:bg-gray-50 lg:hidden"
          aria-label="Open navigation menu"
        >
          <LuMenu size={20} />
        </button>
      ) : null}

      <Drawer open={isMobileDrawerOpen} onClose={() => setIsMobileDrawerOpen(false)} placement="left" closable={false} className="lg:hidden" styles={{ body: { padding: 0 }, content: { backgroundColor: "#f3f4f6" } }}>
        <SidebarContent isCollapsed={false} onItemClick={() => setIsMobileDrawerOpen(false)} onClose={() => setIsMobileDrawerOpen(false)} />
      </Drawer>

      <aside className={cn("relative hidden h-screen flex-shrink-0 border-gray-200 bg-gray-100 transition-all duration-300 lg:block", isCollapsed ? "w-14" : "w-56")} aria-label="Sidebar navigation">
        <SidebarContent isCollapsed={isCollapsed} />

        {!isPosPage ? (
          <button
            onClick={toggleSidebar}
            className="absolute right-[-9px] top-5 z-10 flex h-5 w-5 items-center justify-center rounded-full border border-gray-300 bg-white shadow-md transition-colors hover:bg-gray-50"
            aria-label={isCollapsed ? "Expand sidebar" : "Collapse sidebar"}
          >
            {isCollapsed ? <GoChevronRight size={14} /> : <GoChevronLeft size={14} />}
          </button>
        ) : null}
      </aside>
    </>
  );
};

interface SidebarContentProps {
  isCollapsed: boolean;
  onItemClick?: () => void;
  onClose?: () => void;
}

const SidebarContent = ({ isCollapsed, onItemClick, onClose }: SidebarContentProps) => (
  <div className="flex h-full flex-col px-3">
    <div className={cn("border-b-0 border-gray-200 py-[1rem]", isCollapsed ? "hidden justify-center" : "px-2")}>
      {!isCollapsed && onClose ? (
        <div className="mb-3 flex justify-end">
          <button type="button" onClick={onClose} className="flex h-9 w-9 items-center justify-center rounded-xl border border-gray-200 bg-white text-gray-700 shadow-sm transition-colors hover:bg-gray-50" aria-label="Close navigation menu">
            <GoChevronLeft size={18} />
          </button>
        </div>
      ) : null}
      {/* <img src={"/images/dellie-logo.png"} alt="Moor Logo" style={{ width: "100px", height: "auto" }} className="object-contain hidden" loading="eager" /> */}
      {/* {!isCollapsed && <h2 className="text-2xl  hidden   font-semibold text-gray-800 whitespace-nowrap">Moor</h2>} */}
    </div>

    <StoreSelector />

    <div className="flex-1 overflow-y-auto py-4">
      <PageLinks isCollapsed={isCollapsed} onItemClick={onItemClick} />
    </div>

    <SidebarAccountDropdown isCollapsed={isCollapsed} />
  </div>
);

interface PageLinksProps {
  isCollapsed: boolean;
  onItemClick?: () => void;
}

const PageLinks = ({ isCollapsed, onItemClick }: PageLinksProps) => {
  const pathname = usePathname();
  const permissions = useSelector((state: RootState) => state.currentUser.permissions);
  const enabledModules = useSelector((state: RootState) => state.currentUser.storeSettings.enabledModules);

  return (
    <nav>
      <ul className="grid ">
        {MENU_ITEMS.filter((item) => !item.permission || permissions.includes(item.permission))
          .filter((item) => !item.moduleKey || enabledModules[item.moduleKey])
          .map(({ title, link, icon }, index) => (
            <MenuItem key={link + title + index} title={title} link={link} icon={icon} isActive={pathname === link} isCollapsed={isCollapsed} onClick={onItemClick} />
          ))}
      </ul>
    </nav>
  );
};

export default Sidebar;
