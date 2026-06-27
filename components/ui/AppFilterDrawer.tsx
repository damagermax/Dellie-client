"use client";

import { Button, Drawer } from "antd";
import { ReactNode } from "react";

interface AppFilterDrawerProps {
  title: string;
  open: boolean;
  onClose: () => void;
  onApply: () => void;
  onClear: () => void;
  children: ReactNode;
}

export function AppFilterDrawer({ title, open, onClose, onApply, onClear, children }: AppFilterDrawerProps) {
  return (
    <Drawer
      title={title}
      placement="right"
      width={360}
      open={open}
      onClose={onClose}
      destroyOnClose={false}
      footer={
        <div className="flex items-center justify-between gap-3">
          <Button onClick={onClear}>Clear</Button>
          <div className="flex items-center gap-2">
            <Button onClick={onClose}>Cancel</Button>
            <Button type="primary" className="!shadow-none" onClick={onApply}>
              Apply
            </Button>
          </div>
        </div>
      }
    >
      <div className="space-y-4">{children}</div>
    </Drawer>
  );
}
