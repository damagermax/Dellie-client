import { Table, Skeleton } from "antd";
import type { TableProps, ColumnsType } from "antd/es/table";
import { title } from "process";

interface AppViewLoaderProps extends TableProps {
  loading: boolean;
}

export function AppViewLoader({ columns, loading }: AppViewLoaderProps) {
  const shimmerRows = Array.from({ length: 12 }, (_, index) => ({
    key: `shimmer-${index}`,
  }));

  const shimmerColumns = [1, 2, 3]?.map((col) => ({
    title: () => <Skeleton.Input style={{ width: "100%" }} className="!px-8  " active size="small" />,
    render: () => <Skeleton.Input style={{ width: "100%" }} active size="small" className="!px-8" />,
  }));

  if (!loading) return null;

  return (
    <>
      <hr className=" border-gray-200/80" />
      <Table className="custom" columns={loading ? shimmerColumns : columns} size="small" dataSource={shimmerRows} pagination={false} />;
    </>
  );
}
