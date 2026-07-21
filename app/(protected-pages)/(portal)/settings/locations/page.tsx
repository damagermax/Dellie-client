"use client";

import { AddButton, FloatingAddButton } from "@/components/ui/AppButtons";
import LocationsFormModal from "@/components/settings/locations/LocationsFormModal";
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

        <div className="hidden md:block">
          <AddButton onClick={toggleCreateModal} label="Add Location" />
        </div>
      </div>

      <LocationView />

      <LocationsFormModal open={openCreateModal} toggle={toggleCreateModal} />
      <FloatingAddButton onClick={toggleCreateModal} label="Add Location" />
    </div>
  );
}
