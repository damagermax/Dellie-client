import { Table } from 'antd';
import Image from 'next/image';
import type { ColumnsType } from 'antd/es/table';

interface OrderItem {
  id: string;
  name: string;
  price: number;
  quantity: number;
  image: string;
  sku: string;
}

interface OrderItemsTableProps {
  items: OrderItem[];
}

const OrderItemsTable = ({ items }: OrderItemsTableProps) => {
  const columns: ColumnsType<OrderItem> = [
    {
      title: 'Product',
      dataIndex: 'name',
      key: 'product',
      render: (_, record) => (
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-md overflow-hidden bg-gray-100 flex-shrink-0">
            <Image
              src={record.image}
              alt={record.name}
              width={48}
              height={48}
              className="w-full h-full object-cover"
              onError={(e) => {
                const target = e.target as HTMLImageElement;
                target.src = '/images/placeholder.png';
              }}
            />
          </div>
          <div>
            <div className="font-medium">{record.name}</div>
            <div className="text-xs text-gray-500">SKU: {record.sku}</div>
          </div>
        </div>
      ),
    },
    {
      title: 'Price',
      dataIndex: 'price',
      key: 'price',
      align: 'right',
      render: (price) => `GHS ${price.toFixed(2)}`,
    },
    {
      title: 'Quantity',
      dataIndex: 'quantity',
      key: 'quantity',
      align: 'center',
    },
    {
      title: 'Total',
      key: 'total',
      align: 'right',
      render: (_, record) => `GHS ${(record.price * record.quantity).toFixed(2)}`,
    },
  ];

  return (
    <Table
      columns={columns}
      dataSource={items}
      rowKey="id"
      pagination={false}
      className="w-full"
    />
  );
};

export default OrderItemsTable;
