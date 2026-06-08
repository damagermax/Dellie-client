"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Modal, Tag, message } from "antd";
import type { MenuProps } from "antd";
import type { TableProps } from "antd/es/table";
import { GrEdit } from "react-icons/gr";
import { HiOutlineTrash } from "react-icons/hi2";
import { LuEye, LuFileText } from "react-icons/lu";
import { ReceiptText } from "lucide-react";
import SaleFormModal from "@/components/orders/SaleFormModal";
import SalesMobileList from "@/components/orders/SalesMobileList";
import SaleShareDocumentModal, { SaleDocumentType } from "@/components/orders/SaleShareDocumentModal";
import { saleApiError, saleDocumentNumber, visibleSaleDeleteRestrictions } from "@/components/orders/saleUtils";
import SettingsDrawer from "@/components/settings/SettingsDrawer";
import { ActionDropdown, DropdownItemLabel } from "@/components/ui/ActionDropdown";
import { AddButton } from "@/components/ui/AppButtons";
import { AppNotFoundView } from "@/components/ui/AppNotFoundView";
import { AppSearch } from "@/components/ui/AppSearchInput";
import AppPaginationFooter from "@/components/ui/AppPaginationFooter";
import AppTable from "@/components/ui/AppTable";
import { AppViewLoader } from "@/components/ui/AppViewLoader";
import MobileInfiniteScrollFooter from "@/components/ui/MobileInfiniteScrollFooter";
import MobileListShimmer from "@/components/ui/MobileListShimmer";
import useToggle from "@/hooks/UseToggle";
import { useMobileInfiniteList } from "@/hooks/useMobileInfiniteList";
import { formatDate } from "@/lib/dateUtils";
import { useConvertSaleQuoteMutation, useDeleteSaleMutation, useGetSalesQuery, useReopenSaleMutation } from "@/lib/redux/services";
import { Sale, SaleQueryParams } from "@/types/index";

const saleSourceLabel = (source?: string) => source || "Manual Sale";
const saleSourceColor = (source?: string) => {
  if (source === "POS") return "green";
  if (source === "Online Store") return "blue";
  if (source === "Sales Order") return "gold";
  return "default";
};

