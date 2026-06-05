export interface PricingGroup {
  id: string;
  name: string;
  isDefault: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface CreatePricingGroupInput {
  name: string;
  isDefault?: boolean;
}

export interface UpdatePricingGroupInput extends Partial<CreatePricingGroupInput> {
  id: string;
}

export interface PricingGroupsQueryParams {
  search?: string;
}
