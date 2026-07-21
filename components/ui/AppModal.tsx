"use client";

import Modal from "antd/es/modal/Modal";
import { ReactNode } from "react";
import { Grid, Spin } from "antd";

export type ModalProps = {
  open: boolean;
  toggle: () => void;
  onOk?: () => void | Promise<void>;
};

export type AppModalProps = {
  children: ReactNode;
  width?: number;
  height?: number | string;
  title: string | ReactNode;
  okText?: string;
  loading?: boolean;
  footer?: ReactNode | null;
  overlayClassName?: string;
} & ModalProps;

export function AppModal({ open, title, footer, toggle, children, width = 900, height = "60vh", onOk, okText, loading = false, overlayClassName }: AppModalProps) {
  const screens = Grid.useBreakpoint();
  const fullScreen = !screens.lg;

  return (
    <Modal
      width={fullScreen ? "100vw" : width}
      title={
        <div>
          <h3 className="text-lg">{title}</h3>
        </div>
      }
      wrapClassName={overlayClassName || "bg-black/60 backdrop-blur-xs"}
      styles={{
        mask: { backdropFilter: "blur(8px)", background: "rgba(15, 23, 42, 0.55)" },
        header: {
          background: "white",
          padding: fullScreen ? "20px 20px 0" : undefined,
        },
        body: {
          padding: 0,
          flex: 1,
          minHeight: 0,
          overflow: fullScreen ? "hidden" : "auto",
        },
        content: fullScreen
          ? {
              height: "100dvh",
              maxHeight: "100dvh",
              borderRadius: 0,
              padding: 0,
              display: "flex",
              flexDirection: "column",
            }
          : {
              overflow: "hidden",
            },
        footer: footer
          ? {
              marginTop: 0,
              padding: 0,
            }
          : undefined,
      }}
      onCancel={toggle}
      className={fullScreen ? "!m-0 !max-w-none !rounded-none" : "!rounded-[28px]"}
      open={open}
      footer={footer}
      okText={okText || "Save"}
      onOk={onOk}
      okButtonProps={{ className: "bg-indigo-600 hover:bg-indigo-700" }}
    >
      <div className={fullScreen ? "h-full min-h-0 overflow-y-auto overscroll-contain" : "overflow-auto"}>
        <div className={fullScreen ? "min-h-full" : undefined} style={{ maxHeight: fullScreen ? undefined : height }}>
          <Spin className=" z-50" spinning={loading}>
            {children}
          </Spin>
        </div>
      </div>
    </Modal>
  );
}
