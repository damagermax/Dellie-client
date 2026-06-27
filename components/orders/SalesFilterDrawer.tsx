"use client";

import { DatePicker, Select } from "antd";
import dayjs, { Dayjs } from "dayjs";
import { SearchableContactSelect } from "@/components/contacts/SeachableContactSelect";
import { SearchableLocationSelect } from "@/components/location/SearchableLocationSelect";
import { AppFilterDrawer } from "@/components/ui/AppFilterDrawer";
import { FilterField } from "@/components/ui/FilterField";
import { SaleQueryParams } from "@/types/sale";
import { PurchaseReceiptStatus } from "@/types/purchase";

const { RangePicker } = DatePicker;

interface SalesFilterDrawerProps {
  open: boolean;
  filters: SaleQueryParams;
  onChange: (value: Partial<SaleQueryParams>) => void;
  onClose: () => void;
  onApply: () => void;
  onClear: () => void;
}

const saleSourceOptions = [
  { value: "", label: "All" },
  { value: "Manual Sale", label: "Manual Sale" },
  { value: "POS", label: "POS" },
  { value: "Online Store", label: "Website" },
  { value: "Sales Order", label: "Sales Order" },
];

export function SalesFilterDrawer({ open, filters, onChange, onClose, onApply, onClear }: SalesFilterDrawerProps) {
  const dateRangeValue =
    filters.dateFrom && filters.dateTo
      ? [dayjs(filters.dateFrom), dayjs(filters.dateTo)]
      : null;

  const handleDateRangeChange = (value: [Dayjs, Dayjs] | null) => {
    if (!value) {
      onChange({ dateFrom: undefined, dateTo: undefined });
      return;
    }

    onChange({
      dateFrom: value[0].format("YYYY-MM-DD"),
      dateTo: value[1].format("YYYY-MM-DD"),
    });
  };

  return (
    <AppFilterDrawer title="Filter sales" open={open} onClose={onClose} onApply={onApply} onClear={onClear}>
      <FilterField label="Status">
        <Select
          allowClear
          className="w-full"
          value={filters.status || ""}
          onChange={(status) => onChange({ status: (status as SaleQueryParams["status"]) || undefined })}
          options={[
            { value: "", label: "All" },
            { value: "open", label: "Open" },
            { value: "closed", label: "Closed" },
            { value: "draft", label: "Draft" },
          ]}
        />
      </FilterField>

      <FilterField label="Fulfillment status">
        <Select
          allowClear
          className="w-full"
          value={filters.fulfillmentStatus || ""}
          onChange={(fulfillmentStatus) => onChange({ fulfillmentStatus: (fulfillmentStatus as PurchaseReceiptStatus) || undefined })}
          options={[
            { value: "", label: "All" },
            { value: "pending", label: "Pending" },
            { value: "partially_received", label: "Partially fulfilled" },
            { value: "received", label: "Fulfilled" },
          ]}
        />
      </FilterField>

      <FilterField label="Payment status">
        <Select
          allowClear
          className="w-full"
          value={filters.paymentStatus || ""}
          onChange={(paymentStatus) => onChange({ paymentStatus: (paymentStatus as SaleQueryParams["paymentStatus"]) || undefined })}
          options={[
            { value: "", label: "All" },
            { value: "unpaid", label: "Unpaid" },
            { value: "partial", label: "Partial" },
            { value: "paid", label: "Paid" },
          ]}
        />
      </FilterField>

      <FilterField label="Customer">
        <SearchableContactSelect includeAllOption allLabel="All" value={filters.customerId} onChange={(customerId) => onChange({ customerId: (customerId as string) || undefined })} />
      </FilterField>

      <FilterField label="Source">
        <Select allowClear className="w-full" value={filters.source || ""} onChange={(source) => onChange({ source: source || undefined })} options={saleSourceOptions} />
      </FilterField>

      <FilterField label="Date range">
        <RangePicker className="w-full" value={dateRangeValue as [Dayjs, Dayjs] | null} onChange={(value) => handleDateRangeChange((value as [Dayjs, Dayjs] | null) || null)} />
      </FilterField>

      <FilterField label="Location">
        <SearchableLocationSelect includeAllOption allLabel="All" value={filters.locationId} onChange={(locationId) => onChange({ locationId: (locationId as string) || undefined })} />
      </FilterField>
    </AppFilterDrawer>
  );
}
