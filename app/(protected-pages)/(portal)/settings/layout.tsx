"use client";
import { cn } from "@/lib/utils";
import { Menu } from "antd";

import type { MenuProps } from "antd";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";

export default function Layout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();

  const items = [
    {
      label: "Company Details",
      key: "/settings/my",
    },

    {
      label: "Unit Of Measure",
      key: "/settings/uom",
    },
    {
      label: "Categories",
      key: "/settings/categories",
    },
    {
      label: "Storefront",
      key: "/settings/my-store",
    },
    {
      key: "/settings/locations",
      label: "Locations",
    },

    {
      key: "/settings/apps",
      label: "Taxes",
    },

    {
      key: "/settings/apps",
      label: "Apps",
    },

    {
      key: "/settings/apps",
      label: "Tags",
    },
  ];

  const onClick: MenuProps["onClick"] = (e) => {
    console.log("click ", e);
    router.push(e.key); // Navigate to the selected page
  };

  return (
    <div className=" min-h-screen ">
      <div className=" h-full overflow-clip flex items-stretch">
        <div className="w-76  bg-gray-50 h-screen border-r  border-r-gray-200   ">
          <h3 className=" px-8 pageTittle  mb-5  ">Settings</h3>

          <ul className="px-2 ">
            {items?.map((item) => (
              <li className="py-0.5">
                <Link href={item.key} className={cn("group !text-gray-600 px-8 rounded-2xl hover:text-gray-900 transition-colors flex items-center  py-1 ", pathname == item.key && "!text-gray-900 font-semibold !-bg-gray-100")}>
                  <div className="flex items-center text-base gap-x-4">
                    <span className="whitespace-nowrap">{item.label}</span>
                  </div>
                </Link>
              </li>
            ))}
          </ul>
        </div>

        <div className=" bg-white justify-center w-full pt-8  ">
          {/* <div className=" ">
            <div className="">
              <hr className=" border-gray-200/80" />
            </div>
          </div> */}
          {children}
        </div>
      </div>
    </div>
  );
}
