"use client";

import OrderDetail from "@/components/orders/OrderDetail";
import PrintReceiptDrawer from "@/components/orders/PrintReceiptDrawer";
import { ArrowLeft, History } from "lucide-react";
import { useParams } from "next/navigation";
import { useState } from "react";

import useToggle from "@/hooks/UseToggle";

import AuditLogDrawer from "@/components/AuditLogDrawer";
import Link from "next/link";

// Mock order data - in a real app, this would come from an API
const mockOrder = {
    id: "ORD-12345",
    date: new Date().toISOString(),
    customer: {
        name: "John Doe",
        email: "john.doe@example.com",
        phone: "+1234567890",
    },
    items: [
        { id: 1, name: "Wireless Earbuds", price: 99.99, quantity: 2 },
        { id: 2, name: "Phone Case", price: 29.99, quantity: 1 },
        { id: 3, name: "Screen Protector", price: 9.99, quantity: 2 },
    ],
    subtotal: 229.96,
    shipping: 15.0,
    tax: 27.6,
    total: 272.56,
    status: "processing",
    paymentMethod: "Credit Card",
    paymentStatus: "paid",
    shippingAddress: {
        street: "123 Main St",
        city: "Accra",
        state: "Greater Accra",
        postalCode: "GA123",
        country: "Ghana",
    },
};

export default function OrderDetailPage() {
    const { orderId } = useParams<{ orderId: string }>();
    const [isPrintModalOpen, setIsPrintModalOpen] = useState(false);
    const [isAuditLogsOpen, toggleAuditLogs] = useToggle(false);

    const handlePrintClick = () => {
        setIsPrintModalOpen(true);
    };

    const handlePrintModalClose = () => {
        setIsPrintModalOpen(false);
    };

    return (
        <div className="p-4 bg-white md:p-6">
            <div className="flex justify-between items-center mb-6">
                <div>
                    <h1 className="text-2xl font-bold">Order Details</h1>

                    <Link href="/orders" className="flex  mt-2  items-center text-sm text-blue-500 hover:text-blue-600">
                        <ArrowLeft className="w-4 h-4 " />
                        Back to orders
                    </Link>
                </div>

                <div className="space-x-2 flex items-center">
                    <div className="flex items-center gap-2 cursor-pointer text-blue-500 mr-8" onClick={toggleAuditLogs}>
                        <History />
                        <span>History</span>
                    </div>
                    <button
                        onClick={handlePrintClick}
                        className="flex items-center gap-2 px-4 py-2 border rounded-md hover:bg-gray-50 transition-colors"
                    >
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                            <path
                                fillRule="evenodd"
                                d="M5 4v3H4a2 2 0 00-2 2v3a2 2 0 002 2h1v2a2 2 0 002 2h6a2 2 0 002-2v-2h1a2 2 0 002-2V9a2 2 0 00-2-2h-1V4a2 2 0 00-2-2H7a2 2 0 00-2 2zm8 0H7v3h6V4zm0 8H7v4h6v-4z"
                                clipRule="evenodd"
                            />
                        </svg>
                        <span>Print Receipt</span>
                    </button>
                    <button className="px-4 py-2 bg-primary  border rounded-md hover:bg-primary/90 transition-colors">Update Status</button>
                </div>
            </div>
            <OrderDetail orderId={orderId} />

            <AuditLogDrawer open={isAuditLogsOpen} onClose={toggleAuditLogs} />

            {/* Print Receipt Drawer */}
            <PrintReceiptDrawer order={mockOrder} visible={isPrintModalOpen} onClose={handlePrintModalClose} />
        </div>
    );
}
