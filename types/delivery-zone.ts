export interface DeliveryZone {
  id: string;
  name: string;
  fee: number;
  areas: string;
  status: "active" | "inactive";
  createdAt: string;
  updatedAt: string;
}

export interface CreateDeliveryZoneInput {
  name: string;
  fee: number;
  areas?: string;
  status?: "active" | "inactive";
}

export interface UpdateDeliveryZoneInput extends Partial<CreateDeliveryZoneInput> {
  id: string;
}

export interface DeliveryZonesQueryParams {
  search?: string;
  status?: "active" | "inactive";
}
