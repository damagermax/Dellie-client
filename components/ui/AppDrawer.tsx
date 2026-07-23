"use client";

import { Button, Drawer, Grid } from "antd";
import { AiOutlineClose } from "react-icons/ai";
import { AppModalProps } from "./AppModal";

const AppDrawer = ({ title, toggle, open, children, footer }: AppModalProps) => {
  const screens = Grid.useBreakpoint();
  const fullScreen = !screens.lg;

  return (
    <div>
      <Drawer
        footer={footer}
        destroyOnClose
        width={fullScreen ? "100vw" : 550}
        styles={{
          body: { padding: 0, flex: 1, minHeight: 0, overflow: "auto" },
          content: {
            borderRadius: 0,
            overflow: "hidden",
            display: "flex",
            flexDirection: "column",
          },
        }}
        closeIcon={null}
        onClose={toggle}
        open={open}
      >
        <div className="sticky top-0 bg-gray-100">
          <div className="flex items-center justify-between px-5">
            <p className=" pageTittle">{title}</p>

            <Button type="text" shape="circle" title="settings" className="!bg-gray-200" onClick={toggle}>
              <AiOutlineClose className="!text-gray-600 " />
            </Button>
          </div>
        </div>

        {children}
      </Drawer>
    </div>
  );
};

export default AppDrawer;
