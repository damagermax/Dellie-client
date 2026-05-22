"use client";

import OrderFormModal from "@/components/orders/OderFormModal";
import { AddButton } from "@/components/ui/AppButtons";
import { AppSearch } from "@/components/ui/AppSearchInput";
import useToggle from "@/hooks/UseToggle";

import type { MenuProps } from "antd";
import { Menu } from "antd";

import AppViewSegments from "@/components/ui/AppViewSegments";

import OrdersView from "@/components/orders/OrdersViews/OrdersView";
import { useState } from "react";

type MenuItem = Required<MenuProps>["items"][number];

export default function OrderPage() {
  const [openOrderFrom, toggleOderFormModal] = useToggle();

  const [view, setView] = useState<"card" | "list" | "table" | "kanban">("kanban");

  const items: MenuItem[] = [
    {
      label: "Pending",
      key: "/products",
    },
    {
      label: "Processing",
      key: "/categories",
    },

    {
      key: "/brands",
      label: "Fulfilled",
    },

    {
      key: "/discounts",
      label: "Cancelled",
    },

    {
      key: "/coupons",
      label: "Abandoned",
    },
  ];
  return (
    <div className="">
      <h3 className="pageTittle px-8  ">Orders</h3>
      <hr className=" border-gray-200/80" />

      <div className="px-8 my-8  flex justify-between w-full ">
        <div className="flex gap-x-5  ">
          <AppSearch />
        </div>
        <div className=" flex items-center gap-x-6  ">
          <AppViewSegments view={view} onChange={setView} />
          <AddButton onClick={toggleOderFormModal} label="New Order" />
        </div>
      </div>

      <div className=" hidden px-4 mb-5">
        <Menu style={{ marginTop: "2rem", fontSize: "16px" }} className="mt-[8rem]" mode="horizontal" items={items} />
      </div>

      <hr className=" border-gray-200/80" />

      <OrdersView view={view} />
      <OrderFormModal toggle={toggleOderFormModal} open={openOrderFrom} />
    </div>
  );
}
