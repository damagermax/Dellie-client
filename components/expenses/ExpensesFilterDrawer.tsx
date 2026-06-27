"use client";

import { DatePicker, Select } from "antd";
import dayjs, { Dayjs } from "dayjs";
import { SearchableContactSelect } from "@/components/contacts/SeachableContactSelect";
import { SearchableExpenseCategorySelect } from "@/components/expenses/SearchableExpenseCategorySelect";
import { AppFilterDrawer } from "@/components/ui/AppFilterDrawer";
import { FilterField } from "@/components/ui/FilterField";
import { CategoryType } from "@/types/category";
import { ExpenseQueryParams } from "@/types/transaction";

const { RangePicker } = DatePicker;

interface ExpensesFilterDrawerProps {
  open: boolean;
  filters: ExpenseQueryParams;
  onChange: (value: Partial<ExpenseQueryParams>) => void;
  onClose: () => void;
  onApply: () => void;
  onClear: () => void;
}

export function ExpensesFilterDrawer({ open, filters, onChange, onClose, onApply, onClear }: ExpensesFilterDrawerProps) {
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
    <AppFilterDrawer title="Filter expenses" open={open} onClose={onClose} onApply={onApply} onClear={onClear}>
      <FilterField label="Status">
        <Select
          allowClear
          className="w-full"
          value={filters.status || ""}
          onChange={(status) => onChange({ status: status || undefined })}
          options={[
            { value: "", label: "All" },
            { value: "open", label: "Open" },
            { value: "closed", label: "Closed" },
            { value: "draft", label: "Draft" },
          ]}
        />
      </FilterField>

      <FilterField label="Category">
        <SearchableExpenseCategorySelect includeAllOption allLabel="All" type={CategoryType.EXPENSE} value={filters.categoryId} onChange={(categoryId) => onChange({ categoryId: (categoryId as string) || undefined })} />
      </FilterField>

      <FilterField label="Contact">
        <SearchableContactSelect includeAllOption allLabel="All" value={filters.contactId} onChange={(contactId) => onChange({ contactId: (contactId as string) || undefined })} />
      </FilterField>

      <FilterField label="Date range">
        <RangePicker className="w-full" value={dateRangeValue as [Dayjs, Dayjs] | null} onChange={(value) => handleDateRangeChange((value as [Dayjs, Dayjs] | null) || null)} />
      </FilterField>
    </AppFilterDrawer>
  );
}
