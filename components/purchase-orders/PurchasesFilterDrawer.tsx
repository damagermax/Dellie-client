"use client";

import { DatePicker, Select } from "antd";
import dayjs, { Dayjs } from "dayjs";
import { SearchableContactSelect } from "@/components/contacts/SeachableContactSelect";
import { SearchableLocationSelect } from "@/components/location/SearchableLocationSelect";
import { AppFilterDrawer } from "@/components/ui/AppFilterDrawer";
import { FilterField } from "@/components/ui/FilterField";
import { PurchaseQueryParams, PurchaseReceiptStatus } from "@/types/purchase";

const { RangePicker } = DatePicker;

interface PurchasesFilterDrawerProps {
  open: boolean;
  filters: PurchaseQueryParams;
  onChange: (value: Partial<PurchaseQueryParams>) => void;
  onClose: () => void;
  onApply: () => void;
  onClear: () => void;
}

export function PurchasesFilterDrawer({ open, filters, onChange, onClose, onApply, onClear }: PurchasesFilterDrawerProps) {
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
    <AppFilterDrawer title="Filter purchases" open={open} onClose={onClose} onApply={onApply} onClear={onClear}>
      <FilterField label="Status">
        <Select
          allowClear
          className="w-full"
          value={filters.status || ""}
          onChange={(status) => onChange({ status: (status as PurchaseQueryParams["status"]) || undefined })}
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
            { value: "partially_received", label: "Partially received" },
            { value: "received", label: "Received" },
          ]}
        />
      </FilterField>

      <FilterField label="Payment status">
        <Select
          allowClear
          className="w-full"
          value={filters.paymentStatus || ""}
          onChange={(paymentStatus) => onChange({ paymentStatus: (paymentStatus as PurchaseQueryParams["paymentStatus"]) || undefined })}
          options={[
            { value: "", label: "All" },
            { value: "unpaid", label: "Unpaid" },
            { value: "partial", label: "Partial Payment" },
            { value: "paid", label: "Paid" },
          ]}
        />
      </FilterField>

      <FilterField label="Supplier">
        <SearchableContactSelect includeAllOption allLabel="All" value={filters.supplierId} onChange={(supplierId) => onChange({ supplierId: (supplierId as string) || undefined })} />
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
