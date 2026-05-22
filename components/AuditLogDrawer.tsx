"use client";

import { Button, Drawer, Tag } from "antd";
import { ArrowDown, ArrowUp, Clock, RefreshCw } from "lucide-react";

interface AuditLog {
    id: string;
    action: "increased" | "decreased" | "adjusted" | "created" | "updated";
    field: string;
    oldValue?: number;
    newValue: number;
    timestamp: Date;
    userId: string;
    userName: string;
    note?: string;
}

interface AuditLogDrawerProps {
    open: boolean;
    onClose: () => void;
    logs?: AuditLog[];
    title?: string;
}

const getActionColor = (action: string) => {
    switch (action) {
        case "increased":
            return "green";
        case "decreased":
            return "red";
        case "adjusted":
            return "blue";
        default:
            return "gray";
    }
};

const getActionIcon = (action: string) => {
    switch (action) {
        case "increased":
            return <ArrowUp size={12} />;
        case "decreased":
            return <ArrowDown size={12} />;
        default:
            return <RefreshCw size={12} />;
    }
};

export default function AuditLogDrawer({ open, onClose, logs, title = "History" }: AuditLogDrawerProps) {
    return (
        <Drawer
            title={title}
            open={open}
            onClose={onClose}
            width={500}
            footer={
                <div className="flex justify-end">
                    <Button onClick={onClose} type="primary">
                        Close
                    </Button>
                </div>
            }
        >
            <div className="space-y-3">
                {logs?.length === 0 ? (
                    <div className="text-center py-8 text-gray-500">No audit logs available</div>
                ) : (
                    logs?.map((log) => (
                        <div key={log.id} className="p-3 bg-gray-50 rounded-lg">
                            <div className="flex justify-between items-start">
                                <div className="flex items-center gap-2">
                                    {getActionIcon(log.action)}
                                    <span className="text-sm font-medium">
                                        {log.userName} {log.action} {log.field}
                                    </span>
                                </div>
                                <Tag color={getActionColor(log.action)} className="text-xs">
                                    {log.action.toUpperCase()}
                                </Tag>
                            </div>
                            <div className="mt-2 flex items-center text-xs text-gray-500">
                                <Clock size={12} className="mr-1" />
                                {log.timestamp.toLocaleString()}
                            </div>
                            {log.note && <div className="mt-2 text-xs text-gray-600 bg-white p-2 rounded border border-gray-100">{log.note}</div>}
                            {log.oldValue !== undefined && (
                                <div className="mt-2 flex items-center justify-between text-xs">
                                    <span className="text-gray-500">Changed from</span>
                                    <span className="font-mono">{log.oldValue}</span>
                                    <span>→</span>
                                    <span className="font-mono font-semibold">{log.newValue}</span>
                                </div>
                            )}
                        </div>
                    ))
                )}
            </div>
        </Drawer>
    );
}
