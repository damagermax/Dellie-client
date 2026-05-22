import { Form, Switch } from "antd";
import { AppModal, ModalProps } from "../ui/AppModal";
import { ProductInventory } from "./ProductInventory";
import { useEffect, useState } from "react";
import { InputFormItem } from "../ui/AppFormItems";
import PreviewImage from "../ui/PreviewImage";
import ImageUpload from "../ui/ImageUploader";
import { useUpdateProductVariantMutation } from "@/lib/redux/services";
import { ProductPerformance } from "./ProductPerformance";

interface VariantDetailModalProps extends ModalProps {
  selectedVariant: any;
}

export function VariantDetailModal({ open, toggle, selectedVariant }: VariantDetailModalProps) {
  const [variantForm] = Form.useForm();
  const [updatedVariant, setUpdatedVariant] = useState<Record<string, any>>({});

  const [updateProductVariant, { isLoading: isUpdating, isSuccess: updateSuccess, reset: resetVariantUpdate }] = useUpdateProductVariantMutation();

  useEffect(() => {
    if (selectedVariant) {
      const profit = selectedVariant?.sellingPrice - selectedVariant?.costPrice || 0;
      const profitMargin = `${((profit / selectedVariant.sellingPrice) * 100).toFixed() || 0}%`;

      variantForm.setFieldsValue({ ...selectedVariant, ...selectedVariant?.inventory, profit, profitMargin });
    }
  }, [selectedVariant]);

  const handleFormValueChange = (changedValues: Record<string, unknown>) => {
    const key = Object.keys(changedValues)[0];

    const oldVariant = { ...selectedVariant, ...selectedVariant?.inventory };

    // Check if the changed value is different from the original product value and update changed fields
    if (changedValues[key] != oldVariant[key]) {
      setUpdatedVariant((values) => ({ ...values, ...changedValues }));
    } else {
      setUpdatedVariant((values) => {
        const updated: any = { ...values };
        delete updated[key];

        return updated;
      });
    }

    // Recalculate profit and profit margin if relevant fields changed
    if (key === "costPrice" || key === "sellingPrice") {
      recalculateProfit();
    }
  };

  const recalculateProfit = () => {
    const costPrice = variantForm.getFieldValue("costPrice") ?? 0;
    const sellingPrice = variantForm.getFieldValue("sellingPrice") ?? 0;

    const profit = sellingPrice - costPrice;
    const profitMargin = sellingPrice ? `${((profit / sellingPrice) * 100).toFixed()}%` : "0%";

    variantForm.setFieldsValue({ profit, profitMargin });
  };

  const handleUpdate = async () => {
    if (isUpdating) return;

    if (Object.keys(updatedVariant).length === 0) {
      toggle();
      return;
    }

    const formData = new FormData();

    for (const key in updatedVariant) {
      const value = updatedVariant[key];
      formData.append(key, value as string | Blob);
    }

    await updateProductVariant({ id: selectedVariant.id, data: formData, productId: selectedVariant.productId });
  };

  if (updateSuccess) {
    toggle();
    resetVariantUpdate();
  }

  return (
    <AppModal loading={isUpdating} width={1000} height={"70vh"} title={selectedVariant?.name} open={open} toggle={toggle} onOk={handleUpdate}>
      <>
        <section className="">
          <Form form={variantForm} layout="vertical" className="  " onValuesChange={handleFormValueChange}>
            <div className="grid  p-5  grid-cols-4   gap-x-5">
              <InputFormItem type="number" label="Cost Price" name="costPrice" placeholder="Enter product cost price" />
              <InputFormItem type="number" label="Selling Price" name="sellingPrice" placeholder="Enter product selling price" />
              <InputFormItem label="Profit" name="profit" disable />
              <InputFormItem label="Profit Margin" name="profitMargin" disable />
            </div>

            <div className=" p-5  ">
              <p>Image (Only one image per variant)</p>

              <div className="flex p-1 gap-2 bg-gray-50 mt-3  rounded-lg border border-dashed border-gray-300">
                {selectedVariant?.imageUrl && !updatedVariant?.image && <PreviewImage width={80} height={80} src={selectedVariant?.imageUrl} />}

                <ImageUpload
                  label={selectedVariant?.imageUrl ? "Change Image" : "Upload Image "}
                  width={80}
                  height={80}
                  maxCount={1}
                  multiple={false}
                  onChange={(files) => {
                    console.log("uploaded files", files);
                    setUpdatedVariant((values) => ({ ...values, image: files[0] }));
                  }}
                />
              </div>
            </div>

            <hr className="!border-gray-200  border-solid" />

            <div className=" p-5  flex justify-between items-center">
              <div>
                <p> Availability</p>
                <p className=" text-xs">Control whether this variant is available for customers to purchase</p>
              </div>
              <Form.Item name="isAvailable" className="!m-0 !p-0">
                <Switch size="default" />
              </Form.Item>
            </div>

            <hr className="!border-gray-200  border-solid" />
          </Form>
        </section>

        <ProductInventory form={variantForm} inventory={selectedVariant?.inventory?.inventoryLevels} onChange={handleFormValueChange} />
      </>
    </AppModal>
  );
}
