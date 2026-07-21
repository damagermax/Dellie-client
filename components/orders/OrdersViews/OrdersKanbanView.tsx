"use client";

import {
  DragDropContext,
  Draggable,
  DraggableProvided,
  DropResult,
  Droppable,
  DroppableProvided,
} from "@hello-pangea/dnd";
import { format } from "date-fns";
import Link from "next/link";
import { useCallback, useState } from "react";

import { groupOrdersByStatus, mockOrders, OrderStatus, OrderViewItem, orderStatusConfig } from "./ordersViewData";

const OrderCard = ({ order, index, status }: { order: OrderViewItem; index: number; status: OrderStatus }) => (
  <Draggable draggableId={`${status}-${order.id}`} index={index}>
    {(provided: DraggableProvided) => (
      <div ref={provided.innerRef} {...provided.draggableProps} {...provided.dragHandleProps} className="mb-3 rounded-lg border border-gray-200 bg-white p-3 transition-shadow hover:shadow-md">
        <div className="flex items-start justify-between">
          <div>
            <Link href={`/orders/${order.id}`} className="font-medium text-gray-900 hover:text-primary">
              #{order.orderNumber}
            </Link>
            <p className="text-xs text-gray-500">{format(new Date(order.date), "MMM d, h:mm a")}</p>
          </div>
          <span className="font-medium">GHS {order.total.toFixed(2)}</span>
        </div>
        <div className="mt-2 text-sm text-gray-700">
          <p className="truncate">{order.customer}</p>
          <p className="text-xs text-gray-500">
            {order.itemsCount} items • {order.paymentMethod}
          </p>
        </div>
      </div>
    )}
  </Draggable>
);

export default function OrdersKanbanView() {
  const [orders, setOrders] = useState<Record<OrderStatus, OrderViewItem[]>>(() => groupOrdersByStatus(mockOrders));

  const onDragEnd = useCallback((result: DropResult) => {
    const { source, destination, draggableId } = result;
    if (!destination) return;

    const sourceStatus = source.droppableId as OrderStatus;
    const destStatus = destination.droppableId as OrderStatus;
    const orderId = draggableId.split("-").slice(1).join("-");

    if (source.droppableId === destination.droppableId && source.index === destination.index) {
      return;
    }

    setOrders((prevOrders) => {
      const sourceArray = [...prevOrders[sourceStatus]];
      const destinationArray = sourceStatus === destStatus ? sourceArray : [...prevOrders[destStatus]];
      const movedOrderIndex = sourceArray.findIndex((order) => order.id === orderId);

      if (movedOrderIndex === -1) {
        return prevOrders;
      }

      const [movedOrder] = sourceArray.splice(movedOrderIndex, 1);

      if (sourceStatus !== destStatus) {
        movedOrder.status = destStatus;
      }

      destinationArray.splice(destination.index, 0, movedOrder);

      return {
        ...prevOrders,
        [sourceStatus]: sourceArray,
        [destStatus]: destinationArray,
      };
    });
  }, []);

  return (
    <div className="h-full overflow-x-auto px-8 pt-5">
      <DragDropContext onDragEnd={onDragEnd}>
        <div className="flex min-w-max gap-4">
          {Object.entries(orderStatusConfig).map(([status, config]) => (
            <Droppable key={status} droppableId={status} type="ORDER">
              {(provided: DroppableProvided) => (
                <div ref={provided.innerRef} {...provided.droppableProps} className="w-72 flex-shrink-0">
                  <div className="mb-2 flex items-center">
                    <span className="mr-2 text-lg">{config.icon}</span>
                    <h3 className="font-medium">{config.title}</h3>
                    <span className="ml-2 rounded-full bg-gray-100 px-2 py-0.5 text-xs">{orders[status as OrderStatus]?.length || 0}</span>
                  </div>
                  <div className="h-[calc(100vh-200px)] overflow-y-auto rounded-lg bg-gray-50 p-3" style={{ minHeight: "200px" }}>
                    {orders[status as OrderStatus]?.map((order, index) => (
                      <OrderCard key={`${status}-${order.id}`} order={order} index={index} status={status as OrderStatus} />
                    ))}
                    {provided.placeholder}
                  </div>
                </div>
              )}
            </Droppable>
          ))}
        </div>
      </DragDropContext>
    </div>
  );
}
