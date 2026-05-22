import { useGetLocationsQuery } from "@/lib/redux/services";
import React from "react";
import { AppModal, ModalProps } from "../ui/AppModal";
import { Location } from "@/types/location";
import { Checkbox } from "antd";

interface Props extends ModalProps {
  toggleSelect: (location: Location) => void;
  selected: { locationId: string; name: string; quantity: number }[];
}

export const LocationSelector = ({ toggle, open, selected, toggleSelect }: Props) => {
  const { data: locations, isLoading, isError } = useGetLocationsQuery({});

  return (
    <AppModal loading={isLoading} width={600} okText="Select" onOk={toggle} title="All Locations" toggle={toggle} open={open}>
      <div className=" border-t px-5 border-blue-100">
        {locations?.map((location) => {
          const isSelected = selected?.find((item) => item.locationId == location?.id);
          return (
            <div
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
