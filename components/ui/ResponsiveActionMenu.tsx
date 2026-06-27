"use client";

import { Button, Drawer, Dropdown, MenuProps } from "antd";
import { useState } from "react";
import type { Key, ReactNode } from "react";
import { RiMoreLine } from "react-icons/ri";

type MenuItem = NonNullable<MenuProps["items"]>[number];

interface ResponsiveActionMenuProps {
  items: MenuProps["items"];
  onClick?: MenuProps["onClick"];
  title?: string;
}

function isActionItem(item: MenuItem): item is Exclude<MenuItem, null> & { key: Key; label?: ReactNode; disabled?: boolean; danger?: boolean; type?: string } {
  return Boolean(item && "key" in item);
}

export default function ResponsiveActionMenu({ items = [], onClick, title = "Actions" }: ResponsiveActionMenuProps) {
  const [open, setOpen] = useState(false);
  const actionItems = items.filter(isActionItem);

  const trigger = (
    <button type="button" aria-label="Open actions" className="flex h-8 w-8 items-center justify-center rounded-full bg-gray-100 text-gray-600">
      <RiMoreLine size={15} />
    </button>
  );

  const handleAction = (item: (typeof actionItems)[number]) => {
    if (item.disabled) return;
    onClick?.({ key: String(item.key), keyPath: [String(item.key)], domEvent: undefined as never });
    setOpen(false);
  };

  return (
    <>
      <div className="hidden md:flex">
        <Dropdown arrow={{ pointAtCenter: true }} menu={{ items, onClick }} trigger={["click"]} placement="bottomRight">
          {trigger}
        </Dropdown>
      </div>

      <div className="md:hidden">
        <div onClick={() => setOpen(true)}>{trigger}</div>
        <Drawer
          title={title}
          placement="bottom"
          open={open}
          onClose={() => setOpen(false)}
          height="auto"
          className="rounded-t-3xl"
          extra={
            <Button type="text" onClick={() => setOpen(false)}>
              Close
            </Button>
          }
        >
          <div className="pb-4">
            {actionItems.map((item) => (
              <button
                key={String(item.key)}
                type="button"
                disabled={item.disabled}
                onClick={() => handleAction(item)}
                className={`flex min-h-12 w-full items-center justify-between border-b border-gray-100 px-1 py-3 text-left text-base disabled:cursor-not-allowed disabled:opacity-40 ${item.danger ? "text-red-600" : "text-gray-800"}`}
              >
                <span className="flex items-center gap-3">{item.label}</span>
              </button>
            ))}
          </div>
        </Drawer>
      </div>
    </>
  );
}
