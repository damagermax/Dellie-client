"use client";

import { Table, TableProps } from "antd";
import { useEffect, useState } from "react";

interface AppTableProps<T> extends Omit<TableProps<T>, "dataSource" | "columns" | "pagination"> {
  columns: any[];
  dataSource: T[];
  pageSize?: number;
  scrollY?: number;
  scrollX?: number | string;
  className?: string;
  pagination?: boolean | TableProps<T>["pagination"];
}

const AppTable = <T extends object>({ columns, dataSource, pageSize = 100, scrollX, className = "custom-table", pagination: paginationProp = true, ...rest }: AppTableProps<T>) => {
  const [isMounted, setIsMounted] = useState(false);

  // Ensure component is mounted before rendering to avoid hydration issues
  useEffect(() => {
    setIsMounted(true);
  }, []);

  // Handle pagination prop
  const pagination = typeof paginationProp === "boolean" ? (paginationProp ? { pageSize } : false) : { pageSize, ...paginationProp };

  if (!isMounted) {
    return <div className="w-full" style={{ height: scrollY }} />;
  }

  if (dataSource?.length > 0)
    return (
      <div className="overflow-x-auto">
        <div className="min-w-full">
          <hr className=" border-gray-200/80" />

          <Table<T> size="middle" columns={columns} dataSource={dataSource} className={className} pagination={dataSource.length > 10 ? pagination : false} scroll={{ x: scrollX }} rowKey="key" {...rest} />
        </div>
      </div>
    );
};

export default AppTable;
