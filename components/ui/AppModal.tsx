import Modal from "antd/es/modal/Modal";
import { ReactNode } from "react";
import { Spin } from "antd";

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
  return (
    <Modal
      width={width}
      title={
        <div>
          <h3 className=" text-lg">{title}</h3>
          <p className="  text-sm  text-gray-600 font-normal">{}</p>
        </div>
      }
      wrapClassName={overlayClassName || "bg-black/60 backdrop-blur-xs"}
      styles={{ header: { background: "white" } }}
      onCancel={toggle}
      className="  !rounded-4xl"
      open={open}
      footer={footer}
      okText={okText || "Save"}
      onOk={onOk}
      okButtonProps={{ className: "bg-indigo-600 hover:bg-indigo-700" }}
    >
      <div className=" overflow-auto">
        <div style={{ maxHeight: height }}>
          <Spin className=" z-50" spinning={loading}>
            {children}
          </Spin>
        </div>
      </div>
    </Modal>
  );
}
