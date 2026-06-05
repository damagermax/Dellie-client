"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Modal, Tag, message } from "antd";
import type { TableProps } from "antd/es/table";
import PurchaseOrderFormModal from "@/components/purchase-orders/PurchaseOrderFormModal";
import SettingsDrawer from "@/components/settings/SettingsDrawer";
import { ActionDropdown, DropdownItemLabel } from "@/components/ui/ActionDropdown";
import { AddButton } from "@/components/ui/AppButtons";
import { AppNotFoundView } from "@/components/ui/AppNotFoundView";
import { AppSearch } from "@/components/ui/AppSearchInput";
import AppTable from "@/components/ui/AppTable";
import { AppViewLoader } from "@/components/ui/AppViewLoader";
import useToggle from "@/hooks/UseToggle";
import { formatDate } from "@/lib/dateUtils";
import { useDeletePurchaseMutation, useGetPurchasesQuery, useReopenPurchaseMutation } from "@/lib/redux/services";
import { Purchase, PurchaseQueryParams } from "@/types/index";
import { GrEdit } from "react-icons/gr";
import { HiOutlineTrash } from "react-icons/hi2";
import { LuEye } from "react-icons/lu";

function apiError(error: any, fallback: string) {
  const message = error?.data?.message;
  return Array.isArray(message) ? message.join(" ") : message || fallback;
}

function visibleDeleteRestrictions(purchase: Purchase) {
  const restrictions: string[] = [];
  const toCents = (value: number) => Math.round(Number(value || 0) * 100);
  const hasReceivedStock = purchase.receiptStatus !== "pending" || purchase.lineItems.some((line) => Number(line.fulfilledQuantity || 0) > 0) || Boolean(purchase.fulfilledItems?.length);

  if (purchase.locked) restrictions.push("it is locked");
  if (hasReceivedStock) restrictions.push("stock has been received");
  if (purchase.landedCosts?.length) restrictions.push("landed costs have been added");
  if (purchase.payments?.length || toCents(purchase.balance) !== toCents(purchase.amount)) {
    restrictions.push("payments have been recorded");
  }
  return restrictions;
}

