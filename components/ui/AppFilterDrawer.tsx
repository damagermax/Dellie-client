"use client";

import { Button, Drawer, Grid } from "antd";
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
  const screens = Grid.useBreakpoint();
  const fullScreen = !screens.lg;

  return (
    <Drawer
      title={title}
      placement="right"
      width={fullScreen ? "100vw" : 360}
      open={open}
      onClose={onClose}
      destroyOnClose={false}
      styles={{
        content: {
          borderRadius: 0,
          overflow: "hidden",
        },
        body: {
          overflow: "auto",
        },
      }}
      footer={
        <div className="flex  gap-3 sm:flex-row sm:items-center sm:justify-between">
          <Button className="w-full  sm:w-auto" onClick={onClear}>
            Clear
          </Button>
          <div className="flex  gap-2 sm:flex-row sm:items-center">
            <Button className="w-full sm:w-auto" onClick={onClose}>
              Cancel
            </Button>
            <Button type="primary" className="!shadow-none w-full sm:w-auto" onClick={onApply}>
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
