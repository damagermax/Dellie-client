import React from "react";
import { Tag } from "antd";
import { useDeleteTaxMutation, useGetTaxesQuery, useUpdateTaxMutation } from "@/lib/redux/services";
import { Tax } from "@/types/taxes";
import { ActionDropdown } from "../ui/ActionDropdown";

const TaxList = ({ onSelect }: { onSelect: (tax: Tax) => void }) => {
  const [updateTax, { isLoading: isUpdating }] = useUpdateTaxMutation();
  const [deleteTax, { isLoading: isDeleting }] = useDeleteTaxMutation();
  const { data: texes } = useGetTaxesQuery();

  const handleActivateTax = async (tax: Tax) => {
    if (!isUpdating) {
      await updateTax({ id: tax.id, status: "active" }).unwrap();
    }
  };

  const handleDeactivateTax = async (tax: Tax) => {
    if (!isUpdating) {
      await updateTax({ id: tax.id, status: "inactive" }).unwrap();
    }
  };

  const handleDeleteTax = async (taxId: string) => {
    if (!isDeleting) {
      await deleteTax(taxId).unwrap();
    }
  };

  return (
    <div>
      <div className="max-w-3xl mx-auto -bg-green-50/30  pb-52 ">
        {texes?.map((tax, index) => {
          const total = tax.items.reduce((sum, i) => sum + i.value, 0);

          return (
            <div key={tax?.id || index} className="flex items-start justify-between gap-4 border-b border-blue-100 py-5 mx-5 cursor-pointer" onClick={() => onSelect(tax)}>
              <div className="min-w-0 flex-1">
                <div className="mb-2 flex min-w-0 items-center gap-2">
                  <h3 className="truncate font-medium text-gray-800">{tax.description}</h3>
                  <Tag color={tax.status === "active" ? "green" : "default"} className="!m-0 !rounded-full !px-1.5 !py-0 !text-[10px] !leading-4">
                    {tax.status === "active" ? "Active" : "Inactive"}
                  </Tag>
                  <span className="text-xs font-medium text-gray-500">{total}%</span>
                </div>
                <div className="flex flex-wrap gap-2">
                  {tax?.items?.map((item, idx) => (
                    <div key={idx} className="flex items-center gap-x-2 text-xs text-gray-600">
                      <span className="rounded-full bg-gray-100 px-2 py-0.5">{item.name}</span>
                      <span className="font-medium">{item.value}%</span>
                    </div>
                  ))}
                </div>
              </div>
              <div
                onClick={(event) => {
                  event.stopPropagation();
                }}
              >
                <ActionDropdown
                  openEditModal={() => onSelect(tax)}
                  onDelete={() => handleDeleteTax(tax.id)}
                  onActivate={() => handleActivateTax(tax)}
                  onDeactivate={() => handleDeactivateTax(tax)}
                  status={tax.status}
                />
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default TaxList;
