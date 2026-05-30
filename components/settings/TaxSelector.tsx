import { useGetTaxesQuery } from "@/lib/redux/services";
import React from "react";
import { AppModal, ModalProps } from "../ui/AppModal";
import { Checkbox, Switch } from "antd";
import { Tax } from "@/types/taxes";

interface Props extends ModalProps {
  handleTaxSelect: (tax: Tax) => void;
  selected?: string;
  isDeferentProductTax: boolean;
  toggleDeferentProductTax: () => void;
}

export const TaxSelector = ({ toggle, toggleDeferentProductTax, isDeferentProductTax, open, selected, handleTaxSelect }: Props) => {
  const { data: taxes, isLoading, isError } = useGetTaxesQuery();

  return (
    <AppModal loading={isLoading} width={600} okText="Continue" onOk={toggle} title="Texes" toggle={toggle} open={open}>
      <div className="  flex items-center w-full justify-between  border-t bg-gray-50 px-5 border-blue-100 py-3">
        <p className="text-base">Some Products are taxes deferent</p>

        <Switch onChange={toggleDeferentProductTax} checked={isDeferentProductTax} size="small" />
      </div>
      <div className=" border-t px-5 border-blue-100">
        {taxes?.map((tax) => {
          const isSelected = tax.id == selected;
          return (
            <div
              className={`py-3 flex justify-between items-center  px-5 cursor-pointer border-b border-blue-100 `}
              onClick={() => {
                handleTaxSelect(tax);
              }}
            >
              <div>
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

              <Checkbox checked={isSelected ? true : false} />
            </div>
          );
        })}
      </div>
    </AppModal>
  );
};
