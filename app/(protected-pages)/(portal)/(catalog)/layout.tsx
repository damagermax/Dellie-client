"use client";
import { Menu } from "antd";
import type { MenuProps } from "antd";
import { usePathname, useRouter } from "next/navigation";
import Link from "next/link";

type MenuItem = Required<MenuProps>["items"][number];

export default function Layout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();

  const items: MenuItem[] = [
    {
      label: <Link href={"/products"}>Products</Link>,
      key: "/products",
    },

    {
      label: <Link href={"/tags"}>Categories</Link>,
      key: "/tags",
    },

    {
      key: "/discounts",
      label: <Link href={"/discounts"}>Discounts</Link>,
    },
  ];

  const hasTabItem = items.find((item: any) => item.key === pathname);

  if (!hasTabItem) return <>{children}</>;

  // const onClick: MenuProps["onClick"] = (e) => {
  //   router.push(e.key);
  // };
  return (
    <div>
      <div className="">
        <div className=" px-8 flex justify-between items-center ">
          <h3 className="  pageTittle ">Catalog </h3>
          {/* <Button className=" !rounded-lg !bg-[#39B588]  !border-0 !shadow-none" type="primary">
            Need Help?
          </Button> */}
        </div>

        <hr className=" border-gray-200/80" />
        {/* <Menu style={{ fontSize: "16px" }} selectedKeys={[pathname]} mode="horizontal" items={items} /> */}
      </div>
      {children}
    </div>
  );
}
