"use client";

import type { MenuProps } from "antd";
import { Menu } from "antd";
import { useState } from "react";

import TransactionsView from "@/components/transactions/TransactionsView";
import { AddButton } from "@/components/ui/AppButtons";
import { AppSearch } from "@/components/ui/AppSearchInput";
import AppViewSegments, { ViewType } from "@/components/ui/AppViewSegments";

type MenuItem = Required<MenuProps>["items"][number];

export default function TransactionsPage() {
    const [view, setView] = useState<ViewType>("table");

    const items: MenuItem[] = [
        {
            label: "All",
            key: "all",
        },
        {
            label: "Completed",
            key: "completed",
        },
        {
            label: "Pending",
            key: "pending",
        },
        {
            label: "Failed",
            key: "failed",
        },
        {
            label: "Refunded",
            key: "refunded",
        },
    ];

    return (
        <div className="">
            
            <div className="px-8 mb-8 flex justify-between w-full">
                <div className="flex gap-x-5">
                    <AppSearch placeholder="Search transactions..." />
                </div>
                <div className="flex items-center gap-x-6">
                    <AppViewSegments view={view} onChange={(view) => setView(view)} />
                    <AddButton onClick={() => {}} label="Export" />
                </div>
            </div>

            <div className="hidden px-4 mb-5">
                <Menu style={{ marginTop: "2rem", fontSize: "16px" }} className="mt-[8rem]" mode="horizontal" items={items} />
            </div>

            <hr className="border-gray-200/80" />

            <TransactionsView view={view} />
        </div>
    );
}
