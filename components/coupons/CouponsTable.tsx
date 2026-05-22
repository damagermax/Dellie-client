"use client";
import type { TableProps } from "antd/es/table";

import AppTable from "@/components/ui/AppTable";
import AppTag from "../ui/AppTag";

interface Coupon {
    key: string;
    code: string;
    discountType: "Percentage" | "Fixed Amount";
    value: string;
    status: "Active" | "Expired" | "Scheduled";
    usageLimit: number | "Unlimited";
    startDate: string;
    endDate: string;
}

export default function CouponsTable() {
    const columns: TableProps<Coupon>["columns"] = [
        {
            title: "Coupon Code",
            dataIndex: "code",
            key: "code",
            className: "!pl-8",
        },
        //         {
        //             title: "Type",
        //             dataIndex: "discountType",
        //             key: "discountType",
        //         },
        {
            title: "Value",
            dataIndex: "value",
            key: "value",
        },
        {
            title: "Usage Limit",
            dataIndex: "usageLimit",
            key: "usageLimit",
        },
        {
            title: "Date",
            dataIndex: "startDate",
            key: "startDate",
            render: (date: Coupon["startDate"], data: Coupon) => {
                return (
                    <span className=" bg-gray-100 p-1 px-3 rounded-full text-xs">
                        {date} - {data.endDate}
                    </span>
                );
            },
        },

        {
            title: "Status",
            dataIndex: "status",
            key: "status",
            className: "!pr-8",
            render: (status: Coupon["status"]) => <AppTag value={status} />,
        },
    ];

    const dataSource: Coupon[] = [
        {
            key: "1",
            code: "NEWYEAR20",
            discountType: "Percentage",
            value: "20%",
            status: "Expired",
            usageLimit: 100,
            startDate: "Jan 1, 2025",
            endDate: "Jan 10, 2025",
        },
        {
            key: "2",
            code: "SUMMER50",
            discountType: "Fixed Amount",
            value: "GHS 50",
            status: "Active",
            usageLimit: 200,
            startDate: "Mar 1, 2025",
            endDate: "Mar 31, 2025",
        },
        {
            key: "3",
            code: "BLACKFRIDAY30",
            discountType: "Percentage",
            value: "30%",
            status: "Scheduled",
            usageLimit: "Unlimited",
            startDate: "Nov 29, 2025",
            endDate: "Nov 30, 2025",
        },
        {
            key: "4",
            code: "XMAS100",
            discountType: "Fixed Amount",
            value: "GHS 100",
            status: "Scheduled",
            usageLimit: 50,
            startDate: "Dec 20, 2025",
            endDate: "Dec 25, 2025",
        },
        {
            key: "5",
            code: "EASTER15",
            discountType: "Percentage",
            value: "15%",
            status: "Scheduled",
            usageLimit: 150,
            startDate: "Apr 10, 2025",
            endDate: "Apr 15, 2025",
        },
        {
            key: "6",
            code: "VALENTINE10",
            discountType: "Percentage",
            value: "10%",
            status: "Expired",
            usageLimit: 75,
            startDate: "Feb 10, 2025",
            endDate: "Feb 14, 2025",
        },
        {
            key: "7",
            code: "BACK2SCHOOL",
            discountType: "Fixed Amount",
            value: "GHS 30",
            status: "Active",
            usageLimit: "Unlimited",
            startDate: "Aug 1, 2025",
            endDate: "Aug 31, 2025",
        },
        {
            key: "8",
            code: "FLASHSALE25",
            discountType: "Percentage",
            value: "25%",
            status: "Active",
            usageLimit: 500,
            startDate: "Mar 10, 2025",
            endDate: "Mar 15, 2025",
        },
        {
            key: "9",
            code: "INDEPENDENCE40",
            discountType: "Fixed Amount",
            value: "GHS 40",
            status: "Scheduled",
            usageLimit: 250,
            startDate: "Jul 4, 2025",
            endDate: "Jul 5, 2025",
        },
        {
            key: "10",
            code: "MIDYEAR35",
            discountType: "Percentage",
            value: "35%",
            status: "Active",
            usageLimit: 300,
            startDate: "Jun 15, 2025",
            endDate: "Jun 30, 2025",
        },
        {
            key: "11",
            code: "BUYMORE20",
            discountType: "Fixed Amount",
            value: "GHS 20",
            status: "Active",
            usageLimit: 150,
            startDate: "May 1, 2025",
            endDate: "May 15, 2025",
        },
        {
            key: "12",
            code: "CYBERMON40",
            discountType: "Percentage",
            value: "40%",
            status: "Scheduled",
            usageLimit: "Unlimited",
            startDate: "Dec 2, 2025",
            endDate: "Dec 2, 2025",
        },
    ];

    return (
        <div className="">
            <AppTable<Coupon> columns={columns} dataSource={dataSource} className="custom-table" />
        </div>
    );
}
