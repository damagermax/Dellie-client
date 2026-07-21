"use client";

import { Form, InputNumber } from "antd";

import PreviewImage from "@/components/ui/PreviewImage";

const { Item: FormItem } = Form;

export type ReturnLine = {
  id: string;
  name: string;
  sku?: string;
  imageUrl?: string;
  maxQuantity: number;
};

export type ReturnFormValue = {
  quantity?: number;
};

export type ReturnFormValues = {
  reason?: string;
  lines?: Record<string, ReturnFormValue>;
};

export function buildDefaultReturnFormValues(lines: ReturnLine[]): Pick<ReturnFormValues, "reason" | "lines"> {
  return {
    reason: undefined,
    lines: Object.fromEntries(lines.map((line) => [line.id, { quantity: line.maxQuantity }])),
  };
}

export function buildReturnItems(values: ReturnFormValues, lines: ReturnLine[]) {
  const reason = values.reason?.trim() || undefined;

  return lines
    .map((line) => {
      const lineValues = values.lines?.[line.id] || {};
      const quantity = Number(lineValues.quantity || 0);

      if (quantity <= 0) {
        return null;
      }

      return {
        lineItemId: line.id,
        quantity,
        reason,
      };
    })
    .filter(Boolean) as { lineItemId: string; quantity: number; reason?: string }[];
}

export function TransactionReturnLineList({ lines }: { lines: ReturnLine[] }) {
  return (
    <div className="space-y-3">
      {lines.map((line) => (
        <div key={line.id} className="rounded-lg border border-gray-200 bg-white px-4 py-3">
          <div className="grid gap-3 sm:grid-cols-[minmax(0,1fr)_140px] sm:items-center">
            <div className="flex min-w-0 items-center gap-3">
              <PreviewImage width={44} height={44} src={line.imageUrl} />
              <div className="min-w-0 flex-1">
                <p className="truncate text-sm font-semibold text-gray-900">{line.name}</p>
                <div className="mt-1 flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-gray-500">
                  {line.sku ? <span>SKU: {line.sku}</span> : null}
                  <span>{line.maxQuantity.toLocaleString()} available</span>
                </div>
              </div>
            </div>

            <FormItem
              label="Return qty"
              name={["lines", line.id, "quantity"]}
              className="!mb-0"
              rules={[{ type: "number", min: 0, max: line.maxQuantity, message: `Enter a value between 0 and ${line.maxQuantity}` }]}
            >
              <InputNumber className="!w-full" min={0} max={line.maxQuantity} controls={false} placeholder="0" />
            </FormItem>
          </div>
        </div>
      ))}
    </div>
  );
}
