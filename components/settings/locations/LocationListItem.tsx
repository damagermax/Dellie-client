import { EnvironmentOutlined } from "@ant-design/icons";
import { Card, Tag } from "antd";
import { Location, UpdateLocationInput } from "@/types/index";
import { ActionDropdown, DropdownItemLabel } from "@/components/ui/ActionDropdown";
import { IoCheckmarkCircleOutline } from "react-icons/io5";

interface LocationListItemProps {
  location: Location;
  onEdit: (location: Location) => void;
  onDelete: (locationId: string) => void;
  onSetDefault: (locationId: string) => void;
  onActivate: (locationId: string) => void;
  onDeactivate: (locationId: string) => void;
}

export default function LocationListItem({ location, onDelete, onEdit, onSetDefault, onActivate, onDeactivate }: LocationListItemProps) {
  return (
    <Card key={location.id} className="border border-gray-300 !mb-2 hover:border-blue-300 transition-colors duration-200 bg-white   !rounded-lg" bodyStyle={{ padding: "15px " }}>
      <div className="flex flex-col md:flex-row md:items-center justify-between">
        <div className="flex items-center space-x-4">
          <div className="p-3 border border-gray-200 rounded-lg bg-gray-100/70">
            <EnvironmentOutlined className="!text-gray-500 text-xl" />
          </div>
          <div>
            <div className="flex items-center space-x-2">
              <h3 className="text-base font-medium">{location.name}</h3>
              {location.isDefault && (
                <Tag color="blue" className="text-xs">
                  Default
                </Tag>
              )}
              <Tag color={location.status === "active" ? "green" : "red"} className="text-xs">
                {location.status}
              </Tag>
            </div>
            <p className="text-gray-600 mt-1 text-xs">{[location.address, location.city, location.country].filter(Boolean).join(", ")}</p>
          </div>
        </div>
        <div className="flex space-x-2 mt-4 md:mt-0">
          <ActionDropdown
            status={location.status}
            menu={{
              items: [
                {
                  key: "set-default",
                  label: <DropdownItemLabel icon={<IoCheckmarkCircleOutline size={15} />} text="Set Default" />,
                  onClick: () => onSetDefault(location.id),
                },
              ],
            }}
            onActivate={() => onActivate(location.id)}
            onEdit={() => onEdit(location)}
            onDelete={() => onDelete(location.id)}
            onDeactivate={() => onDeactivate(location.id)}
          />
        </div>
      </div>
    </Card>
  );
}
