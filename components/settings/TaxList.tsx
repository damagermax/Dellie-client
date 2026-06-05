import { Checkbox } from "antd";
import React from "react";
import { useGetTaxesQuery } from "@/lib/redux/services";
import { Tax } from "@/types/taxes";
import { MdClose } from "react-icons/md";
import { ActionDropdown } from "../ui/ActionDropdown";

const TaxList = ({ onSelect }: { onSelect: (tax: Tax) => void }) => {
  const { data: texes, isLoading, error } = useGetTaxesQuery();

  return (
    <div>
      <div className="max-w-3xl mx-auto -bg-green-50/30  pb-52 ">
        {texes?.map((tax, index) => {
          const total = tax.items.reduce((sum, i) => sum + i.value, 0);

          return (
            <div key={tax?.id || index} className=" flex justify-between items-center border-b py-5 mx-5 cursor-pointer border-blue-100  " onClick={() => onSelect(tax)}>
              <div className="  gap-x-3  items-center">
                <h3 className=" font-medium text-gray-800 mb-2">{tax.description}</h3>
                <div className=" flex  gap-x-5 ">
                  {tax?.items?.map((item, idx) => (
                    <div key={idx} className="flex gap-x-2  text-xs text-gray-600">
                      <span className=" bg-gray-200 px-2   ">{item.name}</span>
                      <span className="font-medium">{item.value}%</span>
                    </div>
                  ))}
                </div>
              </div>
              {/* 
              <ActionDropdown /> */}

              <div className="text-xs hidden bg-green-100 px-2 rounded-full  text-green-600">Active</div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default TaxList;
