"use client";

import { AppModal } from "@/components/ui/AppModal";
import { Button, Divider, Form, Switch } from "antd";
import { useEffect } from "react";
import { Location, CreateLocationInput, UpdateLocationInput } from "@/types/index";
import { InputFormItem, SelectFormItem } from "@/components/ui/AppFormItems";

import { useCreateLocationMutation, useUpdateLocationMutation, useGetLocationQuery } from "@/lib/redux/services";
import AppDrawer from "@/components/ui/AppDrawer";
import { BaseButton } from "@/components/ui/AppButtons";
import { SearchableLocationSelect } from "@/components/location/SearchableLocationSelect";

interface LocationsFormModalProps {
  open: boolean;
  toggle: () => void;
  initialValues?: Location;
}

type LocationFormValues = Omit<Partial<Location>, "id">;

function LocationsFormModal({ open, toggle, initialValues }: LocationsFormModalProps) {
  const [locationForm] = Form.useForm();

  const { data: locationData, isSuccess } = useGetLocationQuery(initialValues?.id || "", { skip: !initialValues?.id });
  const [createLocation, { isLoading: isCreating, isSuccess: isCreateSuccess }] = useCreateLocationMutation();
  const [updateLocation, { isLoading: isUpdating, isSuccess: isUpdateSuccess }] = useUpdateLocationMutation();

  const hasParentLocation = Form.useWatch("parentLocationId", locationForm);

  const handleSubmit = async (values: LocationFormValues) => {
    if (isCreating || isUpdating) return;

    if (initialValues?.id) {
      await updateLocation({ id: initialValues.id, ...values } as UpdateLocationInput);
    } else {
      await createLocation(values as CreateLocationInput);
    }
  };

  useEffect(() => {
    if (!initialValues) {
      locationForm.resetFields();
    }
  }, [initialValues]);

  useEffect(() => {
    if (locationData && isSuccess) {
      locationForm.setFieldsValue(locationData);
    }
  }, [isSuccess, locationData]);

  useEffect(() => {
    if (isCreateSuccess || isUpdateSuccess) {
      locationForm.resetFields();
      toggle();
    }
  }, [isCreateSuccess, isUpdateSuccess]);

  const formView = (
    <Form disabled={isCreating || isUpdating} form={locationForm} layout="vertical" onFinish={handleSubmit} initialValues={initialValues} className="mt-6">
      <div className="grid -grid-cols-2 px-6  gap-x-5">
        <InputFormItem placeholder="e.g., Main Store, Warehouse, Shelf A etc." name="name" label="Name" rules={[{ required: true, message: "Please enter location name" }]} />

        {/* <Form.Item label="Paren Location" name="parentLocationId">
          <SearchableLocationSelect />
        </Form.Item> */}
      </div>
      {!hasParentLocation && (
        <>
          <Divider className="my-0" />
          <div className=" px-6">
            <p className=" ">Add the physical address of this location. This is important for shipping.</p>
          </div>
          <Divider className="my-0" />

          <div className=" px-6 grid grid-cols-2 gap-x-5">
            <InputFormItem name="address" placeholder="Address" className=" col-span-2" label="Address" />
            <InputFormItem label="Country" placeholder="Country" name="country" />
            <InputFormItem label="City" placeholder="City" name="city" />
            <InputFormItem label="State/Region" placeholder="State/Region" name="state" />
            <InputFormItem label="Postal Code" placeholder="Postal Code" name="postalCode" />
          </div>
        </>
      )}
    </Form>
  );

  // return (
  //   <AppModal onOk={locationForm.submit} okText={isCreating || isUpdating ? "Saving..." : "Save"} title={initialValues ? "Edit Location" : "Add New Location"} open={open} toggle={toggle} width={600}>
  //     {formView}
  //   </AppModal>
  // );

  return (
    <AppDrawer onOk={locationForm.submit} okText={isCreating || isUpdating ? "Saving..." : "Save"} title={initialValues ? "Edit Location" : "Location"} open={open} toggle={toggle} width={600}>
      <div className=" mt-5">
        {formView}

        <div className="flex gap-x-5 mt-5 justify-end px-8">
          <BaseButton label="Cancel" type="default" size="middle" onClick={toggle} />
          <BaseButton label="Save" type="primary" size="middle" onClick={locationForm.submit} />
        </div>
      </div>
    </AppDrawer>
  );
}

export default LocationsFormModal;
