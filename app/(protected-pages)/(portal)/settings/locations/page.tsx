"use client";

import { AddButton } from "@/components/ui/AppButtons";
import LocationsFormModal from "@/components/settings/locations/LocationsFormModal";
import LocationList from "@/components/settings/locations/LocationList";
import useToggle from "@/hooks/UseToggle";
import LocationView from "@/components/location/LocationView";

export default function LocationsPage() {
  const [openCreateModal, toggleCreateModal] = useToggle();

  return (
    <div className=" ">
      <div className="flex mb-8 justify-between items-center px-6">
        <div>
          <h2 className="text-xl ">Locations</h2>
          <p className="text-gray-500">Manage your store locations and inventory</p>
        </div>

        <AddButton onClick={toggleCreateModal} label="Add Location" />
      </div>

      <LocationView />

      <LocationsFormModal open={openCreateModal} toggle={toggleCreateModal} />
    </div>
  );
}
