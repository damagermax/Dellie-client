import { useUpdateLocationMutation, useDeleteLocationMutation, useGetLocationsQuery } from "@/lib/redux/services";

import { Location } from "@/types/index";
import useToggle from "@/hooks/UseToggle";
import { useState } from "react";
import { Checkbox } from "antd";

import { TbChevronDown, TbChevronRight } from "react-icons/tb";

const dummyLocations: Location[] = [
  {
    id: "1",
    name: "Accra Main Warehouse",
    address: "Spintex Road",
    city: "Accra",
    country: "Ghana",
    status: "active",
    isDefault: true,
    subLocations: [
      { id: "1-1", name: "Receiving Bay" },
      { id: "1-2", name: "Cold Room" },
      { id: "1-3", name: "Dispatch Area" },
    ],
  },
  {
    id: "2",
    name: "Kumasi Distribution Center",
    address: "Ahodwo",
    city: "Kumasi",
    country: "Ghana",
    status: "active",
    subLocations: [
      { id: "2-1", name: "Bulk Storage" },
      { id: "2-2", name: "Packing Zone" },
    ],
  },
  {
    id: "3",
    name: "Tema Port Warehouse",
    address: "Harbour Road",
    city: "Tema",
    country: "Ghana",
    status: "active",
    subLocations: [
      { id: "3-1", name: "Container Yard" },
      { id: "3-2", name: "Inspection Unit" },
      { id: "3-3", name: "Transit Section" },
    ],
  },
  {
    id: "4",
    name: "Takoradi Depot",
    address: "Market Circle",
    city: "Takoradi",
    country: "Ghana",
    status: "active",
    subLocations: [
      { id: "4-1", name: "Fuel Storage" },
      { id: "4-2", name: "Loading Dock" },
    ],
  },
  {
    id: "5",
    name: "Tamale Regional Store",
    address: "Central Business District",
    city: "Tamale",
    country: "Ghana",
    status: "inactive",
    subLocations: [
      { id: "5-1", name: "Shelf A" },
      { id: "5-2", name: "Shelf B" },
      { id: "5-3", name: "Returns Area" },
    ],
  },
  {
    id: "6",
    name: "Cape Coast Retail Hub",
    address: "Pedu Junction",
    city: "Cape Coast",
    country: "Ghana",
    status: "active",
    subLocations: [
      { id: "6-1", name: "Front Store" },
      { id: "6-2", name: "Back Inventory" },
    ],
  },
  {
    id: "7",
    name: "East Legon Mini Warehouse",
    address: "Boundary Road",
    city: "Accra",
    country: "Ghana",
    status: "active",
    subLocations: [
      { id: "7-1", name: "Electronics Section" },
      { id: "7-2", name: "Accessories Shelf" },
    ],
  },
  {
    id: "8",
    name: "Sunyani Storage Facility",
    address: "Magazine Area",
    city: "Sunyani",
    country: "Ghana",
    status: "inactive",
    subLocations: [
      { id: "8-1", name: "Reserved Stock" },
      { id: "8-2", name: "Damaged Goods Area" },
      { id: "8-3", name: "Outgoing Orders" },
    ],
  },
];
export default function LocationList({ onSelect }: { onSelect: (location: Location) => void }) {
  const { data: locations } = useGetLocationsQuery({ parentsOnly: false });

  const [updateLocation] = useUpdateLocationMutation();
  const [deleteLocation] = useDeleteLocationMutation();

  const [selectedLocation, setSelectedLocation] = useState<Location>();

  const [openEditModal, toggleEditModal] = useToggle();

  const handleEditLocation = (location: Location) => {
    setSelectedLocation(location);
    toggleEditModal();
  };

  const handleDeleteLocation = async (locationId: string) => {
    await deleteLocation(locationId);
  };

  const handleSetDefaultLocation = async (locationId: string) => {
    await updateLocation({ id: locationId, isDefault: true });
  };

  const handleActivateLocation = async (locationId: string) => {
    await updateLocation({ id: locationId, status: "active" });
  };

  const handleDeactivateLocation = async (locationId: string) => {
    await updateLocation({ id: locationId, status: "inactive" });
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
            <div key={location.id} className={`py-5  ${index !== dummyLocations.length - 1 ? "border-b border-blue-100" : ""}`}>
              {/* LOCATION HEADER */}
              <div className="flex items-start justify-between gap-4">
                <div className="flex items-start gap-x-3 flex-1">
                  <button onClick={() => toggleExpand(location?.id)} className="mt-1  hidden text-gray-500">
                    {isExpanded ? <TbChevronDown size={16} /> : <TbChevronRight size={16} />}
                  </button>

                  <div className="flex-1">
                    <div className="flex items-center gap-3 flex-wrap cursor-pointer" onClick={() => onSelect(location)}>
                      <h3 className="font-medium text-gray-800">{location?.name}</h3>

                      <span className="text-[10px] hidden bg-gray-100 text-gray-600 px-1 flex items-center justify-center    text-center  w-[8px] h-f[8px] rounded-full">{location?.subLocations?.length} </span>
                    </div>

                    <p className="text-xs text-gray-500 mt-1">{location?.address}</p>
                  </div>
                </div>

                <button className="text-sm hidden text-blue-600 hover:underline" onClick={() => onSelect(location)}>
                  Edit
                </button>
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
