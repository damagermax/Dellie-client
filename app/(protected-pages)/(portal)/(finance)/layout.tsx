"use client";
import { Menu } from "antd";

import type { MenuProps } from "antd";
import { usePathname, useRouter } from "next/navigation";
import Link from "next/link";


export default function Layout({ children }: { children: React.ReactNode }) {
    const pathname = usePathname();
    const router = useRouter();

    const items = [

         {
            label: <Link href={"/transactions"}>Transactions</Link>,
            key: "/transactions",
        },
        {
            label: <Link href={"/expenses"}>Expenses</Link>,
            key: "/expenses",
        },
        {
            key: "/expense-categories",
            label: <Link href={"/expense-categories"}>Expense Categories</Link>,
        },

       
    ];

    const onClick: MenuProps["onClick"] = (e) => {
        console.log("click ", e);
        router.push(e.key); // Navigate to the selected page
    };
    return (
        <div className=" ">
            <div className="">
                <h3 className=" px-8 pageTittle ">Finance Report</h3>

                <hr className=" border-gray-200/80" />
                <Menu
                    style={{ fontSize: "16px" }}
                    onClick={onClick}
                    className="mt-[7rem]"
                    selectedKeys={[pathname]}
                    mode="horizontal"
                    items={items}
                />
            </div>




            <div  className=" bg-white  w-full  bg-gray-50  py-10  overflow-auto">{children}</div>
        </div>
    );
}
