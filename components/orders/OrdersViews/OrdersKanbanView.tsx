"use client";

import {
    DragDropContext,
    Draggable,
    DraggableProvided,
    DraggableStateSnapshot,
    DropResult,
    Droppable,
    DroppableProvided,
    DroppableStateSnapshot,
} from "@hello-pangea/dnd";
import { format } from "date-fns";
import Link from "next/link";
import { useCallback, useState } from "react";

// Types
interface OrderItem {
    id: string;
    name: string;
    quantity: number;
    price: number;
    sku: string;
}

interface Order {
    id: string;
    orderNumber: string;
    date: string;
    customer: string;
    status: "pending" | "processing" | "fulfilled" | "cancelled" | "delivered";
    total: number;
    itemsCount: number;
    paymentMethod: string;
    items: OrderItem[];
    shippingAddress: string;
    contactEmail: string;
    contactPhone: string;
}

// Mock data
const mockOrders: Order[] = [
    // Processing Orders
    {
        id: "1",
        orderNumber: "ORD-001",
        date: new Date(Date.now() - 3600000 * 2).toISOString(), // 2 hours ago
        customer: "John Mensah",
        status: "processing",
        total: 249.99,
        itemsCount: 3,
        paymentMethod: "Mobile Money",
        shippingAddress: "123 High Street, Accra",
        contactEmail: "john.mensah@example.com",
        contactPhone: "+233 24 123 4567",
        items: [
            { id: "101", name: "Wireless Earbuds Pro", quantity: 1, price: 199.99, sku: "WEB-001" },
            { id: "102", name: "Phone Case", quantity: 1, price: 29.99, sku: "PHC-045" },
            { id: "103", name: "Screen Protector", quantity: 1, price: 20.01, sku: "SP-112" },
        ],
    },
    {
        id: "2",
        orderNumber: "ORD-002",
        date: new Date(Date.now() - 3600000).toISOString(), // 1 hour ago
        customer: "Ama Serwaa",
        status: "processing",
        total: 159.5,
        itemsCount: 2,
        paymentMethod: "Card",
        shippingAddress: "45 Independence Ave, Kumasi",
        contactEmail: "ama.serwaa@example.com",
        contactPhone: "+233 20 987 6543",
        items: [
            { id: "201", name: "Bluetooth Speaker", quantity: 1, price: 129.99, sku: "BTS-022" },
            { id: "202", name: "USB-C Cable", quantity: 2, price: 29.51, sku: "UCC-117" },
        ],
    },

    // Pending Orders
    {
        id: "3",
        orderNumber: "ORD-003",
        date: new Date(Date.now() - 86400000).toISOString(), // 1 day ago
        customer: "Kwame Asante",
        status: "pending",
        total: 89.99,
        itemsCount: 1,
        paymentMethod: "Bank Transfer",
        shippingAddress: "78 Palm Street, Takoradi",
        contactEmail: "kwame.a@example.com",
        contactPhone: "+233 27 555 1234",
        items: [{ id: "301", name: "Wireless Mouse", quantity: 1, price: 89.99, sku: "WM-056" }],
    },
    {
        id: "4",
        orderNumber: "ORD-004",
        date: new Date(Date.now() - 172800000).toISOString(), // 2 days ago
        customer: "Esi Boateng",
        status: "pending",
        total: 345.5,
        itemsCount: 4,
        paymentMethod: "Card",
        shippingAddress: "22 Ring Road, Tamale",
        contactEmail: "esi.b@example.com",
        contactPhone: "+233 54 321 9876",
        items: [
            { id: "401", name: "Laptop Stand", quantity: 2, price: 119.98, sku: "LS-012" },
            { id: "402", name: "Wireless Keyboard", quantity: 1, price: 140.0, sku: "WK-078" },
            { id: "403", name: "Mouse Pad", quantity: 1, price: 85.52, sku: "MP-033" },
        ],
    },

    // Fulfilled Orders
    {
        id: "5",
        orderNumber: "ORD-005",
        date: new Date("2023-06-10").toISOString(),
        customer: "Yaw Ofori",
        status: "fulfilled",
        total: 199.99,
        itemsCount: 2,
        paymentMethod: "Mobile Money",
        shippingAddress: "10 Kwame Nkrumah Ave, Accra",
        contactEmail: "yaw.ofori@example.com",
        contactPhone: "+233 50 111 2233",
        items: [
            { id: "501", name: "Power Bank 10000mAh", quantity: 1, price: 149.99, sku: "PB-100" },
            { id: "502", name: "USB Cable Set", quantity: 1, price: 50.0, sku: "UCS-045" },
        ],
    },

    // Delivered Orders
    {
        id: "6",
        orderNumber: "ORD-006",
        date: new Date("2023-06-05").toISOString(),
        customer: "Akosua Agyemang",
        status: "delivered",
        total: 75.5,
        itemsCount: 1,
        paymentMethod: "Card",
        shippingAddress: "33 Oxford Street, Accra",
        contactEmail: "akosua.a@example.com",
        contactPhone: "+233 26 555 6677",
        items: [{ id: "601", name: "Wireless Earbuds", quantity: 1, price: 75.5, sku: "WEB-202" }],
    },

    // Cancelled Orders
    {
        id: "7",
        orderNumber: "ORD-007",
        date: new Date("2023-06-01").toISOString(),
        customer: "Kofi Ansah",
        status: "cancelled",
        total: 299.99,
        itemsCount: 3,
        paymentMethod: "Card",
        shippingAddress: "15 Castle Road, Cape Coast",
        contactEmail: "kofi.ansah@example.com",
        contactPhone: "+233 55 123 4567",
        items: [
            { id: "701", name: "Smart Watch", quantity: 1, price: 249.99, sku: "SW-500" },
            { id: "702", name: "Screen Protector", quantity: 2, price: 50.0, sku: "SP-113" },
        ],
    },
];

