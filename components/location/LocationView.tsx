import useToggle from "@/hooks/UseToggle";
import { useUpdateLocationMutation, useDeleteLocationMutation, useGetLocationsQuery } from "@/lib/redux/services";
import React, { useState } from "react";
import { AppNotFoundView } from "../ui/AppNotFoundView";
import { AppViewLoader } from "../ui/AppViewLoader";
import LocationTable from "./LocationTable";
import { Location } from "@/types/location";

export interface ExpenseViewItemAction {
  openEditModal?: (location: Location) => void;
  onItemClick?: (location: Location) => void;
  onDelete: (id: string) => void;
  onSetDefault: (id: string) => void;
  onActivate: (id: string) => void;
  onDeactivate: (id: string) => void;
}

export interface LocationViewTypeProps extends ExpenseViewItemAction {
  locations: Location[];
}

const LocationView = () => {
  const [updateLocation] = useUpdateLocationMutation();
  const [deleteLocation] = useDeleteLocationMutation();

  const [selectedLocation, setSelectedLocation] = useState<Location>();

  const [openEditModal, toggleEditModal] = useToggle();
  const { data: locations, isLoading, isError } = useGetLocationsQuery({});

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
  return (
    <div>
      <AppViewLoader loading={isLoading} />
      <AppNotFoundView dataLength={locations?.length || 0} loading={isLoading} query={{}} entity="Locations" />

      <LocationTable locations={locations || []} openEditModal={handleEditLocation} onDelete={handleDeleteLocation} onSetDefault={handleSetDefaultLocation} onActivate={handleActivateLocation} onDeactivate={handleDeactivateLocation} />
    </div>
  );
};

export default LocationView;
