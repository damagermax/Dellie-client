import { ActionDropdown } from "@/components/ui/ActionDropdown";
import AppTag from "@/components/ui/AppTag";
import { formatDate } from "@/lib/dateUtils";
import { useGetDiscountsQuery } from "@/lib/redux/services";
import { DiscountMethod, DiscountType } from "@/types/discount";
import React from "react";
import { LuCopy } from "react-icons/lu";
import { MdClose } from "react-icons/md";

const DiscountsList = () => {
  const { data: discountsData, isLoading: loadingTags } = useGetDiscountsQuery({});

  return (
    <div>
      <div className="bg-white px-6 ">
        {discountsData?.data?.map((discount, index) => (
          <div key={discount.id} className={` py-5  ${index !== discountsData?.data?.length - 1 ? "border-b border-blue-100" : "border-b border-blue-100"}`}>
            {/* LEFT */}
            <div className=" flex justify-between items-center">
              <div className="flex items-center gap-1">
                {/* <button className=" mr-2  text-gray-500">
                  <MdClose size={16} />
                </button> */}
                <p className="font-medium text-gray-800 truncate">{discount.name}</p>

                {discount.method === DiscountMethod.CODE && <LuCopy className="hover:bg-gray-100 cursor-pointer p-1 text-lg rounded-md text-gray-600" />}
              </div>
            </div>

            <div className=" flex items-center   mt-1 text-xs gap-2">
              <div className="flex items-center gap-3  text-gray-600 flex-wrap">
                <span>{discount.type === DiscountType.PERCENT ? `${discount.value}%` : `GHS ${discount.value}`} off</span>
              </div>

              <div className="w-1 h-1 mt-0.5 rounded-full bg-gray-400" />

              {/* CENTER */}
              <div className="md:flex">
                <span className=" rounded-full  text-gray-600 whitespace-nowrap">
                  {discount.startDate && <>{formatDate(discount.startDate)}</>}

                  {discount.startDate && !discount?.endDate && " – Till Deactivated"}

                  {discount.startDate && discount?.endDate && ` – ${formatDate(discount.endDate)}`}

                  {!discount.startDate && "Till Deactivated"}
                </span>
              </div>
            </div>
            {/* RIGHT */}
            <div className="flex items-center gap-4">{/* <AppTag value={discount.status} /> */}</div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default DiscountsList;
