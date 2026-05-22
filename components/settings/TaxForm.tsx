import React, { useEffect } from "react";
import { Button, Input, InputNumber } from "antd";

interface Props {}

import { useMemo, useState } from "react";
import AppDrawer from "../ui/AppDrawer";
import { AppModal, ModalProps } from "../ui/AppModal";

import { useUpdateTaxMutation, useCreateTaxMutation, useGetTaxQuery } from "@/lib/redux/services";
import { Tax, TaxRateInput } from "@/types/taxes";

const subTotal = Math.floor(Math.random() * 1000) + 500;

interface TaxesProps extends ModalProps {
  initialValue?: Tax;
}

export const TaxesForm = ({ initialValue, onSaveSuccess }: { initialValue?: Tax; onSaveSuccess: () => void }) => {
  const [createTax, { isLoading: isCreating }] = useCreateTaxMutation();

  const [updateTaxApi, { isLoading: isUpdating }] = useUpdateTaxMutation();

  const { data } = useGetTaxQuery(initialValue?.id as string, { skip: !initialValue?.id });

  const [description, setDescription] = useState("");
  const [items, setItems] = useState<TaxRateInput[]>([{ name: "", value: 0 }]);

  useEffect(() => {
    const tax = data || initialValue;

    if (tax) {
      setDescription(tax.description || "");

      setItems(tax.items?.length ? tax.items : [{ name: "", value: 0 }]);
    }
  }, [data, initialValue]);

  const addTax = () => {
    setItems([...items, { name: "", value: 0 }]);
  };

  const removeTax = (index: number) => {
    setItems(items.filter((_, i) => i !== index));
  };

  const updateTax = (index: number, key: keyof TaxRateInput, value: any) => {
    const updated = [...items];

    updated[index] = {
      ...updated[index],
      [key]: key === "value" ? Number(value) : value,
    };

    setItems(updated);
  };

  const preview = useMemo(() => {
    let totalTax = 0;

    const breakdown = items?.map((tax) => {
      const amount = (subTotal * (tax.value || 0)) / 100;
      totalTax += amount;

      return {
        ...tax,
        amount,
      };
    });

    return {
      breakdown,
      total: subTotal + totalTax,
    };
  }, [items, subTotal]);

  const handleSubmit = async () => {
    if (!description.trim()) {
      return window.alert("Tax schema name is required");
    }

    const filteredRates = items.filter((item) => item.name.trim() && item.value >= 0);

    if (!filteredRates.length) {
      return window.alert("Add at least one tax");
    }

    const normalizedNames = filteredRates?.map((item) => item.name.trim().toLowerCase());

    const hasDuplicateNames = new Set(normalizedNames).size !== normalizedNames.length;

    if (hasDuplicateNames) {
      return window.alert("Duplicate tax names are not allowed");
    }

    const payload = {
      description,
      items: filteredRates,
    };

    try {
      if (initialValue?.id) {
        await updateTaxApi({ id: initialValue.id, ...payload }).unwrap();
      } else {
        await createTax(payload).unwrap();

        setDescription("");
        setItems([{ name: "", value: 0 }]);
      }

      onSaveSuccess();
    } catch (error) {}
  };

  return (
    <div className="px-5">
      <p className=" text-sm  py-4 pb-6 text-gray-500 ">Define your taxing schemes to account for different types of taxes on purchase and sales orders</p>
      <div className="grid grid-cols-1 gap-x-8">
        {/* LEFT */}
        <div className="-col-span-3">
          <div className="mb-4 ">
            <p className="text-sm mb-2">Tax schema name</p>
            <Input placeholder="Standard Tax" value={description} onChange={(e) => setDescription(e.target.value)} />
          </div>

          {items?.map((tax, index) => (
            <div key={index} className="grid grid-cols-5 gap-x-5 items-end mb-3">
              <div className="  col-span-3">
                {index === 0 && <p className="text-sm mb-2">Tax name</p>}
                <Input placeholder="VAT, NHIL ..." value={tax.name} onChange={(e) => updateTax(index, "name", e.target.value)} />
              </div>

              <div className=" col-span-2 ">
                {index === 0 && <p className="text-sm mb-2 ">Tax rate </p>}

                <div className="w-full flex items-center gap-x-5">
                  <InputNumber placeholder="0" className="!w-full" type="number" controls={false} value={tax.value} onChange={(value) => updateTax(index, "value", value)} suffix="%" />
                  {items.length > 1 && (
                    <div onClick={() => removeTax(index)} className=" flex items-center cursor-pointer">
                      ✕
                    </div>
                  )}
                </div>
              </div>
            </div>
          ))}

          <Button type="dashed" className=" " block onClick={addTax}>
            + Add Tax
          </Button>
        </div>

        {/* RIGHT PREVIEW */}
        <div className=" -col-span-2 mt-6">
          <p className="font-medium mb-2">Preview</p>

          <div className="space-y-2 text-sm bg-gray-100  rounded-md p-5 h-fit">
            <div className="flex justify-between">
              <span>Subtotal</span>
              <span>{subTotal.toFixed(2)}</span>
            </div>

            {preview.breakdown?.map((tax, i) => (
              <div key={i} className="flex justify-between text-gray-600">
                <span>
                  {tax.name || "Tax"} ({tax.value}%)
                </span>
                <span>{tax.amount.toFixed(2)}</span>
              </div>
            ))}

            <hr className=" border-gray-200" />

            <div className="flex justify-between font-medium">
              <span>Total</span>
              <span>{preview.total.toFixed(2)}</span>
            </div>
          </div>
        </div>
      </div>

      <div className="flex gap-x-5 mt-8 justify-end">
        <Button>Cancel</Button>
        <Button type="primary" onClick={handleSubmit}>
          Save
        </Button>
      </div>
    </div>
  );
};

export const TaxesDrawer = ({ open, toggle, initialValue }: TaxesProps) => {
  return (
    <>
      <AppDrawer open={open} toggle={toggle} title="Taxes">
        <TaxesForm onSaveSuccess={toggle} initialValue={initialValue} />
      </AppDrawer>
    </>
  );
};

export const TaxesModal = ({ open, toggle }: TaxesProps) => {
  return (
    <>
      <AppModal open={open} toggle={toggle} title="Taxes">
        <TaxesForm onSaveSuccess={toggle} />
      </AppModal>
    </>
  );
};
