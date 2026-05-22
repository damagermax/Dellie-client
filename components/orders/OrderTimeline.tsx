import { Timeline } from 'antd';
import { Clock, CheckCircle, Truck, Package, Check, X, RefreshCw } from 'lucide-react';

interface OrderTimelineProps {
  orderId: string;
}

const OrderTimeline = ({ orderId }: OrderTimelineProps) => {
  // In a real app, you would fetch the timeline data based on orderId
  const timelineItems = [
    {
      id: 'order-placed',
      color: 'green',
      label: 'Order Placed',
      description: 'Your order has been received',
      icon: <CheckCircle className="w-4 h-4" />,
      time: '2023-11-15 14:30',
      status: 'completed',
    },
    {
      id: 'order-confirmed',
      color: 'green',
      label: 'Order Confirmed',
      description: 'We\'ve confirmed your order',
      icon: <CheckCircle className="w-4 h-4" />,
      time: '2023-11-15 15:15',
      status: 'completed',
    },
    {
      id: 'processing',
      color: 'blue',
      label: 'Processing',
      description: 'Your order is being processed',
      icon: <RefreshCw className="w-4 h-4" />,
      time: '2023-11-15 16:45',
      status: 'in-progress',
    },
    {
      id: 'shipped',
      color: 'gray',
      label: 'Shipped',
      description: 'Your order is on the way',
      icon: <Truck className="w-4 h-4" />,
      time: 'Estimated: 2023-11-17',
      status: 'pending',
    },
    {
      id: 'delivered',
      color: 'gray',
      label: 'Delivered',
      description: 'Your order has been delivered',
      icon: <Package className="w-4 h-4" />,
      time: 'Estimated: 2023-11-19',
      status: 'pending',
    },
  ];

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'completed':
        return <Check className="w-4 h-4 text-green-500" />;
      case 'in-progress':
        return <RefreshCw className="w-4 h-4 text-blue-500 animate-spin" />;
      case 'pending':
        return <Clock className="w-4 h-4 text-gray-400" />;
      default:
        return <Clock className="w-4 h-4 text-gray-400" />;
    }
  };

  return (
    <div className="p-4">
      <Timeline
        mode="left"
        items={timelineItems.map((item) => ({
          key: item.id,
          color: item.color,
          label: <span className="text-sm text-gray-500">{item.time}</span>,
          dot: getStatusIcon(item.status),
          children: (
            <div className="pl-4">
              <div className="font-medium">{item.label}</div>
              <div className="text-sm text-gray-500">{item.description}</div>
            </div>
          ),
        }))}
      />
    </div>
  );
};

export default OrderTimeline;
