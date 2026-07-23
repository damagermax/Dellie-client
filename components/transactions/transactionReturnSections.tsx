"use client";

import dayjs from "dayjs";
import { Checkbox, Form, InputNumber } from "antd";
import type { TableProps } from "antd/es/table";

import { ResolvedProductName } from "@/components/products/ResolvedProductName";
import AppTable from "@/components/ui/AppTable";
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
  restock?: boolean;
};

export type ReturnFormValues = {
  reason?: string;
  returnedAt?: dayjs.Dayjs;
  lines?: Record<string, ReturnFormValue>;
};

export type ReturnSubmissionItem = {
  lineItemId: string;
  quantity: number;
  reason?: string;
  restock?: boolean;
};

const quantityInputClass = "!w-24";

export function buildDefaultReturnFormValues(
  lines: ReturnLine[],
  options?: { showRestock?: boolean },
): Pick<ReturnFormValues, "reason" | "returnedAt" | "lines"> {
  return {
    reason: undefined,
    returnedAt: dayjs(),
    lines: Object.fromEntries(
      lines.map((line) => [
        line.id,
        {
          quantity: line.maxQuantity,
          restock: options?.showRestock ? true : undefined,
        },
      ]),
    ),
  };
}

export function buildReturnItems(values: ReturnFormValues, lines: ReturnLine[], options?: { showRestock?: boolean }) {
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
        restock: options?.showRestock ? lineValues.restock !== false : undefined,
      };
    })
    .filter(Boolean) as ReturnSubmissionItem[];
}

export function TransactionReturnLineList({ lines, showRestock = false }: { lines: ReturnLine[]; showRestock?: boolean }) {
  const columns: TableProps<ReturnLine>["columns"] = [
    {
      title: "Product",
      dataIndex: "name",
      key: "name",
      className: "!pl-8",
      width: showRestock ? "65%" : "75%",
      render: (_: unknown, line) => (
        <div className="flex items-center gap-x-2">
          <PreviewImage width={28} height={28} src={line.imageUrl} />
          <div className="min-w-0">
            <ResolvedProductName name={line.name} className="line-clamp-1" />
            <p className="text-xs text-gray-500">
              {line.sku || "No SKU"} | Available {Number(line.maxQuantity || 0).toLocaleString()}
            </p>
          </div>
        </div>
      ),
    },
    {
      title: "Qty",
      dataIndex: "id",
      key: "quantity",
      width: "20%",
      render: (_: unknown, line) => (
        <div className="flex flex-col items-start gap-1">
          <FormItem
            name={["lines", line.id, "quantity"]}
            className="!mb-0"
            rules={[{ type: "number", min: 0, max: line.maxQuantity, message: `Enter a value between 0 and ${line.maxQuantity}` }]}
          >
            <InputNumber
              className={quantityInputClass}
              variant="underlined"
              min={0}
              max={line.maxQuantity}
              controls={false}
              precision={0}
              placeholder="0"
            />
          </FormItem>
        </div>
      ),
    },
    ...(showRestock
      ? [
          {
            title: "Restock",
            dataIndex: "id",
            key: "restock",
            align: "center" as const,
            className: "!pr-8",
            width: "15%",
            render: (_: unknown, line: ReturnLine) => (
              <div className="flex justify-center">
                <FormItem name={["lines", line.id, "restock"]} valuePropName="checked" className="!mb-0">
                  <Checkbox />
                </FormItem>
              </div>
            ),
          },
        ]
      : []),
  ];

  return <AppTable columns={columns} dataSource={lines} rowKey="id" pagination={false} scrollX={720} />;
}
