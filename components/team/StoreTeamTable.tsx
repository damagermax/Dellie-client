import type { TableProps } from "antd/es/table";

import AppTable from "@/components/ui/AppTable";
import AppTag from "../ui/AppTag";

interface TeamMember {
    key: string;
    name: string;
    email: string;
    phone: string;
    status: string;
}

export default function StoreTeamTable() {
    const columns: TableProps<TeamMember>["columns"] = [
        {
            title: "Name",
            dataIndex: "name",
            key: "name",
            className: "!pl-8",
        },
        {
            title: "Email",
            dataIndex: "email",
            key: "email",
        },
        {
            title: "Phone",
            dataIndex: "phone",
            key: "phone",
        },
        {
            title: "Status",
            dataIndex: "status",
            key: "status",
            className: "!pr-8",
            render: (status: TeamMember["status"]) => <AppTag value={status} />,
        },
    ];

    const dataSource: TeamMember[] = [
        { key: "1", name: "John Doe", email: "john@example.com", phone: "123-456-7890", status: "InActive" },
        { key: "2", name: "Jane Smith", email: "jane@example.com", phone: "987-654-3210", status: "InActive" },
        { key: "3", name: "Alice Johnson", email: "alice@example.com", phone: "555-123-4567", status: "InActive" },
        { key: "4", name: "Bob Brown", email: "bob@example.com", phone: "444-789-0123", status: "Active" },
    ];

    return <AppTable<TeamMember> columns={columns} dataSource={dataSource} className="custom-table" />;
}
