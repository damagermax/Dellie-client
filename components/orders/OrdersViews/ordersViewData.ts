"use client";

export interface OrderItem {
  id: string;
  name: string;
  quantity: number;
  price: number;
  image?: string;
  sku: string;
}

export type OrderStatus = "pending" | "processing" | "fulfilled" | "cancelled" | "delivered";

export interface OrderViewItem {
  id: string;
  orderNumber: string;
  date: string;
  customer: string;
  status: OrderStatus;
  total: number;
  itemsCount: number;
  paymentMethod: string;
  items: OrderItem[];
  shippingAddress: string;
  contactEmail: string;
  contactPhone: string;
}

export const mockOrders: OrderViewItem[] = [
  {
    id: "1",
    orderNumber: "ORD-001",
    date: new Date(Date.now() - 3600000 * 2).toISOString(),
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
    date: new Date(Date.now() - 3600000).toISOString(),
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
  {
    id: "3",
    orderNumber: "ORD-003",
    date: new Date(Date.now() - 86400000).toISOString(),
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
    date: new Date(Date.now() - 172800000).toISOString(),
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

export const orderStatusConfig: Record<
  OrderStatus,
  { title: string; color: string; bgColor: string; icon?: string }
> = {
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

export function sortOrdersByDate(orders: OrderViewItem[]) {
  return [...orders].sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
}

export function groupOrdersByStatus(orders: OrderViewItem[]) {
  return orders.reduce(
    (acc, order) => {
      acc[order.status].push(order);
      return acc;
    },
    {
      pending: [],
      processing: [],
      fulfilled: [],
      cancelled: [],
      delivered: [],
    } as Record<OrderStatus, OrderViewItem[]>,
  );
}
