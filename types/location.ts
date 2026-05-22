export interface SubLocation {
  id: string;
  name: string;
}

export interface Location {
  id: string;
  name: string;
  address?: string;
  city?: string;
  state?: string;
  postalCode?: string;
  country?: string;
  status: "active" | "inactive";
  isDefault?: boolean;
  subLocations: SubLocation[];
}

export interface CreateLocationInput {
  name: string;
  address: string;
  city: string;
  state?: string;
  postalCode?: string;
  country: string;
  phone: string;
  email?: string;
  status: "active" | "inactive";
  isDefault?: boolean;
}

export interface UpdateLocationInput {
  id: string;
  name?: string;
  address?: string;
  city?: string;
  state?: string;
  postalCode?: string;
  country?: string;
  phone?: string;
  email?: string;
  status?: "active" | "inactive";
  isDefault?: boolean;
}

export enum LocationStatus {
  ACTIVE = "active",
  INACTIVE = "inactive",
}

export interface LocationsQueryParams {
  search?: string | "";
  status?: LocationStatus;
  parentsOnly?: boolean;
}