export default function PurchaseOrdersPage() {
  const router = useRouter();
  const [formOpen, toggleForm] = useToggle();
  const [editOpen, toggleEdit] = useToggle();
  const [selectedPurchase, setSelectedPurchase] = useState<Purchase>();
  const [deletingPurchaseId, setDeletingPurchaseId] = useState<string>();
  const [reopeningPurchaseId, setReopeningPurchaseId] = useState<string>();
  const [query, setQuery] = useState<PurchaseQueryParams>({ page: 1, limit: 20 });
  const { data, error, isLoading, isError } = useGetPurchasesQuery(query, { refetchOnMountOrArgChange: true });
  const [cancelPurchase] = useDeletePurchaseMutation();
  const [reopenPurchase] = useReopenPurchaseMutation();

  const openEdit = (purchase: Purchase) => {
    setSelectedPurchase(purchase);
    toggleEdit();
  };

  const confirmCancel = (purchase: Purchase) => {
    if (deletingPurchaseId === purchase.id) return;

    const restrictions = visibleDeleteRestrictions(purchase);
    if (restrictions.length) {
      Modal.warning({
        title: `${purchase.purchaseNumber} cannot be cancelled`,
        content: `This purchase cannot be cancelled because ${restrictions.join(", ")}.`,
      });
      return;
    }

    Modal.confirm({
      title: `Cancel ${purchase.purchaseNumber}?`,
      content: "All related transactions will be reversed. This action cannot be undone.",
      okText: "Cancel",
      okType: "danger",
      onOk: async () => {
        setDeletingPurchaseId(purchase.id);
        try {
          await cancelPurchase(purchase.id).unwrap();
          message.success("Purchase cancelled and related transactions reversed.");
          if (selectedPurchase?.id === purchase.id) {
            if (editOpen) toggleEdit();
            setSelectedPurchase(undefined);
          }
        } catch (error: any) {
          message.error(apiError(error, "Purchase could not be cancelled."));
          throw error;
        } finally {
          setDeletingPurchaseId(undefined);
        }
      },
    });
  };

  const reopen = async (purchase: Purchase) => {
    if (reopeningPurchaseId === purchase.id) return;
    setReopeningPurchaseId(purchase.id);
    try {
      await reopenPurchase(purchase.id).unwrap();
      message.success("Purchase reopened.");
    } catch (error: any) {
      message.error(apiError(error, "Purchase could not be reopened."));
    } finally {
      setReopeningPurchaseId(undefined);
    }
  };

  const columns: TableProps<Purchase>["columns"] = [
    {
      title: "Purchase Number",
      key: "purchaseNumber",
      className: "!pl-8",
      render: (_, purchase) => (
        <Link href={`/purchases/${purchase.id}`} className="font-medium !text-gray-700 hover:!text-indigo-600">
          {purchase.purchaseNumber}
        </Link>
      ),
    },
    {
      title: "Status",
      key: "status",
      render: (_, purchase) =>
        purchase.isDeleted ? (
          <Tag className="!m-0 !rounded-full !px-2" color="red">
            Cancelled
          </Tag>
        ) : (
          <Tag className="!m-0 !rounded-full !px-2 capitalize" color={purchase.receiptStatus === "received" ? "green" : purchase.receiptStatus === "partially_received" ? "gold" : "blue"}>
            {purchase.receiptStatus.replaceAll("_", " ")}
          </Tag>
        ),
    },
    { title: "Supplier", key: "supplier", render: (_, purchase) => purchase.contactId?.name || purchase.contactId?.displayName || "-" },
    { title: "Date", key: "date", render: (_, purchase) => formatDate(purchase.date) },
    // { title: "Expected Delivery", key: "deliveryDate", render: (_, purchase) => formatDate(purchase.deliveryDate) },
    // { title: "Location", key: "location", render: (_, purchase) => purchase.locationId?.name || "-" },

    {
      title: "Total Amount",
      key: "amount",
      render: (_, purchase) => (
        <p>
          {purchase.currencyId?.code || ""} {Number(purchase.amount || 0).toLocaleString(undefined, { minimumFractionDigits: 2 })}
        </p>
      ),
    },
    {
      title: "Balance",
      key: "balance",
      render: (_, purchase) => (
        <p className=" border border-solid border-amber-600 w-fit px-2 rounded-full text-amber-600 font-semibold">
          {purchase.currencyId?.code || ""} {Number(purchase.balance || 0).toLocaleString(undefined, { minimumFractionDigits: 2 })}
        </p>
      ),
    },
    {
      title: "Actions",
      key: "actions",
      align: "right",
      className: "!pr-8",
      render: (_, purchase) => (
        <ActionDropdown
          menu={{
            items: [
              {
                key: "view",
                label: <DropdownItemLabel icon={<LuEye size={15} />} text="View" />,
                onClick: () => router.push(`/purchases/${purchase.id}`),
              },
                ...(purchase.isDeleted
                  ? [
                      {
                        key: "reopen",
                        label: <DropdownItemLabel icon={<GrEdit size={15} />} text="Reopen" />,
                        disabled: reopeningPurchaseId === purchase.id,
                        onClick: () => reopen(purchase),
                      },
                    ]
                  : [
                      {
                        key: "edit",
                        label: <DropdownItemLabel icon={<GrEdit size={15} />} text="Edit" />,
                        disabled: Boolean(purchase.locked || purchase.receiptStatus === "received"),
                        onClick: () => openEdit(purchase),
                      },
                      {
                        key: "delete",
                        label: <DropdownItemLabel icon={<HiOutlineTrash size={15} />} text="Cancel" danger />,
                        disabled: deletingPurchaseId === purchase.id,
                        onClick: () => confirmCancel(purchase),
                      },
                    ]),
              ],
            }}
          />
      ),
    },
  ];

  return (
    <div>
      <h3 className="pageTittle px-8">Purchases</h3>
      <hr className="border-gray-200/80" />
      <div className="flex w-full justify-between px-8 py-8">
        <AppSearch placeholder="Search purchase number..." onReset={() => setQuery({ page: 1, limit: 20 })} onSearchChange={(values) => setQuery((current: PurchaseQueryParams) => ({ ...current, ...values, page: 1 }))} />
        <div className="flex gap-x-5">
          <AddButton onClick={toggleForm} label="New Purchase" />
          <SettingsDrawer />
        </div>
      </div>

      <AppViewLoader loading={isLoading} />
      {isError && <p className="px-8 py-8 text-sm text-red-600">{apiError(error, "Purchases could not be loaded.")}</p>}
      {!isError && <AppNotFoundView dataLength={data?.data?.length || 0} loading={isLoading} query={{ search: query.search }} entity="Purchase" />}
      {!isError && <AppTable columns={columns} dataSource={data?.data || []} rowKey="id" />}

      {formOpen && <PurchaseOrderFormModal open={formOpen} toggle={toggleForm} />}
      {editOpen && selectedPurchase && <PurchaseOrderFormModal open={editOpen} toggle={toggleEdit} purchase={selectedPurchase} />}
    </div>
  );
}
