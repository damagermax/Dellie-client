"use client";
import { cn } from "@/lib/utils";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { memo, useCallback, useState } from "react";
import { GoChevronLeft, GoChevronRight, GoCreditCard } from "react-icons/go";
import { LiaStoreAltSolid } from "react-icons/lia";
import { RiGroupLine, RiSettings2Line } from "react-icons/ri";
import { TbLayoutGridAdd } from "react-icons/tb";

// Memoize the menu items to prevent unnecessary re-renders
const MENU_ITEMS = [
    { title: "Overview", link: "/admin/overview", icon: <TbLayoutGridAdd /> },
    { title: "Stores", link: "/admin/stores", icon: <LiaStoreAltSolid /> },
    { title: "Users", link: "/admin/users", icon: <RiGroupLine /> },
    { title: "Transactions", link: "/admin/transactions", icon: <GoCreditCard /> },
    { title: "Settings", link: "admin/settings/my-store", icon: <RiSettings2Line /> },
] as const;

// Memoized component to prevent unnecessary re-renders
const MenuItem = memo(
    ({
        title,
        link,
        icon,
        isActive,
        isCollapsed,
    }: {
        title: string;
        link: string;
        icon: React.ReactNode;
        isActive: boolean;
        isCollapsed: boolean;
    }) => (
        <li>
            <Link
                href={link}
                className={cn(
                    "group text-gray-500 hover:text-gray-900 transition-colors flex items-center p-2 rounded-md",
                    isActive && "text-gray-900 font-medium bg-gray-100"
                )}
                title={isCollapsed ? title : undefined}
            >
                <div className="flex items-center text-lg gap-x-4">
                    <span className="text-xl">{icon}</span>
                    {!isCollapsed && <span className="whitespace-nowrap">{title}</span>}
                </div>
            </Link>
        </li>
    )
);
MenuItem.displayName = "MenuItem";

const AdminSidebar = () => {
    const [isCollapsed, setIsCollapsed] = useState(false);
    const toggleSidebar = useCallback(() => setIsCollapsed((prev) => !prev), []);

    return (
        <aside
            className={cn("h-screen bg-gray-100  border-gray-200 transition-all duration-300 relative flex-shrink-0", isCollapsed ? "w-16" : "w-56")}
            aria-label="Sidebar navigation"
        >
            <div className="h-full flex flex-col">
                {/* Logo Section */}
                <div className={cn("py-4 border-b-0 border-gray-200 flex   ", isCollapsed ? "justify-center" : "px-4 gap-x-2")}>
                    <div className="w-8 h-8 rounded-md overflow-hidden">
                        <img
                            src={"/images/moorlogo.png"}
                            alt="Moor Logo"
                            className="w-full h-full object-cover"
                            width={52}
                            height={52}
                            loading="eager"
                        />
                    </div>
                    {!isCollapsed && <h2 className="text-2xl    font-semibold text-gray-800 whitespace-nowrap">Moor</h2>}
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
                    className="absolute -right-3 top-6 w-6 h-6 rounded-full bg-white border border-gray-300 flex items-center justify-center shadow-md hover:bg-gray-50 transition-colors z-10"
                    aria-label={isCollapsed ? "Expand sidebar" : "Collapse sidebar"}
                >
                    {isCollapsed ? <GoChevronRight size={16} /> : <GoChevronLeft size={16} />}
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
            <ul className="grid gap-1 px-2">
                {MENU_ITEMS.map(({ title, link, icon }) => (
                    <MenuItem key={link} title={title} link={link} icon={icon} isActive={pathname === link} isCollapsed={isCollapsed} />
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

export default AdminSidebar;
