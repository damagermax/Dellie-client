"use client";

import { Button, Drawer } from "antd";
import { Clock } from "lucide-react";
import { useState } from "react";
import AuditLogDrawer from "../AuditLogDrawer";

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

const mockAuditLogs: AuditLog[] = [
  {
    id: "1",
    action: "increased",
    field: "onHand",
    oldValue: 50,
    newValue: 100,
    timestamp: new Date("2025-08-16T14:30:00"),
    userId: "user1",
    userName: "John Doe",
    note: "Initial stock received",
  },
  {
    id: "2",
    action: "adjusted",
    field: "unavailable",
    oldValue: 0,
    newValue: 5,
    timestamp: new Date("2025-08-16T15:45:00"),
    userId: "user2",
    userName: "Jane Smith",
    note: "Damaged items set aside",
  },
  {
    id: "3",
    action: "decreased",
    field: "available",
    oldValue: 95,
    newValue: 90,
    timestamp: new Date("2025-08-16T16:15:00"),
    userId: "user1",
    userName: "John Doe",
    note: "Order #12345 processed",
  },
];

interface MetricCardProps {
  title: string;
  value: number;
  description: string;
  valueClassName?: string;
  size?: "sm" | "lg";
}

const MetricCard = ({ title, value, description, valueClassName = "text-gray-700", size = "sm" }: MetricCardProps) => (
  <div className="bg-white p-4 cursor-pointer rounded-xl border border-gray-200 hover:shadow transition-shadow">
    <div className="text-sm font-medium text-gray-700 mb-1">{title}</div>
    <div className={`number text-xl font-semibold  ${valueClassName}`}>{value.toLocaleString()}</div>
    <div className="mt-2 text-xs text-gray-400">{description}</div>
  </div>
);

interface QuantityEditorDrawerProps {
  variantName?: string;
  locationName?: string;
  quantity?: any;
  onSave?: (quantity: any) => void;
  children?: React.ReactNode;
}

export function QuantityEditorDrawer({ variantName, locationName, quantity, onSave, children }: QuantityEditorDrawerProps) {
  const [open, setOpen] = useState(false);
  const [auditLogsOpen, setAuditLogsOpen] = useState(false);
  const [editedQuantity, setEditedQuantity] = useState<any>({ ...quantity });

  return (
    <>
      <div onClick={() => setOpen(true)}>{children}</div>
      <Drawer
        title={
          <div className="text-left">
            <div className=" font-medium text-gray-800">
              {variantName} • {locationName}
            </div>
          </div>
        }
        open={open}
        onClose={() => setOpen(false)}
        width={400}
        footer={
          <div className="flex justify-end gap-2">
            <Button onClick={() => setOpen(false)}>Cancel</Button>
            <Button type="primary">Save Changes</Button>
          </div>
        }
      >
        <div className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <MetricCard title="On Hand" value={quantity.onHand} description="Total physical stock" valueClassName="text-gray-900" />
            <MetricCard title="Available" value={quantity.available} description="Ready to sell" valueClassName="text-green-600" />
            <MetricCard title="Committed" value={quantity.committed} description="Reserved in orders" valueClassName="text-blue-600" />
            <MetricCard title="Unavailable" value={quantity.unavailable || 0} description="Not for sale" valueClassName="text-red-600" />
          </div>

          <div className="mt-6 border-t border-gray-100 pt-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1">
                <div className="text-xs font-medium text-gray-400">LAST UPDATED</div>
                <div className="flex items-center text-sm text-gray-700">
                  <Clock className="mr-1.5 h-3.5 w-3.5 text-gray-400" />
                  Just now
                </div>
              </div>
              <div className="space-y-1">
                <div className="text-xs font-medium text-gray-400">LOCATION</div>
                <div className="text-sm text-gray-700">{locationName}</div>
              </div>
            </div>

            <div className="mt-4 pt-3 border-t border-gray-100">
              <button onClick={() => setAuditLogsOpen(true)} className="flex items-center text-sm font-medium text-blue-600 hover:text-blue-800 transition-colors">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                </svg>
                View full audit history
              </button>
            </div>
          </div>

          <AuditLogDrawer open={auditLogsOpen} onClose={() => setAuditLogsOpen(false)} logs={mockAuditLogs} title={`Audit Logs - ${variantName} (${locationName})`} />
        </div>
      </Drawer>
    </>
  );
}
