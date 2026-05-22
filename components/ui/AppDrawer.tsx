import { Drawer, Button } from "antd";
import { AiOutlineClose } from "react-icons/ai";
import { AppModalProps } from "./AppModal";

const AppDrawer = ({ title, toggle, open, children, footer }: AppModalProps) => {
  return (
    <div>
      <Drawer footer={footer} destroyOnClose width={550} styles={{ body: { padding: 0 } }} closeIcon={null} onClose={toggle} open={open}>
        <div className=" sticky top-0 bg-gray-100 ">
          <div className=" px-5 flex items-center justify-between ">
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
