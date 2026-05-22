"use client";

import { useGetInventoryQuery } from "@/lib/redux/services";
import InventoryTable from "./InventoryTable";

export default function InventoryView() {
  const { data: inventoryData } = useGetInventoryQuery({});

  return (
    <>
      <InventoryTable inventory={inventoryData?.data || []} />
    </>
  );
}
