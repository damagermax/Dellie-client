"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Modal, message } from "antd";
import type { TableProps } from "antd/es/table";
import { GrEdit } from "react-icons/gr";
import { HiOutlineTrash } from "react-icons/hi2";
import { LuEye, LuFileText } from "react-icons/lu";
import { ReceiptText } from "lucide-react";
import SaleFormModal from "@/components/orders/SaleFormModal";
import SaleShareDocumentModal, { SaleDocumentType } from "@/components/orders/SaleShareDocumentModal";
import { saleApiError, visibleSaleDeleteRestrictions } from "@/components/orders/saleUtils";
import SettingsDrawer from "@/components/settings/SettingsDrawer";
import { ActionDropdown, DropdownItemLabel } from "@/components/ui/ActionDropdown";
import { AddButton } from "@/components/ui/AppButtons";
import { AppNotFoundView } from "@/components/ui/AppNotFoundView";
import { AppSearch } from "@/components/ui/AppSearchInput";
import AppTable from "@/components/ui/AppTable";
import { AppViewLoader } from "@/components/ui/AppViewLoader";
import useToggle from "@/hooks/UseToggle";
import { formatDate } from "@/lib/dateUtils";
import { useDeleteSaleMutation, useGetSalesQuery } from "@/lib/redux/services";
import { Sale, SaleQueryParams } from "@/types/index";

export default function SalesPage() {
  const router = useRouter();
  const [formOpen, toggleForm] = useToggle();
  const [editOpen, toggleEdit] = useToggle();
  const [selectedSale, setSelectedSale] = useState<Sale>();
  const [shareDocumentType, setShareDocumentType] = useState<SaleDocumentType>();
  const [deletingSaleId, setDeletingSaleId] = useState<string>();
  const [query, setQuery] = useState<SaleQueryParams>({ page: 1, limit: 20 });
  const { data, error, isLoading, isError } = useGetSalesQuery(query, { refetchOnMountOrArgChange: true });
  const [deleteSale] = useDeleteSaleMutation();

  const confirmDelete = (sale: Sale) => {
    if (deletingSaleId === sale.id) return;
    const restrictions = visibleSaleDeleteRestrictions(sale);
    if (restrictions.length) {
      Modal.warning({
        title: `${sale.saleNumber} cannot be deleted`,
        content: `This sale cannot be deleted because ${restrictions.join(", ")}.`,
      });
      return;
    }
    Modal.confirm({
      title: `Delete ${sale.saleNumber}?`,
      content: "Stock deducted by this sale will be restored. This action cannot be undone.",
      okText: "Delete",
      okType: "danger",
      onOk: async () => {
        setDeletingSaleId(sale.id);
        try {
          await deleteSale(sale.id).unwrap();
          message.success("Sale deleted and stock restored.");
          if (selectedSale?.id === sale.id) {
            if (editOpen) toggleEdit();
            setSelectedSale(undefined);
          }
        } catch (error) {
          message.error(saleApiError(error, "Sale could not be deleted."));
          throw error;
        } finally {
          setDeletingSaleId(undefined);
        }
      },
    });
  };

  const columns: TableProps<Sale>["columns"] = [
    {
      title: "Sale Number",
      key: "saleNumber",
      className: "!pl-8",
      render: (_, sale) => (
        <Link href={`/orders/${sale.id}`} className="font-medium !text-gray-700 hover:!text-indigo-600">
          {sale.saleNumber}
        </Link>
      ),
    },
    { title: "Customer", key: "customer", render: (_, sale) => sale.contactId?.name || sale.contactId?.displayName || "-" },
    { title: "Date", key: "date", render: (_, sale) => formatDate(sale.date) },
    { title: "Expected Delivery", key: "deliveryDate", render: (_, sale) => formatDate(sale.deliveryDate) },
    { title: "Location", key: "location", render: (_, sale) => sale.locationId?.name || "-" },
    { title: "Total Amount", key: "amount", render: (_, sale) => `${sale.currencyId?.code || ""} ${Number(sale.amount || 0).toLocaleString(undefined, { minimumFractionDigits: 2 })}` },
    { title: "Balance", key: "balance", render: (_, sale) => `${sale.currencyId?.code || ""} ${Number(sale.balance || 0).toLocaleString(undefined, { minimumFractionDigits: 2 })}` },
    {
      title: "Actions",
      key: "actions",
      align: "right",
      className: "!pr-8",
      render: (_, sale) => (
        <ActionDropdown
          menu={{
            items: [
              {
                key: "view",
                label: <DropdownItemLabel icon={<LuEye size={15} />} text="View" />,
                onClick: () => router.push(`/orders/${sale.id}`),
              },
              {
                key: "edit",
                label: <DropdownItemLabel icon={<GrEdit size={15} />} text="Edit" />,
                disabled: Boolean(sale.locked || sale.receiptStatus === "received" || sale.returnedItems?.length),
                onClick: () => {
                  setSelectedSale(sale);
                  toggleEdit();
                },
              },
              {
                key: "invoice",
                label: <DropdownItemLabel icon={<LuFileText size={15} />} text="Share Invoice" />,
                onClick: () => {
                  setSelectedSale(sale);
                  setShareDocumentType("invoice");
                },
              },
              {
                key: "receipt",
                label: <DropdownItemLabel icon={<ReceiptText size={15} />} text="Share Receipt" />,
                onClick: () => {
                  setSelectedSale(sale);
                  setShareDocumentType("receipt");
                },
              },
              {
                key: "delete",
                label: <DropdownItemLabel icon={<HiOutlineTrash size={15} />} text="Delete" danger />,
                disabled: deletingSaleId === sale.id,
                onClick: () => confirmDelete(sale),
              },
            ],
          }}
        />
      ),
    },
  ];

  return (
    <div>
      <h3 className="pageTittle px-8">Sales</h3>
      <hr className="border-gray-200/80" />
      <div className="flex w-full justify-between px-8 py-8">
        <AppSearch placeholder="Search sale number..." onReset={() => setQuery({ page: 1, limit: 20 })} onSearchChange={(values) => setQuery((current) => ({ ...current, ...values, page: 1 }))} />
        <div className="flex gap-x-5">
          <AddButton onClick={toggleForm} label="New Sale" />
          <SettingsDrawer />
        </div>
      </div>

      <AppViewLoader loading={isLoading} />
      {isError && <p className="px-8 py-8 text-sm text-red-600">{saleApiError(error, "Sales could not be loaded.")}</p>}
      {!isError && <AppNotFoundView dataLength={data?.data?.length || 0} loading={isLoading} query={{ search: query.search }} entity="Sale" />}
      {!isError && <AppTable columns={columns} dataSource={data?.data || []} rowKey="id" />}

      {formOpen && <SaleFormModal open={formOpen} toggle={toggleForm} />}
      {editOpen && selectedSale && <SaleFormModal open={editOpen} toggle={toggleEdit} sale={selectedSale} />}
      {shareDocumentType && selectedSale && (
        <SaleShareDocumentModal
          open={Boolean(shareDocumentType)}
          toggle={() => setShareDocumentType(undefined)}
          sale={selectedSale}
          type={shareDocumentType}
        />
      )}
    </div>
  );
}
