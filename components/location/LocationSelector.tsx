import { useGetLocationsQuery } from "@/lib/redux/services";
import React from "react";
import { AppModal, ModalProps } from "../ui/AppModal";
import { Location } from "@/types/location";
import { Checkbox } from "antd";

interface Props extends ModalProps {
  toggleSelect: (location: Location) => void;
  selected: { locationId: string; name: string; quantity: number }[];
}

const getLocationId = (location: Partial<Location> & { _id?: string; value?: string }) => {
  const rawId = location.id || location._id || location.value;
  return typeof rawId === "string" ? rawId : "";
};

export const LocationSelector = ({ toggle, open, selected, toggleSelect }: Props) => {
  const { data: locations, isLoading } = useGetLocationsQuery({ status: 'active' });

  return (
    <AppModal loading={isLoading} width={600} okText="Select" onOk={toggle} title="All Locations" toggle={toggle} open={open}>
      <div className=" border-t px-5 border-blue-100">
        {locations?.map((location) => {
          const locationId = getLocationId(location);
          const isSelected = selected?.find((item) => item.locationId === locationId);
          return (
            <div
              key={locationId || location.name}
              className={`py-3 flex justify-between items-center  px-5 cursor-pointer border-b border-blue-100 `}
              onClick={() => {
                toggleSelect(location);
              }}
            >
              <p>{location?.name}</p> <Checkbox checked={isSelected ? true : false} />
            </div>
          );
        })}
      </div>
    </AppModal>
  );
};