// Status configuration
const statusConfig = {
    processing: {
        title: "Processing",
        color: "#1890FF",
        bgColor: "rgba(24, 144, 255, 0.1)",
        icon: "🔄",
    },
    pending: {
        title: "Pending",
        color: "#FFA500",
        bgColor: "rgba(255, 165, 0, 0.1)",
        icon: "⏳",
    },
    fulfilled: {
        title: "Fulfilled",
        color: "#52C41A",
        bgColor: "rgba(82, 196, 26, 0.1)",
        icon: "✅",
    },
    delivered: {
        title: "Delivered",
        color: "#722ED1",
        bgColor: "rgba(114, 46, 209, 0.1)",
        icon: "📦",
    },
    cancelled: {
        title: "Cancelled",
        color: "#FF4D4F",
        bgColor: "rgba(255, 77, 79, 0.1)",
        icon: "❌",
    },
};

const OrderCard = ({ order, index, status }: { order: Order; index: number; status: string }) => (
    <Draggable draggableId={`${status}-${order.id}`} index={index}>
        {(provided: DraggableProvided, snapshot: DraggableStateSnapshot) => (
            <div
                ref={provided.innerRef}
                {...provided.draggableProps}
                {...provided.dragHandleProps}
                className="mb-3 bg-white rounded-lg border border-gray-200 p-3 hover:shadow-md transition-shadow"
            >
                <div className="flex justify-between items-start">
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
    const [orders, setOrders] = useState<Record<string, Order[]>>(() => {
        // Group orders by status initially
        return mockOrders.reduce((acc, order) => {
            if (!acc[order.status]) {
                acc[order.status] = [];
            }
            acc[order.status].push(order);
            return acc;
        }, {} as Record<string, Order[]>);
    });

    const onDragEnd = useCallback((result: DropResult) => {
        const { source, destination, draggableId } = result;

        // Dropped outside the list
        if (!destination) return;

        const sourceStatus = source.droppableId as keyof typeof statusConfig;
        const destStatus = destination.droppableId as keyof typeof statusConfig;
        const orderId = draggableId.split("-").slice(1).join("-"); // Extract the original order ID

        // No change in position
        if (source.droppableId === destination.droppableId && source.index === destination.index) {
            return;
        }

        setOrders((prevOrders) => {
            // Create a deep copy of the orders to avoid direct state mutation
            const updatedOrders = JSON.parse(JSON.stringify(prevOrders));

            // Get source and destination arrays
            const sourceArray = [...(updatedOrders[sourceStatus] || [])];
            const destArray = sourceStatus === destStatus ? sourceArray : [...(updatedOrders[destStatus] || [])];

            // Find the order in the source array using the extracted orderId
            const movedOrderIndex = sourceArray.findIndex((order) => order.id === orderId);
            if (movedOrderIndex === -1) return prevOrders; // Return previous state if order not found

            // Remove from source
            const [movedOrder] = sourceArray.splice(movedOrderIndex, 1);

            // Update status if moving to a different column
            if (sourceStatus !== destStatus) {
                movedOrder.status = destStatus;
            }

            // Add to destination at the correct position
            destArray.splice(destination.index, 0, movedOrder);

            // Update the state with the new orders
            updatedOrders[sourceStatus] = sourceArray;
            updatedOrders[destStatus] = destArray;

            return updatedOrders;
        });
    }, []);

    return (
        <div className="px-8 pt-5 h-full overflow-x-auto">
            <DragDropContext onDragEnd={onDragEnd}>
                <div className="flex gap-4 min-w-max">
                    {Object.entries(statusConfig).map(([status, config]) => (
                        <Droppable key={status} droppableId={status} type="ORDER">
                            {(provided: DroppableProvided, snapshot: DroppableStateSnapshot) => (
                                <div ref={provided.innerRef} {...provided.droppableProps} className="w-72 flex-shrink-0">
                                    <div className="mb-2 flex items-center">
                                        <span className="mr-2 text-lg">{config.icon}</span>
                                        <h3 className="font-medium">{config.title}</h3>
                                        <span className="ml-2 text-xs bg-gray-100 px-2 py-0.5 rounded-full">{orders[status]?.length || 0}</span>
                                    </div>
                                    <div className="bg-gray-50 rounded-lg p-3 h-[calc(100vh-200px)] overflow-y-auto" style={{ minHeight: "200px" }}>
                                        {orders[status]?.map((order, index) => (
                                            <OrderCard key={`${status}-${order.id}`} order={order} index={index} status={status} />
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
