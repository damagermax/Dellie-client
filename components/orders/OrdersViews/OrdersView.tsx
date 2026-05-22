"use client";

import dynamic from "next/dynamic";
import OrdersCardView from "./OrdersCardView";
import OrdersListView from "./OrdersListView";
import OrdersTable from "./OrdersTable";

// Dynamically import the Kanban view with no SSR to avoid window is not defined errors
const OrdersKanbanView = dynamic(() => import("./OrdersKanbanView"), { ssr: false });

export default function OrdersView({ view }: { view: "card" | "list" | "table" | "kanban" }) {
  return (
    <section className="  h-[calc(100vh-12rem)]">
      {view === "card" && <OrdersCardView />}
      {view === "list" && <OrdersListView />}
      {view === "table" && <OrdersTable />}
      {view === "kanban" && <OrdersKanbanView />}
    </section>
  );
}
