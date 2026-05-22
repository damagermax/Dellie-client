import { Card, Divider, Tabs, TabsProps } from "antd";
import { Clock, CreditCard, Mail, Package, Phone, Truck, User } from "lucide-react";
import OrderItemsTable from "./OrderItemsTable";
import OrderTimeline from "./OrderTimeline";

interface OrderDetailProps {
    orderId: string;
}

const OrderDetail = ({ orderId }: OrderDetailProps) => {
    // Mock data - replace with actual data fetching
    const order = {
        id: orderId,
        orderNumber: `#${orderId.padStart(6, "0")}`,
        date: "2023-11-15T14:30:00Z",
        status: "Processing",
        shippingStatus: "Not Shipped",
        paymentMethod: "Credit Card",
        paymentStatus: "Paid",
        customer: {
            name: "John Doe",
            email: "john.doe@example.com",
            phone: "+1 (555) 123-4567",
        },
        shippingAddress: {
            street: "123 Main St",
            city: "Accra",
            state: "Greater Accra",
            country: "Ghana",
            postalCode: "GA123",
        },
        billingAddress: {
            sameAsShipping: true,
            street: "123 Main St",
            city: "Accra",
            state: "Greater Accra",
            country: "Ghana",
            postalCode: "GA123",
        },
        items: [
            {
                id: "1",
                name: "Premium Wireless Earbuds",
                price: 129.99,
                quantity: 1,
                image: "/images/placeholder.png",
                sku: "SKU-001",
            },
            {
                id: "2",
                name: "Phone Case",
                price: 24.99,
                quantity: 2,
                image: "/images/placeholder.png",
                sku: "SKU-002",
            },
        ],
        subtotal: 179.97,
        shipping: 15.0,
        tax: 24.37,
        total: 219.34,
        notes: "Please leave the package at the front door.",
    };

    const items: TabsProps["items"] = [
        {
            key: "1",
            label: "Order Details",
            children: <OrderItemsTable items={order.items} />,
        },
        {
            key: "2",
            label: "Timeline",
            children: <OrderTimeline orderId={orderId} />,
        },
    ];

    return (
        <div className="space-y-6 ">
            {/* Order Summary */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {/* Order Info */}
                <Card title="Order Information" className="col-span-2">
                    <div className="space-y-4">
                        <div className="flex items-center gap-2">
                            <Clock className="w-5 h-5 text-gray-500" />
                            <span className="text-gray-600">Placed on {new Date(order.date).toLocaleDateString()}</span>
                        </div>
                        <div className="flex items-center gap-2">
                            <Package className="w-5 h-5 text-gray-500" />
                            <div>
                                <span className="text-gray-600">Status: </span>
                                <span className="font-medium">{order.status}</span>
                            </div>
                        </div>
                        <div className="flex items-center gap-2">
                            <Truck className="w-5 h-5 text-gray-500" />
                            <div>
                                <span className="text-gray-600">Shipping: </span>
                                <span className="font-medium">{order.shippingStatus}</span>
                            </div>
                        </div>
                        <div className="flex items-center gap-2">
                            <CreditCard className="w-5 h-5 text-gray-500" />
                            <div>
                                <span className="text-gray-600">Payment: </span>
                                <span className="font-medium">
                                    {order.paymentMethod} ({order.paymentStatus})
                                </span>
                            </div>
                        </div>
                    </div>
                </Card>

                {/* Customer Info */}
                <Card title="Customer Information" className="border border-gray-100 rounded-lg ">
                    <div className="space-y-5">
                        <div className="flex items-start p-2 gap-4  bg-gray-50 rounded-md">
                            <div className="p-2 bg-white rounded-full shadow-sm">
                                <User className="w-5 h-5 text-primary" />
                            </div>
                            <div>
                                <h3 className="font-medium text-gray-900">{order.customer.name}</h3>
                                <p className="text-sm text-gray-500">Customer</p>
                            </div>
                        </div>

                        <div className="space-y-4 border-t border-gray-100 pt-4">
                            <a
                                href={`mailto:${order.customer.email}`}
                                className="flex items-center gap-3 p-2 -mx-2 rounded-md hover:bg-gray-50 transition-colors group"
                            >
                                <div className="p-1.5 bg-blue-50 rounded-md group-hover:bg-blue-100 transition-colors">
                                    <Mail className="w-4 h-4 text-blue-600" />
                                </div>
                                <span className="text-gray-700 group-hover:text-primary transition-colors">{order.customer.email}</span>
                            </a>

                            <a
                                href={`tel:${order.customer.phone}`}
                                className="flex items-center gap-3 p-2 -mx-2 rounded-md hover:bg-gray-50 transition-colors group"
                            >
                                <div className="p-1.5 bg-green-50 rounded-md group-hover:bg-green-100 transition-colors">
                                    <Phone className="w-4 h-4 text-green-600" />
                                </div>
                                <span className="text-gray-700 group-hover:text-primary transition-colors">{order.customer.phone}</span>
                            </a>
                        </div>
                    </div>
                </Card>
            </div>

            {/* Order Items */}
            <Card>
                <Tabs defaultActiveKey="1" items={items} />
            </Card>

            <div className="grid grid-cols-1 mt-5 md:grid-cols-2 gap-6">
                {/* Addresses */}
                <Card title="Shipping Address">
                    <div className="space-y-2">
                        <div>{order.shippingAddress.street}</div>
                        <div>
                            {order.shippingAddress.city}, {order.shippingAddress.state} {order.shippingAddress.postalCode}
                        </div>
                        <div>{order.shippingAddress.country}</div>
                    </div>
                </Card>
                {/* Order Summary */}
                <Card title="Order Summary">
                    <div className="space-y-3">
                        <div className="flex justify-between">
                            <span className="text-gray-600">Subtotal</span>
                            <span>GHS {order.subtotal.toFixed(2)}</span>
                        </div>
                        <div className="flex justify-between">
                            <span className="text-gray-600">Shipping</span>
                            <span>GHS {order.shipping.toFixed(2)}</span>
                        </div>
                        <div className="flex justify-between">
                            <span className="text-gray-600">Tax</span>
                            <span>GHS {order.tax.toFixed(2)}</span>
                        </div>
                        <Divider className="my-2" />
                        <div className="flex justify-between text-lg font-semibold">
                            <span>Total</span>
                            <span className="text-primary">GHS {order.total.toFixed(2)}</span>
                        </div>
                    </div>
                </Card>
            </div>

            {/* Order Notes */}
            {order.notes && (
                <Card title="Order Notes">
                    <p className="text-gray-700">{order.notes}</p>
                </Card>
            )}
        </div>
    );
};

export default OrderDetail;
