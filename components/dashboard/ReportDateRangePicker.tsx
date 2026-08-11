"use client";

import { DatePicker, Select } from "antd";
import dayjs, { Dayjs } from "dayjs";

const { RangePicker } = DatePicker;

type ReportDatePreset =
  | "today"
  | "yesterday"
  | "this_week"
  | "last_week"
  | "this_month"
  | "last_month"
  | "last_30_days"
  | "last_90_days"
  | "this_year";

const PRESET_OPTIONS: Array<{ label: string; value: ReportDatePreset }> = [
  { label: "Today", value: "today" },
  { label: "Yesterday", value: "yesterday" },
  { label: "This week", value: "this_week" },
  { label: "Last week", value: "last_week" },
  { label: "This month", value: "this_month" },
  { label: "Last month", value: "last_month" },
  { label: "Last 30 days", value: "last_30_days" },
  { label: "Last 90 days", value: "last_90_days" },
  { label: "This year", value: "this_year" },
];

interface ReportDateRangePickerProps {
  value: [Dayjs, Dayjs];
  onChange: (value: [Dayjs, Dayjs]) => void;
  className?: string;
}

export function ReportDateRangePicker({ value, onChange, className = "" }: ReportDateRangePickerProps) {
  const presetValue = getMatchingPreset(value);

  return (
    <div className={`flex flex-col gap-2 sm:flex-row sm:items-center ${className}`.trim()}>
      <Select
        className="min-w-[150px]"
        value={presetValue || "custom"}
        onChange={(nextValue) => {
          if (nextValue === "custom") return;
          onChange(getPresetRange(nextValue as ReportDatePreset));
        }}
        options={[...PRESET_OPTIONS, { label: "Custom", value: "custom" }]}
      />
      <RangePicker className="w-full sm:w-auto" value={value} onChange={(nextValue) => nextValue && onChange(nextValue as [Dayjs, Dayjs])} />
    </div>
  );
}

function getPresetRange(preset: ReportDatePreset): [Dayjs, Dayjs] {
  const today = dayjs();

  switch (preset) {
    case "today":
      return [today.startOf("day"), today.endOf("day")];
    case "yesterday": {
      const yesterday = today.subtract(1, "day");
      return [yesterday.startOf("day"), yesterday.endOf("day")];
    }
    case "this_week":
      return [today.startOf("week"), today.endOf("week")];
    case "last_week": {
      const lastWeek = today.subtract(1, "week");
      return [lastWeek.startOf("week"), lastWeek.endOf("week")];
    }
    case "this_month":
      return [today.startOf("month"), today.endOf("day")];
    case "last_month": {
      const lastMonth = today.subtract(1, "month");
      return [lastMonth.startOf("month"), lastMonth.endOf("month")];
    }
    case "last_30_days":
      return [today.subtract(29, "day").startOf("day"), today.endOf("day")];
    case "last_90_days":
      return [today.subtract(89, "day").startOf("day"), today.endOf("day")];
    case "this_year":
      return [today.startOf("year"), today.endOf("day")];
  }
}

function getMatchingPreset(value: [Dayjs, Dayjs]) {
  return PRESET_OPTIONS.find((option) => {
    const [from, to] = getPresetRange(option.value);
    return value[0].isSame(from, "day") && value[1].isSame(to, "day");
  })?.value;
}
