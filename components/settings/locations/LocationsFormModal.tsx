"use client";

import { Divider, Form } from "antd";
import { useEffect } from "react";
import { Location, CreateLocationInput, UpdateLocationInput } from "@/types/index";
import { InputFormItem, PhoneInputFormItem } from "@/components/ui/AppFormItems";

import { useCreateLocationMutation, useUpdateLocationMutation, useGetLocationQuery } from "@/lib/redux/services";
import AppDrawer from "@/components/ui/AppDrawer";
import { BaseButton } from "@/components/ui/AppButtons";

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

          <div className="grid gap-x-5 px-6 sm:grid-cols-2">
            <InputFormItem
              className="sm:col-span-2"
              name="address"
              placeholder="Enter location address"
              label="Address"
            />
            <PhoneInputFormItem
              label="Phone Number"
              name="phone"
              placeholder="Enter phone number"
            />
            <InputFormItem label="Email" name="email" placeholder="Enter location email" rules={[{ type: "email", message: "Enter a valid email address" }]} />
          </div>
        </>
      )}
    </Form>
  );

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