export default function SalesPage() {
  const router = useRouter();
  const [formOpen, toggleForm] = useToggle();
  const [editOpen, toggleEdit] = useToggle();
  const [selectedSale, setSelectedSale] = useState<Sale>();
  const [shareDocumentType, setShareDocumentType] = useState<SaleDocumentType>();
  const [deletingSaleId, setDeletingSaleId] = useState<string>();
  const [reopeningSaleId, setReopeningSaleId] = useState<string>();
  const [convertingSaleId, setConvertingSaleId] = useState<string>();
  const [query, setQuery] = useState<SaleQueryParams>({ page: 1, limit: 20 });
  const { data, error, isLoading, isError, isFetching } = useGetSalesQuery(query, { refetchOnMountOrArgChange: true });
  const meta = data?.meta;
  const mobileList = useMobileInfiniteList({ query, response: data, isFetching, setQuery });
  const [cancelSale] = useDeleteSaleMutation();
  const [reopenSale] = useReopenSaleMutation();
  const [convertSaleQuote] = useConvertSaleQuoteMutation();

  const confirmCancel = (sale: Sale) => {
    if (deletingSaleId === sale.id) return;
    const restrictions = visibleSaleDeleteRestrictions(sale);
    if (restrictions.length) {
      Modal.warning({
        title: `${saleDocumentNumber(sale)} cannot be cancelled`,
        content: `This sale cannot be cancelled because ${restrictions.join(", ")}.`,
      });
      return;
    }
    Modal.confirm({
      title: `Cancel ${saleDocumentNumber(sale)}?`,
      content: "All related transactions will be reversed. This action cannot be undone.",
      okText: "Cancel",
      okType: "danger",
      onOk: async () => {
        setDeletingSaleId(sale.id);
        try {
          await cancelSale(sale.id).unwrap();
          message.success("Sale cancelled and related transactions reversed.");
          if (selectedSale?.id === sale.id) {
            if (editOpen) toggleEdit();
            setSelectedSale(undefined);
          }
        } catch (error) {
          message.error(saleApiError(error, "Sale could not be cancelled."));
          throw error;
        } finally {
          setDeletingSaleId(undefined);
        }
      },
    });
  };

  const reopen = async (sale: Sale) => {
    if (reopeningSaleId === sale.id) return;
    setReopeningSaleId(sale.id);
    try {
      await reopenSale(sale.id).unwrap();
      message.success("Sale reopened.");
    } catch (error) {
      message.error(saleApiError(error, "Sale could not be reopened."));
    } finally {
      setReopeningSaleId(undefined);
    }
  };

  const convert = async (sale: Sale) => {
    if (convertingSaleId === sale.id) return;
    setConvertingSaleId(sale.id);
    try {
      await convertSaleQuote(sale.id).unwrap();
      message.success("Quote converted to sale.");
    } catch (error) {
      message.error(saleApiError(error, "Quote could not be converted."));
    } finally {
      setConvertingSaleId(undefined);
    }
  };

  const getSaleActions = (sale: Sale): MenuProps["items"] => [
    {
      key: "view",
      label: <DropdownItemLabel icon={<LuEye size={15} />} text="View" />,
      onClick: () => router.push(`/orders/${sale.id}`),
    },
    ...(sale.isDeleted
      ? [
          {
            key: "reopen",
            label: <DropdownItemLabel icon={<GrEdit size={15} />} text="Reopen" />,
            disabled: reopeningSaleId === sale.id,
            onClick: () => reopen(sale),
          },
        ]
      : sale.status === "draft"
        ? [
            {
              key: "convert",
              label: <DropdownItemLabel icon={<ReceiptText size={15} />} text="Convert to Sale" />,
              disabled: convertingSaleId === sale.id,
              onClick: () => convert(sale),
            },
            {
              key: "edit",
              label: <DropdownItemLabel icon={<GrEdit size={15} />} text="Edit" />,
              disabled: Boolean(sale.locked),
              onClick: () => {
                setSelectedSale(sale);
                toggleEdit();
              },
            },
            {
              key: "delete",
              label: <DropdownItemLabel icon={<HiOutlineTrash size={15} />} text="Cancel" danger />,
              disabled: deletingSaleId === sale.id,
              onClick: () => confirmCancel(sale),
            },
          ]
        : [
            {
              key: "edit",
              label: <DropdownItemLabel icon={<GrEdit size={15} />} text="Edit" />,
              disabled: Boolean(sale.locked || sale.receiptStatus === "received"),
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
              label: <DropdownItemLabel icon={<HiOutlineTrash size={15} />} text="Cancel" danger />,
              disabled: deletingSaleId === sale.id,
              onClick: () => confirmCancel(sale),
            },
          ]),
  ];

  const columns: TableProps<Sale>["columns"] = [
    {
      title: "# Number",
      key: "saleNumber",
      className: "!pl-8",
      render: (_, sale) => (
        <div className="flex items-center gap-2">
          <Link href={`/orders/${sale.id}`} className="font-medium !text-gray-700 hover:!text-indigo-600">
            {saleDocumentNumber(sale)}
          </Link>
          <Tag className="!m-0 !rounded-full !px-2" color={saleSourceColor(sale.source)}>
            {saleSourceLabel(sale.source)}
          </Tag>
        </div>
      ),
    },
    {
      title: "Status",
      key: "status",
      render: (_, sale) =>
        sale.isDeleted ? (
          <Tag className="!m-0 !rounded-full !px-2" color="red">
            Cancelled
          </Tag>
        ) : sale.status === "draft" ? (
          <Tag className="!m-0 !rounded-full !px-2" color="purple">
            Estimate
          </Tag>
        ) : (
          <Tag className="!m-0 !rounded-full !px-2 capitalize" color={sale.receiptStatus === "received" ? "green" : sale.receiptStatus === "partially_received" ? "gold" : "blue"}>
            {sale.receiptStatus.replaceAll("_", " ")}
          </Tag>
        ),
    },
    { title: "Customer", key: "customer", render: (_, sale) => sale.contactId?.name || sale.contactId?.displayName || "Walk-in Customer" },
    { title: "Date", key: "date", render: (_, sale) => formatDate(sale.date) },
    // { title: "Expected Delivery", key: "deliveryDate", render: (_, sale) => formatDate(sale.deliveryDate) },
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
            items: getSaleActions(sale),
          }}
        />
      ),
    },
  ];

  return (
    <div>
      <h3 className="pageTittle px-4 md:px-8">Sales</h3>
      <hr className="border-gray-200/80" />
      <div className="flex w-full flex-col gap-4 px-4 py-5 md:flex-row md:justify-between md:px-8 md:py-8">
        <AppSearch placeholder="Search sale number..." onReset={() => setQuery({ page: 1, limit: 20 })} onSearchChange={(values) => setQuery((current) => ({ ...current, ...values, page: 1 }))} />
        <div className="flex gap-x-3 md:gap-x-5">
          <AddButton onClick={toggleForm} label="New Sale" />
          <SettingsDrawer />
        </div>
      </div>

      <div className="hidden md:block">
        <AppViewLoader loading={isLoading} />
      </div>
      {isError && <p className="px-8 py-8 text-sm text-red-600">{saleApiError(error, "Sales could not be loaded.")}</p>}
      {!isError && <AppNotFoundView dataLength={data?.data?.length || 0} loading={isLoading} query={{ search: query.search }} entity="Sale" />}
      {!isError && (
        <>
          <div className="hidden md:block">
            <AppTable columns={columns} dataSource={data?.data || []} rowKey="id" pagination={false} />
            <AppPaginationFooter entity="sales" dataLength={data?.data?.length || 0} meta={meta} page={data?.page || query.page} limit={data?.limit || query.limit} total={data?.total} onChange={(page, limit) => setQuery((current) => ({ ...current, page, limit }))} />
          </div>
          {isLoading ? <MobileListShimmer showAvatar={false} /> : <SalesMobileList sales={mobileList.items} getActions={getSaleActions} />}
          <MobileInfiniteScrollFooter entity="sales" dataLength={mobileList.items.length} hasNextPage={mobileList.hasNextPage} isFetching={isFetching && !isLoading} sentinelRef={mobileList.sentinelRef} onLoadMore={mobileList.loadNextPage} />
        </>
      )}

      {formOpen && <SaleFormModal open={formOpen} toggle={toggleForm} />}
      {editOpen && selectedSale && <SaleFormModal open={editOpen} toggle={toggleEdit} sale={selectedSale} />}
      {shareDocumentType && selectedSale && <SaleShareDocumentModal open={Boolean(shareDocumentType)} toggle={() => setShareDocumentType(undefined)} sale={selectedSale} type={shareDocumentType} />}
    </div>
  );
}
