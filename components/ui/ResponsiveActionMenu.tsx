"use client";

import { Button, Drawer, Dropdown, MenuProps } from "antd";
import { useState } from "react";
import type { Key, ReactNode } from "react";
import { RiMoreLine } from "react-icons/ri";

type MenuItem = NonNullable<MenuProps["items"]>[number];
type ActionItem = Exclude<MenuItem, null> & { key: Key; label?: ReactNode; disabled?: boolean; danger?: boolean; type?: string; onClick?: () => void };

interface ResponsiveActionMenuProps {
  items: MenuProps["items"];
  onClick?: MenuProps["onClick"];
  title?: string;
  isTransparent?: boolean;
}

function isActionItem(item: MenuItem): item is ActionItem {
  return Boolean(item && "key" in item);
}

export default function ResponsiveActionMenu({ items = [], onClick, title = "Actions", isTransparent }: ResponsiveActionMenuProps) {
  const [open, setOpen] = useState(false);
  const actionItems = items.filter(isActionItem);
  const desktopItems = items.map((item) => {
    if (!isActionItem(item)) {
      return item;
    }

    return {
      ...item,
      onClick: () => handleAction(item),
    };
  });

  const trigger = (
    <button type="button" aria-label="Open actions" className={`flex h-8 w-8 items-center justify-center rounded-full ${isTransparent ? "bg-transparent text-gray-600" : "bg-gray-100 text-gray-600"}`}>
      <RiMoreLine size={isTransparent ? 20 : 15} className=" " />
    </button>
  );

  const handleAction = (item: ActionItem) => {
    if (item.disabled) return;
    if (onClick) {
      onClick({
        key: String(item.key),
        keyPath: [String(item.key)],
        domEvent: undefined as never,
        item: undefined as never,
      });
    } else {
      item.onClick?.();
    }
    setOpen(false);
  };

  return (
    <>
      <div className="hidden md:flex">
        <Dropdown arrow={{ pointAtCenter: true }} menu={{ items: desktopItems }} trigger={["click"]} placement="bottomRight">
          {trigger}
        </Dropdown>
      </div>

      <div className="md:hidden">
        <div onClick={() => setOpen(true)}>{trigger}</div>
        <Drawer
          title={title}
          placement="bottom"
          open={open}
          closeIcon={null}
          height={"40%"}
          onClose={() => setOpen(false)}
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
                className={`flex  w-full items-center justify-between border-b border-gray-100 px-1 py-3 text-left text-base disabled:cursor-not-allowed disabled:opacity-40 ${item.danger ? "text-red-600" : "text-gray-800"}`}
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
