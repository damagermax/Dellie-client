import { useUpdateLocationMutation, useDeleteLocationMutation, useGetLocationsQuery } from "@/lib/redux/services";

import { Location } from "@/types/index";
import { useState } from "react";
import { Checkbox, Tag } from "antd";
import { ActionDropdown, DropdownItemLabel } from "@/components/ui/ActionDropdown";
import { IoCheckmarkCircleOutline } from "react-icons/io5";

import { TbChevronDown, TbChevronRight } from "react-icons/tb";
export default function LocationList({ onSelect }: { onSelect: (location: Location) => void }) {
  const { data: locations } = useGetLocationsQuery({ parentsOnly: false });

  const [updateLocation] = useUpdateLocationMutation();
  const [deleteLocation] = useDeleteLocationMutation();

  const handleDeleteLocation = async (locationId: string) => {
    if (!window.confirm("Delete this location?")) return;
    await deleteLocation(locationId).unwrap();
  };

  const handleSetDefaultLocation = async (locationId: string) => {
    await updateLocation({ id: locationId, isDefault: true }).unwrap();
  };

  const handleActivateLocation = async (locationId: string) => {
    await updateLocation({ id: locationId, status: "active" }).unwrap();
  };

  const handleDeactivateLocation = async (locationId: string) => {
    await updateLocation({ id: locationId, status: "inactive" }).unwrap();
  };

  const [expanded, setExpanded] = useState<Record<string, boolean>>({});

  const toggleExpand = (id: string) => {
    setExpanded((prev) => ({
      ...prev,
      [id]: !prev[id],
    }));
  };

  return (
    <div className="  pb-32 ">
      <div className=" py-5 px-5 hidden  sticky -top-[calc(6.5rem)] border-b border-blue-100 -bg-gray-100   ">
        <p className=" text-gray-600   hidden  mb-4 ">Use locations to track inventory across different spaces at your business (e.g., Warehouse A, Warehouse B, etc.).</p>
        <div className="flex items-center gap-3">
          <Checkbox />
          <p className=" text-gray-900 font-medium ">Break locations down to sublocations</p>
        </div>
      </div>

      <div className=" px-5">
        {locations?.map((location, index) => {
          const isExpanded = expanded[location.id];

          return (
            <div key={location.id} className={`py-5  ${index !== (locations?.length || 0) - 1 ? "border-b border-blue-100" : ""}`}>
              {/* LOCATION HEADER */}
              <div className="flex items-start justify-between gap-4">
                <div className="flex items-start gap-x-3 flex-1">
                  <button onClick={() => toggleExpand(location?.id)} className="mt-1  hidden text-gray-500">
                    {isExpanded ? <TbChevronDown size={16} /> : <TbChevronRight size={16} />}
                  </button>

                  <div className="flex-1">
                    <div className="flex items-center gap-3 flex-wrap cursor-pointer" onClick={() => onSelect(location)}>
                      <h3 className="font-medium text-gray-800">{location?.name}</h3>
                      {location.isDefault ? (
                        <Tag color="blue" className="!mr-0 !rounded-full !px-1.5 !py-0 !text-[10px] !leading-4">
                          Default
                        </Tag>
                      ) : null}
                      <Tag color={location.status === "active" ? "green" : "red"} className="!mr-0 !rounded-full !px-1.5 !py-0 !text-[10px] !leading-4">
                        {location.status}
                      </Tag>

                      <span className="text-[10px] hidden bg-gray-100 text-gray-600 px-1 flex items-center justify-center    text-center  w-[8px] h-f[8px] rounded-full">{location?.subLocations?.length} </span>
                    </div>

                    <p className="text-xs text-gray-500 mt-1">{location?.address}</p>
                  </div>
                </div>

                <ActionDropdown
                  openEditModal={() => onSelect(location)}
                  onDelete={() => handleDeleteLocation(location.id)}
                  onActivate={() => handleActivateLocation(location.id)}
                  onDeactivate={() => handleDeactivateLocation(location.id)}
                  status={location.status}
                  menu={{
                    items: location.isDefault
                      ? []
                      : [
                          {
                            key: "set-default",
                            label: <DropdownItemLabel icon={<IoCheckmarkCircleOutline size={15} />} text="Set Default" />,
                            onClick: () => handleSetDefaultLocation(location.id),
                          },
                        ],
                  }}
                />
              </div>

              {/* SUB LOCATIONS */}
              {isExpanded && (
                <>
                  {location?.subLocations?.length > 0 && (
                    <div className="border-y hidden border-gray-200 mt-5 bg-gray-100 ">
                      {location?.subLocations?.map((sub, subIndex) => (
                        <div key={sub?.id} className={`px-6 py-3 flex items-center justify-between text-sm ${subIndex !== location?.subLocations?.length - 1 ? "border-b border-gray-200" : ""}`}>
                          <div className="flex items-center gap-3">
                            <div className="w-2 h-2 rounded-full bg-gray-400" />

                            <span className="text-gray-700">{sub?.name}</span>
                          </div>

                          <button className="text-xs text-gray-500 hover:text-blue-600">Edit</button>
                        </div>
                      ))}
                    </div>
                  )}

                  {location?.subLocations?.length == 0 && <div className=" mt-3 text-xs  text-gray-500 ml-8 ">No sublocation</div>}
                </>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
