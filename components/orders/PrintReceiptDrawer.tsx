"use client";

import { Order } from "@/types/order";
import { CloseOutlined, DownloadOutlined, PrinterOutlined } from "@ant-design/icons";
import { Button, Drawer } from "antd";

interface PrintReceiptDrawerProps {
    order: Order;
    visible: boolean;
    onClose: () => void;
}

export default function PrintReceiptDrawer({ order, visible, onClose }: PrintReceiptDrawerProps) {
    const handlePrint = () => {
        const printContent = document.getElementById("receipt-content");
        if (printContent) {
            const printWindow = window.open("", "", "width=800,height=900");
            if (printWindow) {
                printWindow.document.write(`
          <!DOCTYPE html>
          <html>
            <head>
              <title>Receipt - Order #${order.id}</title>
              <link href="https://cdn.jsdelivr.net/npm/tailwindcss@2.2.19/dist/tailwind.min.css" rel="stylesheet">
              <style>
                @media print {
                  @page { margin: 0; }
                  body { margin: 1.6cm; }
                  .no-print { display: none !important; }
                }
              </style>
            </head>
            <body class="bg-white">
              <div id="receipt-content">
                ${printContent.innerHTML}
              </div>
              <div class="no-print fixed bottom-4 right-4">
                <button onclick="window.print()" class="bg-blue-600 text-white px-4 py-2 rounded-md mr-2">
                  Print Receipt
                </button>
                <button onclick="window.close()" class="bg-gray-500 text-white px-4 py-2 rounded-md">
                  Close
                </button>
              </div>
              <script>
                window.onload = function() {
                  window.print();
                };
              </script>
            </body>
          </html>
        `);
                printWindow.document.close();
            }
        }
    };

    const handleDownload = () => {
        // This is a placeholder for PDF generation
        // In a real app, you would generate a PDF here
        alert("PDF download functionality would be implemented here");
    };

    return (
        <Drawer
            title={
                <div className="flex justify-between items-center">
                    <span>Order Receipt</span>
                    <Button type="text" icon={<CloseOutlined />} onClick={onClose} />
                </div>
            }
            open={visible}
            onClose={onClose}
            width={800}
            className="print:hidden"
            extra={
                <div className="space-x-2">
                    <Button icon={<DownloadOutlined />} onClick={handleDownload}>
                        Download PDF
                    </Button>
                    <Button type="primary" icon={<PrinterOutlined />} onClick={handlePrint}>
                        Print Receipt
                    </Button>
                </div>
            }
        >
            <div className="bg-white p-8 rounded-lg shadow-md" id="receipt-content">
                {/* Header */}
                <div className="text-center mb-8 border-b pb-4">
                    <h1 className="text-2xl font-bold tracking-wide text-gray-800">Bambi-Sell</h1>
                    <p className="text-gray-600">123 Market Street, Accra, Ghana</p>
                    <p className="text-gray-600">Tel: +233 50 123 4567 | Email: info@bambi-sell.com</p>
                </div>

                {/* Order Info */}
                <div className="mb-6 flex justify-between items-start">
                    <div>
                        <h2 className="text-lg font-semibold text-gray-700">Receipt</h2>
                        <p className="text-sm text-gray-500">Official Document</p>
                    </div>
                    <div className="text-right text-sm text-gray-600">
                        <p>
                            <span className="font-medium">Order #:</span> {order.id}
                        </p>
                        <p>
                            <span className="font-medium">Date:</span> {new Date(order.date).toLocaleDateString()}
                        </p>
                    </div>
                </div>

                {/* Customer Info */}
                <div className="mb-6">
                    <h3 className="font-semibold text-gray-700 mb-2">Customer Details</h3>
                    <p className="font-medium">{order.customer.name}</p>
                    <p className="text-gray-600">{order.customer.email}</p>
                    <p className="text-gray-600">{order.customer.phone}</p>
                </div>

                {/* Order Items */}
                <div className="mb-6">
                    <h3 className="font-semibold text-gray-700 mb-2">Order Items</h3>
                    <table className="w-full border-collapse text-sm">
                        <thead>
                            <tr className="border-b bg-gray-50 text-gray-700">
                                <th className="text-left py-2 px-2">Item</th>
                                <th className="text-right py-2 px-2">Qty</th>
                                <th className="text-right py-2 px-2">Price</th>
                                <th className="text-right py-2 px-2">Total</th>
                            </tr>
                        </thead>
                        <tbody>
                            {order.items.map((item, index) => (
                                <tr key={index} className="border-b">
                                    <td className="py-2 px-2">{item.name}</td>
                                    <td className="text-right py-2 px-2">{item.quantity}</td>
                                    <td className="text-right py-2 px-2">GHS {item.price.toFixed(2)}</td>
                                    <td className="text-right py-2 px-2">GHS {(item.price * item.quantity).toFixed(2)}</td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>

                {/* Order Summary */}
                <div className="flex justify-end mb-8">
                    <div className="w-72 text-sm">
                        <div className="flex justify-between mb-1">
                            <span>Subtotal:</span>
                            <span>GHS {order.subtotal.toFixed(2)}</span>
                        </div>
                        <div className="flex justify-between mb-1">
                            <span>Shipping:</span>
                            <span>GHS {order.shipping.toFixed(2)}</span>
                        </div>
                        <div className="flex justify-between mb-1">
                            <span>Tax:</span>
                            <span>GHS {order.tax.toFixed(2)}</span>
                        </div>
                        <div className="border-t mt-2 pt-2 font-semibold text-gray-800 text-base flex justify-between">
                            <span>Total:</span>
                            <span>GHS {order.total.toFixed(2)}</span>
                        </div>
                    </div>
                </div>

                {/* Footer */}
                <div className="mt-6 text-center text-xs text-gray-500 border-t pt-4">
                    <p>Thank you for your business.</p>
                    <p>For inquiries, contact our support team.</p>
                </div>
            </div>
        </Drawer>
    );
}
