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

import { FaBarcode } from "react-icons/fa";

// Memoize the menu items to prevent unnecessary re-renders
const MENU_ITEMS = [
  // { title: "Quick Setup", link: "/setup", icon: <RxRocket /> },
  { title: "Dashboard", link: "/dashboard", icon: <TbLayoutGridAdd /> },
  { title: "Catalog", link: "/products", icon: <LuPackage2 /> },
  { title: "Purchases", link: "/purchases", icon: <RiShoppingBag2Line /> },
  { title: "Sales", link: "/orders", icon: <GoTag /> },
  // { title: "Inventory", link: "/inventory", icon: <FaBarcode /> },
  { title: "Expenses", link: "/expenses", icon: <GoCreditCard /> },
  { title: "Contacts", link: "/contacts", icon: <RiGroupLine /> },
  { title: "Cash Book", link: "/wallet", icon: <IoWalletOutline /> },
  // { title: "Transactions", link: "/transactions", icon: <GoCreditCard /> },
  // { title: "Settings", link: "/settings/my-store", icon: <RiSettings2Line /> },
] as const;

// Memoized component to prevent unnecessary re-renders
const MenuItem = memo(({ title, link, icon, isActive, isCollapsed }: { title: string; link: string; icon: React.ReactNode; isActive: boolean; isCollapsed: boolean }) => (
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
    <aside className={cn("h-screen bg-gray-100 hidden md:block   border-gray-200 transition-all duration-300 relative flex-shrink-0", isCollapsed ? "w-14" : "w-56")} aria-label="Sidebar navigation">
      <div className="h-full flex flex-col  px-3">
        {/* Logo Section */}
        <div className={cn("py-[1rem]  border-b-0 border-gray-200 flex   ", isCollapsed ? "justify-center hidden" : "px-2 gap-x-2")}>
          {/* <img src={"/images/dellie-logo.png"} alt="Moor Logo" style={{ width: "100px", height: "auto" }} className="object-contain hidden" loading="eager" /> */}
          {/* {!isCollapsed && <h2 className="text-2xl  hidden   font-semibold text-gray-800 whitespace-nowrap">Moor</h2>} */}
        </div>

        {/* Navigation Links */}
        <div className="flex-1 overflow-y-auto py-4">
          <PageLinks isCollapsed={isCollapsed} />
        </div>

        {/* User Account */}
        <div className="p-3 border-t border-gray-200">
          <Account isCollapsed={isCollapsed} />
        </div>

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

  return (
    <nav>
      <ul className="grid ">
        {MENU_ITEMS.map(({ title, link, icon }, index) => (
          <MenuItem key={link + title + index} title={title} link={link} icon={icon} isActive={pathname === link} isCollapsed={isCollapsed} />
        ))}
      </ul>
    </nav>
  );
};

interface AccountProps {
  isCollapsed: boolean;
}

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

export default Sidebar;
