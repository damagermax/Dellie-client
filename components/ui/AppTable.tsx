"use client";

import { Table, TableProps } from "antd";
import type { AnyObject } from "antd/es/_util/type";
import type { ColumnGroupType, ColumnType } from "antd/es/table";
import { useEffect, useState } from "react";

interface AppTableProps<T> extends Omit<TableProps<T>, "dataSource" | "columns" | "pagination"> {
  columns: TableProps<T>["columns"];
  dataSource: T[];
  pageSize?: number;
  scrollY?: number;
  scrollX?: number | string;
  className?: string;
  pagination?: boolean | TableProps<T>["pagination"];
  disableFixedColumns?: boolean;
}

function removeFixedColumns<T extends AnyObject>(columns: TableProps<T>["columns"]): TableProps<T>["columns"] {
  return columns?.map((column) => {
    if (!column) {
      return column;
    }

    if ("children" in column && column.children) {
      return {
        ...column,
        fixed: undefined,
        children: removeFixedColumns(column.children),
      } as ColumnGroupType<T>;
    }

    return {
      ...column,
      fixed: undefined,
    } as ColumnType<T>;
  });
}

const AppTable = <T extends object>({ columns, dataSource, pageSize = 100, scrollY, scrollX, className = "custom-table", pagination: paginationProp = true, disableFixedColumns = false, ...rest }: AppTableProps<T>) => {
  const [isMounted, setIsMounted] = useState(false);

  // Ensure component is mounted before rendering to avoid hydration issues
  useEffect(() => {
    setIsMounted(true);
  }, []);

  // Handle pagination prop
  const pagination = typeof paginationProp === "boolean" ? (paginationProp ? { pageSize } : false) : { pageSize, ...paginationProp };
  const shouldShowPagination = typeof paginationProp === "boolean" ? dataSource.length > 10 && paginationProp : Boolean(paginationProp);
  const resolvedColumns = disableFixedColumns ? removeFixedColumns(columns) : columns;

  if (!isMounted) {
    return <div className="w-full" style={{ height: scrollY }} />;
  }

  if (dataSource?.length > 0)
    return (
      <div className="overflow-x-auto overscroll-x-contain [touch-action:pan-x]" style={{ WebkitOverflowScrolling: "touch" }}>
        <div className="min-w-full w-max">
          <hr className=" border-gray-200/80" />

          <Table<T> size="middle" columns={resolvedColumns} dataSource={dataSource} className={className} pagination={shouldShowPagination ? pagination : false} scroll={{ x: scrollX ?? "max-content" }} rowKey="key" {...rest} />
        </div>
      </div>
    );
};

export default AppTable;
